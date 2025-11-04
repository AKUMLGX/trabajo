import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExpedienteAutocompleteService {
  
  constructor(private http: HttpClient) {}

  /**
   * Obtiene el siguiente número de expediente sugerido
   * Formato: Exp.001, Exp.002, Exp.003...
   */
  obtenerSiguienteExpediente(): Observable<string> {
    // TODO: Conectar con el backend cuando esté listo
    // return this.http.get<{siguiente: string}>('/api/expedientes/siguiente')
    //   .pipe(map(response => response.siguiente));
    
    // Por ahora retornamos un valor mock
    const ultimoNumero = this.getUltimoNumeroLocal();
    const siguiente = ultimoNumero + 1;
    return of(this.formatearExpediente(siguiente));
  }

  /**
   * Obtiene expedientes recientes para autocompletar
   * @param termino - Término de búsqueda (ej: "Exp.00")
   */
  buscarExpedientes(termino: string): Observable<string[]> {
    // TODO: Conectar con el backend cuando esté listo
    // return this.http.get<string[]>(`/api/expedientes/buscar?q=${termino}`);
    
    // Por ahora retornamos valores mock
    const expedientesMock = this.getExpedientesRecientesLocal();
    const filtrados = expedientesMock.filter(exp => 
      exp.toLowerCase().includes(termino.toLowerCase())
    );
    return of(filtrados.slice(0, 5)); // Máximo 5 resultados
  }

  /**
   * Guarda el último número de expediente usado (LocalStorage temporal)
   */
  guardarUltimoExpediente(expediente: string): void {
    const numero = this.extraerNumero(expediente);
    if (numero) {
      localStorage.setItem('ultimo_expediente', numero.toString());
      
      // Guardar en lista de recientes
      const recientes = this.getExpedientesRecientesLocal();
      if (!recientes.includes(expediente)) {
        recientes.unshift(expediente);
        // Mantener solo los últimos 10
        const recientesLimitados = recientes.slice(0, 10);
        localStorage.setItem('expedientes_recientes', JSON.stringify(recientesLimitados));
      }
    }
  }

  /**
   * Formatea un número a formato de expediente: Exp.001
   */
  private formatearExpediente(numero: number): string {
    return `Exp.${numero.toString().padStart(3, '0')}`;
  }

  /**
   * Extrae el número de un expediente: "Exp.001" -> 1
   */
  private extraerNumero(expediente: string): number | null {
    const match = expediente.match(/Exp\.(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Obtiene el último número usado del LocalStorage
   */
  private getUltimoNumeroLocal(): number {
    const ultimo = localStorage.getItem('ultimo_expediente');
    return ultimo ? parseInt(ultimo, 10) : 0;
  }

  /**
   * Obtiene la lista de expedientes recientes del LocalStorage
   */
  private getExpedientesRecientesLocal(): string[] {
    const recientes = localStorage.getItem('expedientes_recientes');
    return recientes ? JSON.parse(recientes) : [];
  }

  /**
   * Valida que el expediente tenga el formato correcto
   */
  validarFormato(expediente: string): boolean {
    return /^Exp\.\d{3}$/i.test(expediente);
  }

  /**
   * Auto-formatea mientras el usuario escribe
   * Ej: Usuario escribe "123" -> retorna "Exp.123"
   */
  autoFormatear(valor: string): string {
    // Remover cualquier texto que no sea número
    const soloNumeros = valor.replace(/[^\d]/g, '');
    
    if (soloNumeros.length === 0) return '';
    if (soloNumeros.length > 3) return valor; // No modificar si ya tiene más de 3 dígitos
    
    // Formatear automáticamente
    return `Exp.${soloNumeros.padStart(3, '0')}`;
  }
}

