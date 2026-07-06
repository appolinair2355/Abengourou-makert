# ABENGOUROU-MARKET

Plateforme numérique d'Abengourou (Côte d'Ivoire) — acheter, vendre, immobilier, emploi, rencontres.

## Stack

- **Backend**: Node.js + Express (`server.js`)
- **Frontend**: SPA vanilla JS (`public/app.js`, `public/index.html`, `public/styles.css`)
- **Database**: PostgreSQL (Replit built-in, tables auto-created on startup)
- **Other**: `sharp` (image resizing), `xlsx` (Excel export/import), `ikoddi-client-sdk` (SMS)

## How to run

```bash
npm install
node server.js
```

The workflow **Start application** (`node server.js`) runs on port 5000.

## Environment variables

| Variable       | Description                          | Default            |
|----------------|--------------------------------------|--------------------|
| `DATABASE_URL` | PostgreSQL connection string         | Replit built-in DB |
| `ADMIN_ID`     | Admin username                       | `buzz`             |
| `ADMIN_PWD`    | Admin password                       | `arrow`            |
| `PORT`         | Server port                          | `5000`             |

## Admin access

Navigate to the site and log in with the admin credentials (`buzz` / `arrow` by default, or values set via env vars).

## Database

Tables are created automatically on first startup via `initDB()` in `server.js`. Images are stored as base64 in PostgreSQL.

## User preferences
