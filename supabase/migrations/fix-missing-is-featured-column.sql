-- =====================================================
-- FIX: Add missing is_featured column to businesses table
-- Run this if you got error: column "is_featured" does not exist
-- =====================================================

-- Add is_featured column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE businesses ADD COLUMN is_featured BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_featured column to businesses table';
  ELSE
    RAISE NOTICE 'is_featured column already exists';
  END IF;
END $$;

-- Add featured_until column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'featured_until'
  ) THEN
    ALTER TABLE businesses ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added featured_until column to businesses table';
  ELSE
    RAISE NOTICE 'featured_until column already exists';
  END IF;
END $$;

-- Now create the index (will succeed now that column exists)
DROP INDEX IF EXISTS idx_businesses_featured;
CREATE INDEX idx_businesses_featured ON businesses(is_featured) WHERE is_featured = true;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed! is_featured column and index created successfully';
END $$;