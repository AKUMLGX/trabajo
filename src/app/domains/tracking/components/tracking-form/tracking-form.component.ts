import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  switchMap,
  takeUntil,
} from 'rxjs';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tracking-form.component.html',
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
  });

  opcionesPrioridad: OpcionSelect[] = [];
  opcionesEstatus: OpcionSelect[] = [];
  opcionesResponsables: OpcionSelect[] = [];

  private catalogoPrioridad: CatalogoReworkItem[] = [];
  private catalogoEstatus: CatalogoReworkItem[] = [];
  private catalogoResponsables: CatalogoResponsableResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private expedienteService: ExpedienteTlalcalliService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.suscribirFiltroTextoEnVivo();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['expediente']) {
        this.consultForm.patchValue({ expediente: params['expediente'] }, { emitEvent: false });
        setTimeout(() => this.onSave(), 600);
      } else if (params['oficio']) {
        this.consultForm.patchValue({ oficio: params['oficio'] }, { emitEvent: false });
        setTimeout(() => this.onSave(), 600);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSave(): void {
    this.consultarYEmitir();
  }

  limpiarFiltros(): void {
    this.consultForm.reset(
      {
        expediente: '',
        oficio: '',
        prioridad: '',
        status: '',
        responsable: '',
      },
      { emitEvent: false }
    );
    this.consultarYEmitir();
  }

  /**
   * Expediente y oficio filtran al escribir (debounce 400 ms).
   * Prioridad, estatus y responsable filtran al cambiar el select.
   */
  private suscribirFiltroTextoEnVivo(): void {
    const controles = [
      this.consultForm.get('expediente'),
      this.consultForm.get('oficio'),
      this.consultForm.get('prioridad'),
      this.consultForm.get('status'),
      this.consultForm.get('responsable'),
    ].filter((ctrl) => !!ctrl);

    if (!controles.length) {
      return;
    }

    merge(...controles.map((ctrl) => ctrl!.valueChanges))
      .pipe(
        debounceTime(400),
        map(() => JSON.stringify(this.construirFiltrosConsulta())),
        distinctUntilChanged(),
        switchMap(() => this.expedienteService.consultarExpedientes(this.construirFiltrosConsulta())),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (expedientes) => {
          this.expedienteService.expedientesConsultados.emit(expedientes);
        },
        error: (error) => {
          console.error('Error al consultar expedientes:', error);
        },
      });
  }

  private consultarYEmitir(): void {
    this.expedienteService.consultarExpedientes(this.construirFiltrosConsulta()).subscribe({
      next: (expedientes) => {
        this.expedienteService.expedientesConsultados.emit(expedientes);
      },
      error: (error) => {
        console.error('Error al consultar expedientes:', error);
      },
    });
  }

  private construirFiltrosConsulta(): Record<string, unknown> {
    const form = this.consultForm.getRawValue();
    const prioridadId = this.comoIdCatalogo(form.prioridad);
    const estatusId = this.comoIdCatalogo(form.status);

    return {
      expediente: String(form.expediente ?? '').trim(),
      oficio: String(form.oficio ?? '').trim(),
      prioridad: this.obtenerPrioridadLegacy(prioridadId ?? ''),
      prioridad_id: prioridadId ?? 0,
      estatus: this.obtenerDescripcionCatalogo(this.catalogoEstatus, estatusId ?? ''),
      estatus_id: estatusId ?? 0,
      responsable: this.obtenerNombreResponsable(form.responsable) ?? '',
    };
  }

  /** El <select> con [value] entrega string; el catálogo trae number. */
  private comoIdCatalogo(valor: number | string | '' | null | undefined): number | null {
    if (valor === '' || valor === null || valor === undefined) {
      return null;
    }
    const n = Number(valor);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private obtenerPrioridadLegacy(idPrioridad: number | ''): string | undefined {
    const id = this.comoIdCatalogo(idPrioridad);
    if (id == null) {
      return undefined;
    }

    const item = this.catalogoPrioridad.find((p) => Number(p.id_exp) === id);
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
    const idNum = this.comoIdCatalogo(id);
    if (idNum == null) {
      return undefined;
    }

    return catalogo.find((item) => Number(item.id_exp) === idNum)?.descripcion;
  }

  private obtenerNombreResponsable(id: number | string | '' | null | undefined): string | undefined {
    const idNum = this.comoIdCatalogo(id);
    if (idNum == null) {
      return undefined;
    }

    return this.catalogoResponsables.find((r) => Number(r.id_aplicativo) === idNum)?.nombre;
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
