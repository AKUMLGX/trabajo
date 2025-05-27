export interface  Estado {
  en_tramite: number;
  no_aplica: number;
  parcial: number;
  recibido: number;
  total: number;
  documento: number;
}

interface Requerimiento {
  REQUERIMIENTO: Estado;
}
interface Respuesta {
  RESPUESTA_INTERNA: Estado;
}

interface Respuesta_A_FGR {
  RESPUESTA_A_FGR: Estado;
}

interface Apertura{
  APERTURA:Estado
}

interface Segunda_Pieza{
SEGUNDA_PIEZA:Estado
}

export interface EstadisticosResponse {
  data: (Requerimiento | Respuesta | Respuesta_A_FGR | Apertura | Segunda_Pieza)[];
}
