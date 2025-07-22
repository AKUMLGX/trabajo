import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  pdf = '';
  msg = '';

  pdfUpdated = new EventEmitter<string>();

  msgUpdated = new EventEmitter<string>();

  constructor(private httpClient: HttpClient) {}

  updatePdfFile(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.pdf = data;
        this.pdfUpdated.emit(this.pdf);
      });
  }

  updatePdfFileBandejaAtencion(folio: string, fileName: string): void {
    console.log('🔍 [FileService] updatePdfFileBandejaAtencion INICIADO');
    console.log('🔍 [FileService] Parámetros recibidos:', { folio, fileName });
    
    const params = {
      folio: folio,
      file_name: fileName,
    };
    
    const fullUrl = environment.baseUrl + environment.getPdfEndpoint;
    console.log('🔍 [FileService] URL construida:', fullUrl);
    console.log('🔍 [FileService] Parámetros de la petición:', params);
    console.log('🔍 [FileService] Environment.baseUrl:', environment.baseUrl);
    console.log('🔍 [FileService] Environment.getPdfEndpoint:', environment.getPdfEndpoint);
    
    this.httpClient
      .get(fullUrl, { params: params, responseType: 'text' })
      .subscribe({
        next: (data) => {
          console.log('✅ [FileService] Respuesta exitosa del servidor');
          console.log('✅ [FileService] Tipo de datos recibidos:', typeof data);
          console.log('✅ [FileService] Longitud de datos:', data?.length || 0);
          console.log('✅ [FileService] Primeros 100 caracteres:', data?.substring(0, 100));
          
          this.pdf = data;
          this.pdfUpdated.emit(this.pdf);
          console.log('✅ [FileService] Evento pdfUpdated emitido');
        },
        error: (error) => {
          console.error('❌ [FileService] Error en la petición HTTP:', error);
          console.error('❌ [FileService] Status:', error.status);
          console.error('❌ [FileService] StatusText:', error.statusText);
          console.error('❌ [FileService] URL que falló:', fullUrl);
          console.error('❌ [FileService] Parámetros que fallaron:', params);
          console.error('❌ [FileService] Error completo:', JSON.stringify(error, null, 2));
        }
      });
  }

  updateMsgFile(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getMsgEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.msg = data;
        this.msgUpdated.emit(this.msg);
      });
  }

  printPdf(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobURL = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobURL;
        document.body.appendChild(iframe);
        if (iframe.contentWindow !== null) iframe.contentWindow.print();
      });
  }
}
