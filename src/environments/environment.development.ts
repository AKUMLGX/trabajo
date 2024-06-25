export const environment = {
  baseUrl: 'http://localhost:8090/akamba/api/v1/',
  oauthParametersEndpoint: 'login/get_oauth_parameters',
  layoutUrl:"http://localhost:4200/akamba/layout/capture",
  tokenValidationEndpoint: 'login/token_validation',
  refreshTokenEndpoint: 'login/refresh_token',
  asuntoEndpoint: 'asunto/',
  asuntoHistoricoEndpoint: 'asunto/historico/',
  updateTableHistorico:"asunto/historico/update",
  updateTableNuevo: "asunto/nuevo/update",
  asuntoNuevoEndpoint: 'asunto/nuevo/',
  getPdfEndpoint: 'getPdf',
  getMsgEndpoint: 'getMsg',
  base: '/akamba',
  loginUrl: 'http://localhost:4200/login',
  logoutUrl: 'https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout'
};
