export const environment = {
  baseUrl: 'https://balam.sat.gob.mx/tlalcalli/api/v1/',

  loginUrl: 'http://localhost:4200/login',
  logoutUrl: 'https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout',
  environment:"DEVELOPMENT",
  hash: "1111111",
  REDIRECT_URI:"http://localhost:4200/home",

  oauthParametersEndpoint: 'login/get_oauth_parameters',
  tokenValidationEndpoint: 'login/token_validation',
  refreshTokenEndpoint: 'login/refresh_token',
  asuntoEndpoint: 'asunto/',
  asuntoEndpointC: 'asunto/consulta',
  asuntoDescargaTablaBusqueda: 'asunto/descargarconsulta',
  chartPieEstaditicos:"asunto/get_estadisticas_atencion",
  tableEstaditicas_Diarias:"asunto/get_estadisticas_diarias",
  tableEstaditicas_DiariasAperturas_Segunda:"asunto/get_estadisticas_diarias_por_tipo",
  updateTableHistorico:"asunto/historico/update",
  updateTableNuevo: "asunto/nuevo/update",
  updateDocumentoEscaneado: "asunto/nuevo/updatearchivo",
  generateAcuse: "asunto/get_estadistico_por_folio",
  generateEstadistico: "asunto/get_estadistico_por_dia",
  //#region Bandeja de Expedientes (Tlalcalli)
  cardsInfo:'expedientes/buscar',
  cardsInfoPorAsignar:'expedientes/buscar',
  asuntosPorDictaminar: 'expedientes/buscar',
  asuntosPorAsignarTable: 'expedientes/buscar',
  usuariosPorAdministracion:'expedientes/buscar',
  asignarAsunto:'expedientes/buscar',
  enTramiteTableCard:'expedientes/buscar',
  parcialTableCard:'expedientes/buscar',
  totalTableCard:'expedientes/buscar',
  downloadExecelEnTramite:'expedientes/buscar',
  downloadExecelParcial:'expedientes/buscar',
  downloadExecelTotal:'expedientes/buscar',
  subirArchivosAtencion: 'expedientes/buscar',
  listarArchivosAtencionModal: 'expedientes/buscar',
  finalizarAtencion: 'expedientes/buscar',
  resolverAsunto: 'expedientes/buscar',
  asignarAdministracion: 'expedientes/buscar',
  //#endregion
//#region Bandeja Dictaminiador
  asigarRespuestaDictaminador: 'asunto/nuevo/euacape/respuesta/',
//#endregion
  asuntoHistoricoEndpoint: 'asunto/historico/',
  asuntoNuevoEndpoint: 'asunto/nuevo/',
  getPdfEndpoint: 'getPdf',
  getMsgEndpoint: 'getMsg',
  base: '/',

layoutUrl: 'http://localhost:4200',

devIncluirTodasCapturasResponsables: (() => {
  const env = (window as { [key: string]: any })['env'];
  const v = env?.['devIncluirTodasCapturasResponsables'];

  return v === true || v === 'true' || v === 1 || v === '1';
})(),

devVistaEquipoCentroControl: (() => {
  const env = (window as { [key: string]: any })['env'];
  const v = env?.['devVistaEquipoCentroControl'];

  return v === true || v === 'true' || v === 1 || v === '1';
})(),

};


