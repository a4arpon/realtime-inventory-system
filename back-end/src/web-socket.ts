import type { Server } from "node:http"

import { Server as SocketIOServer } from "socket.io"

import { ENV } from "./config/env"

let io: SocketIOServer

export function initSocket(httpServer: Server) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ENV.FRONTEND_URL,
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  })

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    const interval = setInterval(() => {
      socket.emit("ping", {
        message: "Pong",
        date: new Date()?.toLocaleTimeString("en-US", {
          hour12: true
        })
      })
    }, 30_000)

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
      clearInterval(interval)
    })
  })

  return io
}

export function getSIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.")
  }
  return io
}
