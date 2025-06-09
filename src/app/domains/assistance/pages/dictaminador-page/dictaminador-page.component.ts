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
  diasTranscurridos: number;
  plazoUrgente: boolean;
  observaciones?: string;
}

interface AsuntoRechazado {
  id: string;
  folio: string;
  carpetaInvestigacion: string;
  personaRelacionada: string;
  fechaRecepcion: string;
  fechaRechazo: string;
  motivo: string;
  observaciones: string;
  rechazadoPor: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  prioridadVisual: 'rojo' | 'amarillo' | 'verde';
  diasTranscurridos: number;
  plazoUrgente: boolean;
}

interface Estadisticas {
  totalAsignados: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  prioridadAlta: number;
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
  asuntosRechazados: AsuntoRechazado[] = [];
  asuntosRechazadosFiltrados: AsuntoRechazado[] = [];
  
  estadisticas: Estadisticas = {
    totalAsignados: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    prioridadAlta: 0
  };

  filtroEstado: string = 'Todos';
  filtroPrioridad: string = 'Todas';
  mostrarCompletados: boolean = false;
  vistaActual: 'tarjetas' | 'tabla' = 'tarjetas';
  pestanaActual: 'asignados' | 'rechazados' = 'asignados';

  // Nuevas variables para el formulario
  mostrarFormularioAtencion: boolean = false;
  formularioAtencion: FormGroup;
  asuntoSeleccionado: any = null;
  archivosSeleccionados: File[] = [];
  
  // Variable para mostrar detalles del rechazo
  mostrarDetallesRechazo: boolean = false;
  asuntoRechazadoSeleccionado: AsuntoRechazado | null = null;

  constructor(private router: Router, private fb: FormBuilder) {
    this.formularioAtencion = this.fb.group({
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Simular carga de datos del backend
    this.cargarDatosEjemplo();
    this.cargarDatosRechazadosEjemplo();
    this.actualizarEstadisticas();
    this.aplicarFiltros();
    this.aplicarFiltrosRechazados();
  }

  calcularDiasTranscurridos(fechaRecepcion: string): number {
    const fechaInicio = new Date(fechaRecepcion);
    const fechaActual = new Date();
    const diferencia = fechaActual.getTime() - fechaInicio.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  calcularPrioridadVisual(asunto: AsuntoDictaminador | AsuntoRechazado): 'rojo' | 'amarillo' | 'verde' {
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
      prioridadAlta: this.asuntos.filter(a => a.prioridadVisual === 'rojo').length
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
  
  aplicarFiltrosRechazados() {
    this.asuntosRechazadosFiltrados = this.asuntosRechazados.filter(asunto => {
      if (this.filtroPrioridad !== 'Todas' && asunto.prioridad !== this.filtroPrioridad) return false;
      return true;
    });
  }

  cambiarPestana(pestana: 'asignados' | 'rechazados') {
    this.pestanaActual = pestana;
    if (pestana === 'rechazados') {
      this.aplicarFiltrosRechazados();
    } else {
      this.aplicarFiltros();
    }
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
  
  cargarDatosRechazadosEjemplo() {
    const fechaActual = new Date();
    const ejemplosRechazados: AsuntoRechazado[] = [
      {
        id: '101',
        folio: 'EUACAPE-0101',
        carpetaInvestigacion: 'CI-79001',
        personaRelacionada: 'Luis Mendoza García',
        fechaRecepcion: new Date(fechaActual.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaRechazo: new Date(fechaActual.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        motivo: 'Información incompleta',
        observaciones: 'El dictamen carece de fundamento jurídico en los artículos 145 y 146 del Código Fiscal. Se requiere completar la información y volver a presentar.',
        rechazadoPor: 'Ana Martínez - Coordinadora',
        prioridad: 'Alta',
        prioridadVisual: 'rojo',
        diasTranscurridos: 15,
        plazoUrgente: true
      },
      {
        id: '102',
        folio: 'EUACAPE-0102',
        carpetaInvestigacion: 'CI-79002',
        personaRelacionada: 'Roberto Vázquez Luna',
        fechaRecepcion: new Date(fechaActual.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        fechaRechazo: new Date(fechaActual.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        motivo: 'Error en el cálculo',
        observaciones: 'Se detectaron errores en el cálculo de los accesorios. Por favor, revisar los importes y actualizar las cantidades según la normativa vigente.',
        rechazadoPor: 'Carlos Jiménez - Administrador',
        prioridad: 'Media',
        prioridadVisual: 'amarillo',
        diasTranscurridos: 25,
        plazoUrgente: false
      },
      {
        id: '103',
        folio: 'EUACAPE-0103',
        carpetaInvestigacion: 'CI-79003',
        personaRelacionada: 'Elena Torres Montes',
        fechaRecepcion: new Date(fechaActual.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        fechaRechazo: new Date(fechaActual.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        motivo: 'Documentación faltante',
        observaciones: 'Falta anexar la documentación probatoria mencionada en el punto 3 del dictamen. Es necesario incluir los comprobantes fiscales y la declaración complementaria.',
        rechazadoPor: 'Sergio Rodríguez - Supervisor',
        prioridad: 'Baja',
        prioridadVisual: 'verde',
        diasTranscurridos: 8,
        plazoUrgente: false
      }
    ];

    // Calcular prioridad visual para cada asunto rechazado
    this.asuntosRechazados = ejemplosRechazados.map(asunto => ({
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
        observaciones: ''
      });
      
      this.mostrarFormularioAtencion = true;
      this.actualizarEstadisticas();
      this.aplicarFiltros();
    }
  }
  
  atenderAsuntoRechazado(id: string): void {
    // Navegar a la página de detalle con información adicional para saber que es un asunto rechazado
    this.router.navigate(['/layout/dictaminador/detalle', id], { 
      queryParams: { 
        origen: 'rechazado',
        revision: 'true'  // Para que se abra el modal de revisión automáticamente
      }
    });
  }
  
  verDetallesRechazo(id: string): void {
    this.asuntoRechazadoSeleccionado = this.asuntosRechazados.find(asunto => asunto.id === id) || null;
    if (this.asuntoRechazadoSeleccionado) {
      this.mostrarDetallesRechazo = true;
    }
  }
  
  cerrarDetallesRechazo(): void {
    this.mostrarDetallesRechazo = false;
    this.asuntoRechazadoSeleccionado = null;
  }

  verDetalle(id: string) {
    // Navegar a la página de detalle del asunto
    this.router.navigate(['/layout/dictaminador/detalle', id]);
  }

  revisarAsunto(id: string) {
    // Navegar a la página de detalle con el modal de revisión activado
    this.router.navigate(['/layout/dictaminador/detalle', id], { 
      queryParams: { revision: 'true' } 
    });
  }

  cambiarVista(vista: 'tarjetas' | 'tabla') {
    this.vistaActual = vista;
  }

  cerrarFormularioAtencion(): void {
    this.mostrarFormularioAtencion = false;
    this.asuntoSeleccionado = null;
    this.archivosSeleccionados = [];
    this.formularioAtencion.reset({
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
            estado: 'En Proceso'
          };
        }

        this.cerrarFormularioAtencion();
      } catch (error) {
        console.error('Error al guardar la atención:', error);
      }
    }
  }
} 