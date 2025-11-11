-- Migration: Add navbar_text_color column to theme table
-- Date: 2024
-- Description: Adds navbar_text_color field to store navbar text color customization

USE virtualign;

-- Check if column exists, if not add it
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'virtualign'
    AND TABLE_NAME = 'theme'
    AND COLUMN_NAME = 'navbar_text_color'
);

-- Add column if it doesn't exist
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE theme ADD COLUMN navbar_text_color VARCHAR(7) DEFAULT "#ffffff" AFTER navbar_color;',
    'SELECT "Column navbar_text_color already exists" as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records to have default text color
UPDATE theme 
SET navbar_text_color = '#ffffff' 
WHERE navbar_text_color IS NULL;

SELECT 'Migration completed: navbar_text_color column added successfully' as result;
