export const SEPARADOR_LISTA_TEXTO = '; ';

/** Acepta arreglo o cadena `A; B` y devuelve valores únicos sin vacíos ni `-`. */
export function separarListaTexto(valor: unknown): string[] {
  const crudos: unknown[] = Array.isArray(valor)
    ? valor
    : typeof valor === 'string'
      ? valor.split(';')
      : [];

  const vistos = new Set<string>();
  const resultado: string[] = [];

  for (const crudo of crudos) {
    const texto = String(crudo ?? '').trim();
    const clave = texto.toLowerCase();
    if (!texto || texto === '-' || texto === '—' || vistos.has(clave)) {
      continue;
    }
    vistos.add(clave);
    resultado.push(texto);
  }

  return resultado;
}

export function unirListaTexto(valor: unknown): string {
  return separarListaTexto(valor).join(SEPARADOR_LISTA_TEXTO);
}
