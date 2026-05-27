import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CatalogosAtencion, CatEspecialista, TipoAccion } from '../../../services/atencion.service';
import { AtencionEspecialistasComponent } from '../atencion-especialistas/atencion-especialistas.component';
import { FormularioAtencion } from '../atencion-modal.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-atencion-flujos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, AtencionEspecialistasComponent],
  templateUrl: './atencion-flujos.component.html'
})
export class AtencionFlujosComponent {
  @Input() catalogos!: CatalogosAtencion;
  @Input() formulario!: FormularioAtencion;
  @Input() externos: CatEspecialista[] = [];
  @Input() internos: CatEspecialista[] = [];
  @Input() maxEspecialistas = 3;

  opcionesFlujosAsignado = [
    {
      value: 'ADQUISICION_INFO' as TipoAccion,
      label: 'Adquisición de Información',
      icon: 'folder_special',
      description: 'Proceso completo con insumos, resultado y especialistas',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      value: 'SOLICITUD_INFORMACION' as TipoAccion,
      label: 'Solicitud de Información',
      icon: 'info',
      description: 'Solicitar información mediante correlación u otra área',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      value: 'INVESTIGACION_FORENSE' as TipoAccion,
      label: 'Investigación Forense Digital',
      icon: 'search',
      description: 'Análisis forense con reporte de investigación',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      value: 'ELABORACION_DICTAMENES' as TipoAccion,
      label: 'Elaboración de Dictámenes',
      icon: 'gavel',
      description: 'Generación de dictámenes especializados',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      value: 'RECUPERACION_INFO' as TipoAccion,
      label: 'Recuperación de Información',
      icon: 'restore',
      description: 'Recuperación de datos de dispositivos de almacenamiento',
      color: 'text-teal-500',
      bg: 'bg-teal-50'
    },
    {
      value: 'DESTRUCCION_DISPOSITIVOS' as TipoAccion,
      label: 'Destrucción de Dispositivos',
      icon: 'delete_forever',
      description: 'Destrucción segura de dispositivos de almacenamiento',
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    }
  ];

  opcionesPorFlujo: Record<string, { codigo: string; descripcion: string; icon: string }[]> = {
    SOLICITUD_INFORMACION: [
      { codigo: 'CORRELACION', descripcion: 'Correlación', icon: 'link' },
      { codigo: 'OTRA_AREA', descripcion: 'Otra área', icon: 'domain' }
    ],
    INVESTIGACION_FORENSE: [
      { codigo: 'ADQ_INFO', descripcion: 'Adquisición de información', icon: 'content_copy' },
      { codigo: 'FUENTES_INFO', descripcion: 'Fuentes de información', icon: 'source' },
      { codigo: 'RIF', descripcion: 'Reporte de Investigación Forense (RIF)', icon: 'assessment' }
    ],
    ELABORACION_DICTAMENES: [
      { codigo: 'INV_FORENSE', descripcion: 'Investigación forense digital', icon: 'search' },
      { codigo: 'JUICIO_NULIDAD', descripcion: 'Juicio de Nulidad', icon: 'gavel' },
      { codigo: 'PISTAS_AUDITORIA', descripcion: 'Pistas de Auditoría', icon: 'track_changes' },
      { codigo: 'DAF', descripcion: 'Dictamen Análisis Forense (DAF)', icon: 'analytics' },
      { codigo: 'DPA', descripcion: 'Dictamen Pistas de Auditoría (DPA)', icon: 'track_changes' },
      { codigo: 'DJN', descripcion: 'Dictamen Juicio de Nulidad (DJN)', icon: 'gavel' }
    ],
    RECUPERACION_INFO: [
      { codigo: 'PUESTO_SERVIDOR', descripcion: 'Puesto de Servicio / Servidor', icon: 'dns' },
      { codigo: 'DISCO_EXTERNO', descripcion: 'Disco Externo', icon: 'storage' },
      { codigo: 'USB', descripcion: 'USB', icon: 'usb' },
      { codigo: 'RR', descripcion: 'Reporte de Resultados (RR)', icon: 'description' }
    ],
    DESTRUCCION_DISPOSITIVOS: [
      { codigo: 'DISCO_EXTERNO', descripcion: 'Disco Externo', icon: 'storage' },
      { codigo: 'USB', descripcion: 'USB', icon: 'usb' },
      { codigo: 'CD', descripcion: 'CD', icon: 'album' },
      { codigo: 'RDD', descripcion: 'Reporte de Destrucción de Dispositivos (RDD)', icon: 'delete_sweep' }
    ]
  };

  seleccionarFlujo(flujo: TipoAccion): void {
    this.formulario.flujoAsignadoSeleccionado = flujo;
    this.formulario.tipoInsumo = '';
    this.formulario.tiposResultado = [];
    this.formulario.opcionesSeleccionadas = [];
    this.formulario.especialistasSeleccionados = [];
    this.formulario.fechaEntrega = '';
  }

  seleccionarInsumo(codigo: string): void {
    this.formulario.tipoInsumo = codigo;
  }

  toggleResultado(codigo: string): void {
    this.formulario.tiposResultado = this.formulario.tiposResultado.includes(codigo)
      ? this.formulario.tiposResultado.filter(item => item !== codigo)
      : [...this.formulario.tiposResultado, codigo];
  }

  toggleOpcion(codigo: string): void {
    this.formulario.opcionesSeleccionadas = this.formulario.opcionesSeleccionadas.includes(codigo)
      ? this.formulario.opcionesSeleccionadas.filter(item => item !== codigo)
      : [...this.formulario.opcionesSeleccionadas, codigo];
  }

  seleccionado(lista: string[], codigo: string): boolean {
    return lista.includes(codigo);
  }

  setFechaRapida(tipo: 'manana' | 'tresDias' | 'semana'): void {
    const fecha = new Date();

    if (tipo === 'manana') fecha.setDate(fecha.getDate() + 1);
    if (tipo === 'tresDias') fecha.setDate(fecha.getDate() + 3);
    if (tipo === 'semana') fecha.setDate(fecha.getDate() + 7);

    this.formulario.fechaEntrega = fecha.toISOString().split('T')[0];
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  get opcionesActuales() {
    return this.opcionesPorFlujo[this.formulario.flujoAsignadoSeleccionado] || [];
  }

  get flujoCompleto(): boolean {
    if (!this.formulario.flujoAsignadoSeleccionado) return false;
    if (!this.formulario.fechaEntrega) return false;
    if (this.formulario.especialistasSeleccionados.length === 0) return false;

    if (this.formulario.flujoAsignadoSeleccionado === 'ADQUISICION_INFO') {
      return !!this.formulario.tipoInsumo && this.formulario.tiposResultado.length > 0;
    }

    return this.formulario.opcionesSeleccionadas.length > 0;
  }

  getInsumoIcon(codigo: string): string {
  const icons: Record<string, string> = {
    EQUIPO_FISICO: 'computer',
    EQUIPO_VIRTUAL: 'cloud',
    EQUIPO_MOVIL: 'smartphone',
    EQUIPO_REMOTO: 'settings_remote',
    IMAGEN_CIFRADA: 'enhanced_encryption',
    PERSONALIZADA: 'tune',
    OTROS: 'more_horiz'
  };

  return icons[codigo] || 'devices';
}
}