import { Injectable } from '@angular/core';

/**
 * Servicio para ayudar con valores por defecto y autocompletado inteligente
 */
@Injectable({
  providedIn: 'root'
})
export class FormHelperService {
  private readonly STORAGE_KEY_PREFIX = 'tlalcalli_form_';

  /**
   * Obtener fecha actual en formato YYYY-MM-DD
   */
  getFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtener fecha de hace N días
   */
  getFechaHaceDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Guardar valor en historial de usuario (localStorage)
   */
//   guardarEnHistorial(campo: string, valor: string): void {
//     if (!valor || valor.trim() === '') return;

//     const key = `${this.STORAGE_KEY_PREFIX}historial_${campo}`;
//     const historial = this.obtenerHistorial(campo);
    
//     // Evitar duplicados
//     const index = historial.indexOf(valor);
//     if (index > -1) {
//       historial.splice(index, 1);
//     }
    
//     // Agregar al inicio
//     historial.unshift(valor);
    
//     // Mantener solo los últimos 10
//     const historialLimitado = historial.slice(0, 10);
    
//     try {
//       localStorage.setItem(key, JSON.stringify(historialLimitado));
//     } catch (e) {
//       // Si localStorage está lleno, ignorar
//       console.warn('No se pudo guardar en historial:', e);
//     }
//   }

//   /**
//    * Obtener historial de un campo
//    */
//   obtenerHistorial(campo: string): string[] {
//     const key = `${this.STORAGE_KEY_PREFIX}historial_${campo}`;
//     try {
//       const historial = localStorage.getItem(key);
//       return historial ? JSON.parse(historial) : [];
//     } catch (e) {
//       return [];
//     }
//   }

//   /**
//    * Guardar borrador del formulario
//    */
//   guardarBorrador(paso: number, datos: any): void {
//     const key = `${this.STORAGE_KEY_PREFIX}borrador_paso${paso}`;
//     try {
//       localStorage.setItem(key, JSON.stringify({
//         datos,
//         fecha: new Date().toISOString()
//       }));
//     } catch (e) {
//       console.warn('No se pudo guardar borrador:', e);
//     }
//   }

//   /**
//    * Obtener borrador del formulario
//    */
//   obtenerBorrador(paso: number): any | null {
//     const key = `${this.STORAGE_KEY_PREFIX}borrador_paso${paso}`;
//     try {
//       const borrador = localStorage.getItem(key);
//       if (borrador) {
//         const parsed = JSON.parse(borrador);
//         // Verificar que no sea muy antiguo (más de 7 días)
//         const fecha = new Date(parsed.fecha);
//         const diasDiferencia = (new Date().getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24);
//         if (diasDiferencia > 7) {
//           this.limpiarBorrador(paso);
//           return null;
//         }
//         return parsed.datos;
//       }
//     } catch (e) {
//       console.warn('No se pudo obtener borrador:', e);
//     }
//     return null;
//   }

//   /**
//    * Limpiar borrador
//    */
//   limpiarBorrador(paso: number): void {
//     const key = `${this.STORAGE_KEY_PREFIX}borrador_paso${paso}`;
//     localStorage.removeItem(key);
//   }

//   /**
//    * Limpiar todos los borradores
//    */
//   limpiarTodosLosBorradores(): void {
//     for (let i = 1; i <= 3; i++) {
//       this.limpiarBorrador(i);
//     }
//   }
}







