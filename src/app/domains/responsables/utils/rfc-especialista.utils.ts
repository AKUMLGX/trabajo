/** Misma regla que `validar_especialista` en el back de Max. */
const PATRON_RFC =
  /^([A-ZÑ&]{3,4})([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([A-Z0-9]{2}[0-9A])$/;

export function normalizarRfc(valor: string): string {
  return valor.trim().toUpperCase();
}

export function esRfcValido(valor: string): boolean {
  const texto = normalizarRfc(valor);
  return texto.length > 0 && PATRON_RFC.test(texto);
}

export function errorRfc(valor: string): string | null {
  const texto = valor.trim();
  if (!texto) {
    return 'El RFC es obligatorio.';
  }
  if (!esRfcValido(texto)) {
    return 'El RFC ingresado no es válido.';
  }
  return null;
}
