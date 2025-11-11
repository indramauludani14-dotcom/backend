-- =====================================================
-- MIGRATION: Add Navbar Color to Theme Table
-- Menambahkan kolom navbar_color untuk customisasi warna navbar
-- =====================================================

USE virtualign;

-- Check if column exists, if not add it
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'virtualign' 
  AND TABLE_NAME = 'theme' 
  AND COLUMN_NAME = 'navbar_color'
);

-- Add navbar_color column if it doesn't exist
SET @query = IF(
  @col_exists = 0,
  'ALTER TABLE `theme` ADD COLUMN `navbar_color` VARCHAR(7) DEFAULT ''#0a0a0a'' AFTER `theme_name`',
  'SELECT "Column navbar_color already exists" AS status'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing theme records with default navbar color if NULL
UPDATE `theme` 
SET `navbar_color` = '#0a0a0a' 
WHERE `navbar_color` IS NULL OR `navbar_color` = '';

-- Display results
SELECT 'Migration completed successfully!' AS status;
SELECT * FROM theme;
