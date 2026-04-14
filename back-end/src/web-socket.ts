import type { Server } from "node:http"

import { Server as SocketIOServer } from "socket.io"

import { ENV } from "./config/env"

let io: SocketIOServer

export function initSocket(httpServer: Server) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ENV.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  })

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })

    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() })
    })
  })

  return io
}
