#!/bin/bash

#########################################################################################
#
#
# Este script busca que las versiones y definiciones generadas en el archivo version control
# sean las mismas que se usaran para genera el html que se presenta al usuario en el front
# y que contiene todos los cambios que disparan una nueva version.
#
#
#
#
#
#################################################################################

# export const environment = {
#   baseUrl: 'http://localhost:8090/akamba/api/v1/',
#   oauthParametersEndpoint: 'login/get_oauth_parameters',
#   layoutUrl:"http://localhost:4200/akamba/layout/capture",
#   tokenValidationEndpoint: 'login/token_validation',
#   refreshTokenEndpoint: 'login/refresh_token',
#   asuntoEndpoint: 'asunto/',
#   asuntoHistoricoEndpoint: 'asunto/historico/',
#   updateTableHistorico:"asunto/historico/update",
#   updateTableNuevo: "asunto/nuevo/update",
#   generateAcuse: "asunto/nuevo/get_acuse",
#   asuntoNuevoEndpoint: 'asunto/nuevo/',
#   getPdfEndpoint: 'getPdf',
#   getMsgEndpoint: 'getMsg',
#   base: '/akamba',
#   loginUrl: 'http://localhost:4200/login',
#   logoutUrl: 'https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout'
# };


destination_path="src/environments/environment.ts"

cat > ${destination_path} << EOF
export const environment = {
EOF

cat >> ${destination_path} << EOF
  baseUrl: '${ENV_DEV_baseUrl}', 
  oauthParametersEndpoint: '${ENV_DEV_oauthParametersEndpoint}',
  layoutUrl: '${ENV_DEV_layoutUrl}',
  tokenValidationEndpoint: '${ENV_DEV_tokenValidationEndpoint}',
  refreshTokenEndpoint: '${ENV_DEV_refreshTokenEndpoint}',
  asuntoEndpoint: '${ENV_DEV_asuntoEndpoint}',
  asuntoHistoricoEndpoint: '${ENV_DEV_asuntoHistoricoEndpoint}',
  updateTableHistorico: '${ENV_DEV_updateTableHistorico}',
  updateTableNuevo: '${ENV_DEV_updateTableNuevo}',
  generateAcuse: '${ENV_DEV_generateAcuse}',
  asuntoNuevoEndpoint: '${ENV_DEV_asuntoNuevoEndpoint}',
  getPdfEndpoint: '${ENV_DEV_getPdfEndpoint}',
  getMsgEndpoint: '${ENV_DEV_getMsgEndpoint}',
  base: '${ENV_DEV_base}', 
  loginUrl: '${ENV_DEV_loginUrl}',
  logoutUrl: '${ENV_DEV_logoutUrl}'
EOF

cat >> ${destination_path}  << EOF
}
EOF