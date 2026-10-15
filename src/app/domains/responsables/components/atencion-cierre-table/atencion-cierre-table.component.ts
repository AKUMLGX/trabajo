import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';
import { parsearRemitenteCompuesto } from '../../../dashboard/services/dashboard-remitente-admin.utils';
import { CierreReworkService, EstadoCierre, ResumenCierre } from '../../services/cierre-rework.service';
import { ResumenSeguimiento, SeguimientoAsignacionService } from '../../services/seguimiento-asignacion.service';
import { EtapaAtencion, etapaAtencion } from '../../utils/etapa-atencion.utils';
import { CierreModalComponent } from '../cierre-modal/cierre-modal.component';
import { SeguimientoExpedienteModalComponent } from '../seguimiento-expediente-modal/seguimiento-expediente-modal.component';
import { TablaPaginadorComponent } from '../../../shared/components/tabla-paginador/tabla-paginador.component';
import { paginar } from '../../../shared/utils/paginacion.utils';

interface FilaCierre {
  expediente: ExpedienteTlalcalli;
  resumen: ResumenCierre | null;
  estado: EstadoCierre;
}

const ETIQUETAS_ESTADO: Record<EstadoCierre, string> = {
  SIN_REGISTRO: 'Sin evidencia',
  PARCIAL: 'Respuesta parcial',
  TOTAL: 'Respuesta total',
  COMPLETO: 'Cierre completo',
};

type EstadoTarjeta = Extract<EstadoCierre, 'PARCIAL' | 'TOTAL'>;

const ESTILOS_TARJETA: Record<EstadoTarjeta, { icono: string; acento: string; tinte: string; valor: string; descripcion: string }> = {
  PARCIAL: {
    icono: 'mark_email_read',
    acento: 'bg-tlalcalli-warning',
    tinte: 'bg-tlalcalli-warning/15 text-tlalcalli-warning-muted',
    valor: 'text-tlalcalli-warning-muted',
    descripcion: 'Con evidencia de respuesta pendiente de completar',
  },
  TOTAL: {
    icono: 'task',
    acento: 'bg-tlalcalli-primary',
    tinte: 'bg-tlalcalli-light-lavender text-tlalcalli-primary',
    valor: 'text-tlalcalli-primary',
    descripcion: 'Respondidos en su totalidad, listos para cierre',
  },
};

@Component({
  selector: 'app-atencion-cierre-table',
  imports: [CommonModule, FormsModule, TablaPaginadorComponent],
  templateUrl: './atencion-cierre-table.component.html',
  styleUrl: './atencion-cierre-table.component.css',
})
export class AtencionCierreTableComponent implements OnInit {
  cargando = true;
  filas: FilaCierre[] = [];
  busqueda = '';
  pagina = 1;
  tamanoPagina = 10;
  readonly opcionesTamanoPagina = [10, 20, 50];

  readonly estadosTarjeta: EstadoTarjeta[] = ['PARCIAL', 'TOTAL'];

  constructor(
    private expedienteService: ExpedienteTlalcalliService,
    private cierreService: CierreReworkService,
    private seguimientoService: SeguimientoAsignacionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      expedientes: this.expedienteService.consultarExpedientes({}),
      resumen: this.cierreService.obtenerResumen(),
      seguimiento: this.seguimientoService.obtenerResumen(),
    }).subscribe({
      next: ({ expedientes, resumen, seguimiento }) => {
        const porExpediente = new Map(resumen.map((r) => [r.id_expediente, r]));
        const enAtencion = this.expedientesEnAtencion(seguimiento);
        this.filas = expedientes
          .filter((e) => !!e.id_expediente)
          .filter((e) => enAtencion.has(e.id_expediente!) || porExpediente.has(e.id_expediente!))
          .map((expediente) => {
            const r = porExpediente.get(expediente.id_expediente!) ?? null;
            return { expediente, resumen: r, estado: this.estadoFila(r) };
          });
        this.cargando = false;
      },
      error: () => {
        this.filas = [];
        this.cargando = false;
      },
    });
  }

  /** Entran los notificados; los que ya tienen registro de cierre se agregan aparte. */
  private expedientesEnAtencion(seguimiento: ResumenSeguimiento[]): Set<number> {
    return new Set(seguimiento.filter((s) => !!s.fecha_notificacion_asignacion).map((s) => s.id_expediente));
  }

  /** El back da COMPLETO con una sola fecha de notificación total; el acuse puede exigir ambas. */
  private estadoFila(r: ResumenCierre | null): EstadoCierre {
    if (!r) return 'SIN_REGISTRO';
    if (r.estado_cierre !== 'COMPLETO') return r.estado_cierre;
    const acuse = (r.acuse || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const faltaCorreo = acuse.includes('CORREO') && !r.fecha_notif_total_correo;
    const faltaFisica = acuse.includes('FISICAMENTE') && !r.fecha_notif_total_fisica;
    return faltaCorreo || faltaFisica ? 'TOTAL' : 'COMPLETO';
  }

  contar(estado: EstadoCierre): number {
    return this.filas.filter((f) => f.estado === estado).length;
  }

  get totalPendientes(): number {
    return this.filas.length - this.contar('COMPLETO');
  }

  get filasVisibles(): FilaCierre[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.filas.filter((f) => {
      if (!q) return true;
      const e = f.expediente;
      return [e.expediente, e.oficio, e.referencia_asunto, e.remitente_area]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }

  get filasPagina(): FilaCierre[] {
    return paginar(this.filasVisibles, this.pagina, this.tamanoPagina);
  }

  buscar(texto: string): void {
    this.busqueda = texto;
    this.pagina = 1;
  }

  etiquetaEstado(estado: EstadoCierre): string {
    return ETIQUETAS_ESTADO[estado];
  }

  etapa(e: ExpedienteTlalcalli): EtapaAtencion | null {
    return etapaAtencion(e.estatus);
  }

  oficios(e: ExpedienteTlalcalli): string[] {
    return (e.oficio || '').split('|').map((o) => o.trim()).filter(Boolean);
  }

  remitente(e: ExpedienteTlalcalli): { principal: string; detalle: string } {
    const compuesto = parsearRemitenteCompuesto(e.remitente_area);
    if (!compuesto) return { principal: e.remitente_area?.trim() || '—', detalle: '' };
    return {
      principal: [compuesto.generalClave, compuesto.centralClave].filter(Boolean).join(' · '),
      detalle: compuesto.identificador,
    };
  }

  estiloTarjeta(estado: EstadoTarjeta) {
    return ESTILOS_TARJETA[estado];
  }

  porcentaje(estado: EstadoCierre): number {
    return this.filas.length ? Math.round((this.contar(estado) / this.filas.length) * 100) : 0;
  }

  /** Fechas YYYY-MM-DD del back → DD/MM/YYYY sin pasar por Date (evita desfase de zona horaria). */
  formatearFecha(valor?: string | null): string {
    if (!valor) return '—';
    const [anio, mes, dia] = valor.split('-');
    return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
  }

  verSeguimiento(fila: FilaCierre): void {
    this.dialog.open(SeguimientoExpedienteModalComponent, {
      data: { expediente: fila.expediente },
      maxWidth: '96vw',
      maxHeight: '95vh',
      panelClass: 'atencion-modal-panel',
    });
  }

  abrirModalCierre(fila: FilaCierre): void {
    this.dialog
      .open(CierreModalComponent, {
        data: { expediente: fila.expediente },
        maxWidth: '95vw',
        maxHeight: '95vh',
        panelClass: 'atencion-modal-panel',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado?.success) {
          this.cargarDatos();
        }
      });
  }
}
