import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para los archivos adjuntos
 */
export interface ArchivoAdjunto {
  nombre: string;
  tamano_bytes: number;
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
   * Obtiene la lista de archivos PDF adjuntos a un asunto en atención
   * @param folio - Folio interno del asunto cuyos archivos se desean listar
   * @returns Observable con el listado de archivos adjuntos
   */
  listarArchivosPdf(folio: string): Observable<ArchivoAdjunto[]> {
    const params = new HttpParams().set('folio', folio);
    const targetUrl = environment.baseUrl + (environment as any)['listarArchivosAtencion'];
    return this.http.get<ArchivoAdjunto[]>(targetUrl, { params });
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