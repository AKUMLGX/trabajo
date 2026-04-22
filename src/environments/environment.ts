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
    base: '/tlalcalli',

    /**
     * Solo para pruebas locales: si env.js define devIncluirTodasCapturasResponsables=true,
     * Centro de control carga por defecto todas las capturas (incluir_todos).
     * En producción omitir la variable o poner false.
     */
    devIncluirTodasCapturasResponsables: (() => {
      const env = (window as { [key: string]: any })['env'];
      const v = env?.['devIncluirTodasCapturasResponsables'];
      return v === true || v === 'true' || v === 1 || v === '1';
    })(),

    /**
     * Sin roles aún: si true y no está activo "Todas las capturas", el backend usa vista_equipo
     * (solo expedientes de Irma, Karen, Héctor y Carlos según lista del servidor).
     */
    devVistaEquipoCentroControl: (() => {
      const env = (window as { [key: string]: any })['env'];
      const v = env?.['devVistaEquipoCentroControl'];
      return v === true || v === 'true' || v === 1 || v === '1';
    })(),
  
    }
  