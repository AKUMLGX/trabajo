ARG DOCKER_REGISTRY="nexusavl.sat.gob.mx:8093/"
ARG SERVICE_NAME="front"
ARG VERSION=0.0.0

FROM --platform=arm64 ${DOCKER_REGISTRY}akamba/${SERVICE_NAME}_base:${VERSION} AS builder_modules

ARG COMMIT_SHA=00000000

# Copiando el código fuente
COPY . .

# Compilando el código

RUN ng build

FROM nginx:1.26.1

LABEL proyecto "querybuilder-itzamná"
LABEL dependencia-gubernamental = "SAT"
LABEL administracion-general = "AGCTI"
LABEL administracion-central = "ACSMC"
LABEL administracion = "AIA"
LABEL servicio = "spa"
LABEL version = ${VERSION}
LABEL commit_sha = ${COMMIT_SHA}


ARG VERSION=0.0.1

ENV COMMIT_SHA=${COMMIT_SHA}
ENV commit_sha=${COMMIT_SHA}
ENV TZ=America/Mexico_City


USER root
RUN rm /etc/nginx/conf.d/default.conf

# Archivos estáticos html
# WORKDIR /queryb


# Copiando la carpeta dist
COPY --from=builder_modules /akamba/dist/acamba/browser /var/www/html
COPY welcome.html /var/www/html/
COPY ./home /var/www/html/home

# Se cambian los ids por default del usuario nginx por lo que son validos en el Cluster
RUN sed -i 's/101:101/117:119/g' /etc/passwd
RUN sed -i 's/101:/119:/g' /etc/group

# Se anade este archivo para dar permisos al usuario nginx
RUN touch /run/nginx.pid &&  chown -R nginx:nginx /run/nginx.pid
#RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx  /var/cache/nginx /var/www/html
RUN ls src/environments/env-template.js

# Archivos de configuración
COPY ./nginx/ /etc/nginx

# Puertos de exposición para nginx
EXPOSE 80
CMD [ "/bin/sh", "-c", "exec nginx -g 'daemon off;'"]
CMD [ "/bin/sh", "-c", "envsubst < src/environments/env-template.js > /var/www/assets/env.js && exec nginx -p 4200:4200 -g 'daemon off;'"]
