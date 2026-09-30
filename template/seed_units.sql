-- ==========================================================
-- DUMMY DATA : units
-- Cara pakai: phpMyAdmin (http://localhost:9092) -> pilih database
-- -> tab SQL -> paste isi file ini -> Go.
--
-- INSERT IGNORE: aman dijalankan berulang (baris dengan code/
-- reference yang sudah ada akan dilewati).
-- Tabel dibuat oleh AutoMigrate saat aplikasi Go berjalan.
-- ==========================================================

INSERT IGNORE INTO `units`
  (`id`, `reference`, `code`, `name`, `description`, `is_active`, `created_at`, `updated_at`)
VALUES
  ('592f4f8b-0d9b-4aed-a3e5-841ad6803d21', 'UNL58BN', 'PCS', 'Pieces', 'Satuan buah', 1, NOW(), NOW()),
  ('e602f935-65eb-4537-9437-261f78a51fd9', 'UNXBK63', 'BOX', 'Box', 'Satuan kotak', 1, NOW(), NOW()),
  ('cef0220d-3290-4ce6-8081-4a5ca0baa521', 'UNJYQFA', 'PACK', 'Pack', 'Satuan bungkus', 1, NOW(), NOW()),
  ('d7b39aa5-7e6b-404b-9ec8-e251496e5964', 'UN4QXNC', 'DUS', 'Dus', 'Satuan dus / karton', 1, NOW(), NOW()),
  ('fed24680-2c34-4f19-ba9a-a5d1e8707ec8', 'UN2AFU9', 'LSN', 'Lusin', 'Satuan 12 buah', 1, NOW(), NOW()),
  ('77dc0a16-0c6c-4193-a561-88e7c3c9ae90', 'UNQQ7CZ', 'KG', 'Kilogram', 'Satuan berat 1000 gram', 1, NOW(), NOW()),
  ('7d0b2577-118b-476c-9713-7bbb919c2691', 'UNSCL8E', 'GR', 'Gram', 'Satuan berat', 1, NOW(), NOW()),
  ('14712848-b053-43e5-8093-a40bbae3d6c6', 'UNKM598', 'LTR', 'Liter', 'Satuan volume', 1, NOW(), NOW()),
  ('b6d50ce6-f4f6-441d-99ab-f9a9c2bace67', 'UNTBAM3', 'ML', 'Mililiter', NULL, 1, NOW(), NOW()),
  ('321396ad-7129-4be7-9fa6-c0b2987f407a', 'UNCMEN5', 'MTR', 'Meter', 'Satuan panjang', 1, NOW(), NOW()),
  ('5ea13686-022c-4425-bec8-77d73b1dc268', 'UNHUY4N', 'CM', 'Centimeter', NULL, 1, NOW(), NOW()),
  ('6517a15d-69b9-45b3-a82f-656f8c5d4fcc', 'UNL88UU', 'ROLL', 'Roll', 'Satuan gulungan', 1, NOW(), NOW()),
  ('a976b423-461c-4528-96ab-c712f0ac5f55', 'UNFWSKY', 'SET', 'Set', 'Satuan paket lengkap', 1, NOW(), NOW()),
  ('1b555a8e-7dd6-43f6-b1f3-cc8b4cfea23a', 'UNJTYAF', 'BTL', 'Botol', 'Satuan botol', 1, NOW(), NOW()),
  ('0e09c41c-de60-4e91-80c6-4dddc577aeee', 'UNVJSCS', 'SAK', 'Sak', 'Satuan karung', 0, NOW(), NOW()),
  ('170bebe4-34c6-461d-b6c5-5ffaae361b44', 'UN8GXD9', 'UNIT', 'Unit', 'Satuan unit barang', 0, NOW(), NOW());
