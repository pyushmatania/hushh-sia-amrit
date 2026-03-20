-- Delete previously added Fun/Comforting host_listings
DELETE FROM host_listings WHERE id IN (
  '10a17aa5-0af2-43f5-97b0-3743c140a973',
  '38958ec1-ceea-41db-aa55-c25032304740',
  '29cce4b3-9513-4f2f-abe4-23565119d9d6',
  'feebe959-72cd-4482-a6ec-7e0d3f470a7d',
  '89d46def-9e77-4adc-b6f1-0b29f6cf0606',
  '12b12e68-a6ed-4eb6-b919-7640a702914b',
  '296ec68c-f383-4f04-9c97-0ae5f07f7b72',
  '07331f60-771e-4394-96a3-72e141a1a490',
  '76c39a39-bfa3-4bf8-80c1-86d94a1f2a40',
  'a69aec0b-5c6f-4d63-af42-85ddc77e7654',
  'b920abf4-7471-4793-bcf8-634c1527a455',
  'cd504c2a-764d-4177-aa56-2bb1b78ab3bb',
  'ab6fe239-d2b1-4079-afba-5d498c7c6153',
  '3293199e-dbe7-4a80-aee3-b697272b646a',
  'c3b21e39-c095-4dba-95ec-bf03f2ab2b09',
  'b576b8ac-cfad-498b-b644-be5c24080027',
  '007d50b9-01ec-48d0-a35a-9fe93a1e59ac',
  '4b88f6e2-ee78-452f-a3b1-d6f55990b451',
  '839f2621-b7b0-4e60-bb9c-f8c4baeb14ff',
  '7bc332fc-219e-4377-b01b-9e35b7539b67'
);

-- Add 10 Fun (entertainment/activity) inventory items
INSERT INTO inventory (name, category, emoji, unit_price, stock, available, sort_order) VALUES
  ('Trampoline Session', 'entertainment', '🤸', 400, 50, true, 20),
  ('Laser Tag Set', 'entertainment', '🔫', 600, 30, true, 21),
  ('VR Headset Rental', 'entertainment', '🥽', 800, 20, true, 22),
  ('Go-Kart Ride', 'entertainment', '🏎️', 500, 40, true, 23),
  ('Paintball Gear', 'entertainment', '🎯', 700, 25, true, 24),
  ('Water Balloon Kit', 'activity', '🎈', 150, 80, true, 25),
  ('Archery Set', 'activity', '🏹', 350, 30, true, 26),
  ('Slip-N-Slide Setup', 'activity', '🌊', 300, 20, true, 27),
  ('Giant Jenga', 'activity', '🧱', 200, 40, true, 28),
  ('Photo Booth Props', 'entertainment', '📸', 250, 50, true, 29);

-- Add 10 Comfort inventory items
INSERT INTO inventory (name, category, emoji, unit_price, stock, available, sort_order) VALUES
  ('Hot Water Bottle', 'comfort', '♨️', 80, 60, true, 20),
  ('Weighted Blanket', 'comfort', '🧣', 250, 30, true, 21),
  ('Essential Oil Diffuser', 'comfort', '🌿', 200, 40, true, 22),
  ('Memory Foam Pillow', 'comfort', '💤', 180, 50, true, 23),
  ('Cozy Socks Set', 'comfort', '🧦', 100, 100, true, 24),
  ('Herbal Tea Kit', 'comfort', '🍵', 120, 80, true, 25),
  ('Eye Mask & Earplugs', 'comfort', '😴', 80, 100, true, 26),
  ('Room Heater', 'comfort', '🔥', 300, 20, true, 27),
  ('White Noise Machine', 'comfort', '🔈', 150, 35, true, 28),
  ('Scented Candle Set', 'comfort', '🕯️', 200, 60, true, 29);