// export const environment = {
//   // baseUrl: 'http://akmer.dev.cloudb.sat.gob.mx:8080/akamba/api/v1/',
//   baseUrl: 'http://localhost:8090/akamba/api/v1/',
//   layoutUrl:"http://localhost:4200/akamba/layout/capture",
//   oauthParametersEndpoint: 'login/get_oauth_parameters',
//   tokenValidationEndpoint: 'login/token_validation',
//   refreshTokenEndpoint: 'login/refresh_token',
//   asuntoEndpoint: 'asunto/',
//   updateTableHistorico:"asunto/historico/update",
//   updateTableNuevo: "asunto/nuevo/update",
//   generateAcuse: "asunto/nuevo/get_reporte_por_dia",
//   asuntoHistoricoEndpoint: 'asunto/historico/',
//   asuntoNuevoEndpoint: 'asunto/nuevo/',
//   getPdfEndpoint: 'getPdf',
//   getMsgEndpoint: 'getMsg',
//   base: '/akamba',
//   loginUrl: 'http://localhost:4200/login',
//   logoutUrl: 'https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout',
//   environment:"DESARROLLO",
//   hash:"011111"
// };




export const environment={
  environment:(window as {[key:string]:any})["env"]["environment"],
  hash: (window as {[key:string]:any})["env"]["hash"],

  baseUrl:(window as {[key:string]:any})["env"]["baseUrl"],
  layoutUrl:(window as {[key:string]:any})["env"]["layoutUrl"],
  loginUrl:(window as {[key:string]:any})["env"]["loginUrl"],
  logoutUrl:(window as {[key:string]:any})["env"]["logoutUrl"],

  oauthParametersEndpoint: 'login/get_oauth_parameters',
  tokenValidationEndpoint: 'login/token_validation',
  refreshTokenEndpoint: 'login/refresh_token',
  asuntoEndpoint: 'asunto/',
  asuntoEndpointC: 'asunto/consulta',
  asuntoDescargaTablaBusqueda: 'asunto/descargarconsulta',
  chartPieEstaditicos:"asunto/get_estadisticas_atencion",
  tableEstaditicas_Diarias:"asunto/get_estadisticas_diarias",
  updateTableHistorico:"asunto/historico/update",
  updateTableNuevo: "asunto/nuevo/update",
  updateDocumentoEscaneado: "asunto/nuevo/updatearchivo",
  generateAcuse: "asunto/get_estadistico_por_folio",
  generateEstadistico: "asunto/get_estadistico_por_dia",

  asuntoHistoricoEndpoint: 'asunto/historico/',
  asuntoNuevoEndpoint: 'asunto/nuevo/',
  getPdfEndpoint: 'getPdf',
  getMsgEndpoint: 'getMsg',
  base: '/akamba',

  }
