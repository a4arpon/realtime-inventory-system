# ---- Stage 1: Builder ----
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (dev + prod)
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema (if needed for build)
COPY . .

# Build TypeScript into dist/
RUN npm run build

# ---- Stage 2: Production ----
FROM node:24-alpine AS production

WORKDIR /app

# Install only production dependencies (no dev)
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application from builder (Prisma client is already bundled in dist)
COPY --from=builder /app/dist ./dist

# Copy Prisma schema if needed for runtime migrations (optional)
COPY prisma ./prisma

# Expose port
ENV PORT=4000
EXPOSE 4000

# Run the compiled server
CMD ["node", "dist/serve.js"]
