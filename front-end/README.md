# Sneaker Drop – Frontend

Real‑time inventory dashboard for a limited‑edition sneaker drop.  
Built with React, TanStack Router, TanStack Query, Socket.IO, and shadcn/ui.

## ✨ Features

- **Live product listing** – Drops are fetched from the backend and displayed as cards.
- **Real‑time stock updates** – WebSocket connection (`realtime-drop:inventory`) updates stock counts instantly across all open tabs.
- **Atomic reservation** – Click “Reserve” to temporarily lock a product for 60 seconds. Prevents overselling via backend transactions.
- **Purchase flow** – Active reservations are shown in a floating badge; each reservation has a countdown timer and a “Purchase” button.
- **Top 3 purchasers** – Each drop card displays the three most recent buyers (usernames) directly from the API.
- **Session management** – A `sessionId` is automatically created and stored in `localStorage`; used for all authenticated requests.

## 🧰 Tech Stack

- **React** + TypeScript
- **TanStack Router** – type‑safe routing with lazy loading
- **TanStack Query** – data fetching, caching, and mutation handling
- **Socket.IO client** – real‑time bidirectional communication (read‑only)
- **Tailwind CSS** + **shadcn/ui** – clean, responsive UI components
- **Vite** – fast build tool

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:4000
```

Replace the URL with your backend API address (the same one that serves WebSocket connections).

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next free port).

### 4. Build for production

```bash
npm run build
```

The output is in the `dist` folder.

## 📁 Project Structure (simplified)

```
src/
├── assets/            # Global styles, images
├── components/
│   └── shared/        # DropCard, ReservationBadge, skeletons
├── hooks/             # useDrops, useReservations, useSession
├── lib/               # api.ts, socket.ts, tw.ts
├── routes/            # TanStack Router routes (__root, index.lazy)
├── services/          # API calls (drops, reservations, user-profile)
├── types/             # TypeScript definitions (DropT, ReservationT, etc.)
└── main.tsx           # App entry, QueryClient, Socket init, Router
```

## 🔌 Key Integrations

### WebSocket (read‑only)

- The socket is initialized in `main.tsx` with the query client.
- Listens to `realtime-drop:inventory` and `realtime-drop:purchases`.
- Updates React Query cache directly – no manual refetching needed.

### Authentication (demo)

- The backend expects a `Bearer <sessionId>` header.
- On first visit, the frontend calls `/public-users/create-user` and stores the returned `sessionId` in `localStorage`.
- All subsequent authenticated requests use this token automatically.

## 📦 Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

## 📝 Notes

- Countdown timers are local to each reservation item and do not cause global re‑renders.
- The UI is responsive and works on desktop and mobile.

---

**Backend Folder** – contains the Express + Prisma + PostgreSQL API.

**Live demo** – https://realtime-inventory-system-techzu.vercel.app/
