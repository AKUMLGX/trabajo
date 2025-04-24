export interface Cards {
  en_tramite: number;
  no_aplica: number;
  parcial: number;
  recibido: number;
  total: number;
  documento: number;
}

interface Requerimiento {
  REQUERIMIENTO: Cards;
}


interface Respuesta {
  RESPUESTA_INTERNA: Cards;
}

interface Respuesta_A_FGR {
  RESPUESTA_A_FGR: Cards;
}

export interface CardsResponse {
  data: (Requerimiento  )[];
}
