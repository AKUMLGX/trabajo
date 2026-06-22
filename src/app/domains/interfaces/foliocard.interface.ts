export interface FolioCard {
  acronimo: string;
  titulo: string;
  total: number;
  ultimo_folio?: string;
  descripcion?: string;
  icono?: string;
}

export interface EstadisticoAtencionResponse {
  tipo_resultado: string;
  acronimo: string;
  ultimo_folio: string;
  consecutivo: number;
}