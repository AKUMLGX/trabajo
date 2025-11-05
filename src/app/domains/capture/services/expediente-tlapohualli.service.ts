import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Interfaz del formulario completo que se envía al backend
 */
export interface FormularioExpedienteCompleto {
  // Paso 1: Identificación (8 campos)
  oficio: string;
  expediente: string;
  numero_entrada_central: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  referencia_asunto: string;
  plazo_vencimiento_prioridad: {
    valor: number;
    unidad: string; // 'dias', 'horas', 'ambos'
    es_urgente: boolean;
  };
  
  // Paso 2: Seguimiento (10 campos - sin los calculados)
  responsable: string;
  fecha_asignacion: string;
  sistema_aplicativo?: string;
  woos: string;
  estatus: string;
  ubicacion: string;
  oficios_comision?: string;
  tipo_respuesta: string;
  fecha_notificacion?: string;
  
  // Paso 3: Documentos (5 campos)
  tipo_documento: string;
  anexos?: string;
  acuse_fisico_digital?: string;
  expediente_fisico_digital: string;
  comentarios_omega?: string;
}

/**
 * Servicio para gestionar expedientes de Tlapohualli
 */
@Injectable({
  providedIn: 'root'
})
export class ExpedienteTlapohualliService {
  private readonly BASE_URL = '/tlapohualli/api/v1/expedientes';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo expediente desde los 3 pasos del formulario
   */
  crearExpedienteDesdePasos(
    paso1: any,
    paso2: any,
    paso3: any
  ): Observable<any> {
    const formularioCompleto: FormularioExpedienteCompleto = {
      // Paso 1
      oficio: paso1.oficio,
      expediente: paso1.expediente,
      numero_entrada_central: paso1.numero_entrada_central,
      remitente_area: paso1.remitente_area,
      fecha_documento: paso1.fecha_documento,
      fecha_recibido: paso1.fecha_recibido,
      referencia_asunto: paso1.referencia_asunto,
      plazo_vencimiento_prioridad: paso1.plazo_vencimiento_prioridad,
      
      // Paso 2
      responsable: paso2.responsable,
      fecha_asignacion: paso2.fecha_asignacion,
      sistema_aplicativo: paso2.sistema_aplicativo,
      woos: paso2.woos,
      estatus: paso2.estatus,
      ubicacion: paso2.ubicacion,
      oficios_comision: paso2.oficios_comision,
      tipo_respuesta: paso2.tipo_respuesta,
      fecha_notificacion: paso2.fecha_notificacion,
      
      // Paso 3
      tipo_documento: paso3.tipo_documento,
      anexos: paso3.anexos,
      acuse_fisico_digital: paso3.acuse_fisico_digital,
      expediente_fisico_digital: paso3.expediente_fisico_digital,
      comentarios_omega: paso3.comentarios_omega
    };

    return this.http.post<any>(this.BASE_URL, formularioCompleto).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear expediente');
      })
    );
  }

  /**
   * Obtener todos los expedientes
   */
  obtenerExpedientes(): Observable<any[]> {
    return this.http.get<any>(this.BASE_URL).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener expedientes');
      })
    );
  }

  /**
   * Obtener un expediente por ID
   */
  obtenerExpedientePorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener expediente');
      })
    );
  }

  /**
   * Obtener dashboard (expedientes en trámite y pendientes)
   */
  obtenerDashboard(): Observable<any[]> {
    return this.http.get<any>(`${this.BASE_URL}/dashboard`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener dashboard');
      })
    );
  }

  /**
   * Actualizar un expediente
   */
  actualizarExpediente(id: number, datos: Partial<FormularioExpedienteCompleto>): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, datos).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar expediente');
      })
    );
  }

  /**
   * Eliminar un expediente
   */
  eliminarExpediente(id: number): Observable<void> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar expediente');
        }
      })
    );
  }

  /**
   * Validar si un oficio ya existe en la BD
   */
  validarOficioExistente(oficio: string): Observable<{success: boolean, existe: boolean, mensaje: string, oficio_buscado?: string, id_expediente_duplicado?: number}> {
    return this.http.get<any>(`${this.BASE_URL}/validar-oficio/${encodeURIComponent(oficio)}`);
  }
}
