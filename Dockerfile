# ============================
# 1. Build stage
# ============================
FROM node:20-alpine AS builder

# Dependências necessárias para bcrypt e pdf-parse
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run clean || true
RUN npx tsc


# ============================
# 2. Run stage
# ============================
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

# O CMD é genérico — será sobrescrito
CMD ["npm", "run", "main"]
