INSERT INTO services (name,duration_minutes,price_thb) VALUES
('อาบน้ำ',60,300),('ตัดขน',90,450),('ตัดเล็บ',20,100),('อาบน้ำ + ตัดขน',120,650)
ON CONFLICT (name) DO NOTHING;
