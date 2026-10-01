/**
 * Normalización defensiva de la respuesta del backend a un PDF válido.
 *
 * El backend Rust (actix-web) puede devolver el archivo de varias formas según
 * cómo esté escrito el handler:
 *   - `.body(Vec<u8>)`            → bytes crudos, empiezan con `%PDF`
 *   - `.json(Vec<u8>)`            → arreglo JSON de números: `[37,80,68,70,...]`
 *   - `.json(base64)`             → cadena base64, normalmente entre comillas
 *   - `.json({ data: ... })`      → objeto envolvente con los bytes o el base64
 *
 * El front pedía `responseType: 'arraybuffer'` y envolvía el buffer en un Blob
 * sin validar nada, así que cualquier variante distinta a bytes crudos producía
 * un PDF corrupto (200 en la red, visor en blanco y descarga inservible).
 *
 * La detección se hace SIEMPRE inspeccionando los primeros bytes, nunca el
 * `Content-Type`: `obten_pdf_data` responde sin content-type explícito y nginx
 * o los proxies intermedios pueden reescribirlo.
 */

/** Firma de archivo PDF: `%PDF`. */
const FIRMA_PDF = [0x25, 0x50, 0x44, 0x46];

/** PDF.js tolera basura inicial; buscamos la firma en la misma ventana. */
const VENTANA_BUSQUEDA_FIRMA = 1024;

const CAMPOS_ENVOLVENTES = ['data', 'archivo', 'bytes', 'contenido', 'pdf', 'file'];

const PREFIJO_TEXTO_DIAGNOSTICO = 80;

export class PdfInvalidoError extends Error {
  constructor(mensaje: string, readonly muestra: string) {
    super(mensaje);
    this.name = 'PdfInvalidoError';
  }
}

/** true si los bytes contienen la firma `%PDF` al inicio (con margen de basura). */
export function tieneFirmaPdf(bytes: Uint8Array): boolean {
  return indiceFirmaPdf(bytes) >= 0;
}

function indiceFirmaPdf(bytes: Uint8Array): number {
  const limite = Math.min(bytes.length, VENTANA_BUSQUEDA_FIRMA) - FIRMA_PDF.length;
  for (let i = 0; i <= limite; i++) {
    if (
      bytes[i] === FIRMA_PDF[0] &&
      bytes[i + 1] === FIRMA_PDF[1] &&
      bytes[i + 2] === FIRMA_PDF[2] &&
      bytes[i + 3] === FIRMA_PDF[3]
    ) {
      return i;
    }
  }
  return -1;
}

function comoTexto(bytes: Uint8Array, maximo?: number): string {
  const trozo = maximo == null ? bytes : bytes.subarray(0, maximo);
  return new TextDecoder('utf-8', { fatal: false }).decode(trozo);
}

function muestraDiagnostico(bytes: Uint8Array): string {
  return comoTexto(bytes, PREFIJO_TEXTO_DIAGNOSTICO).replace(/\s+/g, ' ').trim();
}

function blobPdf(bytes: Uint8Array): Blob {
  // Se copia a un ArrayBuffer propio: `Uint8Array<ArrayBufferLike>` no es un
  // BlobPart válido para TypeScript (podría respaldarse en SharedArrayBuffer).
  const copia = new Uint8Array(bytes.byteLength);
  copia.set(bytes);
  return new Blob([copia.buffer], { type: 'application/pdf' });
}

function bytesDesdeArregloNumerico(valores: unknown[]): Uint8Array {
  const bytes = new Uint8Array(valores.length);
  for (let i = 0; i < valores.length; i++) {
    const valor = valores[i];
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new TypeError(`Elemento no numérico en la posición ${i}`);
    }
    bytes[i] = valor & 0xff;
  }
  return bytes;
}

function bytesDesdeBase64(texto: string): Uint8Array {
  const limpio = texto
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/^data:[^;]*;base64,/i, '')
    .replace(/\s+/g, '');

  if (!limpio || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(limpio)) {
    throw new TypeError('La cadena no es base64 válido');
  }

  // Soporta base64url, que algunos serializadores de Rust emiten.
  const normalizado = limpio.replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(normalizado);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

/** Extrae los bytes de `{ data: [...] }` o `{ data: "base64" }`. */
function bytesDesdeObjetoEnvolvente(objeto: Record<string, unknown>): Uint8Array {
  const claves = Object.keys(objeto);
  const candidatas = [
    ...CAMPOS_ENVOLVENTES.filter((campo) =>
      claves.some((clave) => clave.toLowerCase() === campo)
    ),
    // Si el backend usa otro nombre, tomamos el primer campo utilizable.
    ...claves,
  ];

  for (const campo of candidatas) {
    const clave = claves.find((k) => k.toLowerCase() === campo.toLowerCase());
    const valor = clave == null ? undefined : objeto[clave];

    if (Array.isArray(valor)) {
      return bytesDesdeArregloNumerico(valor);
    }
    if (typeof valor === 'string') {
      try {
        return bytesDesdeBase64(valor);
      } catch {
        // Seguimos con el siguiente campo candidato.
      }
    }
  }

  throw new TypeError('El objeto JSON no contiene un campo con los bytes del PDF');
}

