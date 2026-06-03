import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AtencionService, AtencionConEspecialistas } from '../../services/atencion.service';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';

export interface DetalleAtencionData {
  idAtencion: number;
  idExpediente: number;
  expediente: string;
}

interface DetalleCompleto {
  // Datos del expediente
  expediente: string;
  oficio: string;
  remitente: string;
  asunto: string;
  fechaRecibido: string;
  fechaVencimiento: string;
  estatus: string;
  // Datos de la atención
  tipoAccion: string;
  prioridad: string;
  fechaEntrega: string;
  tiposInsumo: string[];
  tipoResultado: string;
  opcionSeleccionada: string[];
  sistemaAplicativo: string;
  especialistas: { codigo: string; nombre: string }[];
  usuarioRegistro: string;
  fechaRegistro: string;
  estadoAtencion: string;
}

@Component({
  selector: 'app-detalle-atencion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './detalle-atencion-modal.component.html'
})

export class DetalleAtencionModalComponent implements OnInit {
  cargando = true;
  detalle: DetalleCompleto | null = null;

  constructor(
    public dialogRef: MatDialogRef<DetalleAtencionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleAtencionData,
    private atencionService: AtencionService,
    private expedienteService: ExpedienteTlalcalliService
  ) {}

  ngOnInit(): void {
    this.cargarDetalles();
  }

  cargarDetalles(): void {
    this.cargando = true;

    // Obtener la atención específica
    this.atencionService.obtenerAtencion(this.data.idAtencion).subscribe({
      next: (atencionData) => {
        if (!atencionData) {
          this.cargando = false;
          this.detalle = null;
          return;
        }
        
        // Obtener datos del expediente
        this.expedienteService.obtenerExpedientePorId(this.data.idExpediente).subscribe({
          next: (expedienteData: any) => {
            const exp = expedienteData?.data || expedienteData || {};
            const atencion: any = atencionData.atencion;
            const especialistas = atencionData.especialistas || [];

            // Parsear JSON strings
            let tiposInsumo: string[] = [];
            let opcionSeleccionada: string[] = [];

            if (atencion.tipos_insumo) {
              try {
                tiposInsumo = JSON.parse(atencion.tipos_insumo);
              } catch { tiposInsumo = []; }
            }

            if (atencion.opcion_seleccionada) {
              try {
                opcionSeleccionada = JSON.parse(atencion.opcion_seleccionada);
              } catch { opcionSeleccionada = []; }
            }

            this.detalle = {
              expediente: exp.expediente || this.data.expediente,
              oficio: exp.oficio || '',
              remitente: exp.remitente_area || exp.remitente_general || '',
              asunto: exp.referencia_asunto || '',
              fechaRecibido: exp.fecha_recibido || '',
              fechaVencimiento: exp.fecha_vencimiento || '',
              estatus: exp.estatus || '',
              tipoAccion: atencion.tipo_accion || '',
              prioridad: atencion.prioridad || '',
              fechaEntrega: atencion.fecha_entrega || '',
              tiposInsumo,
              tipoResultado: atencion.tipo_resultado || '',
              opcionSeleccionada,
              sistemaAplicativo: atencion.sistema_aplicativo || '',
              especialistas: especialistas.map((e: any) => ({
                codigo: e.codigo_especialista,
                nombre: e.nombre_especialista
              })),
              usuarioRegistro: atencion.usuario_registro || '',
              fechaRegistro: atencion.fecha_registro || '',
              estadoAtencion: atencion.estado_atencion || ''
            };

            this.cargando = false;
          },
          error: () => {
            // Si falla obtener expediente, mostrar solo datos de atención
            const atencion: any = atencionData?.atencion;
            const especialistas = atencionData?.especialistas || [];

            this.detalle = {
              expediente: this.data.expediente,
              oficio: '',
              remitente: '',
              asunto: '',
              fechaRecibido: '',
              fechaVencimiento: '',
              estatus: '',
              tipoAccion: atencion?.tipo_accion || '',
              prioridad: atencion?.prioridad || '',
              fechaEntrega: atencion?.fecha_entrega || '',
              tiposInsumo: [],
              tipoResultado: atencion?.tipo_resultado || '',
              opcionSeleccionada: [],
              sistemaAplicativo: atencion?.sistema_aplicativo || '',
              especialistas: especialistas.map((e: any) => ({
                codigo: e.codigo_especialista,
                nombre: e.nombre_especialista
              })),
              usuarioRegistro: atencion?.usuario_registro || '',
              fechaRegistro: atencion?.fecha_registro || '',
              estadoAtencion: atencion?.estado_atencion || ''
            };
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.detalle = null;
      }
    });
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearFechaHora(fecha: string | null | undefined): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  formatearTipoAccion(tipo: string): string {
    const mapeo: { [key: string]: string } = {
      'ADQUISICION_INFO': 'Adquisición de Información',
      'ATENCION_INMEDIATA': 'Atención Inmediata',
      'PENDIENTE_INFO': 'Pendiente de Información',
      'RECHAZADO': 'Rechazado',
      'INVESTIGACION_FORENSE': 'Investigación Forense',
      'ELABORACION_DICTAMENES': 'Elaboración de Dictámenes',
      'RECUPERACION_INFO': 'Recuperación de Información',
      'DESTRUCCION_DISPOSITIVOS': 'Destrucción de Dispositivos',
      'SOLICITUD_INFORMACION': 'Solicitud de Información'
    };
    return mapeo[tipo] || tipo;
  }

  getPrioridadClass(prioridad: string | null | undefined): string {
    if (!prioridad) return '';
    const p = prioridad.toUpperCase();
    if (p === 'URGENTE') return 'prioridad-urgente';
    if (p === 'ALTA') return 'prioridad-alta';
    if (p === 'MEDIA') return 'prioridad-media';
    if (p === 'BAJA') return 'prioridad-baja';
    return '';
  }

  // getEstatusClass(estatus: string | null | undefined): string {
  //   if (!estatus) return '';
  //   const e = estatus.toUpperCase();
  //   if (e.includes('ATENCION') || e === 'EN_ATENCION') return 'estatus-atencion';
  //   if (e.includes('PENDIENTE')) return 'estatus-pendiente';
  //   if (e.includes('RECHAZ')) return 'estatus-rechazado';
  //   return '';
  // }

  getEstatusClass(estatus: string | null | undefined): string {
  if (!estatus) return '';

  const e = estatus.toUpperCase().trim();

  if (
    e.includes('ATENCION') ||
    e === 'EN_ATENCION' ||
    e === 'ASIGNADO'
  ) {
    return 'estatus-atencion';
  }

  if (e.includes('PENDIENTE')) {
    return 'estatus-pendiente';
  }

  if (e.includes('RECHAZ')) {
    return 'estatus-rechazado';
  }

  return '';
}

  cerrar(): void {
    this.dialogRef.close();
  }
}

