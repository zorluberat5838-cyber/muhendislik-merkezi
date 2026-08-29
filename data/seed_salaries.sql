
DELETE FROM salaries
WHERE engineering IN (
    'Bilgisayar Mühendisliği',
    'Yazılım Mühendisliği',
    'Makine Mühendisliği',
    'Elektrik-Elektronik Mühendisliği',
    'İnşaat Mühendisliği',
    'Endüstri Mühendisliği',
    'Kimya Mühendisliği'
)
AND year = 2026;

INSERT INTO salaries (engineering, sector, year, salary, source) VALUES
('Bilgisayar Mühendisliği','Özel sektör',2026,'İlan ve maaş platformu verileri güncellenerek eklenecek','Kaynak doğrulaması gerekli'),
('Yazılım Mühendisliği','Özel sektör',2026,'İlan ve maaş platformu verileri güncellenerek eklenecek','Kaynak doğrulaması gerekli'),
('Makine Mühendisliği','Kamu / Özel',2026,'Kurum, deneyim ve dereceye göre değişir','Resmî kurum ve sektörel veriler'),
('Elektrik-Elektronik Mühendisliği','Kamu / Özel',2026,'Kurum, deneyim ve sektöre göre değişir','Resmî kurum ve sektörel veriler'),
('İnşaat Mühendisliği','Özel sektör',2026,'Proje, şehir ve deneyime göre değişir','Sektörel veriler'),
('Endüstri Mühendisliği','Özel sektör',2026,'Pozisyon ve deneyime göre değişir','Sektörel veriler'),
('Kimya Mühendisliği','Özel sektör',2026,'Sektör ve deneyime göre değişir','Sektörel veriler');
