-- Удаляем существующую таблицу и создаем новую с правильной структурой
DROP TABLE IF EXISTS car_services CASCADE;

-- Создаем таблицу с новой структурой
CREATE TABLE car_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Основная информация о клиенте
  name text NOT NULL,
  phone text NOT NULL,
  
  -- Информация об автомобиле
  car_brand text NOT NULL,
  car_number text NOT NULL,
  current_mileage integer NOT NULL,
  
  -- История обслуживания
  last_service_date date,
  oil_type text,
  recommended_interval integer,
  
  -- Информация о текущем визите
  service_date date NOT NULL,
  work_types text[] NOT NULL,
  additional_work text,
  master_notes text,
  
  -- Системные поля
  user_id uuid REFERENCES auth.users,
  status text DEFAULT 'pending'
);

-- Индексы для оптимизации поиска
CREATE INDEX car_services_car_number_idx ON car_services(car_number);
CREATE INDEX car_services_phone_idx ON car_services(phone);
CREATE INDEX car_services_service_date_idx ON car_services(service_date);

-- Настройка RLS
ALTER TABLE car_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_services FORCE ROW LEVEL SECURITY;

-- Политики доступа
-- Разрешаем анонимную вставку записей
CREATE POLICY "Anyone can insert appointments"
  ON car_services
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Разрешаем анонимам просматривать записи
CREATE POLICY "Anyone can view appointments"
  ON car_services
  FOR SELECT
  TO anon
  USING (true);

-- Разрешаем всем просматривать записи
CREATE POLICY "Public can view appointments"
  ON car_services
  FOR SELECT
  TO public
  USING (true);

-- Разрешаем всем вставлять записи
CREATE POLICY "Public can insert appointments"
  ON car_services
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Комментарии к таблице
COMMENT ON TABLE car_services IS 'Записи на техническое обслуживание';
COMMENT ON COLUMN car_services.status IS 'Статус записи: pending, confirmed, completed, cancelled'; 