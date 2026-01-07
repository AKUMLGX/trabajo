import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AtencionService, AtencionConEspecialistas } from '../../services/atencion.service';
import { ExpedienteTlapohualliService } from '../../../capture/services/expediente-tlapohualli.service';

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
  template: `
    <div class="detalle-modal">
      <!-- HEADER -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>visibility</mat-icon>
          </div>
          <div class="header-text">
            <p class="header-eyebrow">Detalle de Atención</p>
            <h2 class="header-title">{{ data.expediente }}</h2>
            <p class="header-subtitle">ID Atención: {{ data.idAtencion }}</p>
          </div>
        </div>
        <button class="close-btn" (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- BODY -->
      <div class="modal-body" [class.loading]="cargando">
        @if (cargando) {
          <div class="loader">
            <div class="spinner"></div>
            <p>Cargando información...</p>
          </div>
        } @else if (detalle) {
          
          <!-- SECCIÓN: DATOS DEL EXPEDIENTE -->
          <div class="detail-section expediente-section">
            <div class="section-header">
              <mat-icon>folder_open</mat-icon>
              <h3>Datos del Expediente</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Expediente</span>
                <span class="value highlight">{{ detalle.expediente || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Oficio</span>
                <span class="value">{{ detalle.oficio || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="label">Remitente</span>
                <span class="value">{{ detalle.remitente || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="label">Asunto</span>
                <span class="value">{{ detalle.asunto || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha Recibido</span>
                <span class="value">{{ formatearFecha(detalle.fechaRecibido) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha Vencimiento</span>
                <span class="value">{{ formatearFecha(detalle.fechaVencimiento) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Estatus</span>
                <span class="value badge" [class]="getEstatusClass(detalle.estatus)">{{ detalle.estatus || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: DATOS DE LA ATENCIÓN -->
          <div class="detail-section atencion-section">
            <div class="section-header">
              <mat-icon>assignment</mat-icon>
              <h3>Datos de la Atención</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Tipo de Acción</span>
                <span class="value badge tipo-accion">{{ formatearTipoAccion(detalle.tipoAccion) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Prioridad</span>
                <span class="value badge" [class]="getPrioridadClass(detalle.prioridad)">{{ detalle.prioridad || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha de Entrega</span>
                <span class="value">{{ formatearFecha(detalle.fechaEntrega) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Estado Atención</span>
                <span class="value badge estado">{{ detalle.estadoAtencion || 'N/A' }}</span>
              </div>
              @if (detalle.tiposInsumo && detalle.tiposInsumo.length > 0) {
                <div class="detail-item full-width">
                  <span class="label">Tipos de Insumo</span>
                  <div class="chips-container">
                    @for (insumo of detalle.tiposInsumo; track insumo) {
                      <span class="chip insumo">{{ insumo }}</span>
                    }
                  </div>
                </div>
              }
              @if (detalle.tipoResultado) {
                <div class="detail-item">
                  <span class="label">Tipo de Resultado</span>
                  <span class="value">{{ detalle.tipoResultado }}</span>
                </div>
              }
              @if (detalle.opcionSeleccionada && detalle.opcionSeleccionada.length > 0) {
                <div class="detail-item full-width">
                  <span class="label">Opciones Seleccionadas</span>
                  <div class="chips-container">
                    @for (opcion of detalle.opcionSeleccionada; track opcion) {
                      <span class="chip opcion">{{ opcion }}</span>
                    }
                  </div>
                </div>
              }
              @if (detalle.sistemaAplicativo) {
                <div class="detail-item full-width">
                  <span class="label">Sistema/Aplicativo</span>
                  <span class="value">{{ detalle.sistemaAplicativo }}</span>
                </div>
              }
            </div>
          </div>

          <!-- SECCIÓN: ESPECIALISTAS -->
          @if (detalle.especialistas && detalle.especialistas.length > 0) {
            <div class="detail-section especialistas-section">
              <div class="section-header">
                <mat-icon>people</mat-icon>
                <h3>Especialistas Asignados</h3>
              </div>
              <div class="especialistas-grid">
                @for (esp of detalle.especialistas; track esp.codigo) {
                  <div class="especialista-card">
                    <div class="esp-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="esp-info">
                      <span class="esp-nombre">{{ esp.nombre }}</span>
                      <span class="esp-codigo">{{ esp.codigo }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- SECCIÓN: REGISTRO -->
          <div class="detail-section registro-section">
            <div class="section-header">
              <mat-icon>history</mat-icon>
              <h3>Información de Registro</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Usuario Registro</span>
                <span class="value">{{ detalle.usuarioRegistro || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Fecha Registro</span>
                <span class="value">{{ formatearFechaHora(detalle.fechaRegistro) }}</span>
              </div>
            </div>
          </div>

        } @else {
          <div class="no-data">
            <mat-icon>info</mat-icon>
            <p>No se encontró información de la atención</p>
          </div>
        }
      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn-primary" (click)="cerrar()">
          <mat-icon>check</mat-icon>
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detalle-modal {
      width: 700px;
      max-width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    /* HEADER */
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 24px;
      background: linear-gradient(135deg, #34005b 0%, #4a0080 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .header-content {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
    }

    .header-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #d6ae67;
    }

    .header-eyebrow {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
      margin: 0;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 4px 0;
    }

    .header-subtitle {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
    }

    .close-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 8px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    /* BODY */
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #f8f9fa;
    }

    .modal-body.loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .loader {
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #34005b;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* SECCIONES */
    .detail-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-header mat-icon {
      color: #34005b;
      font-size: 24px;
    }

    .section-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 0.95rem;
      color: #1f2937;
      word-break: break-word;
    }

    .value.highlight {
      font-weight: 700;
      color: #34005b;
      font-size: 1.1rem;
    }

    .value.badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      width: fit-content;
    }

    .badge.tipo-accion {
      background: linear-gradient(135deg, #34005b 0%, #4a0080 100%);
      color: white;
    }

    .badge.estado {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge.prioridad-urgente {
      background: #fee2e2;
      color: #dc2626;
    }

    .badge.prioridad-alta {
      background: #ffedd5;
      color: #ea580c;
    }

    .badge.prioridad-media {
      background: #fef9c3;
      color: #ca8a04;
    }

    .badge.prioridad-baja {
      background: #dcfce7;
      color: #16a34a;
    }

    .badge.estatus-atencion {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge.estatus-pendiente {
      background: #fef9c3;
      color: #ca8a04;
    }

    .badge.estatus-rechazado {
      background: #fee2e2;
      color: #dc2626;
    }

    /* CHIPS */
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .chip.insumo {
      background: #e0e7ff;
      color: #4338ca;
    }

    .chip.opcion {
      background: #fce7f3;
      color: #be185d;
    }

    /* ESPECIALISTAS */
    .especialistas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .especialista-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .esp-avatar {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #34005b 0%, #4a0080 100%);
      border-radius: 50%;
    }

    .esp-avatar mat-icon {
      color: white;
      font-size: 20px;
    }

    .esp-info {
      display: flex;
      flex-direction: column;
    }

    .esp-nombre {
      font-weight: 600;
      color: #1f2937;
    }

    .esp-codigo {
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* NO DATA */
    .no-data {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    /* FOOTER */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      background: white;
      border-top: 1px solid #e5e7eb;
      border-radius: 0 0 8px 8px;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: linear-gradient(135deg, #34005b 0%, #4a0080 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    @media (max-width: 600px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DetalleAtencionModalComponent implements OnInit {
  cargando = true;
  detalle: DetalleCompleto | null = null;

  constructor(
    public dialogRef: MatDialogRef<DetalleAtencionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleAtencionData,
    private atencionService: AtencionService,
    private expedienteService: ExpedienteTlapohualliService
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

  getEstatusClass(estatus: string | null | undefined): string {
    if (!estatus) return '';
    const e = estatus.toUpperCase();
    if (e.includes('ATENCION') || e === 'EN_ATENCION') return 'estatus-atencion';
    if (e.includes('PENDIENTE')) return 'estatus-pendiente';
    if (e.includes('RECHAZ')) return 'estatus-rechazado';
    return '';
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}

