import { Pool } from 'pg'

// Hardcoded environment variables for deployment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.fgtzsslxumdlmbmrrxrc:yM5Z5EtPgnwocXzw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'

let pool: Pool | null = null

function getPool(): Pool | null {
  if (!pool && DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      })
    } catch (err) {
      console.error('Failed to create database pool:', err)
    }
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
        base_amount_cents INTEGER DEFAULT 0,
        addons_amount_cents INTEGER DEFAULT 0,
        is_upgrade BOOLEAN DEFAULT false,
        is_addon BOOLEAN DEFAULT false,
        oto_step INTEGER,
        oto_kind TEXT,
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
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS is_addon BOOLEAN DEFAULT false;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS oto_step INTEGER;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS oto_kind TEXT;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS base_amount_cents INTEGER DEFAULT 0;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS addons_amount_cents INTEGER DEFAULT 0;`)
      await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS thankyou_sent BOOLEAN DEFAULT false;`)
      // Ensure unique constraint on customer_id to support upserts when email is missing
      const custConstraint = await db.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'checkouts' 
          AND constraint_type = 'UNIQUE' 
          AND constraint_name = 'checkouts_customer_unique';
      `)
      if (custConstraint.rows.length === 0) {
        await db.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'checkouts_customer_id_key'
            ) THEN
              CREATE UNIQUE INDEX checkouts_customer_id_key ON checkouts (customer_id);
            END IF;
          END$$;
        `)
        await db.query(`ALTER TABLE checkouts ADD CONSTRAINT checkouts_customer_unique UNIQUE USING INDEX checkouts_customer_id_key;`)
      }
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

export async function recordCheckout(data: {
  sessionId: string
  customerId?: string
  email?: string
  fullName?: string
  contactNumber?: string
  selectedTier: string
  fromTier?: string
  amountCents: number
  baseAmountCents?: number
  addonsAmountCents?: number
  isUpgrade: boolean
  isAddon?: boolean
  otoStep?: number
  otoKind?: string
}): Promise<void> {
  const db = getPool()
  if (!db) return

  try {
    const baseAmount = typeof data.baseAmountCents === 'number' ? data.baseAmountCents : 0
    const addonsAmount = typeof data.addonsAmountCents === 'number' ? data.addonsAmountCents : 0
    const totalAmount = (baseAmount || 0) + (addonsAmount || 0) || data.amountCents || 0

    const conflictTarget = data.email ? 'email' : (data.customerId ? 'customer_id' : '')

    if (!conflictTarget) {
      // Plain insert when we lack a stable conflict key
      await db.query(`
        INSERT INTO checkouts (
          session_id, customer_id, email, full_name, contact_number,
          selected_tier, from_tier, amount_cents, base_amount_cents, addons_amount_cents,
          is_upgrade, is_addon, oto_step, oto_kind
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        data.sessionId,
        data.customerId,
        data.email,
        data.fullName,
        data.contactNumber,
        data.selectedTier,
        data.fromTier,
        totalAmount,
        baseAmount,
        addonsAmount,
        data.isUpgrade,
        !!data.isAddon,
        typeof data.otoStep === 'number' ? data.otoStep : null,
        data.otoKind || null
      ])
      return
    }

    const upsertSql = `
      INSERT INTO checkouts (
        session_id, customer_id, email, full_name, contact_number,
        selected_tier, from_tier, amount_cents, base_amount_cents, addons_amount_cents,
        is_upgrade, is_addon, oto_step, oto_kind
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (${conflictTarget}) DO UPDATE SET
        session_id = EXCLUDED.session_id,
        customer_id = COALESCE(EXCLUDED.customer_id, checkouts.customer_id),
        full_name = COALESCE(EXCLUDED.full_name, checkouts.full_name),
        contact_number = COALESCE(EXCLUDED.contact_number, checkouts.contact_number),
        selected_tier = COALESCE(EXCLUDED.selected_tier, checkouts.selected_tier),
        from_tier = COALESCE(EXCLUDED.from_tier, checkouts.from_tier),
        base_amount_cents = GREATEST(COALESCE(EXCLUDED.base_amount_cents, 0), COALESCE(checkouts.base_amount_cents, 0)),
        addons_amount_cents = COALESCE(checkouts.addons_amount_cents, 0) + COALESCE(EXCLUDED.addons_amount_cents, 0),
        amount_cents = GREATEST(COALESCE(EXCLUDED.base_amount_cents, 0), COALESCE(checkouts.base_amount_cents, 0)) + (COALESCE(checkouts.addons_amount_cents, 0) + COALESCE(EXCLUDED.addons_amount_cents, 0)),
        is_upgrade = (checkouts.is_upgrade OR COALESCE(EXCLUDED.is_upgrade, false)),
        is_addon = (checkouts.is_addon OR COALESCE(EXCLUDED.is_addon, false)),
        oto_step = GREATEST(COALESCE(EXCLUDED.oto_step, 0), COALESCE(checkouts.oto_step, 0)),
        oto_kind = COALESCE(EXCLUDED.oto_kind, checkouts.oto_kind)
    `
    await db.query(upsertSql, [
      data.sessionId,
      data.customerId,
      data.email,
      data.fullName,
      data.contactNumber,
      data.selectedTier,
      data.fromTier,
      totalAmount,
      baseAmount,
      addonsAmount,
      data.isUpgrade,
      !!data.isAddon,
      typeof data.otoStep === 'number' ? data.otoStep : null,
      data.otoKind || null
    ])
  } catch (err) {
    console.error('Failed to record checkout:', err)
    throw err
  }
}

export async function hasSession(sessionId: string): Promise<boolean> {
  const db = getPool()
  if (!db) return false
  try {
    const res = await db.query('SELECT 1 FROM checkouts WHERE session_id = $1 LIMIT 1', [sessionId])
    return res.rowCount > 0
  } catch {
    return false
  }
}

export async function markThankYouSentBySession(sessionId: string): Promise<void> {
  const db = getPool()
  if (!db) return
  try {
    await db.query('UPDATE checkouts SET thankyou_sent = true WHERE session_id = $1', [sessionId])
  } catch {}
}

export async function isThankYouSentBySession(sessionId: string): Promise<boolean> {
  const db = getPool()
  if (!db) return false
  try {
    const res = await db.query('SELECT thankyou_sent FROM checkouts WHERE session_id = $1 LIMIT 1', [sessionId])
    if (res.rowCount === 0) return false
    return !!res.rows[0]?.thankyou_sent
  } catch {
    return false
  }
}

export async function claimThankYouSendBySession(sessionId: string): Promise<boolean> {
  const db = getPool()
  if (!db) return false
  try {
    const res = await db.query(
      'UPDATE checkouts SET thankyou_sent = true WHERE session_id = $1 AND thankyou_sent = false RETURNING 1',
      [sessionId]
    )
    return res.rowCount > 0
  } catch {
    return false
  }
}


