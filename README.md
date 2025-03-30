# BIA OIL - Сервис записи на техническое обслуживание

Веб-приложение для записи клиентов автосервиса на техническое обслуживание.

## Технологии

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (база данных)
- Netlify (хостинг и обработка форм)

## Функциональность

- Запись на техническое обслуживание
- Выбор марки автомобиля
- Выбор видов работ
- Указание пробега и даты обслуживания
- Сохранение данных в Supabase

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Переменные окружения

Создайте файл `.env` со следующими переменными:

```
VITE_SUPABASE_URL=ваш_url_supabase
VITE_SUPABASE_ANON_KEY=ваш_anon_key_supabase
```

## Структура базы данных

Таблица `car_services`:
- id: uuid (первичный ключ)
- name: text (имя клиента)
- phone: text (телефон)
- car_brand: text (марка автомобиля)
- car_number: text (номер автомобиля)
- mileage: integer (пробег)
- next_service_date: date (дата следующего ТО)
- service_date: date (желаемая дата ТО)
- work_types: text[] (типы работ)
- additional_work: text (дополнительные работы)
- created_at: timestamptz (дата создания записи)
- user_id: uuid (ссылка на пользователя)
