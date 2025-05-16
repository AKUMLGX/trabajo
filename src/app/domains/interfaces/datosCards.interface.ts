export interface Cards {
  en_tramite: number;
  no_aplica: number;
  parcial: number;
  recibido: number;
  total: number;
  documento: number;

}
export interface AdministracionResponse{
   Administracion: number;
}


interface Requerimiento {
  REQUERIMIENTO: Cards;
}

interface  Administracion{
  Administracion: AdministracionResponse
}

export interface CardsResponse {
  data: (Requerimiento|Administracion)[];
}
