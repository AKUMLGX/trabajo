import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
} 