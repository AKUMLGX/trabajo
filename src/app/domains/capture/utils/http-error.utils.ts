/** Extrae mensaje amigable del body de un HttpErrorResponse (objeto JSON, JSON string o texto). */
export function extraerMensajeErrorHttp(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.'
): string {
  const httpError = error as {
    mensajeUsuario?: string;
    status?: number;
    message?: string;
    error?: unknown;
  };

  if (httpError?.mensajeUsuario?.trim()) {
    return normalizarMensajeCrudo(httpError.mensajeUsuario);
  }

  const delBody = parsearCuerpoError(httpError?.error);
  if (delBody) {
    return delBody;
  }

  if (httpError?.message?.trim()) {
    return httpError.message.trim();
  }

  return fallback;
}

/** Mensaje UX para fallo PUT expedientes_rework/inicial (modal edición lápiz). */
export function mensajeErrorPutInicialRework(error: unknown): string {
  const httpError = error as { status?: number };
  const mensajeBack = extraerMensajeErrorHttp(error, '');

  if (httpError?.status === 500) {
    const detalle = mensajeBack || 'Error dentro de la actualización del registro.';
    return `No se pudo guardar. El servidor respondió: ${detalle} (Pendiente corrección en back Max)`;
  }

  if (mensajeBack) {
    return mensajeBack;
  }

  return 'No se pudo guardar el expediente. Verifique conexión con el servidor (PUT inicial).';
}

function parsearCuerpoError(body: unknown): string | null {
  if (body == null) {
    return null;
  }

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        return extraerMensajeDeObjeto(parsed);
      } catch {
        return normalizarMensajeCrudo(trimmed);
      }
    }

    return normalizarMensajeCrudo(trimmed);
  }

  if (typeof body === 'object') {
    return extraerMensajeDeObjeto(body as Record<string, unknown>);
  }

  return null;
}

function extraerMensajeDeObjeto(obj: Record<string, unknown>): string | null {
  for (const key of ['mensaje', 'message', 'error'] as const) {
    const valor = obj[key];
    if (typeof valor === 'string' && valor.trim()) {
      return normalizarMensajeCrudo(valor);
    }
  }

  return null;
}

function normalizarMensajeCrudo(texto: string): string {
  const trimmed = texto.trim();

  if (trimmed.startsWith('{') && trimmed.includes('"mensaje"')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const inner = extraerMensajeDeObjeto(parsed);
      if (inner) {
        return inner;
      }
    } catch {
      // usar texto tal cual
    }
  }

  return trimmed;
}
