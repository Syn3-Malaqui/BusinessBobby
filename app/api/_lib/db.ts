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

export async function recordCheckout(data: {
  sessionId: string
  customerId?: string
  email?: string
  fullName?: string
  contactNumber?: string
  selectedTier: string
  fromTier?: string
  amountCents: number
  isUpgrade: boolean
  isAddon?: boolean
}): Promise<void> {
  const db = getPool()
  if (!db) return

  try {
    await db.query(`
      INSERT INTO checkouts (
        session_id, customer_id, email, full_name, contact_number, 
        selected_tier, from_tier, amount_cents, is_upgrade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      data.sessionId,
      data.customerId,
      data.email,
      data.fullName,
      data.contactNumber,
      data.selectedTier,
      data.fromTier,
      data.amountCents,
      data.isUpgrade
    ])
  } catch (err) {
    console.error('Failed to record checkout:', err)
    throw err
  }
}


