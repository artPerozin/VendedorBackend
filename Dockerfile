# Base image
FROM node:24.8-alpine

# Definir diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json primeiro (cache inteligente)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código
COPY . .

# Compilar TypeScript (caso use)
RUN npm run build || echo "⚠️ Nenhuma etapa de build necessária"

EXPOSE 8000

# Comando final: executar seu script principal
CMD [ "npm", "run", "main" ]
