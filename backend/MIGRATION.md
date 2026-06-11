# Hướng dẫn Migration SQLite → PostgreSQL

## Yêu cầu
- PostgreSQL 16+
- pgloader (cài qua brew/choco/apt)

## Bước 1: Chuẩn bị database
```bash
createdb mindwell
```

## Bước 2: Export SQLite → PostgreSQL
```bash
pgloader scripts/pgloader/migrate.load
```

## Bước 3: Kiểm tra datetime
```sql
SELECT id, created_at FROM users WHERE created_at > '2100-01-01';
```

## Bước 4: Run Drizzle migrations
```bash
npx drizzle-kit migrate
```

## Bước 5: Seed data
```bash
npx tsx src/db/seed.ts
```

## Bước 6: Dual-write mode
```bash
DATABASE_URL=postgres://... DUAL_WRITE=true npm run dev
```
