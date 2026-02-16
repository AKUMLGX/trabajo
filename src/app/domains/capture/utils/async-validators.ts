import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ExpedienteTlalcalliService } from '../services/expediente-tlalcalli.service';

/**
 * Validador asíncrono para verificar si un oficio ya existe en la BD
 * @param expedienteService Servicio de expedientes Tlalcalli
 * @returns AsyncValidatorFn
 */
export function oficioExistenteValidator(expedienteService: ExpedienteTlalcalliService): AsyncValidatorFn {
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
        return expedienteService.validarOficioExistente(oficio).pipe(
          map(response => {
            // Si el oficio YA EXISTE, retornar error
            if (response.existe) {
              return {
                oficioExistente: {
                  message: `⚠️ Este oficio ya está registrado${response.id_expediente_duplicado ? ` (ID: ${response.id_expediente_duplicado})` : ''}`,
                  detalle: response.mensaje
                }
              };
            }
            // Si el oficio NO EXISTE, está disponible
            return null;
          }),
          catchError(() => {
            // Si hay error en la conexión, no bloquear el formulario
            return of(null);
          })
        );
      })
    );
  };
}

/**
 * Validador asíncrono para verificar si un expediente ya existe en la BD
 * @param expedienteService Servicio de expedientes Tlalcalli
 * @returns AsyncValidatorFn
 * 
 * NOTA: Este validador NO es necesario actualmente porque el campo
 * "expediente" está bloqueado y se genera automáticamente.
 * Se mantiene para uso futuro si se requiere.
 */
export function expedienteExistenteValidator(expedienteService: ExpedienteTlalcalliService): AsyncValidatorFn {
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
        return expedienteService.obtenerExpedientes().pipe(
          map((expedientes: any[]) => {
            // Buscar si existe un expediente con ese número
            const existe = expedientes.some((exp: any) => exp.expediente === expediente);
            
            if (existe) {
              return {
                expedienteExistente: {
                  message: '⚠️ Este expediente ya está registrado',
                  detalle: 'Intenta con otro número'
                }
              };
            }
            return null;
          }),
          catchError(() => {
            return of(null);
          })
        );
      })
    );
  };
}

