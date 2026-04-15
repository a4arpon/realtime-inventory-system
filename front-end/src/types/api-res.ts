export type DropT = {
  id: string
  name: string
  price: number
  availableStock: number
  purchases: Array<{
    purchasedAt: string
    user: { username: string }
  }>
}

export type UserT = {
  username: string
  sessionId: string
}

export type ReservationT = {
  id: string
  userId: string
  dropId: string
  quantity: number
  expiresAt: string
  status: "active" | "completed" | "expired"
  drop: DropT
}

export type PurchaseResponseT = {
  purchaseId: string
  reservation: ReservationT
}
