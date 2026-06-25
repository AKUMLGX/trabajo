# Frontend Akamba / Tlapohualli

SPA construida con Angular 17 + Material que expone el formulario de tres pasos, la bandeja de seguimiento y los reportes de Tlapohualli. Este documento explica **cómo configurarla y ejecutarla en ambientes locales o remotos** alineados al backend Rust (`/tlapohualli/api/v1`) y a los lineamientos del SAT.

---

## ✅ Requisitos previos

- Node.js **18 LTS o 20 LTS** (`node -v` para verificar).
- npm 9+ (se instala junto con Node).
- Angular CLI 17 global (opcional, pero recomendado):  
  `npm install -g @angular/cli@17`
- `envsubst` (paquete `gettext-base`) si deseas autogenerar `env.js`.
- Backend de Tlapohualli ejecutándose (por defecto en `https://balam.sat.gob.mx/akamba` cuando se usa Docker o 8080/8000 si se corre directamente). Ajusta los puertos según tu entorno.

---

## 1. Instalar dependencias

```bash
cd /home/hemc9599@dssat.sat.gob.mx/Tlapohualli-Fullstack/frontend
npm install
```

Esto descarga las dependencias indicadas en `package-lock.json` y deja listo `node_modules/`.

---

## 2. Configurar `src/assets/env.js`

El frontend **NO lee variables en tiempo de compilación**; en tiempo de ejecución carga `assets/env.js`, el cual se genera a partir de `src/environments/env-template.js`. Este archivo define URLs para autenticación, layout y API. Sin estos valores, la app queda en blanco.

### 2.1. Define los valores de tu ambiente

Crea un archivo `.env.frontend` (fuera de `src/` para no empacarlo) con los valores reales de tu backend. Ejemplo dev local:

```bash
cat <<'EOF' > .env.frontend
environment=DESARROLLO
COMMIT_SHA=local-dev
baseUrl=https://balam.sat.gob.mx/akamba/api/v1/
layoutUrl=http://localhost:4200/akamba/tlapohualli/layout/capture
loginUrl=http://localhost:4200/login
logoutUrl=https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout
authInfo=https://balam.sat.gob.mx/akamba/login/get_oauth_parameters
EOF
```

> **Notas**
> - `baseUrl` debe apuntar al backend Akamba **incluyendo** `/api/v1/` al final; los servicios internos derivan de ahí `.../tlapohualli/api/v1/`.
> - Si tu backend corre en otro host/puerto (ej. `http://localhost:8080/tlapohualli`), ajusta `baseUrl` y el proxy (ver sección 3).

### 2.2. Genera `src/assets/env.js`

Con `envsubst` (recomendado):

```bash
set -a
source .env.frontend
envsubst < src/environments/env-template.js > src/assets/env.js
set +a
```

Sin `envsubst`, copia el template y remplaza manualmente los `${...}` por tus valores:

```bash
cp src/environments/env-template.js src/assets/env.js
# luego edita src/assets/env.js y escribe los valores finales.
```

Cada ambiente (local, QA, prod) debe regenerar este archivo para evitar mezclar endpoints.

---

## 3. Verificar comunicación con el backend

Angular usa `proxy.conf.json` cuando ejecutas `npm start`. La configuración por defecto espera:

```json
"/tlapohualli/api/v1/*" -> https://balam.sat.gob.mx/akamba
"/akamba/api/v1/*"      -> https://balam.sat.gob.mx
```

Si el backend corre en otro puerto (`8080`, `8000`, etc.) modifica `proxy.conf.json` **y** los valores de `baseUrl`/`layoutUrl` para que apunten al mismo host. Sin esto, el formulario, la bandeja y el autocompletado devolverán 404/CORS.

Para validar que el backend responde:

```bash
curl https://balam.sat.gob.mx/akamba/tlapohualli/api/v1/expedientes/dashboard
```

Debes recibir JSON válido antes de iniciar el front.

---

## 4. Levantar el frontend en modo desarrollo

```bash
npm run start
# equivalente a: ng serve --proxy-config proxy.conf.json
```

- URL principal: `http://localhost:4200/`
- Captura: `http://localhost:4200/akamba/tlapohualli/layout/capture`
- Login (mock): `http://localhost:4200/login`

Angular recompila en caliente y respeta el proxy configurado.

---

## 5. Compilar para QA/Producción

```bash
npm run build
# ó para forzar prod:
ng build --configuration production
```

Los artefactos quedan en `dist/acamba/browser`. Antes de desplegarlos:

1. Genera `assets/env.js` con los valores del ambiente objetivo.
2. Copia `dist/acamba/browser` al servidor web (nginx, S3, etc.).
3. Si usas Docker (`akamba.dockerfile`), pasa las variables `environment`, `baseUrl`, etc. y deja que `envsubst` las inyecte en `assets/env.js` durante `CMD`.

---

## 6. Solución de problemas comunes

- **Pantalla en blanco al cargar** → `assets/env.js` no existe o tiene sintaxis inválida. Regrénalo desde el template.
- **Error 404/CORS** → Backend caído o `proxy.conf.json` apuntando al puerto equivocado. Valida con `curl`.
- **`npm install` lento o fallido** → El proyecto ya incluye `package-lock`. Borrar `node_modules` y ejecutar `npm ci` puede ser más estable en CI.
- **Assets de Material no cargan** → Asegúrate de tener conexión a Google Fonts o empaqueta las fuentes manualmente en `src/assets`.

---

## 7. Scripts útiles

```bash
npm run lint          # Reglas Angular/ESLint específicas del proyecto
npm run test          # Karma + Jasmine
ng generate component # Scaffolding respetando Angular 17
```

---

Con estos pasos el frontend queda alineado a las necesidades de Tlapohualli y listo para integrarse con el backend Rust. Cualquier ajuste adicional (nuevos endpoints, autenticación real, etc.) sólo requiere actualizar `assets/env.js` y, de ser necesario, el proxy. ¡Listo para desarrollar! 💻🚀
