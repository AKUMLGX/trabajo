export interface Aplicativo {
  id_aplicativo: number;
  nombre: string;
  es_sistema: boolean;
  es_usuario?: boolean;
}

export interface CrearAplicativoDTO {
  nombre: string;
}

export interface ActualizarAplicativoDTO {
  id_aplicativo: number;
  nombre: string;
}

export interface MensajeResponse {
  mensaje?: string;
  error?: string;
}