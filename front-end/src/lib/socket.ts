import type { QueryClient } from "@tanstack/react-query"
import { io, type Socket } from "socket.io-client"

import type { DropT } from "#app/types/api-res"

import { API_BASE } from "./api"

interface StockUpdatePayload {
  dropId: string
  availableStock: number
}

interface PurchaseUpdatePayload {
  dropId: string
  purchases: DropT["purchases"]
}

let socket: Socket | null = null

export function initSocket(queryClient: QueryClient) {
  if (socket) return socket

  socket = io(API_BASE, {
    transports: ["websocket", "polling"],
    autoConnect: true
  })

  socket.on("connect", () => {
    console.log("🔌 WebSocket connected")
  })

  socket.on("disconnect", () => {
    console.log("🔌 WebSocket disconnected")
  })

  socket.on("realtime-drop:inventory", (data: StockUpdatePayload) => {
    console.log("📦 Stock update:", data)

    queryClient.setQueryData<DropT[]>(["drops", "all"], (oldDrops) => {
      if (!oldDrops) return oldDrops
      return oldDrops.map((drop) =>
        drop.id === data.dropId
          ? { ...drop, availableStock: data.availableStock }
          : drop
      )
    })
  })

  socket.on("realtime-drop:purchases", (data: PurchaseUpdatePayload) => {
    console.log("🛒 Purchase update:", data)

    queryClient.setQueryData<DropT[]>(["drops", "all"], (oldDrops) => {
      if (!oldDrops) return oldDrops
      return oldDrops.map((drop) =>
        drop.id === data.dropId ? { ...drop, purchases: data.purchases } : drop
      )
    })
  })

  return socket
}

export function getSocket() {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.")
  }
  return socket
}
