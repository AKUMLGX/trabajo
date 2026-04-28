export interface CatalogoGeneralResponse {
  id: number;
  clave: string;
  nombre: string;
}

export interface CatalogoCentralResponse {
  id: number;
  clave: string;
  nombre: string;
  general_clave: string;
}

export interface CatalogoGeneralesCentralResponse {
  gene: CatalogoGeneralResponse[];
  centra: CatalogoCentralResponse[];
}