import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ExpedienteTlapohualliService } from '../services/expediente-tlapohualli.service';

/**
 * Validador asíncrono para verificar si un oficio ya existe en la BD
 * @param expedienteService Servicio de expedientes Tlapohualli
 * @returns AsyncValidatorFn
 */
export function oficioExistenteValidator(expedienteService: ExpedienteTlapohualliService): AsyncValidatorFn {
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
        console.log('🔍 [VALIDADOR] Validando oficio:', oficio);
        
        return expedienteService.validarOficioExistente(oficio).pipe(
          map(response => {
            console.log('📡 [VALIDADOR] Respuesta del servidor:', response);
            
            // Si el oficio YA EXISTE, retornar error
            if (response.existe) {
              console.warn('❌ [VALIDADOR] Oficio DUPLICADO detectado');
              return {
                oficioExistente: {
                  message: `⚠️ Este oficio ya está registrado${response.id_expediente_duplicado ? ` (ID: ${response.id_expediente_duplicado})` : ''}`,
                  detalle: response.mensaje
                }
              };
            }
            // Si el oficio NO EXISTE, está disponible
            console.log('✅ [VALIDADOR] Oficio disponible');
            return null;
          }),
          catchError(error => {
            console.error('❌ [VALIDADOR] Error al validar oficio:', error);
            console.error('❌ [VALIDADOR] Status:', error.status);
            console.error('❌ [VALIDADOR] Error completo:', JSON.stringify(error));
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
 * @param expedienteService Servicio de expedientes Tlapohualli
 * @returns AsyncValidatorFn
 */
export function expedienteExistenteValidator(expedienteService: ExpedienteTlapohualliService): AsyncValidatorFn {
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
        return expedienteService.listarExpedientes().pipe(
          map(expedientes => {
            // Buscar si existe un expediente con ese número
            const existe = expedientes.some(exp => exp.expediente === expediente);
            
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
          catchError(error => {
            console.error('Error al validar expediente:', error);
            return of(null);
          })
        );
      })
    );
  };
}

