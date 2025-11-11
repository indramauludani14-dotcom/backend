-- =====================================================
-- VIRTUALIGN DATABASE SCHEMA (OFFICIAL)
-- Sesuai Dokumentasi Resmi TA - Departemen Teknik Komputer Undip
-- Dokumen: C300-02-TA1920.1.16037
-- Tanggal: 10 Februari 2021
-- =====================================================

DROP DATABASE IF EXISTS virtualign;
CREATE DATABASE virtualign CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE virtualign;

-- Drop tables if exists (reverse order for FK constraints)
DROP TABLE IF EXISTS social_media;
DROP TABLE IF EXISTS contact_pages;
DROP TABLE IF EXISTS property_agents;
DROP TABLE IF EXISTS contact_requests;
DROP TABLE IF EXISTS user_layoutdesigns;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS qna;
DROP TABLE IF EXISTS house_details;
DROP TABLE IF EXISTS virtual_tours;
DROP TABLE IF EXISTS house_types;
DROP TABLE IF EXISTS about_pages;
DROP TABLE IF EXISTS admins;

-- =====================================================
-- TABEL 2: ADMIN
-- Berisi data pengguna yang memiliki akses ke admin panel
-- =====================================================
CREATE TABLE admins (
    admin_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE COMMENT 'Nama pengguna',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Alamat email',
    password VARCHAR(255) NOT NULL COMMENT 'Kata sandi (hashed)',
    role VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT "Peran admin ('superadmin', 'admin')",
    last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu login terakhir',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan',
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 3: ABOUTPAGE
-- Berisi konten tentang informasi situs yang dapat dikelola oleh admin
-- =====================================================
CREATE TABLE about_pages (
    about_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    admin_id INT(10) NOT NULL COMMENT 'Foreign Key ke Admin',
    content TEXT NOT NULL COMMENT 'Konten halaman',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan konten',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 4: HOUSETYPE
-- Berisi jenis-jenis properti yang tersedia dengan deskripsi dan spesifikasi
-- =====================================================
CREATE TABLE house_types (
    house_type_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    admin_id INT(10) NOT NULL COMMENT 'Foreign Key ke Admin',
    name VARCHAR(255) NOT NULL COMMENT 'Nama Tipe Rumah',
    description TEXT NOT NULL COMMENT 'Deskripsi tipe rumah',
    base_area DECIMAL(10,2) NOT NULL COMMENT 'Luas dasar rumah (m²)',
    building_area DECIMAL(10,2) NOT NULL COMMENT 'Luas bangunan (m²)',
    thumbnail VARCHAR(255) NULL COMMENT 'Gambar thumbnail rumah',
    hero_image VARCHAR(255) NULL COMMENT 'Gambar utama rumah',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan tipe rumah',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 5: VIRTUALTOUR
-- Berisi data tentang virtual tour yang dapat dipilih untuk properti
-- =====================================================
CREATE TABLE virtual_tours (
    virtual_tour_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    house_type_id INT(10) NOT NULL COMMENT 'Foreign Key ke HouseType',
    tour_url VARCHAR(255) NOT NULL COMMENT 'URL dari virtual tour',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Menandakan apakah virtual tour ini unggulan',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan virtual tour',
    
    FOREIGN KEY (house_type_id) REFERENCES house_types(house_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_house_type (house_type_id),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 6: HOUSEDETAILS (NEW)
-- Berisi detail lengkap properti yang termasuk deskripsi, gambar, dan fasilitas
-- =====================================================
CREATE TABLE house_details (
    detail_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    house_type_id INT(10) NOT NULL COMMENT 'Foreign Key ke HouseType',
    virtual_tour_id INT(10) NOT NULL COMMENT 'Foreign Key ke VirtualTour',
    complete_description TEXT NULL COMMENT 'Deskripsi lengkap properti',
    total_land_area DECIMAL(10,2) NOT NULL COMMENT 'Luas tanah properti (m²)',
    building_area_details TEXT NULL COMMENT 'Detail luas bangunan properti',
    number_of_rooms INT(5) NOT NULL COMMENT 'Jumlah kamar properti',
    number_of_bathrooms INT(5) NOT NULL COMMENT 'Jumlah kamar mandi properti',
    facilities TEXT NULL COMMENT 'Fasilitas properti',
    base_layout_image VARCHAR(255) NULL COMMENT 'Gambar layout dasar',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan detail properti',
    
    FOREIGN KEY (house_type_id) REFERENCES house_types(house_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (virtual_tour_id) REFERENCES virtual_tours(virtual_tour_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_house_type (house_type_id),
    INDEX idx_virtual_tour (virtual_tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 7: Q&A
-- Berisi pertanyaan yang diajukan oleh pengunjung dan jawaban yang diberikan admin
-- =====================================================
CREATE TABLE qna (
    qna_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL COMMENT 'Nama pengunjung',
    visitor_email VARCHAR(255) NOT NULL COMMENT 'Email pengunjung',
    question_title VARCHAR(255) NOT NULL COMMENT 'Judul pertanyaan',
    question_content TEXT NOT NULL COMMENT 'Konten pertanyaan',
    question_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pertanyaan diajukan',
    admin_id INT(10) NULL COMMENT 'Foreign Key ke Admin (NULL jika belum dijawab)',
    answer_content TEXT NULL COMMENT 'Jawaban admin',
    answer_date TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu jawaban diberikan',
    status ENUM('answered', 'unanswered') NOT NULL DEFAULT 'unanswered' COMMENT 'Status pertanyaan',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_status (status),
    INDEX idx_visitor_email (visitor_email),
    INDEX idx_question_date (question_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 8: NEWS
-- Berisi berita terbaru yang relevan dengan properti atau informasi terkait
-- =====================================================
CREATE TABLE news (
    news_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    admin_id INT(10) NOT NULL COMMENT 'Foreign Key ke Admin',
    title VARCHAR(255) NOT NULL COMMENT 'Judul berita',
    content TEXT NOT NULL COMMENT 'Konten berita',
    image VARCHAR(255) NULL COMMENT 'Gambar berita',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan berita',
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu publikasi berita',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 9: FAQ
-- Berisi pertanyaan dan jawaban umum yang sering diajukan mengenai layanan atau situs
-- =====================================================
CREATE TABLE faqs (
    faq_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    admin_id INT(10) NOT NULL COMMENT 'Foreign Key ke Admin',
    question TEXT NOT NULL COMMENT 'Pertanyaan FAQ',
    answer TEXT NOT NULL COMMENT 'Jawaban FAQ',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan FAQ',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 10: USERLAYOUTDESIGN
-- Berisi desain layout yang dibuat oleh pengunjung, dengan konfigurasi furnitur dan gambar
-- =====================================================
CREATE TABLE user_layoutdesigns (
    design_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    visitor_session_id VARCHAR(255) NOT NULL COMMENT 'ID sesi pengunjung (UUID/session)',
    layout_image VARCHAR(255) NOT NULL COMMENT 'Gambar layout',
    furniture_configuration TEXT NOT NULL COMMENT 'Konfigurasi furnitur (JSON)',
    design_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu desain layout',
    export_jpeg_path VARCHAR(255) NULL COMMENT 'Path ekspor JPEG',
    export_pdf_path VARCHAR(255) NULL COMMENT 'Path ekspor PDF',
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'Status desain',
    
    INDEX idx_visitor_session (visitor_session_id),
    INDEX idx_status (status),
    INDEX idx_design_date (design_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 11: CONTACTREQUEST
-- Berisi permintaan kontak yang diajukan pengunjung terkait properti atau layanan
-- =====================================================
CREATE TABLE contact_requests (
    request_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    layout_id INT(10) NOT NULL COMMENT 'Foreign Key ke UserLayoutDesign',
    name VARCHAR(255) NOT NULL COMMENT 'Nama pengirim permintaan',
    phone VARCHAR(15) NOT NULL COMMENT 'Nomor telepon pengirim',
    message TEXT NOT NULL COMMENT 'Pesan yang dikirimkan',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pengiriman permintaan',
    status ENUM('received', 'resolved') NOT NULL DEFAULT 'received' COMMENT 'Status permintaan',
    
    FOREIGN KEY (layout_id) REFERENCES user_layoutdesigns(design_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_layout (layout_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 12: PROPERTYAGENT
-- Berisi informasi agen properti yang dapat dihubungi untuk transaksi atau konsultasi
-- =====================================================
CREATE TABLE property_agents (
    agent_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Nama agen properti',
    whatsapp_number VARCHAR(15) NOT NULL COMMENT 'Nomor WhatsApp agen',
    whatsapp_link VARCHAR(255) NULL COMMENT 'Tautan WhatsApp agen (wa.me format)',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Status agen',
    
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 13: CONTACTPAGE
-- Berisi data halaman kontak dengan alamat, email, telepon, dan lokasi
-- =====================================================
CREATE TABLE contact_pages (
    contact_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    admin_id INT(10) NOT NULL COMMENT 'Foreign Key ke Admin',
    address TEXT NOT NULL COMMENT 'Alamat halaman kontak',
    email VARCHAR(255) NOT NULL COMMENT 'Email kontak',
    phone VARCHAR(15) NOT NULL COMMENT 'Nomor telepon kontak',
    map_url VARCHAR(255) NULL COMMENT 'URL peta lokasi (Google Maps embed)',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu pembaruan halaman kontak',
    
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABEL 14: SOCIALMEDIA
-- Berisi data akun media sosial yang terkait dengan halaman kontak properti
-- =====================================================
CREATE TABLE social_media (
    social_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    contact_page_id INT(10) NOT NULL COMMENT 'Foreign Key ke ContactPage',
    platform VARCHAR(255) NOT NULL COMMENT 'Platform media sosial (Facebook, Instagram, Twitter, dll)',
    url VARCHAR(255) NOT NULL COMMENT 'URL media sosial',
    icon VARCHAR(255) NULL COMMENT 'Ikon media sosial (path atau emoji)',
    
    FOREIGN KEY (contact_page_id) REFERENCES contact_pages(contact_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_contact_page (contact_page_id),
    INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA / INITIAL DATA
-- =====================================================

-- Sample Admins
INSERT INTO admins (username, email, password, role, created_at) VALUES
('superadmin', 'superadmin@virtualign.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYhtgpZ1EaLtOoa', 'superadmin', NOW()),
('admin', 'admin@virtualign.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYhtgpZ1EaLtOoa', 'admin', NOW());
-- Password: admin123

-- Sample About Page
INSERT INTO about_pages (admin_id, content, updated_at) VALUES
(1, 'VirtualAlign adalah platform inovatif untuk desain interior rumah dengan teknologi AI dan Virtual Reality. Kami membantu Anda memvisualisasikan rumah impian dengan mudah dan cepat.', NOW());

-- Sample House Types
INSERT INTO house_types (admin_id, name, description, base_area, building_area, thumbnail, hero_image, created_at) VALUES
(1, 'Beach House', 'Rumah dengan konsep pantai modern, cocok untuk lokasi dekat laut dengan ventilasi optimal', 120.50, 180.75, '/assets/beach-house-thumb.jpg', '/assets/beach-house-hero.jpg', NOW()),
(1, 'Modern House', 'Rumah minimalis modern dengan desain kontemporer dan efisiensi ruang maksimal', 150.00, 220.00, '/assets/modern-house-thumb.jpg', '/assets/modern-house-hero.jpg', NOW()),
(1, 'Classic Villa', 'Villa klasik dengan sentuhan elegan dan ruang terbuka yang luas', 200.00, 300.00, '/assets/classic-villa-thumb.jpg', '/assets/classic-villa-hero.jpg', NOW());

-- Sample Virtual Tours
INSERT INTO virtual_tours (house_type_id, tour_url, is_featured, created_at) VALUES
(1, '/UnityBuild/index.html?house=beach', TRUE, NOW()),
(2, '/UnityBuild/index.html?house=modern', TRUE, NOW()),
(3, '/UnityBuild/index.html?house=villa', FALSE, NOW());

-- Sample House Details
INSERT INTO house_details (house_type_id, virtual_tour_id, complete_description, total_land_area, building_area_details, number_of_rooms, number_of_bathrooms, facilities, base_layout_image, created_at) VALUES
(1, 1, 'Beach House dengan pemandangan laut, material tahan cuaca, dan desain terbuka yang memaksimalkan sirkulasi udara.', 200.00, 'Lantai 1: 100m², Lantai 2: 80.75m²', 3, 2, 'Kolam Renang, Teras Pantai, BBQ Area, Carport', '/assets/beach-layout.png', NOW()),
(2, 2, 'Modern House dengan smart home system, solar panel, dan material ramah lingkungan.', 250.00, 'Lantai 1: 120m², Lantai 2: 100m²', 4, 3, 'Smart Home, Solar Panel, Rooftop Garden, Carport 2 Mobil', '/assets/modern-layout.png', NOW()),
(3, 3, 'Classic Villa dengan arsitektur Eropa, ruang tamu luas, dan taman pribadi yang asri.', 400.00, 'Lantai 1: 180m², Lantai 2: 120m²', 5, 4, 'Private Pool, Taman Luas, Gazebo, Carport 3 Mobil, Ruang Staff', '/assets/villa-layout.png', NOW());

-- Sample FAQs
INSERT INTO faqs (admin_id, question, answer, created_at) VALUES
(1, 'Bagaimana cara menggunakan fitur auto layout?', 'Pilih furnitur yang Anda inginkan, kemudian klik tombol "Auto Layout AI" di bagian atas editor. Sistem akan secara otomatis menempatkan furnitur dengan optimal.', NOW()),
(1, 'Apakah saya perlu mendaftar untuk menggunakan layanan?', 'Tidak, Anda dapat langsung menggunakan fitur layout designer tanpa perlu mendaftar. Session Anda akan tersimpan otomatis.', NOW()),
(1, 'Bagaimana cara mengekspor hasil desain?', 'Klik tombol "Export PNG" untuk mendapatkan gambar layout Anda. Untuk format PDF dan konsultasi lebih lanjut, silakan hubungi agen kami.', NOW());

-- Sample News
INSERT INTO news (admin_id, title, content, image, created_at, published_at) VALUES
(1, 'Peluncuran Fitur AI Auto Layout', 'Kami dengan bangga mengumumkan peluncuran fitur AI Auto Layout yang memudahkan Anda mendesain interior rumah secara otomatis dengan teknologi Machine Learning.', '/uploads/news/ai-launch.jpg', NOW(), NOW()),
(1, 'Virtual Tour Kini Tersedia di Mobile', 'Pengalaman Virtual Reality kini dapat diakses melalui perangkat mobile Anda dengan kontrol touch yang intuitif.', '/uploads/news/mobile-vr.jpg', NOW(), NOW());

-- Sample Q&A (unanswered)
INSERT INTO qna (visitor_name, visitor_email, question_title, question_content, question_date, status) VALUES
('Budi Santoso', 'budi@email.com', 'Biaya konsultasi design', 'Berapa biaya untuk konsultasi lengkap desain interior rumah 2 lantai?', NOW(), 'unanswered');

-- Sample Q&A (answered)
INSERT INTO qna (visitor_name, visitor_email, question_title, question_content, question_date, admin_id, answer_content, answer_date, status) VALUES
('Siti Rahayu', 'siti@email.com', 'Durasi pengerjaan', 'Berapa lama waktu yang dibutuhkan untuk menyelesaikan desain interior?', DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 'Untuk desain interior standar biasanya membutuhkan 2-3 minggu, tergantung kompleksitas dan revisi yang diperlukan.', DATE_SUB(NOW(), INTERVAL 1 DAY), 'answered');

-- Sample Property Agents
INSERT INTO property_agents (name, whatsapp_number, whatsapp_link, status) VALUES
('Rina Wati', '081234567890', 'https://wa.me/6281234567890', 'active'),
('Ahmad Fauzi', '081298765432', 'https://wa.me/6281298765432', 'active'),
('Dewi Lestari', '081356789012', 'https://wa.me/6281356789012', 'inactive');

-- Sample Contact Page
INSERT INTO contact_pages (admin_id, address, email, phone, map_url, updated_at) VALUES
(1, 'Jl. Prof. H. Soedarto, SH, Tembalang, Semarang, 50275 Indonesia', 'contact@virtualign.com', '024-7460056', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.9876543210!2d110.4420987!3d-7.0511234', NOW());

-- Sample Social Media
INSERT INTO social_media (contact_page_id, platform, url, icon) VALUES
(1, 'Facebook', 'https://facebook.com/virtualign', 'facebook'),
(1, 'Instagram', 'https://instagram.com/virtualign', 'instagram'),
(1, 'Twitter', 'https://twitter.com/virtualign', 'twitter');

-- Sample User Layout Design (Guest)
INSERT INTO user_layoutdesigns (visitor_session_id, layout_image, furniture_configuration, design_date, status) VALUES
('guest-uuid-12345-abcde', '/exports/layout-guest-12345.png', '{"items":[{"id":1,"nama":"SOFA 3 Seat","posisi_x":467,"posisi_y":265,"panjang":260,"lebar":100}]}', NOW(), 'completed');

-- Sample Contact Request
INSERT INTO contact_requests (layout_id, name, phone, message, created_at, status) VALUES
(1, 'John Doe', '081234567890', 'Saya tertarik dengan desain Beach House dan ingin konsultasi lebih lanjut.', NOW(), 'received');

-- =====================================================
-- VIEWS (Optional - untuk mempermudah query)
-- =====================================================

-- View untuk House Types dengan Admin Info
CREATE OR REPLACE VIEW view_house_types_complete AS
SELECT 
    ht.house_type_id,
    ht.name AS house_name,
    ht.description,
    ht.base_area,
    ht.building_area,
    ht.thumbnail,
    ht.hero_image,
    ht.created_at,
    a.admin_id,
    a.username AS admin_username
FROM house_types ht
JOIN admins a ON ht.admin_id = a.admin_id;

-- View untuk Q&A dengan Admin Info
CREATE OR REPLACE VIEW view_qna_complete AS
SELECT 
    q.qna_id,
    q.visitor_name,
    q.visitor_email,
    q.question_title,
    q.question_content,
    q.question_date,
    q.answer_content,
    q.answer_date,
    q.status,
    a.admin_id,
    a.username AS admin_username
FROM qna q
LEFT JOIN admins a ON q.admin_id = a.admin_id;

-- View untuk User Designs dengan Contact Requests
CREATE OR REPLACE VIEW view_user_designs_with_contacts AS
SELECT 
    uld.design_id,
    uld.visitor_session_id,
    uld.layout_image,
    uld.furniture_configuration,
    uld.design_date,
    uld.export_jpeg_path,
    uld.export_pdf_path,
    uld.status AS design_status,
    cr.request_id,
    cr.name AS contact_name,
    cr.phone AS contact_phone,
    cr.message AS contact_message,
    cr.status AS contact_status
FROM user_layoutdesigns uld
LEFT JOIN contact_requests cr ON uld.design_id = cr.layout_id;

-- View untuk House Details Complete
CREATE OR REPLACE VIEW view_house_details_complete AS
SELECT 
    hd.detail_id,
    hd.complete_description,
    hd.total_land_area,
    hd.building_area_details,
    hd.number_of_rooms,
    hd.number_of_bathrooms,
    hd.facilities,
    hd.base_layout_image,
    hd.created_at,
    ht.house_type_id,
    ht.name AS house_name,
    ht.description AS house_description,
    ht.thumbnail,
    ht.hero_image,
    vt.virtual_tour_id,
    vt.tour_url,
    vt.is_featured
FROM house_details hd
JOIN house_types ht ON hd.house_type_id = ht.house_type_id
JOIN virtual_tours vt ON hd.virtual_tour_id = vt.virtual_tour_id;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Verify table creation
SHOW TABLES;
