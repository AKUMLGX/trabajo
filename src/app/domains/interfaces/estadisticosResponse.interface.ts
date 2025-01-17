export interface  Estado {
  en_tramite: number;
  no_aplica: number;
  parcial: number;
  recibido: number;
  total: number;
}

interface Requerimiento {
  REQUERIMIENTO: Estado;
}


interface Respuesta {
  RESPUESTA: Estado;
}

export interface EstadisticosResponse {
  data: (Requerimiento | Respuesta)[];
}
