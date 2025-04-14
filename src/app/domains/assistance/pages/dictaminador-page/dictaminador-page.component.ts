import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Dictaminador {
  nombre: string;
  cargo: string;
  area: string;
}

interface AsuntoDictaminador {
  id: string;
  folio: string;
  carpetaInvestigacion: string;
  personaRelacionada: string;
  fechaRecepcion: string;
  fechaLimite: string;
  estado: 'Pendiente' | 'En Proceso' | 'Atendido';
  estadoAtencion: 'Tramite' | 'Parcial' | 'Total';
  prioridad: 'Alta' | 'Media' | 'Baja';
  prioridadVisual: 'rojo' | 'amarillo' | 'verde';
  porcentajeAvance: number;
  diasTranscurridos: number;
  plazoUrgente: boolean;
  observaciones?: string;
}

interface Estadisticas {
  totalAsignados: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  prioridadAlta: number;
  vencimientoProximo: number;
}

@Component({
  selector: 'app-dictaminador-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dictaminador-page.component.html',
  styleUrl: './dictaminador-page.component.css'
})
export class DictaminadorPageComponent implements OnInit {
  dictaminador: Dictaminador = {
    nombre: 'Juan Pérez',
    cargo: 'Abogado Dictaminador',
    area: 'Área Legal'
  };

  asuntos: AsuntoDictaminador[] = [];
  asuntosFiltrados: AsuntoDictaminador[] = [];
  estadisticas: Estadisticas = {
    totalAsignados: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    prioridadAlta: 0,
    vencimientoProximo: 0
  };

  filtroEstado: string = 'Todos';
  filtroPrioridad: string = 'Todas';
  mostrarCompletados: boolean = false;
  vistaActual: 'tarjetas' | 'tabla' = 'tarjetas';

  // Nuevas variables para el formulario
  mostrarFormularioAtencion: boolean = false;
  formularioAtencion: FormGroup;
  asuntoSeleccionado: any = null;
  archivosSeleccionados: File[] = [];

