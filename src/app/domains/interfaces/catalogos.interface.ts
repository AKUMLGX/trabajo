//Estructura del catalogo de prioridad y de servicios, paso 1 del stepeer.
export interface CatalogoPrioridadResponse {
  id_prioridad: number;
  nombre: string;
}

export interface CatalogoServicioResponse {
  id_servicio: number;
  nombre: string;
}

//Estructura del selector de responsables
export interface CatalogoMesItem {
  clave: string;
  descripcion: string;
}

export interface CatalogoMesesResponse {
  data: CatalogoMesItem[];
}

export interface ConsecutivoFechaRequest {
  clave: string;
}

export interface ConsecutivoFechaResponse {
  data: number;
}

/** GET expediente/consecutivo — folio anual `EXP-2026-1`. */
export interface ConsecutivoAnualResponse {
  data: string;
}


//Estructura sobre el crud de responsables paso 2 del stepper.

export interface CatalogoResponsableResponse {
  id_aplicativo: number;
  nombre: string;
}

export interface CrearResponsableRequest {
  nombre: string;
}

export interface ActualizarResponsableRequest {
  id_aplicativo: number;
  nombre: string;
}

export interface MensajeResponsableResponse {
  mensaje: string;
}