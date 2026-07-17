# ABENGOUROU-MARKET

Plateforme numérique de marketplace pour Abengourou, Côte d'Ivoire.

## Stack
- **Backend**: Node.js + Express (`server.js`)
- **Frontend**: Vanilla JS + CSS (`public/`)
- **Database**: PostgreSQL (via `pg` + `DATABASE_URL`)
- **AI**: Groq API (key configurable in admin settings)
- **SMS**: Ikoddi SDK
- **Image processing**: Sharp + Multer

## How to run
Workflow: **Start application** → `node server.js` → port 5000

## Environment
- `DATABASE_URL` — PostgreSQL connection string (Render.com DB used as fallback if not set)
- `GROQ_API_KEY` — Groq API key (overrides the default hardcoded key if set)
- `PORT` — defaults to 5000

## Admin access
- URL: navigate to admin panel from the app
- Default credentials: `buzz` / `arrow`
- The Groq AI key can be changed at any time in **Admin → Paramètres → Clé API IA**

## User preferences
