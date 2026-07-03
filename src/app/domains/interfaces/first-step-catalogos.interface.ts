// first-step-catalogos.interface.ts

export interface CatalogoGeneralResponse {
  id: number;
  clave: string;
  nombre: string;
  fecha_creacion?: string;
  eliminado?: boolean;
}

export interface CatalogoCentralResponse {
  id: number;
  clave: string;
  nombre: string;
  general_clave: string;
  fecha_creacion?: string;
  eliminado?: boolean;
}

export interface CatalogoGeneralesCentralResponse {
  [key: string]: CatalogoCentralResponse[];
}

export interface CrearGeneralRequest {
  clave: string;
  nombre: string;
}

export interface ActualizarGeneralRequest {
  id_aplicativo: number;
  clave: string;
  nombre: string;
}

export interface CrearCentralRequest {
  clave: string;
  nombre: string;
  general_clave: string;
}

export interface ActualizarCentralRequest {
  id_aplicativo: number;
  clave: string;
  nombre: string;
}

export interface MensajeCatalogoResponse {
  mensaje: string;
}