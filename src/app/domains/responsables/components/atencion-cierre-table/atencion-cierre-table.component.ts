import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';
import { CierreReworkService, EstadoCierre, ResumenCierre } from '../../services/cierre-rework.service';
import { CierreModalComponent } from '../cierre-modal/cierre-modal.component';

type VistaCierre = 'PENDIENTES' | 'CERRADOS' | 'TODOS';

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

const CLASES_ESTADO: Record<EstadoCierre, string> = {
  SIN_REGISTRO: 'tl-chip-neutral',
  PARCIAL: 'tl-chip-warning',
  TOTAL: 'tl-chip-primary',
  COMPLETO: 'tl-chip-success',
};

const ESTILOS_TARJETA: Record<EstadoCierre, { icono: string; acento: string; tinte: string; valor: string }> = {
  SIN_REGISTRO: { icono: 'hourglass_empty', acento: 'bg-tlalcalli-light-muted', tinte: 'bg-tlalcalli-light-base/70 text-tlalcalli-dark-muted', valor: 'text-tlalcalli-dark-muted' },
  PARCIAL: { icono: 'mark_email_read', acento: 'bg-tlalcalli-warning', tinte: 'bg-tlalcalli-warning/15 text-tlalcalli-warning-muted', valor: 'text-tlalcalli-warning-muted' },
  TOTAL: { icono: 'task', acento: 'bg-tlalcalli-primary', tinte: 'bg-tlalcalli-light-lavender text-tlalcalli-primary', valor: 'text-tlalcalli-primary' },
  COMPLETO: { icono: 'verified', acento: 'bg-tlalcalli-success', tinte: 'bg-tlalcalli-success/10 text-tlalcalli-success-muted', valor: 'text-tlalcalli-success-muted' },
};

@Component({
  selector: 'app-atencion-cierre-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-cierre-table.component.html',
  styleUrl: './atencion-cierre-table.component.css',
})
export class AtencionCierreTableComponent implements OnInit {
  cargando = true;
  filas: FilaCierre[] = [];
  vista: VistaCierre = 'PENDIENTES';
  busqueda = '';

  readonly estados: EstadoCierre[] = ['SIN_REGISTRO', 'PARCIAL', 'TOTAL', 'COMPLETO'];

  constructor(
    private expedienteService: ExpedienteTlalcalliService,
    private cierreService: CierreReworkService,
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
    }).subscribe({
      next: ({ expedientes, resumen }) => {
        const porExpediente = new Map(resumen.map((r) => [r.id_expediente, r]));
        this.filas = expedientes
          .filter((e) => !!e.id_expediente)
          .map((expediente) => {
            const r = porExpediente.get(expediente.id_expediente!) ?? null;
            return { expediente, resumen: r, estado: r?.estado_cierre ?? 'SIN_REGISTRO' };
          });
        this.cargando = false;
      },
      error: () => {
        this.filas = [];
        this.cargando = false;
      },
    });
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
      if (this.vista === 'PENDIENTES' && f.estado === 'COMPLETO') return false;
      if (this.vista === 'CERRADOS' && f.estado !== 'COMPLETO') return false;
      if (!q) return true;
      const e = f.expediente;
      return [e.expediente, e.oficio, e.referencia_asunto, e.remitente_area]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }

  etiquetaEstado(estado: EstadoCierre): string {
    return ETIQUETAS_ESTADO[estado];
  }

  claseEstado(estado: EstadoCierre): string {
    return CLASES_ESTADO[estado];
  }

  estiloTarjeta(estado: EstadoCierre) {
    return ESTILOS_TARJETA[estado];
  }

  /** Fechas YYYY-MM-DD del back → DD/MM/YYYY sin pasar por Date (evita desfase de zona horaria). */
  formatearFecha(valor?: string | null): string {
    if (!valor) return '—';
    const [anio, mes, dia] = valor.split('-');
    return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
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
