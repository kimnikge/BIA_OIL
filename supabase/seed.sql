-- Example seed data for car_services table
INSERT INTO car_services (name, phone, car_brand, car_number, mileage, next_service_date, service_date, work_types, additional_work)
VALUES 
  ('Иван Петров', '+7 (999) 123-45-67', 'Toyota', 'A123BC', 15000, '2024-06-15', '2024-04-10', ARRAY['oil_engine', 'coolant'], 'Проверка тормозной системы'),
  ('Мария Иванова', '+7 (999) 987-65-43', 'BMW', 'E456KM', 25000, '2024-07-20', '2024-04-15', ARRAY['oil_engine', 'oil_transmission'], 'Замена фильтров'); 