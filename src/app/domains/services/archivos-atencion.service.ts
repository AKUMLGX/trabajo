import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para los archivos adjuntos
 */
export interface ArchivoAdjunto {
  nombre: string;
  tamano: string;
  ultima_modificacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchivosAtencionService {
  constructor(private http: HttpClient) { }

  /**
   * Sube uno o más archivos PDF asociados a un asunto en atención
   * @param folio - Folio interno del asunto al que se asociarán los archivos
   * @param archivos - Array de archivos PDF a subir
   * @returns Observable con la respuesta del servidor como texto
   */
  subirArchivosPdf(folio: string, archivos: File[]): Observable<string> {
    const formData = new FormData();
    
    // Primero enviamos el folio (requerimiento del backend)
    formData.append('folio', folio);
    
    // Luego agregamos los archivos
    for (const archivo of archivos) {
      formData.append('file', archivo, archivo.name);
    }
    
    // Acceder al endpoint usando indexación para evitar problemas de tipado
    const targetUrl = environment.baseUrl + (environment as any)['subirArchivosAtencion'];
    return this.http.post(targetUrl, formData, { responseType: 'text' });
  }

  /**
   * Obtiene la lista de archivos PDF adjuntos a un asunto en revisión (MODAL VERDE)
   * @param folio - Folio interno del asunto cuyos archivos se desean listar
   * @returns Observable con el listado de archivos adjuntos
   */
  listarArchivosPdf(folio: string): Observable<ArchivoAdjunto[]> {
    console.log('🟢 [ArchivosService] listarArchivosPdf (MODAL VERDE) iniciado para folio:', folio);
    
    const params = new HttpParams().set('folio', folio);
    const endpoint = (environment as any)['listarArchivosAtencion'];
    const targetUrl = environment.baseUrl + endpoint;
    const fullUrl = `${targetUrl}?${params.toString()}`;
    
    console.log('🟢 [ArchivosService] URL construida:', targetUrl);
    console.log('🟢 [ArchivosService] URL completa con parámetros:', fullUrl);
    console.log('🟢 [ArchivosService] Endpoint usado:', endpoint);
    
    // Agregar header para evitar mostrar modal de error en 404 (archivos no encontrados)
    const headers = { 'X-Skip-Error-Handler': 'true' };
    
    return this.http.get<ArchivoAdjunto[]>(targetUrl, { params, headers }).pipe(
      tap({
        next: (response: ArchivoAdjunto[]) => {
          console.log('✅ [ArchivosService] MODAL VERDE - Respuesta exitosa:', response);
          console.log('✅ [ArchivosService] MODAL VERDE - Número de archivos:', response?.length || 0);
        },
        error: (error: any) => {
          console.error('❌ [ArchivosService] MODAL VERDE - Error en petición:', error);
          console.error('❌ [ArchivosService] Status:', error.status);
          console.error('❌ [ArchivosService] URL que falló:', fullUrl);
        }
      })
    );
  }

  /**
   * Obtiene la lista de archivos PDF adjuntos a un asunto en atención (MODAL GUINDA)
   * @param folio - Folio interno del asunto cuyos archivos se desean listar
   * @returns Observable con el listado de archivos adjuntos
   */
  listarArchivosPdfAtencion(folio: string): Observable<ArchivoAdjunto[]> {
    console.log('🟤 [ArchivosService] listarArchivosPdfAtencion (MODAL GUINDA) iniciado para folio:', folio);
    
    const params = new HttpParams().set('folio', folio);
    const endpoint = (environment as any)['listarArchivosAtencionModal'];
    const targetUrl = environment.baseUrl + endpoint;
    const fullUrl = `${targetUrl}?${params.toString()}`;
    
    console.log('🟤 [ArchivosService] URL construida:', targetUrl);
    console.log('🟤 [ArchivosService] URL completa con parámetros:', fullUrl);
    console.log('🟤 [ArchivosService] Endpoint usado:', endpoint);
    
    // Agregar header para evitar mostrar modal de error en 404 (archivos no encontrados)
    const headers = { 'X-Skip-Error-Handler': 'true' };
    
    return this.http.get<ArchivoAdjunto[]>(targetUrl, { params, headers }).pipe(
      tap({
        next: (response: ArchivoAdjunto[]) => {
          console.log('✅ [ArchivosService] MODAL GUINDA - Respuesta exitosa:', response);
          console.log('✅ [ArchivosService] MODAL GUINDA - Número de archivos:', response?.length || 0);
        },
        error: (error: any) => {
          console.error('❌ [ArchivosService] MODAL GUINDA - Error en petición:', error);
          console.error('❌ [ArchivosService] Status:', error.status);
          console.error('❌ [ArchivosService] URL que falló:', fullUrl);
        }
      })
    );
  }
  
  /**
   * Obtiene un documento PDF codificado en base64
   * @param folio - Folio interno del asunto al que pertenece el documento
   * @param fileName - Nombre del archivo PDF que se desea obtener
   * @param carpeta - (Opcional) Subcarpeta dentro del directorio del folio
   * @returns Observable con el contenido del PDF en base64
   */
  obtenerPdf(folio: string, fileName: string, carpeta?: string): Observable<string> {
    let params = new HttpParams()
      .set('folio', folio)
      .set('file_name', fileName);
    
    // Agregar el parámetro de carpeta solo si se proporciona
    if (carpeta) {
      params = params.set('carpeta', carpeta);
    }
    
    const targetUrl = environment.baseUrl + environment.getPdfEndpoint;
    return this.http.get(targetUrl, { params, responseType: 'text' });
  }
} 