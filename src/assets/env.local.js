/**
 * Plantilla LOCAL (ng serve + proxy o Rust en 8090). No commitear como env.js si subes solo front a desarrollo.
 * Uso:  cp src/assets/env.local.js src/assets/env.js
 * Antes de push a rama desarrollo: restaura env.js con Balam (git checkout -- src/assets/env.js o copia desde el repo remoto).
 */
(function(window){
  window["env"] = window["env"] || {};

  window["env"]["COMMIT_SHA"]= "000000";
  window["env"]["hash"] = "000000";
  window["env"]["environment"] ="LH";
  // window["env"]["baseUrl"]= "http://localhost:4200/tlalcalli/api/v1/";
  window["env"]["baseUrl"]= "http://localhost:8090/tlalcalli/api/v1/";
  window["env"]["layoutUrl"]= "http://localhost:4200/tlalcalli/layout/capture";
  window["env"]["loginUrl"]= "http://localhost:4200/tlalcalli/home";
  window["env"]["logoutUrl"]= "https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout";
})(this);