  constructor(private router: Router, private fb: FormBuilder) {
    this.formularioAtencion = this.fb.group({
      estadoAtencion: ['Tramite', Validators.required],
      porcentajeAvance: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Simular carga de datos del backend
    this.cargarDatosEjemplo();
    this.actualizarEstadisticas();
    this.aplicarFiltros();
  }

  calcularDiasTranscurridos(fechaRecepcion: string): number {
    const fechaInicio = new Date(fechaRecepcion);
    const fechaActual = new Date();
    const diferencia = fechaActual.getTime() - fechaInicio.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  calcularPrioridadVisual(asunto: AsuntoDictaminador): 'rojo' | 'amarillo' | 'verde' {
    const diasTranscurridos = this.calcularDiasTranscurridos(asunto.fechaRecepcion);
    
    if (asunto.plazoUrgente) {
      if (diasTranscurridos > 15) return 'rojo';
      if (diasTranscurridos > 5) return 'amarillo';
      return 'verde';
    } else {
      if (diasTranscurridos > 30) return 'rojo';
      if (diasTranscurridos > 15) return 'amarillo';
      return 'verde';
    }
  }

  actualizarEstadisticas() {
    this.estadisticas = {
      totalAsignados: this.asuntos.length,
      pendientes: this.asuntos.filter(a => a.estado === 'Pendiente').length,
      enProceso: this.asuntos.filter(a => a.estado === 'En Proceso').length,
      completados: this.asuntos.filter(a => a.estado === 'Atendido').length,
      prioridadAlta: this.asuntos.filter(a => a.prioridadVisual === 'rojo').length,
      vencimientoProximo: this.asuntos.filter(a => a.prioridadVisual === 'amarillo').length
    };
  }

  aplicarFiltros() {
    this.asuntosFiltrados = this.asuntos.filter(asunto => {
      if (!this.mostrarCompletados && asunto.estado === 'Atendido') return false;
      if (this.filtroEstado !== 'Todos' && asunto.estado !== this.filtroEstado) return false;
      if (this.filtroPrioridad !== 'Todas' && asunto.prioridad !== this.filtroPrioridad) return false;
      return true;
    });
  }

  cargarDatosEjemplo() {
    const fechaActual = new Date();
    const ejemplos: AsuntoDictaminador[] = [
      {
        id: '1',
        folio: 'EUACAPE-0021',
        carpetaInvestigacion: 'CI-78945',
        personaRelacionada: 'María González López',
        fechaRecepcion: new Date(fechaActual.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        fechaLimite: '2024-03-15',
        estado: 'Pendiente',
        estadoAtencion: 'Tramite',
        prioridad: 'Alta',
        prioridadVisual: 'rojo',
        porcentajeAvance: 0,
        diasTranscurridos: 20,
        plazoUrgente: true,
        observaciones: 'Caso prioritario'
      },
      {
        id: '2',
        folio: 'EUACAPE-0022',
        carpetaInvestigacion: 'CI-78946',
        personaRelacionada: 'Juan Pérez Ramírez',
        fechaRecepcion: new Date(fechaActual.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        fechaLimite: '2024-03-25',
        estado: 'En Proceso',
        estadoAtencion: 'Parcial',
        prioridad: 'Media',
        prioridadVisual: 'amarillo',
        porcentajeAvance: 50,
        diasTranscurridos: 10,
        plazoUrgente: false,
        observaciones: 'En revisión'
      },
      {
        id: '3',
        folio: 'EUACAPE-0023',
        carpetaInvestigacion: 'CI-78947',
        personaRelacionada: 'Carlos Sánchez Ruiz',
        fechaRecepcion: new Date(fechaActual.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        fechaLimite: '2024-03-30',
        estado: 'Pendiente',
        estadoAtencion: 'Tramite',
        prioridad: 'Baja',
        prioridadVisual: 'verde',
        porcentajeAvance: 0,
        diasTranscurridos: 3,
        plazoUrgente: false
      }
    ];

    // Calcular prioridad visual para cada asunto
    this.asuntos = ejemplos.map(asunto => ({
      ...asunto,
      prioridadVisual: this.calcularPrioridadVisual(asunto)
    }));
  }

  atenderAsunto(id: string): void {
    this.asuntoSeleccionado = this.asuntosFiltrados.find(asunto => asunto.id === id);
    if (this.asuntoSeleccionado) {
      // Actualizar estado
      this.asuntoSeleccionado.estado = 'En Proceso';
      
      // Inicializar formulario
      this.formularioAtencion.patchValue({
        estadoAtencion: this.asuntoSeleccionado.estadoAtencion,
        porcentajeAvance: this.asuntoSeleccionado.porcentajeAvance || 0,
        observaciones: ''
      });
      
      this.mostrarFormularioAtencion = true;
      this.actualizarEstadisticas();
      this.aplicarFiltros();
    }
  }

  verDetalle(id: string) {
    // Navegar a la página de detalle del asunto
    this.router.navigate(['/layout/dictaminador/detalle', id]);
  }

  cambiarVista(vista: 'tarjetas' | 'tabla') {
    this.vistaActual = vista;
  }

  cerrarFormularioAtencion(): void {
    this.mostrarFormularioAtencion = false;
    this.asuntoSeleccionado = null;
    this.archivosSeleccionados = [];
    this.formularioAtencion.reset({
      estadoAtencion: 'Tramite',
      porcentajeAvance: 0,
      observaciones: ''
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validar tipo de archivo y tamaño
        if (this.validarArchivo(file)) {
          this.archivosSeleccionados.push(file);
        }
      }
    }
  }

  eliminarArchivo(archivo: File): void {
    const index = this.archivosSeleccionados.indexOf(archivo);
    if (index !== -1) {
      this.archivosSeleccionados.splice(index, 1);
    }
  }

  validarArchivo(file: File): boolean {
    const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const tamanoMaximo = 10 * 1024 * 1024; // 10MB

    if (!tiposPermitidos.includes(file.type)) {
      console.error('Tipo de archivo no permitido');
      return false;
    }

    if (file.size > tamanoMaximo) {
      console.error('Archivo demasiado grande');
      return false;
    }

    return true;
  }

  async guardarAtencion(): Promise<void> {
    if (this.formularioAtencion.valid && this.asuntoSeleccionado) {
      try {
        const datosAtencion = {
          ...this.formularioAtencion.value,
          idAsunto: this.asuntoSeleccionado.id,
          archivos: this.archivosSeleccionados
        };

        // Aquí iría la lógica para enviar los datos al backend
        console.log('Guardando atención:', datosAtencion);
        
        // Actualizar el asunto en la lista
        const index = this.asuntosFiltrados.findIndex(a => a.id === this.asuntoSeleccionado.id);
        if (index !== -1) {
          this.asuntosFiltrados[index] = {
            ...this.asuntosFiltrados[index],
            estadoAtencion: datosAtencion.estadoAtencion,
            porcentajeAvance: datosAtencion.porcentajeAvance
          };
        }

        this.cerrarFormularioAtencion();
      } catch (error) {
        console.error('Error al guardar la atención:', error);
      }
    }
  }
} 