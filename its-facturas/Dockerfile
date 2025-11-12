FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3003

# Health check para TCP microservice
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD netstat -an | grep 3003 > /dev/null; if [ 0 != $? ]; then exit 1; fi;

# Comando de inicio
CMD ["npm", "run", "start:prod"]