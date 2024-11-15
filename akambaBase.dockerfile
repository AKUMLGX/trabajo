FROM node:20.11.0 AS builder_modules

ARG VERSION=0.0.0
ARG COMMIT_SHA=00000000

LABEL version = ${VERSION}
LABEL commit_sha = ${COMMIT_SHA}

# Estableciendo el directorio de trabajo
WORKDIR /akamba

RUN apt-get update && apt-get install -y --no-install-recommends
ENV TZ=America/Mexico_City

# Instalando Angular
RUN npm install -g @angular/cli@17.1.3
RUN ng v

#Copiando las configuraciones

COPY package.json /akamba/
COPY package-lock.json /akamba/
RUN cat /akamba/package.json
# Instalando los módulos de node
RUN npm install
