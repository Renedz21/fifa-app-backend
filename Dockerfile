# Etapa 1: Construcción
FROM node:20-alpine as build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package.json package-lock.json ./

# Copiar el archivo .env
COPY .env ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de los archivos de la aplicación
COPY tsconfig.json ./
COPY src ./src

# Compilar el proyecto
RUN npm run build

# Etapa 2: Imagen de producción
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo .env
COPY .env ./

# Copiar solo las dependencias de producción desde la etapa de construcción
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Exponer el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]
