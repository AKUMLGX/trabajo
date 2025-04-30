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

export interface CardsResponse {
  data: (Requerimiento  )[];
}
