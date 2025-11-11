-- =====================================================
-- MIGRATION: Simplify Theme Table
-- Menghapus kolom color yang tidak terpakai
-- Hanya menyimpan font_family saja
-- =====================================================

USE virtualign;

-- Backup data theme yang ada
CREATE TABLE IF NOT EXISTS theme_backup AS SELECT * FROM theme;

-- Hapus kolom color yang tidak terpakai
ALTER TABLE `theme` 
  DROP COLUMN IF EXISTS `primary_color`,
  DROP COLUMN IF EXISTS `secondary_color`,
  DROP COLUMN IF EXISTS `accent_color`,
  DROP COLUMN IF EXISTS `text_color`,
  DROP COLUMN IF EXISTS `background_color`;

-- Update default font_family jika masih menggunakan yang lama
UPDATE `theme` 
SET `font_family` = "'Inter', 'Poppins', 'Segoe UI', sans-serif" 
WHERE `font_family` = 'Segoe UI, sans-serif' OR `font_family` IS NULL;

-- Tampilkan hasil
SELECT 'Theme table simplified successfully!' AS status;
SELECT * FROM theme;
