FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# Stage 2: Servir archivos estáticos
FROM node:22-alpine

WORKDIR /app

# Instalar http-server para servir la app
RUN npm install -g http-server

# Copiar los archivos construidos
COPY --from=build /app/dist/dawi_frontend /app

EXPOSE 80

CMD ["http-server", "-p", "80", "-c-1", "."]