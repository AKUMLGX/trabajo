export interface ParametrosAcuse {
   fecha_inicial: string,
   fecha_final:string
   formato: string,
   administracion: string | null
}

export interface ParametrosAcuseFolio{
  folio_inicial:number,
  folio_final:number,
  formato: string,
  administracion: string | null
}
