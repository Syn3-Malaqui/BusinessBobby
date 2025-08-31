import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | null = null

function getPool(): pg.Pool | null {
  if (pool !== null) return pool
  const connectionString = process.env.DATABASE_URL || ''
  if (!connectionString) {
    return null
  }
  try {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
    pool.on('error', (err) => {
      console.error('DB pool error (non-fatal):', err && (err.message || err))
    })
  } catch (err) {
    console.error('Failed to initialize DB pool, continuing without DB:', err && (err as any).message)
    pool = null
  }
  return pool
}

export async function initDb(): Promise<void> {
  const db = getPool()
  if (!db) return
  
  try {
    // Create the table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS checkouts (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        customer_id TEXT,
        email TEXT,
        full_name TEXT,
        contact_number TEXT,
        selected_tier TEXT,
        from_tier TEXT,
        amount_cents INTEGER,
        is_upgrade BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    
    // Remove duplicate records (keep the latest one per email)
    await db.query(`
      DELETE FROM checkouts a
      USING checkouts b
      WHERE a.email IS NOT NULL AND b.email IS NOT NULL
        AND a.email = b.email
        AND a.id < b.id;
    `)
    
    // Add columns if they don't exist
    try {
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS full_name TEXT;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS contact_number TEXT;`)
    } catch (e) {
      // Columns might already exist, ignore errors
    }
    
    // Handle constraints more carefully
    try {
      // Drop old constraints if they exist
      await db.query(`ALTER TABLE checkouts DROP CONSTRAINT IF EXISTS checkouts_session_id_key;`)
      await db.query(`DROP INDEX IF EXISTS checkouts_email_key;`)
      
      // Check if the unique constraint already exists
      const constraintCheck = await db.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'checkouts' 
        AND constraint_name = 'checkouts_email_unique'
        AND constraint_type = 'UNIQUE';
      `)
      
      // Only add the constraint if it doesn't exist
      if (constraintCheck.rows.length === 0) {
        await db.query(`ALTER TABLE checkouts ADD CONSTRAINT checkouts_email_unique UNIQUE (email);`)
      }
    } catch (e) {
      console.error('DB constraint setup failed (non-fatal):', e)
    }
  } catch (e) {
    console.error('DB initialization failed (non-fatal):', e)
  }
}

type RecordCheckoutArgs = {
  sessionId: string | null
  customerId: string | null
  email: string | null
  fullName: string | null
  contactNumber: string | null
  selectedTier: string | null
  fromTier: string | null
  amountCents: number | null
  isUpgrade: boolean
  isAddon: boolean
}

export async function recordCheckout(args: RecordCheckoutArgs): Promise<void> {
  const db = getPool()
  if (!db) return
  const {
    sessionId,
    customerId,
    email,
    fullName,
    contactNumber,
    selectedTier,
    fromTier,
    amountCents,
    isUpgrade,
    isAddon,
  } = args

  if (email) {
    if (isAddon) {
      await db.query(
        `UPDATE checkouts
         SET amount_cents = COALESCE(amount_cents, 0) + COALESCE($1, 0)
         WHERE email = $2;`,
        [amountCents || 0, email],
      )
      return
    }
    await db.query(
      `INSERT INTO checkouts (session_id, customer_id, email, full_name, contact_number, selected_tier, from_tier, amount_cents, is_upgrade, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (email) DO UPDATE SET
         session_id = EXCLUDED.session_id,
         customer_id = COALESCE(EXCLUDED.customer_id, checkouts.customer_id),
         full_name = COALESCE(EXCLUDED.full_name, checkouts.full_name),
         contact_number = COALESCE(EXCLUDED.contact_number, checkouts.contact_number),
         selected_tier = COALESCE(EXCLUDED.selected_tier, checkouts.selected_tier),
         from_tier = COALESCE(EXCLUDED.from_tier, checkouts.from_tier),
         amount_cents = COALESCE(EXCLUDED.amount_cents, checkouts.amount_cents),
         is_upgrade = COALESCE(EXCLUDED.is_upgrade, checkouts.is_upgrade),
         created_at = checkouts.created_at;`,
      [
        sessionId,
        customerId || null,
        email,
        fullName || null,
        contactNumber || null,
        selectedTier || null,
        fromTier || null,
        amountCents || null,
        !!isUpgrade,
      ],
    )
  } else {
    await db.query(
      `INSERT INTO checkouts (session_id, customer_id, email, full_name, contact_number, selected_tier, from_tier, amount_cents, is_upgrade, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT DO NOTHING;`,
      [
        sessionId,
        customerId || null,
        null,
        fullName || null,
        contactNumber || null,
        selectedTier || null,
        fromTier || null,
        amountCents || null,
        !!isUpgrade,
      ],
    )
  }
}


