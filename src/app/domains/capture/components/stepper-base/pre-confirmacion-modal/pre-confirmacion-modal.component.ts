import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CampoResumen {
  etiqueta: string;
  valor: string | null | undefined;
  tipo?: 'normal' | 'destacado' | 'prioridad' | 'fecha' | 'responsable';
  prioridadColor?: string;
  icono?: string;
}

export interface SeccionResumen {
  titulo: string;
  icono: string;
  campos: CampoResumen[];
}

export interface PreConfirmacionModalData {
  titulo: string;
  subtitulo?: string;
  expediente?: string;
  campos?: CampoResumen[];
  secciones?: SeccionResumen[];
  botonConfirmar?: string;
  botonCancelar?: string;
}

@Component({
    selector: 'app-pre-confirmacion-modal',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="pre-confirmacion-modal">
      <!-- Header Premium -->
      <div class="modal-header">
        <div class="header-badge">
          <span class="icon-font">verified</span>
        </div>
        <div class="header-content">
          <div class="header-title">{{ titulo }}</div>
          <div class="header-subtitle" *ngIf="subtitulo">{{ subtitulo }}</div>
        </div>
        <button class="close-btn" (click)="cancelar()">
          <span class="icon-font">close</span>
        </button>
      </div>

      <!-- Expediente Destacado -->
      <div class="expediente-banner" *ngIf="expediente">
        <span class="icon-font">folder_special</span>
        <div class="expediente-info">
          <span class="expediente-label">Expediente a registrar</span>
          <span class="expediente-numero">{{ expediente }}</span>
        </div>
        <div class="expediente-check">
          <span class="icon-font">check_circle</span>
        </div>
      </div>

      <!-- Contenido por secciones -->
      <div class="modal-content">
        <!-- Secciones agrupadas -->
        <div *ngFor="let seccion of secciones" class="seccion">
          <div class="seccion-header">
            <span class="icon-font">{{ seccion.icono }}</span>
            <span>{{ seccion.titulo }}</span>
          </div>
          <div class="seccion-campos">
            <div *ngFor="let campo of seccion.campos"
                 class="campo-row"
                 [class.campo-destacado]="campo.tipo === 'destacado'"
                 [class.campo-prioridad]="campo.tipo === 'prioridad'">
              <div class="campo-icono" *ngIf="campo.icono">
                <span class="icon-font">{{ campo.icono }}</span>
              </div>
              <div class="campo-etiqueta">{{ campo.etiqueta }}</div>
              <div class="campo-valor"
                   [class.prioridad-urgente]="campo.prioridadColor === 'red'"
                   [class.prioridad-alta]="campo.prioridadColor === 'orange'"
                   [class.prioridad-media]="campo.prioridadColor === 'yellow'"
                   [class.prioridad-baja]="campo.prioridadColor === 'green'">
                <span *ngIf="campo.tipo === 'prioridad'" class="prioridad-badge" [class]="'badge-' + campo.prioridadColor">
                  {{ campo.valor || 'N/A' }}
                </span>
                <span *ngIf="campo.tipo !== 'prioridad'">{{ campo.valor || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Campos sin sección (compatibilidad) -->
        <div *ngIf="campos && campos.length > 0" class="campos-legacy">
          <div *ngFor="let campo of campos" class="campo-item">
            <span class="campo-etiqueta">{{ campo.etiqueta }}:</span>
            <span class="campo-valor">{{ campo.valor || 'N/A' }}</span>
          </div>
        </div>

        <!-- Advertencia -->
        <div class="advertencia">
          <div class="advertencia-icono">
            <span class="icon-font">task_alt</span>
          </div>
          <div class="advertencia-texto">
            <strong>¿Los datos son correctos?</strong>
            <span>Una vez guardado, el expediente quedará registrado en el sistema.</span>
          </div>
        </div>
      </div>

      <!-- Footer con botones mejorados -->
      <div class="modal-footer">
        <button class="btn-cancelar" (click)="cancelar()">
          <span class="icon-font">arrow_back</span>
          {{ botonCancelar }}
        </button>
        <button class="btn-confirmar" (click)="confirmar()">
          <span class="icon-font">save</span>
          {{ botonConfirmar }}
        </button>
      </div>
    </div>
  `,
    styles: [`
.pre-confirmacion-modal {
  width: 900px;
  max-width: 95vw;
  height: 86vh;
  max-height: 86vh;

  display: flex;
  flex-direction: column;

  border-radius: 16px;
  overflow: hidden;
  background: white;
}

    /* Header Premium */
    .modal-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #34005b 0%, #4a0080 50%, #34005b 100%);
      position: relative;
      overflow: hidden;
    }

    .modal-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(214, 174, 103, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .header-badge {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #d6ae67 0%, #f0d78c 100%);
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(214, 174, 103, 0.4);
      position: relative;
      z-index: 1;
    }

    .header-badge mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #34005b;
    }

    .header-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 4px;
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      position: relative;
      z-index: 1;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .close-btn mat-icon {
      color: white;
      font-size: 22px;
    }

    /* Expediente Banner */
    .expediente-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      background: linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%);
      border-bottom: 2px solid #86efac;
    }

    .expediente-banner > mat-icon {
      font-size: 28px;
      color: #16a34a;
    }

    .expediente-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .expediente-label {
      font-size: 0.75rem;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .expediente-numero {
      font-size: 1.25rem;
      font-weight: 700;
      color: #14532d;
      font-family: 'Consolas', monospace;
    }

    .expediente-check mat-icon {
      color: #16a34a;
      font-size: 24px;
    }

    /* Modal Content */
.modal-content {
  flex: 1;
  min-height: 0;

  padding: 26px 30px 32px;

  overflow-y: auto;
  overflow-x: hidden;

  background: #fafafa;
}

    /* Secciones */
    .seccion {
      margin-bottom: 20px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .seccion-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: linear-gradient(90deg, #34005b 0%, #4a0080 100%);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .seccion-header mat-icon {
      font-size: 20px;
      color: #d6ae67;
    }

    .seccion-campos {
      padding: 8px 0;
    }

    .campo-row {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.15s;
    }

    .campo-row:last-child {
      border-bottom: none;
    }

    .campo-row:hover {
      background: #f9fafb;
    }

    .campo-row.campo-destacado {
      background: linear-gradient(90deg, #fef3c7 0%, #fffbeb 100%);
    }

    .campo-icono {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 8px;
      margin-right: 12px;
    }

    .campo-icono mat-icon {
      font-size: 18px;
      color: #6b7280;
    }

    .campo-etiqueta {
      min-width: 130px;
      font-size: 0.85rem;
      color: #6b7280;
      font-weight: 500;
    }

    .campo-valor {
      flex: 1;
      font-size: 0.95rem;
      color: #1f2937;
      font-weight: 600;
    }

    /* Badges de prioridad */
    .prioridad-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-red {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .badge-orange {
      background: #fff7ed;
      color: #ea580c;
      border: 1px solid #fed7aa;
    }

    .badge-yellow {
      background: #fefce8;
      color: #ca8a04;
      border: 1px solid #fef08a;
    }

    .badge-green {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    /* Campos legacy */
    .campos-legacy {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .campo-item {
      display: flex;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      border-left: 3px solid #34005b;
    }

    /* Advertencia mejorada */
    .advertencia {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      padding: 16px 20px;
      background: linear-gradient(90deg, #dbeafe 0%, #eff6ff 100%);
      border-radius: 12px;
      border: 1px solid #93c5fd;
    }

    .advertencia-icono {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3b82f6;
      border-radius: 10px;
    }

    .advertencia-icono mat-icon {
      color: white;
      font-size: 24px;
    }

    .advertencia-texto {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .advertencia-texto strong {
      color: #1e40af;
      font-size: 0.95rem;
    }

    .advertencia-texto span {
      color: #3b82f6;
      font-size: 0.85rem;
    }

    /* Footer mejorado */
.modal-footer {
  flex-shrink: 0;

  display: flex;
  justify-content: space-between;
  gap: 20px;

  padding: 24px 30px;

  background: white;
  border-top: 1px solid #e5e7eb;
}

    .btn-cancelar, .btn-confirmar {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancelar {
      background: #f3f4f6;
      color: #4b5563;
      border: 1px solid #d1d5db;
    }

    .btn-cancelar:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .btn-confirmar {
      background: linear-gradient(135deg, #34005b 0%, #4a0080 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(52, 0, 91, 0.3);
    }

    .btn-confirmar:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(52, 0, 91, 0.4);
    }

    .btn-confirmar mat-icon, .btn-cancelar mat-icon {
      font-size: 20px;
    }
  `]
})
export class PreConfirmacionModalComponent {
  titulo: string;
  subtitulo?: string;
  expediente?: string;
  campos: CampoResumen[];
  secciones: SeccionResumen[];
  botonConfirmar: string;
  botonCancelar: string;

  constructor(
    public dialogRef: MatDialogRef<PreConfirmacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PreConfirmacionModalData
  ) {
    this.titulo = data.titulo || 'Confirmar datos';
    this.subtitulo = data.subtitulo;
    this.expediente = data.expediente;
    this.campos = data.campos || [];
    this.secciones = data.secciones || [];
    this.botonConfirmar = data.botonConfirmar || 'Guardar expediente';
    this.botonCancelar = data.botonCancelar || 'Revisar';
  }

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
