import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface FormularioExpediente {
  // Paso 1
  oficio: string;
  expediente: string;
  numero_entrada_central: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  referencia_asunto: string;
  plazo_vencimiento_prioridad: {
    valor: number;
    unidad: string;
    es_urgente: boolean;
  };
  
  // Paso 2
  responsable: string;
  fecha_asignacion: string;
  sistema_aplicativo?: string;
  woos: string;
  estatus: string;
  ubicacion: string;
  oficios_comision?: string;
  tipo_respuesta: string;
  fecha_notificacion?: string;
  
  // Paso 3
  tipo_documento: string;
  anexos?: string;
  acuse_fisico_digital?: string;
  expediente_fisico_digital: string;
  comentarios_omega?: string;
}

export interface Expediente {
  id_expediente: number;
  oficio: string;
  expediente: string;
  // ... resto de campos
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  private readonly API_URL = '/tlapohualli/api/v1/expedientes';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo expediente
   */
  crearExpediente(formulario: FormularioExpediente): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<any>(this.API_URL, formulario, { headers }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear expediente');
      }),
      catchError(error => {
        const message = error.error?.message || error.message || 'Error desconocido';
        return throwError(() => new Error(message));
      })
    );
  }

  /**
   * Listar todos los expedientes
   */
  listarExpedientes(): Observable<Expediente[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al listar expedientes');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener un expediente por ID
   */
  obtenerExpediente(id: number): Observable<Expediente> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener expediente');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar un expediente
   */
  actualizarExpediente(id: number, datos: Partial<FormularioExpediente>): Observable<Expediente> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.put<any>(`${this.API_URL}/${id}`, datos, { headers }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar expediente');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar un expediente
   */
  eliminarExpediente(id: number): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar expediente');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener dashboard (expedientes en trámite y pendientes)
   */
  obtenerDashboard(): Observable<Expediente[]> {
    return this.http.get<any>(`${this.API_URL}/dashboard`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener dashboard');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}

