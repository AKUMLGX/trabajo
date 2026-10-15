/** El back guarda el correo en `varchar(100)` y lo valida con esta misma expresión. */
export const LONGITUD_MAXIMA_CORREO = 100;

const PATRON_CORREO_SAT = /^[a-z0-9_.-]+@sat\.gob\.mx$/;

export function normalizarCorreo(valor: string | null | undefined): string {
  return (valor ?? '').trim().toLowerCase();
}

export function esCorreoSatValido(valor: string | null | undefined): boolean {
  const correo = normalizarCorreo(valor);
  return correo.length <= LONGITUD_MAXIMA_CORREO && PATRON_CORREO_SAT.test(correo);
}

/** Texto de ayuda para el formulario; null cuando el correo es válido o aún está vacío. */
export function errorCorreo(valor: string | null | undefined): string | null {
  const correo = normalizarCorreo(valor);
  if (!correo) {
    return null;
  }
  if (correo.length > LONGITUD_MAXIMA_CORREO) {
    return `Máximo ${LONGITUD_MAXIMA_CORREO} caracteres.`;
  }
  return PATRON_CORREO_SAT.test(correo) ? null : 'Debe ser un correo @sat.gob.mx.';
}
