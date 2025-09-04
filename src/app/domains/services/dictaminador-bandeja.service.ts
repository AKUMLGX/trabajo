import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { porAsignarRequest, tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';
import { AsuntoPorEstadoAtencionRequest, AsuntoPorEstadoAtencionResponse, AsuntoAsignacion, AsuntoNuevo } from '../interfaces/asuntoPorAtencion.interface';
import { respuestaFormularioDictaminadorRequest } from './../interfaces/respuestaFormulariosDictamindadorRequest';
import { AreaDisponible, NewChecklistRequerimiento, ChecklistRequerimiento } from '../interfaces/seguimiento-areas.interface';



@Injectable({
  providedIn: 'root'
})
export class DictaminadorBandejaService {
  constructor(private http: HttpClient) {}

  obtenerAsuntosPorEstado(estadoAtencion: string): Observable<tableAsuntosPorDictaminar[]> {
    const url = environment.baseUrl + 'asunto/atencion/get_asunto_por_estado_atencion/';
    const params: AsuntoPorEstadoAtencionRequest = {
      documento: 'REQUERIMIENTO',
      estado_atencion: estadoAtencion
    };

    return this.http.post<AsuntoPorEstadoAtencionResponse>(url, params).pipe(
      map((response) => {
        if (!response || response.length === 0) {
          return [] as tableAsuntosPorDictaminar[];
        }

        return response.map((item: AsuntoAsignacion) => {
          let asuntoData: any = {};

          if ('tipo' in item.asunto && 'datos' in item.asunto) {
            asuntoData = item.asunto.datos;
          } else if ('Nuevo' in item.asunto && item.asunto.Nuevo) {
            asuntoData = item.asunto.Nuevo;
          } else if ('Historico' in item.asunto && item.asunto.Historico) {
            asuntoData = item.asunto.Historico;
          } else {
            console.warn('⚠️ Estructura de asunto no reconocida:', item.asunto);
            return null as unknown as tableAsuntosPorDictaminar;
          }

          if (!asuntoData) {
            return null as unknown as tableAsuntosPorDictaminar;
          }

          const normalizado: tableAsuntosPorDictaminar = {
            folio_interno: asuntoData.folio_interno ?? '',
            folio_scanner: asuntoData.folio_scanner ?? 0,
            carpeta_investigacion: asuntoData.carpeta_investigacion ?? '',
            oficio: asuntoData.oficio ?? '',
            persona_relacionada: asuntoData.persona_relacionada ?? '',
            fecha_recepcion: asuntoData.fecha_recepcion ?? '',
            id_administracion_fk: asuntoData.id_administracion_fk ?? 0,
            id_documento_fk: asuntoData.id_documento_fk ?? 0,
            id_atencion_fk: asuntoData.id_atencion_fk ?? 0,
            turno_jefatura: asuntoData.turno_jefatura ?? '',
            autoridad_remitente: asuntoData.autoridad_remitente ?? '',
            id_asunto: asuntoData.id_asunto_nuevo || asuntoData.id_asunto_historico || 0,
            es_historico: 'Historico' in item.asunto || item.tipo_asunto === 'HISTORICO',
            plazo_atencion: asuntoData.plazo_atencion ?? 0,
            id_asignacion: item.id_asignacion ?? undefined,
            tipo_asunto: item.tipo_asunto,
            rfc_dictaminador: item.rfc_asignado,
            nombre_dictaminador: item.rfc_asignado
          };
          // Propagar observaciones desde raíz o desde los datos del asunto
          const obsFuente = (
            (typeof (item as any).observaciones === 'string' && (item as any).observaciones) ||
            (typeof (asuntoData as any)?.observaciones === 'string' && (asuntoData as any).observaciones) ||
            ''
          );
          (normalizado as any).observaciones = obsFuente.trim();
          (normalizado as any).id_asunto = normalizado.id_asunto;
          return normalizado;
        }).filter((item): item is tableAsuntosPorDictaminar => item !== null);
      })
    );
  }

  obtenerAsuntosAsignados(): Observable<tableAsuntosPorDictaminar[]> {
    const url = environment.baseUrl + 'asunto/atencion/get_asunto_por_estado_atencion/';
    const params: AsuntoPorEstadoAtencionRequest = {
      documento: 'REQUERIMIENTO',
      estado_atencion: "EN DICTAMINACION"
    };

    return this.http.post<AsuntoPorEstadoAtencionResponse>(url, params).pipe(
      map((response) => {
        if (!response || response.length === 0) {
          return [] as tableAsuntosPorDictaminar[];
        }

        return response.map((item: AsuntoAsignacion, index: number) => {
          let asuntoData: any = {};

          // Extraer datos según la estructura anidada del backend
          if ('tipo' in item.asunto && 'datos' in item.asunto) {
            // Nueva estructura: { tipo: "Nuevo"|"Historico", datos: {...} }
            asuntoData = item.asunto.datos;
          } else if ('Nuevo' in item.asunto && item.asunto.Nuevo) {
            // Estructura legacy: { Nuevo: {...} }
            asuntoData = item.asunto.Nuevo;
          } else if ('Historico' in item.asunto && item.asunto.Historico) {
            // Estructura legacy: { Historico: {...} }
            asuntoData = item.asunto.Historico;
          } else {
            console.warn('⚠️ Estructura de asunto no reconocida:', item.asunto);
            return null;
          }

          // Verificar que tenemos datos válidos
          if (!asuntoData || !asuntoData.folio_interno) {
            console.warn('⚠️ Asunto sin folio_interno, omitiendo:', asuntoData);
            return null;
          }

          const normalizado: tableAsuntosPorDictaminar = {
            folio_interno: asuntoData.folio_interno ?? '',
            folio_scanner: asuntoData.folio_scanner ?? 0,
            carpeta_investigacion: asuntoData.carpeta_investigacion ?? '',
            oficio: asuntoData.oficio ?? '',
            persona_relacionada: asuntoData.persona_relacionada ?? '',
            fecha_recepcion: asuntoData.fecha_recepcion ?? '',
            id_administracion_fk: asuntoData.id_administracion_fk ?? 0,
            id_documento_fk: asuntoData.id_documento_fk ?? 0,
            id_atencion_fk: asuntoData.id_atencion_fk ?? 0,
            turno_jefatura: asuntoData.turno_jefatura ?? '',
            autoridad_remitente: asuntoData.autoridad_remitente ?? '',
            id_asunto: asuntoData.id_asunto_nuevo || asuntoData.id_asunto_historico || 0,
            es_historico: 'Historico' in item.asunto || item.tipo_asunto === 'HISTORICO',
            plazo_atencion: asuntoData.plazo_atencion ?? 0,
            // Datos adicionales para asignación
            id_asignacion: item.id_asignacion ,
            tipo_asunto: item.tipo_asunto,
            rfc_dictaminador: item.rfc_asignado,
            nombre_dictaminador: item.rfc_asignado // Podrías mapear a nombre real si tienes la info
          };

          // Agregar propiedades adicionales que espera el componente (as any para bypass TypeScript)
          // Propagar observaciones desde raíz o desde los datos del asunto
          const obsFuente = (
            (typeof (item as any).observaciones === 'string' && (item as any).observaciones) ||
            (typeof (asuntoData as any)?.observaciones === 'string' && (asuntoData as any).observaciones) ||
            ''
          );
          (normalizado as any).observaciones = obsFuente.trim();
          (normalizado as any).id_asunto = normalizado.id_asunto; // Para compatibilidad

          return normalizado;
        }).filter((item): item is tableAsuntosPorDictaminar => item !== null);
      })
    );
  }

  obtenerAsuntoPorId(id: string): Observable<tableAsuntosPorDictaminar> {
    const url = environment.baseUrl + environment.asuntosPorAsignarTable + `/${id}`;
    return this.http.get<tableAsuntosPorDictaminar>(url);
  }

  finalizarAtencion(idAsunto: number): Observable<string> {
    const url = environment.baseUrl + environment.finalizarAtencion;
    const params = {
      id_asunto: idAsunto,
      aprobado: true // Este campo es ignorado en este endpoint, pero es requerido por la estructura
    };

    // Configurar opciones para recibir respuesta como texto plano
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'text/plain, */*' // Aceptar texto plano
      }),
      responseType: 'text' as 'json' // Forzar el tipo de respuesta a texto
    };

    return this.http.post<string>(url, params, httpOptions);
  }

  resolverAsunto(idAsunto: number, aprobado: boolean , observaciones : string): Observable<string> {
    const url = environment.baseUrl + environment.resolverAsunto;
    const params = {
      id_asunto: idAsunto,
      aprobado: aprobado,
      observaciones: observaciones
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'text/plain, */*'
      }),
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(url, params, httpOptions);
  }

  asignarRespuestasDictaminadorFormularios(data:respuestaFormularioDictaminadorRequest, selectedFile :File):Observable<string> {
    const tarjetURL = environment.baseUrl + environment.asigarRespuestaDictaminador;
    const type = 'application/json'
    const json = JSON.stringify(data);

    let formData: FormData;
    const blob = new Blob([json], { type });
    formData = new FormData();
    formData.append('data', blob);
    formData.append('file', selectedFile, selectedFile.name);

    return this.http.post(tarjetURL, formData, { responseType: 'text' })
  }

  // ==== Nuevo: obtener respuestas por id_req y documento ====
  getRespuestasAsunto(idReq: number, documento: string): Observable<AsuntoNuevo[]> {
    const url = environment.baseUrl + 'asunto/atencion/get_respuesta_asunto';
    const params = { documento, id_req: idReq } as const;
    return this.http.post<AsuntoNuevo[]>(url, params);
  }

  // ==== NUEVOS MÉTODOS PARA CONTROL DE SEGUIMIENTO DE ÁREAS ====
  
  // 1. Obtener áreas disponibles
  getAreasDisponibles(): Observable<AreaDisponible[]> {
    const url = environment.baseUrl + 'asunto/atencion/listar_areas';
    return this.http.get<AreaDisponible[]>(url);
  }

  // 2. Crear solicitud de información
  crearSolicitudInformacion(solicitud: NewChecklistRequerimiento): Observable<ChecklistRequerimiento> {
    const url = environment.baseUrl + 'asunto/atencion/checklist_solicitud_areas';
    
    // Asegurar headers correctos para JSON
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    console.log('📡 Enviando a URL:', url);
    console.log('📡 Payload:', JSON.stringify(solicitud));
    console.log('📡 Headers:', headers);
    
    return this.http.post<ChecklistRequerimiento>(url, solicitud, { headers });
  }

  // 3. Obtener checklist por asignación
  getChecklistPorAsignacion(idAsignacion: number): Observable<ChecklistRequerimiento[]> {
    // El backend deserializa la query como ChecklistRequerimiento completo,
    // aunque solo usa id_asignacion_fk. Para evitar 400, enviamos los campos requeridos.
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const params = new URLSearchParams({
      id_asignacion_fk: String(idAsignacion),
      id_check: '0',
      area: '-',
      fecha_solicitud: fecha
    }).toString();
    const url = `${environment.baseUrl}asunto/atencion/obtener_checklist_por_asignacion?${params}`;
    return this.http.get<ChecklistRequerimiento[]>(url);
  }

}
