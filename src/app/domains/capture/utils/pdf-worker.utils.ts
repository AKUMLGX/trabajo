import { environment } from '../../../../environments/environment';

/** Debe coincidir con pdfjs-dist anidado de ng2-pdf-viewer (package-lock). */
export const PDFJS_VERSION = '4.8.69';

/**
 * El worker se publica con extensión .js (no .mjs) aunque su contenido sea ESM.
 * PDF.js 4.x lo instancia con `new Worker(src, { type: 'module' })` y los module
 * workers exigen un Content-Type de JavaScript. nginx solo mapea .mjs desde la
 * versión 1.27.4; en versiones anteriores lo sirve como application/octet-stream
 * y el navegador rechaza el worker por strict MIME type checking.
 */
const NOMBRE_ARCHIVO_WORKER = 'pdf.worker.min.js';

type VentanaPdfWorker = Window & {
  pdfWorkerSrc?: string;
  [key: `pdfWorkerSrc${string}`]: string | undefined;
};

/** Ruta absoluta al worker local según baseHref (/tlalcalli en Balam y dev). */
export function rutaPdfWorkerLocal(): string {
  const baseTag = document.querySelector('base')?.getAttribute('href');
  if (baseTag) {
    const base = baseTag.endsWith('/') ? baseTag.slice(0, -1) : baseTag;
    if (base && base !== '/') {
      return `${base}/assets/pdfjs/${NOMBRE_ARCHIVO_WORKER}`;
    }
  }

  const envBase = String(environment.base ?? '').replace(/\/$/, '');
  if (envBase && envBase !== '/') {
    return `${envBase}/assets/pdfjs/${NOMBRE_ARCHIVO_WORKER}`;
  }

  return `/assets/pdfjs/${NOMBRE_ARCHIVO_WORKER}`;
}

function asignarWorkerSrc(src: string): void {
  const ventana = window as unknown as VentanaPdfWorker;
  ventana.pdfWorkerSrc = src;
  ventana[`pdfWorkerSrc${PDFJS_VERSION}`] = src;
}

/**
 * Configura ng2-pdf-viewer / PDF.js antes de instanciar el componente.
 * ng2-pdf-viewer lee window.pdfWorkerSrc o window.pdfWorkerSrc{version}, no PDFJS.workerSrc.
 */
export function configurarPdfWorkerGlobal(): void {
  asignarWorkerSrc(rutaPdfWorkerLocal());
}

let precargaEnCurso: Promise<string> | null = null;
let urlBlobWorker: string | null = null;
let contentTypeServidor: string | null = null;

/** URL del blob del worker, si hizo falta republicarlo. */
export function urlPdfWorkerBlob(): string | null {
  return urlBlobWorker;
}

/** MIME de JavaScript aceptado por los module workers del navegador. */
function esMimeJavaScript(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }
  const tipo = contentType.split(';')[0].trim().toLowerCase();
  return (
    tipo === 'text/javascript' ||
    tipo === 'application/javascript' ||
    tipo === 'application/ecmascript' ||
    tipo === 'text/ecmascript' ||
    tipo === 'application/x-javascript'
  );
}

/**
 * Comprueba con qué Content-Type publica el servidor el worker y, solo si el MIME
 * no es de JavaScript, lo republica como blob `text/javascript`.
 *
 * Se prefiere la ruta estática cuando el MIME es correcto porque una CSP con
 * `worker-src` restrictiva podría bloquear `blob:`; el blob es el rescate para
 * servidores que devuelven `application/octet-stream` (típico con `.mjs`).
 *
 * Es idempotente y nunca lanza: ante cualquier fallo deja la ruta estática.
 */
export function precargarPdfWorkerBlob(): Promise<string> {
  if (precargaEnCurso) {
    return precargaEnCurso;
  }

  const rutaEstatica = rutaPdfWorkerLocal();

  precargaEnCurso = fetch(rutaEstatica, { credentials: 'same-origin' })
    .then(async (respuesta) => {
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status} al descargar ${rutaEstatica}`);
      }

      contentTypeServidor = respuesta.headers.get('content-type');
      if (esMimeJavaScript(contentTypeServidor)) {
        asignarWorkerSrc(rutaEstatica);
        return rutaEstatica;
      }

      console.warn(
        `[pdf-worker] El servidor publica el worker con Content-Type "${contentTypeServidor}", ` +
          'que los module workers rechazan. Se republica como blob text/javascript.'
      );

      const codigo = await respuesta.text();
      const blob = new Blob([codigo], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      urlBlobWorker = url;
      asignarWorkerSrc(url);
      return url;
    })
    .catch((error) => {
      console.warn(
        '[pdf-worker] No se pudo verificar el worker; se usa la ruta estática',
        rutaEstatica,
        error
      );
      asignarWorkerSrc(rutaEstatica);
      return rutaEstatica;
    });

  return precargaEnCurso;
}

/**
 * Deja el worker listo y devuelve la URL efectiva que usará PDF.js.
 * Se llama antes de montar cualquier <pdf-viewer>.
 */
export function prepararPdfWorker(): Promise<string> {
  configurarPdfWorkerGlobal();
  return precargarPdfWorkerBlob();
}

/** Diagnóstico para consola/soporte. */
export function diagnosticoPdfWorker(): Record<string, unknown> {
  const ventana = window as unknown as VentanaPdfWorker;
  return {
    version: PDFJS_VERSION,
    rutaEstatica: rutaPdfWorkerLocal(),
    contentTypeServidor,
    blob: urlBlobWorker,
    workerSrcEfectivo: ventana.pdfWorkerSrc,
  };
}
