import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { MatListModule } from '@angular/material/list';

import { dynamicHeight } from '../../../shared/animacion/dynamicHeight.trigger';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import { ApiService } from '../../../../domains/capture/services/api.service';
import { CatalogoResponsableResponse } from '../../../../domains/interfaces/catalogos.interface';
import { CatalogoReworkItem } from '../../../../domains/capture/interfaces/expediente-rework.interface';

interface OpcionSelect {
  value: number;
  label: string;
}

@Component({
  selector: 'app-tracking-form',
  imports: [CommonModule, ReactiveFormsModule, MatListModule],
  templateUrl: './tracking-form.component.html',
  styleUrl: './tracking-form.component.css',
  animations: [
    dynamicHeight,
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.35)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.35)' })),
      ]),
    ]),
  ],
})
export class TrackingFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  public consultForm: FormGroup = this.fb.group({
    expediente: new FormControl(''),
    oficio: new FormControl(''),
    prioridad: new FormControl<number | ''>(''),
    status: new FormControl<number | ''>(''),
    responsable: new FormControl<number | ''>(''),
    fecha_creacion_desde: new FormControl(''),
    fecha_creacion_hasta: new FormControl(''),
  });

  opcionesPrioridad: OpcionSelect[] = [];
  opcionesEstatus: OpcionSelect[] = [];
  opcionesResponsables: OpcionSelect[] = [];

  private catalogoPrioridad: CatalogoReworkItem[] = [];
  private catalogoEstatus: CatalogoReworkItem[] = [];
  private catalogoResponsables: CatalogoResponsableResponse[] = [];

  showCoincidencias: Record<string, boolean> = {};
  coincidencias: string[] = [];
  nombreCampoAutocomplete = '';

  constructor(
    private fb: FormBuilder,
    private expedienteService: ExpedienteTlalcalliService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['expediente']) {
        this.consultForm.patchValue({ expediente: params['expediente'] });
        setTimeout(() => this.onSave(), 600);
      } else if (params['oficio']) {
        this.consultForm.patchValue({ oficio: params['oficio'] });
        setTimeout(() => this.onSave(), 600);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSave(): void {
    this.expedienteService.consultarExpedientes(this.construirFiltrosConsulta()).subscribe({
      next: (expedientes) => {
        this.expedienteService.expedientesConsultados.emit(expedientes);
      },
      error: (error) => {
        console.error('Error al consultar expedientes:', error);
      },
    });
  }

  limpiarFiltros(): void {
    this.consultForm.reset({
      expediente: '',
      oficio: '',
      prioridad: '',
      status: '',
      responsable: '',
      fecha_creacion_desde: '',
      fecha_creacion_hasta: '',
    });
    this.coincidencias = [];
  }

  private construirFiltrosConsulta(): Record<string, unknown> {
    const form = this.consultForm.getRawValue();

    return {
      expediente: form.expediente?.trim() || undefined,
      oficio: form.oficio?.trim() || undefined,
      prioridad: this.obtenerPrioridadLegacy(form.prioridad),
      estatus: this.obtenerDescripcionCatalogo(this.catalogoEstatus, form.status),
      responsable: this.obtenerNombreResponsable(form.responsable),
      fecha_creacion_desde: form.fecha_creacion_desde || undefined,
      fecha_creacion_hasta: form.fecha_creacion_hasta || undefined,
    };
  }

  private obtenerPrioridadLegacy(idPrioridad: number | ''): string | undefined {
    if (!idPrioridad) {
      return undefined;
    }

    const item = this.catalogoPrioridad.find((p) => p.id_exp === idPrioridad);
    if (!item) {
      return undefined;
    }

    if (item.descripcion.toLowerCase().startsWith('extra urgente')) {
      return 'Extra urgente';
    }

    return item.descripcion.split('(')[0].trim();
  }

  private obtenerDescripcionCatalogo(
    catalogo: CatalogoReworkItem[],
    id: number | ''
  ): string | undefined {
    if (!id) {
      return undefined;
    }

    return catalogo.find((item) => item.id_exp === id)?.descripcion;
  }

  private obtenerNombreResponsable(id: number | ''): string | undefined {
    if (!id) {
      return undefined;
    }

    return this.catalogoResponsables.find((r) => r.id_aplicativo === id)?.nombre;
  }

  onAutocompleteInput(campo: 'expediente' | 'oficio'): void {
    this.nombreCampoAutocomplete = campo;
    const valor = this.consultForm.get(campo)?.value?.toString().trim() ?? '';

    if (!valor) {
      this.coincidencias = [];
      return;
    }

    this.expedienteService.autocompletadoCampo(valor, campo).subscribe({
      next: (coincidencias) => {
        this.coincidencias = coincidencias.slice(0, 5);
      },
    });
  }

  detectInput(entering: boolean, campo: string): void {
    this.showCoincidencias[campo] = entering;
    if (!entering) {
      this.coincidencias = [];
    }
  }

  selectCoincidencia(coincidencia: string): void {
    this.consultForm.get(this.nombreCampoAutocomplete)?.setValue(coincidencia);
    this.coincidencias = [];
  }

  private cargarCatalogos(): void {
    this.cargarCatalogoGetCat(2, (items) => {
      this.catalogoPrioridad = items;
      this.opcionesPrioridad = items.map((item) => ({
        value: item.id_exp,
        label: this.etiquetaCortaPrioridad(item.descripcion),
      }));
    });

    this.cargarCatalogoGetCat(3, (items) => {
      this.catalogoEstatus = items;
      this.opcionesEstatus = items.map((item) => ({
        value: item.id_exp,
        label: item.descripcion,
      }));
    });

    this.apiService
      .getData<CatalogoResponsableResponse[]>('catalogo/responsables', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<CatalogoResponsableResponse[]>) => {
          this.catalogoResponsables = response.body ?? [];
          this.opcionesResponsables = this.catalogoResponsables.map((item) => ({
            value: item.id_aplicativo,
            label: item.nombre,
          }));
        },
      });
  }

  private etiquetaCortaPrioridad(descripcion: string): string {
    if (descripcion.toLowerCase().startsWith('extra urgente')) {
      return 'Extra urgente';
    }

    return descripcion.split('(')[0].trim();
  }

  private cargarCatalogoGetCat(
    numero: number,
    onSuccess: (items: CatalogoReworkItem[]) => void
  ): void {
    this.apiService
      .getData<CatalogoReworkItem[]>(`catalogo/getCat/${numero}`, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<CatalogoReworkItem[]>) => {
          onSuccess(response.body ?? []);
        },
        error: () => onSuccess([]),
      });
  }
}
