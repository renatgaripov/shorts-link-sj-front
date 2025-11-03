# Docker Setup

## Требования
- Docker
- Docker Compose

## Использование

### Production (сборка и запуск)

```bash
# Сборка и запуск
docker-compose up -d --build

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f app
docker-compose logs -f mongo
```

### Development (разработка с hot-reload)

```bash
# Запуск dev окружения
docker-compose -f docker-compose.dev.yml up -d --build

# Остановка
docker-compose -f docker-compose.dev.yml down

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f app
```

## Структура

- `data/mongo/` - данные MongoDB (хранится локально)
- `data/mongo-config/` - конфигурация MongoDB

## Создание пользователя

После первого запуска MongoDB создайте пользователя:

```bash
# Подключение к контейнеру приложения
docker-compose exec app yarn create-user <login> <password>

# Или если используется dev версия
docker-compose -f docker-compose.dev.yml exec app yarn create-user <login> <password>
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

По умолчанию:
- MongoDB URI: `mongodb://mongo:27017/clicker`
- Порт приложения: `3000`
- Порт MongoDB: `27017`

## Очистка данных

```bash
# Остановка контейнеров
docker-compose down

# Удаление данных MongoDB (ОСТОРОЖНО!)
rm -rf data/mongo data/mongo-config

# Удаление всех данных включая volumes
docker-compose down -v
```

