# Sneaker Drop – Real‑Time Inventory System

Full‑stack app for limited‑edition product drops.  
Users browse products, reserve for 60 seconds, then purchase.  
Stock updates live across all browsers via WebSocket.

## What This Is

A technical assessment submission. Implements:

- Atomic reservation (no overselling)
- 60‑second stock lock with auto‑expiry
- Real‑time stock sync across tabs
- Purchase flow (only if reserved)
- Admin API to create drops (no UI)

## How It Works

**Backend (Node + Express + Prisma + PostgreSQL)**

- `POST /admin-drops/create-drop` – admin creates a drop with total stock.
- `POST /public-reservations/reserve-drop` – user reserves one unit.
  - Checks existing active reservation for that user+drop.
  - Atomically decreases `availableStock` by 1 **only if** current stock > 0.
  - Creates a reservation row with `expiresAt = now + 60s`.
- Background job runs every 10 seconds:
  - Finds all `active` reservations where `expiresAt` is past.
  - Locks rows with `FOR UPDATE SKIP LOCKED` (safe for multiple server instances).
  - Marks them `expired` and restores `availableStock` +1.
- `POST /public-reservations/purchase-reserved-drop` – completes purchase.
  - Checks reservation is still active and not expired.
  - Creates purchase record, marks reservation `completed`.
- WebSocket (`realtime-drop:inventory`) broadcasts stock changes after any reserve, purchase, or expiry.

**Frontend (React + TanStack Query + Socket.io)**

- Fetches drops via `GET /public-drops/get-drops` (includes top 3 purchasers).
- Connects to WebSocket, listens to `realtime-drop:inventory`.
- Updates React Query cache directly → UI re‑renders only affected drop card.
- Floating badge shows active reservations count; dialog lists all reservations with countdown timer and purchase button.

## Highlighted Features

### 1. Preventing overselling when 100 users click at the same time

Used a database transaction with `Serializable` isolation:

```ts
const updated = await tx.drop.updateMany({
  where: { id: dropId, availableStock: { gt: 0 } },
  data: { availableStock: { decrement: 1 } }
})
if (updated.count === 0) throw new Error("Out of stock")
```

Only one update succeeds because PostgreSQL row‑level locking prevents concurrent decrements. The transaction also checks for existing active reservations to avoid double‑booking for the same user.

### 2. Handling the 60‑second expiration and stock recovery

A background job (`setInterval` every 10 seconds) runs raw SQL:

```sql
SELECT id, "dropId" FROM "Reservation"
WHERE status = 'active' AND "expiresAt" < NOW()
FOR UPDATE SKIP LOCKED
LIMIT 100
```

It processes expired reservations in batches, marks them `expired`, and increments `availableStock` for each affected drop. The `SKIP LOCKED` clause makes the job safe when multiple server instances run concurrently.

### 3. Real‑time stock sync work across tabs

- Server emits `realtime-drop:inventory` after any stock change (reserve, purchase, expiry).
- Frontend socket listener calls `queryClient.setQueryData` to update the cached drop list.
- All connected clients receive the event and update their UI instantly – no page refresh needed.

## Project Structure

```
/
├── back-end/          # Node + Express + Prisma + Socket.io
├── front-end/         # React + TanStack + Socket.io client
└── README.md
```

Each folder contains its own README with detailed setup instructions.

## Quick Start

### Backend

```bash
cd back-end
npm install
cp .env.example .env   # edit DATABASE_URL, FRONTEND_URL
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:4000`.

### Frontend

```bash
cd front-end
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Admin API (No UI)

Use static bearer token: `ddecbc49-e121-48bc-829c-eef4f4eb186b`

Example create drop:

```bash
curl -X POST http://localhost:4000/admin-drops/create-drop \
  -H "Authorization: Bearer ddecbc49-e121-48bc-829c-eef4f4eb186b" \
  -H "Content-Type: application/json" \
  -d '{"name":"AJ1","price":17000,"stock":100}'
```

See `back-end/README.md` for all admin endpoints.

## Limitations (🙂)

- Expiration job runs inside the main server process – would need a separate worker for production scale.
- Admin token is hardcoded – should be environment‑managed.
- No database read replicas – all queries hit primary.
- Price stored as float – real apps should use integer cents.

## Tech Stack

- **Backend**: Node.js, Express, Prisma (PostgreSQL), Socket.io, Zod
- **Frontend**: React, TypeScript, TanStack Query, TanStack Router, Socket.io client, Tailwind CSS, shadcn/ui
- **Deployment**: Backend via Docker (see Dockerfile), frontend on Vercel

## License
I don't know 🙂
