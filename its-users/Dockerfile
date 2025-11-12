FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache openssl python3 make g++

# Copiar package files
COPY package*.json ./

# Limpiar caché de npm
RUN npm cache clean --force

# Eliminar node_modules si existe
RUN rm -rf node_modules

# Instalar dependencias sin bcrypt primero
RUN npm ci --ignore-scripts

# Instalar bcrypt específicamente para Alpine Linux
RUN npm install bcrypt@latest --build-from-source

# Copiar schema de Prisma ANTES de copiar el código
COPY prisma ./prisma/

# Generar cliente Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Verificar cliente Prisma
RUN ls -la node_modules/.prisma/client/ || echo "Prisma client not found"

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Verificar que dist existe y mostrar contenido
RUN ls -la dist/ && ls -la dist/src/

# Verificar que main.js existe
RUN ls -la dist/src/main.js

# Exponer puerto
EXPOSE 3001

# Comando de inicio: migrar y ejecutar (ruta correcta)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]