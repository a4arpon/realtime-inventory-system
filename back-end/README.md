# Sneaker Drop – Backend

This is the backend for a real‑time “limited edition sneaker drop” system.  
Users can browse products, reserve an item for 60 seconds, and complete the purchase – all with live stock updates across all browsers.

## 🚀 Quick Start for Developers

### 1. Install dependencies

```bash
npm install
```

````

### 2. Set up environment variables

Create a `.env` file (copy from `.env.example`):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:pass@localhost:5432/sneaker_drop"
FRONTEND_URL="http://localhost:5173"   # your React app URL
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:4000`.

---

## 📡 API Endpoints for the Frontend

All public endpoints expect a **Bearer token** with the user’s `sessionId`.
The frontend must obtain a sessionId first (see below) and send it in the `Authorization` header:

```
Authorization: Bearer <sessionId>
```

### 👤 Session management (one‑time)

| Endpoint                    | Method | What it does                                                                                  |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `/public-users/create-user` | POST   | Creates a new user and returns `sessionId` + `username`. Store `sessionId` in `localStorage`. |

**Response example:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "John_Doe",
    "sessionId": "a1b2c3..."
  }
}
```

> After this, the frontend uses the same `sessionId` for all authenticated requests.

### 🎁 Drops (products)

| Endpoint                  | Method | What it does                                                                                            |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `/public-drops/get-drops` | GET    | Returns all drops with name, price, current stock, and the **top 3 latest purchasers** (username only). |

### 📦 Reservation & purchase

| Endpoint                                      | Method | What it does                                                                                              |
| --------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `/public-reservations/reserve-drop`           | POST   | Body: `{ "dropId": "uuid" }` – tries to reserve 1 unit. Returns reservation object with 60‑second expiry. |
| `/public-reservations/my-reservations`        | GET    | Returns all active reservations for the logged‑in user (with drop details).                               |
| `/public-reservations/purchase-reserved-drop` | POST   | Body: `{ "reserveId": "uuid" }` – completes the purchase. Returns purchase confirmation.                  |

> **Important:** After a successful reservation or purchase, the server broadcasts a WebSocket event (`realtime-drop:inventory`) so that **all open tabs** see the new stock count instantly.

---

## 🛠️ Admin API (no frontend required)

Admin endpoints use a **static Bearer token** (hardcoded in code for demo purposes).
Token: `ddecbc49-e121-48bc-829c-eef4f4eb186b`

You can use `curl` to manage drops:

### Create a new drop

```bash
curl -X POST http://localhost:4000/admin-drops/create-drop \
  -H "Authorization: Bearer ddecbc49-e121-48bc-829c-eef4f4eb186b" \
  -H "Content-Type: application/json" \
  -d '{"name":"Air Jordan 1","price":17000,"stock":100}'
```

### Adjust stock (manually)

```bash
curl -X POST http://localhost:4000/admin-drops/adjust-drop-stock \
  -H "Authorization: Bearer ddecbc49-e121-48bc-829c-eef4f4eb186b" \
  -H "Content-Type: application/json" \
  -d '{"dropId":"<drop-uuid>","amount":-5}'   # negative = decrease stock
```

### List all drops (admin view)

```bash
curl -X GET http://localhost:4000/admin-drops/get-drops \
  -H "Authorization: Bearer ddecbc49-e121-48bc-829c-eef4f4eb186b"
```

---

## 🔌 WebSocket Real‑time Events

The server uses **Socket.IO** (WebSocket with fallback).
Frontend must connect to the same URL (`http://localhost:4000`) and listen to:

| Event name                | Payload                          | When it happens                                                                      |
| ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `realtime-drop:inventory` | `{ dropId, availableStock }`     | After any reservation, purchase, or expiration – broadcast to all connected clients. |
| `realtime-drop:purchases` | `{ dropId, purchases: [ ... ] }` | After a purchase, sends the **updated top 3 purchasers** for that drop (optional).   |

> The frontend does **not** need to send any data over WebSocket – it only listens for stock updates and refreshes the UI accordingly.

---

## 🧠 How We Solved the Hard Problems (for the curious)

### 🔒 Preventing overselling (concurrency)

When 100 users click “Reserve” at the same millisecond for the last 1 item, **only one** succeeds.
We use a **database transaction** with `Serializable` isolation level:

1. Check if user already has an active reservation.
2. Atomically decrement `availableStock` **only if** it’s greater than 0.
3. Create a reservation record with `expiresAt = now + 60 seconds`.

If the decrement affects 0 rows, the transaction fails with “Out of stock”.

### ⏱️ 60‑second expiration & stock recovery

A background job runs every 20 seconds and:

1. Finds all `active` reservations where `expiresAt` is in the past.
2. Locks those rows with `FOR UPDATE SKIP LOCKED` (safe for multiple server instances).
3. Changes their status to `expired`.
4. Increments `availableStock` for each affected drop.
5. Broadcasts a WebSocket `stock:updated` event.

This ensures that expired stock is always returned, even if multiple server nodes are running.

---

## 📦 Database Schema (simplified)

- **`Drop`** – product info + `availableStock`.
- **`User`** – `sessionId` (unique) + random `username`.
- **`Reservation`** – links user + drop, has `status` (`active`/`completed`/`expired`) and `expiresAt`.
- **`Purchase`** – permanent record of a completed purchase, used to show the “top 3 purchasers”.

All UUIDs are generated automatically by PostgreSQL.

---

## ✅ What’s already done (backend complete)

- ✅ Full REST API for drops, reservations, purchases.
- ✅ Atomic reservation with race‑condition prevention.
- ✅ 60‑second expiry + stock recovery (background job).
- ✅ WebSocket broadcasts for real‑time stock sync.
- ✅ Input validation (Zod) and global error handling.
- ✅ Graceful shutdown (closes DB & WebSocket on SIGTERM).
- ✅ Ready for deployment (environment variables, connection pooling).

---

## 🧪 Testing the flow manually

1. **Create a user** – `POST /public-users/create-user` → save `sessionId`.
2. **List drops** – `GET /public-drops/get-drops` → pick a `dropId`.
3. **Reserve** – `POST /public-reservations/reserve-drop` with `{ "dropId": "..." }`.
4. **Check my reservations** – `GET /public-reservations/my-reservations`.
5. **Purchase** – `POST /public-reservations/purchase-reserved-drop` with `{ "reserveId": "..." }`.

All stock changes will be broadcast via WebSocket – open two browser tabs to see the live sync.

---

## 🚢 Deployment notes

- **Database** – use Neon (serverless PostgreSQL) for free tier.
- **Backend** – can be deployed to Vercel (Node.js runtime) or any traditional host (Render, Railway, DigitalOcean).
- **Environment variables** – set `DATABASE_URL`, `FRONTEND_URL`, `PORT`.
- **WebSocket** – works out of the box on most platforms (Vercel requires a custom server configuration – see Vercel docs).

---

## 📚 Full API reference (Postman / Insomnia)

All endpoints are described above. For detailed request/response examples, check the source code in `src/controllers/` and `src/routes/`.

---
````