/**
 * Convierte cualquiera de las formas conocidas en un Blob de PDF válido.
 * Lanza `PdfInvalidoError` con una muestra corta del contenido si no reconoce nada.
 */
export function normalizarBytesAPdfBlob(origen: ArrayBuffer | Uint8Array): Blob {
  const bytes = origen instanceof Uint8Array ? origen : new Uint8Array(origen);

  if (bytes.length === 0) {
    throw new PdfInvalidoError('La respuesta del servidor está vacía', '');
  }

  // Caso 1: bytes crudos.
  const inicioPdf = indiceFirmaPdf(bytes);
  if (inicioPdf >= 0) {
    return blobPdf(inicioPdf === 0 ? bytes : bytes.subarray(inicioPdf));
  }

  const muestra = muestraDiagnostico(bytes);
  const primerCaracter = muestra.charAt(0);

  // Caso 2: arreglo JSON de números — `.json(Vec<u8>)` en actix-web.
  if (primerCaracter === '[') {
    try {
      const parseado: unknown = JSON.parse(comoTexto(bytes));
      if (Array.isArray(parseado)) {
        const decodificados = bytesDesdeArregloNumerico(parseado);
        if (tieneFirmaPdf(decodificados)) {
          console.warn(
            '[pdf-bytes] El backend devolvió un arreglo JSON de bytes en lugar de binario; se normalizó en el cliente.'
          );
          return blobPdf(decodificados);
        }
        throw new TypeError('El arreglo decodificado no empieza con %PDF');
      }
    } catch (error) {
      throw new PdfInvalidoError(
        `La respuesta parece un arreglo JSON pero no se pudo decodificar: ${
          error instanceof Error ? error.message : String(error)
        }`,
        muestra
      );
    }
  }

  // Caso 4: objeto JSON envolvente.
  if (primerCaracter === '{') {
    try {
      const parseado: unknown = JSON.parse(comoTexto(bytes));
      if (parseado && typeof parseado === 'object') {
        const decodificados = bytesDesdeObjetoEnvolvente(
          parseado as Record<string, unknown>
        );
        if (tieneFirmaPdf(decodificados)) {
          console.warn(
            '[pdf-bytes] El backend devolvió un objeto JSON envolvente; se extrajeron los bytes del PDF.'
          );
          return blobPdf(decodificados);
        }
        throw new TypeError('Los bytes extraídos del objeto no empiezan con %PDF');
      }
    } catch (error) {
      throw new PdfInvalidoError(
        `La respuesta parece un objeto JSON pero no contiene un PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
        muestra
      );
    }
  }

  // Caso 3: base64 (suelto, entre comillas o con prefijo data:).
  try {
    const decodificados = bytesDesdeBase64(comoTexto(bytes));
    if (tieneFirmaPdf(decodificados)) {
      console.warn(
        '[pdf-bytes] El backend devolvió base64 en lugar de binario; se normalizó en el cliente.'
      );
      return blobPdf(decodificados);
    }
  } catch {
    // Cae al error final.
  }

  throw new PdfInvalidoError(
    'La respuesta del servidor no es un PDF válido (no empieza con %PDF ni es JSON/base64 reconocible)',
    muestra
  );
}

/**
 * Variante para respuestas leídas con `responseType: 'text'` (endpoint `getPdf`,
 * que emite `FileService.pdfUpdated`). Cubre base64 suelto o entrecomillado,
 * arreglo JSON de números y objeto envolvente, en lugar de asumir `atob`.
 */
export function normalizarTextoAPdfBlob(texto: string): Blob {
  return normalizarBytesAPdfBlob(new TextEncoder().encode(texto));
}

/**
 * Igual que `normalizarBytesAPdfBlob` pero para un `Blob` (fallback con
 * `responseType: 'blob'`). Si ya es un PDF binario lo devuelve tal cual.
 */
export async function normalizarBlobAPdf(blob: Blob): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  return normalizarBytesAPdfBlob(buffer);
}

/** Loguea el error con prefijo claro para que el usuario lo copie de DevTools. */
export function registrarErrorPdf(contexto: string, error: unknown): void {
  if (error instanceof PdfInvalidoError) {
    console.error(
      `❌ [pdf-bytes] ${contexto}: ${error.message}\n   Primeros ${PREFIJO_TEXTO_DIAGNOSTICO} caracteres recibidos: ${JSON.stringify(
        error.muestra
      )}`
    );
    return;
  }
  console.error(`❌ [pdf-bytes] ${contexto}:`, error);
}
