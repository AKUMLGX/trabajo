export const environment = {
  baseUrl: 'http://akmer.cloudb.sat.gob.mx:8080/akamba/api/v1/',
  layoutUrl:"https://pe.cloudb.sat.gob.mx/akamba/layout/capture",
  oauthParametersEndpoint: 'login/get_oauth_parameters',
  tokenValidationEndpoint: 'login/token_validation',
  refreshTokenEndpoint: 'login/refresh_token',
  asuntoEndpoint: 'asunto/',
  updateTableHistorico:"asunto/historico/update",
  updateTableNuevo: "asunto/nuevo/update",
  generateAcuse: "asunto/nuevo/get_acuse",
  asuntoHistoricoEndpoint: 'asunto/historico/',
  asuntoNuevoEndpoint: 'asunto/nuevo/',
  getPdfEndpoint: 'getPdf',
  getMsgEndpoint: 'getMsg',
  base: '/akamba',
  loginUrl: 'https://pe.cloudb.sat.gob.mx/home/akamba/login',
  logoutUrl: 'https://auth.cloudb.sat.gob.mx/nidp/app/logout'
};


