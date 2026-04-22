/**
 * Duplicado de referencia: el env.js versionado ya apunta a Balam para desarrollo.
 * Mantener este archivo opcional para copiar a otros entornos o CI.
 */
(function(window){
  window["env"] = window["env"] || {};

  window["env"]["COMMIT_SHA"]= "000000";
  window["env"]["hash"] = "000000";
  window["env"]["environment"] ="LH";
  window["env"]["baseUrl"]= "https://balam.sat.gob.mx/tlalcalli/api/v1/";
  window["env"]["layoutUrl"]= "http://localhost:4200/tlalcalli/layout/capture";
  window["env"]["loginUrl"]= "http://localhost:4200/tlalcalli/home";
  window["env"]["logoutUrl"]= "https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout";
})(this);
