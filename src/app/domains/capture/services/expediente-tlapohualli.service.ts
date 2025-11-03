import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  ExpedienteTlapohualli, 
  FormularioPaso1, 
  FormularioPaso2, 
  FormularioPaso3,
  CatalogoSistemaAplicativo,
  CatalogoEstatusExpediente,
  CatalogoTipoRespuesta,
  CatalogoTipoDocumentoRespuesta
} from '../interfaces/expediente-tlapohualli.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpedienteTlapohualliService {
  private baseUrl = `${environment.baseUrl.replace('/akamba/api/v1', '')}/tlapohualli/api/v1`;

  constructor(private http: HttpClient) { }

  // Obtener todos los expedientes
  obtenerExpedientes(): Observable<ExpedienteTlapohualli[]> {
    return this.http.get<ExpedienteTlapohualli[]>(`${this.baseUrl}/expedientes`);
  }

  // Obtener expediente por ID
  obtenerExpedientePorId(id: number): Observable<ExpedienteTlapohualli> {
    return this.http.get<ExpedienteTlapohualli>(`${this.baseUrl}/expedientes/${id}`);
  }

  // Buscar expedientes por criterios
  buscarExpedientes(criterios: {
    expediente?: string;
    oficio?: string;
    remitente_area?: string;
    estatus?: string;
  }): Observable<ExpedienteTlapohualli[]> {
    let params = new HttpParams();
    
    if (criterios.expediente) {
      params = params.set('expediente', criterios.expediente);
    }
    if (criterios.oficio) {
      params = params.set('oficio', criterios.oficio);
    }
    if (criterios.remitente_area) {
      params = params.set('remitente_area', criterios.remitente_area);
    }
    if (criterios.estatus) {
      params = params.set('estatus', criterios.estatus);
    }

    return this.http.get<ExpedienteTlapohualli[]>(`${this.baseUrl}/expedientes/buscar`, { params });
  }

  // Crear nuevo expediente
  crearExpediente(expediente: ExpedienteTlapohualli): Observable<ExpedienteTlapohualli> {
    return this.http.post<ExpedienteTlapohualli>(`${this.baseUrl}/expedientes`, expediente);
  }

  // Actualizar expediente
  actualizarExpediente(id: number, expediente: ExpedienteTlapohualli): Observable<ExpedienteTlapohualli> {
    return this.http.put<ExpedienteTlapohualli>(`${this.baseUrl}/expedientes/${id}`, expediente);
  }

  // Eliminar expediente
  eliminarExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expedientes/${id}`);
  }

  // Crear expediente desde formularios por pasos
  crearExpedienteDesdePasos(
    paso1: FormularioPaso1, 
    paso2: FormularioPaso2, 
    paso3: FormularioPaso3
  ): Observable<ExpedienteTlapohualli> {
    const expedienteCompleto: ExpedienteTlapohualli = {
      // Paso 1 - Información básica
      expediente: paso1.expediente,
      oficio: paso1.oficio,
      numero_entrada_central: paso1.numero_entrada_central,
      remitente_area: paso1.remitente_area,
      referencia_asunto: paso1.referencia_asunto,
      fecha_documento: paso1.fecha_documento,
      mes_documento: paso1.mes_documento,
      fecha_recibido: paso1.fecha_recibido,
      
      // Paso 2 - Plazos y seguimiento
      plazo_vencimiento_prioridad: paso2.plazo_vencimiento_prioridad,
      fecha_vencimiento: paso2.fecha_vencimiento,
      dias_retraso: paso2.dias_retraso,
      fecha_notificacion: paso2.fecha_notificacion,
      sistema_aplicativo: paso2.sistema_aplicativo,
      responsable_fecha_asignacion: paso2.responsable_fecha_asignacion,
      woos: paso2.woos,
      numero_solicitudes_reales: paso2.numero_solicitudes_reales,
      observaciones: paso2.observaciones,
      estatus: paso2.estatus,
      ubicacion_carpeta: paso2.ubicacion_carpeta,
      respuesta_total_parcial: paso2.respuesta_total_parcial,
      
      // Paso 3 - Documentos y respuestas
      oficios_comision_apoyo: paso3.oficios_comision_apoyo,
      dictamen_reporte_acta: paso3.dictamen_reporte_acta,
      anexos: paso3.anexos,
      acuse_fisico_digital: paso3.acuse_fisico_digital,
      expediente_fisico_digital: paso3.expediente_fisico_digital,
      comentarios_omega: paso3.comentarios_omega
    };

    return this.crearExpediente(expedienteCompleto);
  }

  // Obtener catálogos
  obtenerSistemasAplicativo(): Observable<CatalogoSistemaAplicativo[]> {
    return this.http.get<CatalogoSistemaAplicativo[]>(`${this.baseUrl}/catalogos/sistemas-aplicativo`);
  }

  obtenerEstatusExpediente(): Observable<CatalogoEstatusExpediente[]> {
    return this.http.get<CatalogoEstatusExpediente[]>(`${this.baseUrl}/catalogos/estatus-expediente`);
  }

  obtenerTiposRespuesta(): Observable<CatalogoTipoRespuesta[]> {
    return this.http.get<CatalogoTipoRespuesta[]>(`${this.baseUrl}/catalogos/tipos-respuesta`);
  }

  obtenerTiposDocumentoRespuesta(): Observable<CatalogoTipoDocumentoRespuesta[]> {
    return this.http.get<CatalogoTipoDocumentoRespuesta[]>(`${this.baseUrl}/catalogos/tipos-documento-respuesta`);
  }

  // Validar expediente único
  validarExpedienteUnico(expediente: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/expedientes/validar-unico?expediente=${expediente}`);
  }

  // Calcular días de retraso
  calcularDiasRetraso(fechaVencimiento: Date): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = Math.ceil((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  }

  // Calcular fecha de vencimiento
  calcularFechaVencimiento(fechaRecibido: Date, plazoDias: number): Date {
    const fecha = new Date(fechaRecibido);
    fecha.setDate(fecha.getDate() + plazoDias);
    return fecha;
  }

  // Exportar expedientes a diferentes formatos
  exportarExpedientes(formato: 'pdf' | 'xlsx' | 'csv', criterios?: any): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);
    
    if (criterios) {
      Object.keys(criterios).forEach(key => {
        if (criterios[key]) {
          params = params.set(key, criterios[key]);
        }
      });
    }

    return this.http.get(`${this.baseUrl}/expedientes/exportar`, {
      params,
      responseType: 'blob'
    });
  }

  // Obtener estadísticas de expedientes
  obtenerEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/expedientes/estadisticas`);
  }
}
