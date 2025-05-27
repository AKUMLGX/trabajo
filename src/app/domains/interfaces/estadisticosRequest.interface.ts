export interface EstadisticosRequest{
  fecha_inicial:string;
  fecha_final:string;
  tipo:string;
}

export interface DownloadExcel{
  fecha_inicial:string;
  fecha_final:string;
  documento: string;
  administracion: string | null;
}
export interface DownloadExcelAperturaYSgundaPieza{
  fecha_inicial:string;
  fecha_final:string;
  documento: string;
  tipo: string;
  administracion: string | null;
}
