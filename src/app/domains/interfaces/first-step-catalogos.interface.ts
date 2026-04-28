export interface TipoMedioRecepcionResponse {
  id: number;
  clave: string;
  descripcion: string;
}

export interface RemitenteGeneralResponse {
  id: number;
  clave: string;
  descripcion: string;
}

export interface RemitenteCentralResponse {
  id: number;
  clave: string;
  descripcion: string;
  claveGeneral: string;
}