export interface EstadisticosRequest{
  fecha_incial:Date;
  fecha_final:Date;
}

export interface DownloadExcel{
  fecha_inicial:string;
  fecha_final:string;
  documento: string
  formato:string
  administracion: string | null
}
