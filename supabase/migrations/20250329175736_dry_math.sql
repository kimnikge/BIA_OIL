/*
  # Car Service Appointments Schema

  1. New Tables
    - `car_services`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone` (text, required)
      - `car_brand` (text, required)
      - `car_number` (text, required)
      - `mileage` (integer, required)
      - `next_service_date` (date, required)
      - `service_date` (date, required)
      - `work_types` (text[], required)
      - `additional_work` (text)
      - `created_at` (timestamptz, auto-generated)
      - `user_id` (uuid, references auth.users(id))

  2. Security
    - Enable RLS on `car_services` table
    - Add policies for:
      - Insert: Allow anonymous users to create appointments
      - Select: Allow anonymous users to view appointments
*/

CREATE TABLE IF NOT EXISTS car_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  car_brand text NOT NULL,
  car_number text NOT NULL,
  mileage integer NOT NULL,
  next_service_date date NOT NULL,
  service_date date NOT NULL,
  work_types text[] NOT NULL,
  additional_work text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE car_services ENABLE ROW LEVEL SECURITY;

-- Полностью отключаем RLS для таблицы car_services
ALTER TABLE car_services FORCE ROW LEVEL SECURITY;

-- Разрешаем анонимам вставлять записи
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