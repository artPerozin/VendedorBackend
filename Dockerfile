# ============================
# 1. Build stage
# ============================
FROM node:20-alpine AS builder

# Dependências necessárias para bcrypt, pdf-parse e outras libs nativas
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copia package files
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências
RUN npm ci --only=production && \
    npm ci --only=development

# Copia código fonte
COPY source ./source

# Compila TypeScript
RUN npm run build || npx tsc

# ============================
# 2. Production stage
# ============================
FROM node:20-alpine

# Dependências runtime necessárias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

# Copia arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expõe porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:8000/api/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando padrão (pode ser sobrescrito)
CMD ["node", "dist/main.js"]