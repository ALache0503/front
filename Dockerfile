# Stage 1: Build Stage
FROM node:lts-alpine AS build-stage
WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm install

# Source Code kopieren und builden
COPY . .
RUN npm run build

# Stage 2: Production Stage mit Nginx
FROM nginx:stable-alpine AS production-stage

# Build-Artefakte aus Stage 1 kopieren
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx Config kopieren (optional, siehe unten)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]