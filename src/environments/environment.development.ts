export const environment = {
  baseUrl: 'http://127.0.0.1:8090/tlalcalli/api/v1', 
  oauthParametersEndpoint: 'login/get_oauth_parameters',
  layoutUrl:"http://localhost:4200/akamba/layout/capture",
  tokenValidationEndpoint: 'login/get_token',
  refreshTokenEndpoint: 'login/refresh_token',
  asuntoEndpoint: 'asunto/',
  asuntoHistoricoEndpoint: 'asunto/historico/',
  updateTableHistorico:"asunto/historico/update",
  updateTableNuevo: "asunto/nuevo/update",
  generateAcuse: "asunto/nuevo/get_reporte_por_dia",
  chartPieEstaditicos:"asunto/get_estadisticas_atencion",
  asuntoNuevoEndpoint: 'asunto/nuevo/',
  getPdfEndpoint: 'getPdf',
  getMsgEndpoint: 'getMsg',
  base: '/tlalcalli',
  loginUrl: 'http://localhost:4200/login',
  logoutUrl: 'https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout',
  environment:"DEVELOPMENT",
  hash: "1111111",

};

