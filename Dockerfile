# =============================================================================
# Dockerfile para Frontend Tlalcalli (Angular + Nginx)
# Multi-stage build optimizado para producción
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa 1: Builder - Instalación de dependencias y compilación Angular
# -----------------------------------------------------------------------------
FROM node:20.11.0-bookworm-slim AS builder

ARG VERSION=0.0.0
ARG COMMIT_SHA=00000000

LABEL proyecto="tlalcalli"
LABEL dependencia-gubernamental="SAT"
LABEL administracion-general="AGCTI"
LABEL administracion-central="ACSMC"
LABEL administracion="AIA"
LABEL servicio="frontend"

# Establecer directorio de trabajo
WORKDIR /app

# Configurar zona horaria
ENV TZ=America/Mexico_City

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@17.1.3

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación Angular para producción
RUN ng build --configuration=production

# -----------------------------------------------------------------------------
# Etapa 2: Runtime - Servidor Nginx para servir archivos estáticos
# -----------------------------------------------------------------------------
FROM nginx:1.26-alpine AS runtime

ARG VERSION=0.0.0
ARG COMMIT_SHA=00000000

LABEL proyecto="tlalcalli"
LABEL dependencia-gubernamental="SAT"
LABEL administracion-general="AGCTI"
LABEL administracion-central="ACSMC"
LABEL administracion="AIA"
LABEL servicio="frontend"
LABEL version="${VERSION}"
LABEL commit_sha="${COMMIT_SHA}"

ENV COMMIT_SHA=${COMMIT_SHA}
ENV TZ=America/Mexico_City

# Instalar tzdata y gettext para envsubst
RUN apk add --no-cache tzdata gettext curl

# Eliminar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular bajo /akamba/ (baseHref en la app)
COPY --from=builder /app/dist/acamba/browser /var/www/html/akamba

# Copiar archivos estáticos adicionales (bienvenida, imágenes login)
COPY welcome.html /var/www/html/
COPY ./home /var/www/html/home

# Copiar template de variables de entorno
COPY src/environments/env-template.js /var/env-template.js

# Copiar configuración personalizada de nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/conf.d/ /etc/nginx/conf.d/
COPY ./nginx/mime.types /etc/nginx/mime.types

# Asegurar que exista assets en akamba (env.js se genera en CMD)
RUN mkdir -p /var/www/html/akamba/assets

# Configurar permisos
RUN chown -R nginx:nginx /var/www/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || wget -q --spider http://localhost/health || exit 1

# Script de inicio: genera env.js bajo /akamba/assets y arranca nginx
CMD ["/bin/sh", "-c", "envsubst < /var/env-template.js > /var/www/html/akamba/assets/env.js && exec nginx -g 'daemon off;'"]
