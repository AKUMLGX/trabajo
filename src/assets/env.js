
(function(window){
  window["env"] = window["env"] || {};

  window["env"]["COMMIT_SHA"]= "000000";
  window["env"]["hash"] = "000000";
  window["env"]["environment"] ="LH";
  // Desarrollo / integración (push solo front): API Balam. Ajusta layoutUrl/loginUrl si tu front de dev vive en otra URL.
  // window["env"]["baseUrl"]= "http://localhost:4200/tlalcalli/api/v1/";
  // window["env"]["baseUrl"]= "https://balam.sat.gob.mx/tlalcalli/api/v1/";
  window["env"]["baseUrl"] = "https://balam.sat.gob.mx/tlalcalli/api/v1/";
  window["env"]["layoutUrl"]= "http://localhost:4200/tlalcalli/layout/capture";
  window["env"]["loginUrl"]= "http://localhost:4200/tlalcalli/home";
  window["env"]["logoutUrl"]= "https://auth.dev.cloudb.sat.gob.mx/nidp/app/logout";

  /** Centro de control: listado global (GET /expedientes) para ver expedientes de todos los responsables. En prod, false o omitir. */
  window["env"]["devIncluirTodasCapturasResponsables"] = true;
  /** Si true y lo anterior es false: mismo listado global filtrado en cliente al equipo de captura. */
  window["env"]["devVistaEquipoCentroControl"] = false;
})(this);
