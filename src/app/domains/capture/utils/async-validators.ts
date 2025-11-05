import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Validador asíncrono para verificar si un oficio ya existe en la BD
 * @param http Cliente HTTP de Angular
 * @returns AsyncValidatorFn
 */
export function oficioExistenteValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // Si el campo está vacío, no validar
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const oficio = control.value.trim();

    // Validar solo si tiene al menos 5 caracteres (evitar consultas innecesarias)
    if (oficio.length < 5) {
      return of(null);
    }

    // Debounce de 800ms para evitar múltiples llamadas mientras el usuario escribe
    return timer(800).pipe(
      switchMap(() => {
        const url = `/tlapohualli/api/v1/expedientes/validar-oficio/${encodeURIComponent(oficio)}`;
        
        return http.get<{success: boolean, existe: boolean, mensaje: string}>(url).pipe(
          map(response => {
            // Si el oficio YA EXISTE, retornar error
            if (response.existe) {
              return {
                oficioExistente: {
                  message: '⚠️ Este oficio ya está registrado en el sistema',
                  detalle: response.mensaje
                }
              };
            }
            // Si el oficio NO EXISTE, está disponible
            return null;
          }),
          catchError(error => {
            console.error('Error al validar oficio:', error);
            // Si hay error en la conexión, no bloquear el formulario
            // pero mostrar advertencia en consola
            return of(null);
          })
        );
      })
    );
  };
}

/**
 * Validador asíncrono para verificar si un expediente ya existe en la BD
 * @param http Cliente HTTP de Angular
 * @returns AsyncValidatorFn
 */
export function expedienteExistenteValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // Si el campo está vacío, no validar
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const expediente = control.value.trim();

    // Validar solo si tiene el formato "Exp.XXX"
    if (!expediente.match(/^Exp\.\d+$/)) {
      return of(null);
    }

    // Debounce de 500ms
    return timer(500).pipe(
      switchMap(() => {
        const url = `/tlapohualli/api/v1/expedientes?expediente=${encodeURIComponent(expediente)}`;
        
        return http.get<{success: boolean, data: any[]}>(url).pipe(
          map(response => {
            // Si encuentra resultados, el expediente ya existe
            if (response.data && response.data.length > 0) {
              return {
                expedienteExistente: {
                  message: '⚠️ Este expediente ya está registrado',
                  detalle: 'Intenta con otro número'
                }
              };
            }
            return null;
          }),
          catchError(error => {
            console.error('Error al validar expediente:', error);
            return of(null);
          })
        );
      })
    );
  };
}

