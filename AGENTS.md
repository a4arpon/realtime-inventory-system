# Techzu Agent Guidance

## Project Structure
- back-end/: Node.js/Express API with Prisma ORM
- front-end/: React + TypeScript + Vite SPA

## Backend Commands
Dev: `npm run dev` (in back-end/)
Build: `npm run build`
Start: `npm start`
DB Migrate: `npm run db:migrate`
DB Generate: `npm run db:generate`
DB Seed: `npm run db:seed`
DB Format: `npm run db:fmt`

Backend entry: `src/serve.ts` → `src/app.ts`

## Frontend Commands
Dev: `npm run dev` (in front-end/)
Build: `npm run build`
Lint: `npm run lint`
Preview: `npm run preview`

Frontend entry: standard Vite React setup

## Toolchain
- Formatter: oxfmt
- Linter: oxlint
- TypeScript: strict mode enabled
- Build: esbuild (backend), Vite (frontend)
- Database: Prisma ORM with PostgreSQL
- Env: .env files loaded via --env-file flag

## Important Notes
- Prisma schema: back-end/src/utils/prisma/
- Generated client: back-end/src/utils/prisma/client.ts
- Seed script: back-end/prisma/seed.js
- WebSocket: back-end/src/web-socket.ts
- Error middleware: back-end/src/middleware/error.ts
- Config: back-end/src/config/{database.ts,env.ts}

## Verification Order
Lint → Typecheck → Test (when tests added)