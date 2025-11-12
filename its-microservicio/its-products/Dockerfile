FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Verificar que dist existe y mostrar contenido
RUN ls -la dist/ && ls -la dist/src/

# Verificar que main.js existe
RUN ls -la dist/src/main.js

# NO eliminar devDependencies todavía porque podrían ser necesarias en runtime
# RUN npm prune --production

# Exponer puerto
EXPOSE 3002

# Comando de inicio (ruta correcta) con variable de entorno para Node.js
ENV NODE_OPTIONS="--require crypto"
CMD ["node", "-e", "global.crypto = require('crypto'); require('./dist/src/main.js')"]