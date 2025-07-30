import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AsuntosPendientesTableComponent } from './components/asuntos-pendientes-table/asuntos-pendientes-table.component';
import { AsuntosRevisadosTableComponent } from './components/asuntos-revisados-table/asuntos-revisados-table.component';
import { RevisionDetalleModalComponent } from './components/revision-detalle-modal/revision-detalle-modal.component';
import { RevisionCapturaModalComponent } from './components/revision-captura-modal/revision-captura-modal.component';

// 🆕 Importar servicio e interfaces
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorEstadoAtencionRequest, AsuntoAsignacion } from '../../../interfaces/asuntoPorAtencion.interface';

interface Asunto {
  id: string;
  folio: string;
  personaRelacionada: string;
  fechaRecepcion: Date;
  fechaLimite: Date;
  diasTranscurridos: number;
  estadoAtencion: string;
  prioridad: string;
  dictaminador: string;
  carpetaInvestigacion: string;
  estado: string;
}

// 🆕 Nueva interface para asuntos capturados
interface AsuntoCapturado {
  id: string;
  folio_interno: string; // Folio interno (NO editable)
  
  // ✅ Campos editables
  oficio?: string;
  folioScanner?: string;
  carpeta_investigacion: string;
  fechaRecepcion?: string;
  autoridad_remitente: string;
  personaRelacionada?: string;
  turnoJefatura?: string;
  administracion?: string;
  descripcion: string; // Descripción del asunto
  
  // Plazo de atención
  plazoCantidad?: number;
  plazoUnidad?: 'DIAS' | 'SEMANAS' | 'MESES';
  plazo_atencion?: number; // Campo del JSON
  plazoAtencion?: string; // Plazo formateado (para compatibilidad)
  esUrgente?: boolean;
  
  // Tipos requeridos
  tipoDocumento?: string;
  tipoAtencion?: string;
  
  // Metadatos de captura
  fecha_captura: string;
  usuario_captura: string;
  estado_revision: 'PENDIENTE' | 'APROBADO';
  documento_pdf?: string;
  fecha_limite?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  
  // Campos adicionales para la tabla
  tieneDocumentos?: boolean;
  cantidadDocumentos?: number;
  erroresDetectados?: string[];
  
  // Campos antiguos para compatibilidad
  folio?: string; // Alias de folio_interno
  asunto?: string; // Alias de descripcion
  autoridad_solicitante?: string; // Alias de autoridad_remitente
}

@Component({
  selector: 'app-revision-final',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    AsuntosPendientesTableComponent,
    AsuntosRevisadosTableComponent,
    RevisionDetalleModalComponent,
    RevisionCapturaModalComponent
  ],
  templateUrl: './revision-final.component.html',
  styleUrls: ['./revision-final.component.css']
})
export class RevisionFinalComponent implements OnInit {
  
  // Datos de ejemplo para las tablas
  asuntosPendientes: Asunto[] = [];
  asuntosRevisados: Asunto[] = [];
  
  // 🆕 Datos para asuntos capturados
  asuntosCapturados: AsuntoCapturado[] = [];
  asuntosSeleccionados: string[] = []; // IDs de asuntos seleccionados para envío
  
  // Estadísticas
  estadisticas = {
    // 🆕 Estadísticas para asuntos capturados
    totalCapturados: 0,
    capturadosHoy: 0,
    requierenCorreccion: 0,
    listosParaEnviar: 0,
    
    // ✅ Estadísticas existentes para dictámenes
    totalPendientes: 0,
    pendientesHoy: 0,
    pendientesUrgentes: 0,
    totalRevisados: 0,
    aprobados: 0,
    rechazados: 0
  };
  
  // Filtros
  filtroEstado = 'Todos';
  filtroPrioridad = 'Todas';
  filtroText = '';

  // 🆕 Filtros específicos para asuntos capturados
  filtroEstadoCaptura: 'TODOS' | 'PENDIENTE' | 'APROBADO' = 'TODOS';
  filtroAutoridadRemitente = 'Todas';
  filtroFechaRecepcion = '';
  filtroPlazoAtencion = 'Todos';

  // Propiedades para la vista de asuntos pendientes
  vistaPendientes = 'tabla'; // 'tabla', 'grid' o 'kanban'

  // 🎭 Control de pestaña activa para dashboard dinámico
  tabActiva: 'capturados' | 'dictamenes' | 'revisados' = 'capturados';

  // 🆕 PROPIEDADES SENCILLAS PARA PAGINACIÓN
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  asuntosPaginados: AsuntoCapturado[] = [];

  constructor(
    private dialog: MatDialog,
    private cardsService: CardsInfoBandejadeAtencionService
  ) {}

  ngOnInit(): void {
    // Cargar datos de ejemplo
    this.cargarDatosEjemplo();
    this.cargarAsuntosCapturados(); // 🆕 Cargar asuntos capturados
    this.actualizarEstadisticas();
  }

  cargarDatosEjemplo(): void {
    // Asuntos pendientes de revisión
    this.asuntosPendientes = [
      {
        id: '001',
        folio: 'EUACAPE-0021',
        personaRelacionada: 'María González López',
        fechaRecepcion: new Date('2024-05-20'),
        fechaLimite: new Date('2024-06-15'),
        diasTranscurridos: 20,
        estadoAtencion: 'Finalizado',
        prioridad: 'Alta',
        dictaminador: 'Juan Pérez',
        carpetaInvestigacion: 'CI-78945',
        estado: 'Pendiente'
      },
      {
        id: '002',
        folio: 'EUACAPE-0022',
        personaRelacionada: 'Juan Pérez Ramírez',
        fechaRecepcion: new Date('2024-05-30'),
        fechaLimite: new Date('2024-06-25'),
        diasTranscurridos: 10,
        estadoAtencion: 'Finalizado',
        prioridad: 'Media',
        dictaminador: 'Ana López',
        carpetaInvestigacion: 'CI-78946',
        estado: 'Pendiente'
      },
      {
        id: '003',
        folio: 'EUACAPE-0023',
        personaRelacionada: 'Carlos Sánchez Ruiz',
        fechaRecepcion: new Date('2024-06-06'),
        fechaLimite: new Date('2024-06-30'),
        diasTranscurridos: 3,
        estadoAtencion: 'Finalizado',
        prioridad: 'Baja',
        dictaminador: 'Luis Martínez',
        carpetaInvestigacion: 'CI-78947',
        estado: 'Pendiente'
      },
      {
        id: '004',
        folio: 'EUACAPE-0024',
        personaRelacionada: 'Roberto Juárez Gómez',
        fechaRecepcion: new Date('2024-06-01'),
        fechaLimite: new Date('2024-06-20'),
        diasTranscurridos: 8,
        estadoAtencion: 'Finalizado',
        prioridad: 'Alta',
        dictaminador: 'Carmen Vega',
        carpetaInvestigacion: 'CI-78948',
        estado: 'Pendiente'
      },
      {
        id: '005',
        folio: 'EUACAPE-0025',
        personaRelacionada: 'Laura Estrada Campos',
        fechaRecepcion: new Date('2024-06-05'),
        fechaLimite: new Date('2024-06-28'),
        diasTranscurridos: 4,
        estadoAtencion: 'Finalizado',
        prioridad: 'Media',
        dictaminador: 'Miguel Ángel Torres',
        carpetaInvestigacion: 'CI-78949',
        estado: 'Pendiente'
      }
    ];

    // Asuntos ya revisados
    this.asuntosRevisados = [
      {
        id: '006',
        folio: 'EUACAPE-0016',
        personaRelacionada: 'Pedro Domínguez Vargas',
        fechaRecepcion: new Date('2024-05-10'),
        fechaLimite: new Date('2024-06-05'),
        diasTranscurridos: 30,
        estadoAtencion: 'Aprobado',
        prioridad: 'Alta',
        dictaminador: 'Juan Pérez',
        carpetaInvestigacion: 'CI-78940',
        estado: 'Completado'
      },
      {
        id: '007',
        folio: 'EUACAPE-0017',
        personaRelacionada: 'Sofía Mendoza Quiroz',
        fechaRecepcion: new Date('2024-05-15'),
        fechaLimite: new Date('2024-06-10'),
        diasTranscurridos: 25,
        estadoAtencion: 'Rechazado',
        prioridad: 'Baja',
        dictaminador: 'Ana López',
        carpetaInvestigacion: 'CI-78941',
        estado: 'Completado'
      },
      {
        id: '008',
        folio: 'EUACAPE-0018',
        personaRelacionada: 'Antonio Reyes Lara',
        fechaRecepcion: new Date('2024-05-18'),
        fechaLimite: new Date('2024-06-12'),
        diasTranscurridos: 22,
        estadoAtencion: 'Aprobado',
        prioridad: 'Media',
        dictaminador: 'Luis Martínez',
        carpetaInvestigacion: 'CI-78942',
        estado: 'Completado'
      }
    ];
  }

  // 🆕 Método para cargar asuntos capturados DESDE EL ENDPOINT REAL
  cargarAsuntosCapturados(): void {
    console.log('🔄 Iniciando carga de asuntos capturados desde endpoint...');
    
    const request: AsuntoPorEstadoAtencionRequest = {
      documento: "REQUERIMIENTO",
      estado_atencion: "POR ASIGNAR"
    };

    console.log('📤 Enviando request:', request);

    this.cardsService.getAsuntosPorEstadoAtencion(request).subscribe({
      next: (response) => {
        console.log('✅ Response del backend:', response);
        console.log('📊 Cantidad de asuntos recibidos:', response?.length || 0);
        
        if (response && response.length > 0) {
          // Transformar datos del backend al formato de la interfaz del frontend
          this.asuntosCapturados = response.map((item: AsuntoAsignacion, index: number) => {
            console.log(`🔄 Procesando asunto ${index + 1}:`, item);
            
            let asuntoData: any = {};
            
            // Extraer datos según la estructura anidada del backend
            if ('tipo' in item.asunto && 'datos' in item.asunto) {
              // Nueva estructura: { tipo: "Nuevo"|"Historico", datos: {...} }
              asuntoData = item.asunto.datos;
              console.log(`📝 Asunto ${item.asunto.tipo} encontrado:`, asuntoData);
            } else if ('Nuevo' in item.asunto && item.asunto.Nuevo) {
              // Estructura legacy: { Nuevo: {...} }
              asuntoData = item.asunto.Nuevo;
              console.log('📝 Asunto NUEVO encontrado:', asuntoData);
            } else if ('Historico' in item.asunto && item.asunto.Historico) {
              // Estructura legacy: { Historico: {...} }
              asuntoData = item.asunto.Historico;
              console.log('📚 Asunto HISTORICO encontrado:', asuntoData);
            } else {
              console.warn('⚠️ Estructura de asunto no reconocida:', item.asunto);
              return null;
            }

            const asuntoCapturado: AsuntoCapturado = {
              id: `CAP-${asuntoData.id_asunto_nuevo || asuntoData.id_asunto_historico || index + 1}`,
              folio_interno: asuntoData.folio_interno || `N/A-${index + 1}`,
              folio: asuntoData.folio_interno || `N/A-${index + 1}`, // Para compatibilidad
              fecha_captura: asuntoData.fecha_captura || new Date().toISOString(),
              fechaRecepcion: asuntoData.fecha_recepcion || new Date().toISOString().split('T')[0],
              usuario_captura: item.rfc_asignado || 'Sistema Akamba Real',
              estado_revision: 'PENDIENTE', // Estado mapeado al formato del frontend
              personaRelacionada: asuntoData.persona_relacionada || 'No especificado',
              carpeta_investigacion: asuntoData.carpeta_investigacion || 'Sin carpeta',
              autoridad_remitente: asuntoData.autoridad_remitente || 'No especificado',
              autoridad_solicitante: asuntoData.autoridad_remitente || 'No especificado', // Para compatibilidad
              descripcion: asuntoData.descripcion || 'Sin descripción',
              asunto: asuntoData.descripcion || 'Sin descripción', // Para compatibilidad
              oficio: asuntoData.oficio || 'Sin oficio',
              plazo_atencion: asuntoData.plazo_atencion,
              plazoAtencion: asuntoData.plazo_atencion ? `${asuntoData.plazo_atencion} días` : 'No definido',
              prioridad: 'MEDIA', // Valor por defecto, se puede ajustar según lógica de negocio
              tieneDocumentos: Boolean(asuntoData.documento_escaneado),
              cantidadDocumentos: asuntoData.documento_escaneado ? 1 : 0,
              erroresDetectados: [] // Se puede implementar validación posterior
            };

            console.log('✅ Asunto transformado:', asuntoCapturado);
            return asuntoCapturado;
          }).filter((item): item is AsuntoCapturado => item !== null); // Filtrar elementos nulos con type guard

          console.log('✅ Asuntos capturados cargados exitosamente:', this.asuntosCapturados.length);
          this.actualizarEstadisticas();
          this.calcularPaginacion(); // 🆕 Calcular paginación
        } else {
          console.log('⚠️ No se encontraron asuntos, cargando datos de ejemplo...');
          this.cargarDatosEjemploCapturados();
          this.calcularPaginacion(); // 🆕 Calcular paginación
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar asuntos capturados:', error);
        console.log('🔄 Cargando datos de ejemplo como fallback...');
        
        // Mostrar información específica del error
        if (error.status === 401 || error.status === 403) {
          console.log('🔐 Error de autenticación/autorización');
        } else if (error.status === 404) {
          console.log('🔍 Endpoint no encontrado');
        } else if (error.status === 0) {
          console.log('🌐 Error de conexión de red');
        }
        
        // Fallback a datos de ejemplo
        this.cargarDatosEjemploCapturados();
      }
    });
  }

  // 🆕 Método separado para cargar datos de ejemplo
  cargarDatosEjemploCapturados(): void {
    console.log('📋 Cargando datos de ejemplo para asuntos capturados...');
    this.asuntosCapturados = [
      {
        id: 'CAP-001',
        folio_interno: 'EUACAPE-0030',
        folio: 'EUACAPE-0030', // Para compatibilidad
        fecha_captura: '2024-06-09T10:30:00',
        fechaRecepcion: '2024-06-01',
        usuario_captura: 'Ana Martínez (Akamba 1)',
        estado_revision: 'PENDIENTE',
        personaRelacionada: 'Elena Rodríguez Vega',
        carpeta_investigacion: 'CI-78950',
        autoridad_remitente: 'Fiscalía General de la República',
        autoridad_solicitante: 'Fiscalía General de la República', // Para compatibilidad
        descripcion: 'Investigación por evasión fiscal empresarial',
        asunto: 'Investigación por evasión fiscal empresarial', // Para compatibilidad
        oficio: 'OF-FGR-2024-0123',
        plazoAtencion: '30 días',
        prioridad: 'ALTA',
        tieneDocumentos: true,
        cantidadDocumentos: 3,
        erroresDetectados: ['Falta número de RFC', 'Documento ilegible']
      },
      {
        id: 'CAP-002',
        folio_interno: 'EUACAPE-0031',
        folio: 'EUACAPE-0031', // Para compatibilidad
        fecha_captura: '2024-06-09T11:15:00',
        fechaRecepcion: '2024-06-03',
        usuario_captura: 'Carlos Ruiz (Akamba 1)',
        estado_revision: 'APROBADO',
        personaRelacionada: 'Roberto Sánchez López',
        carpeta_investigacion: 'CI-78951',
        autoridad_remitente: 'Procuraduría Fiscal',
        autoridad_solicitante: 'Procuraduría Fiscal', // Para compatibilidad
        descripcion: 'Análisis de omisión de ingresos por actividades comerciales',
        asunto: 'Análisis de omisión de ingresos por actividades comerciales', // Para compatibilidad
        oficio: 'PF-2024-0456',
        plazoAtencion: '15 días',
        prioridad: 'MEDIA',
        tieneDocumentos: true,
        cantidadDocumentos: 5,
        erroresDetectados: []
      },
      {
        id: 'CAP-003',
        folio_interno: 'EUACAPE-0032',
        folio: 'EUACAPE-0032', // Para compatibilidad
        fecha_captura: '2024-06-08T14:20:00',
        fechaRecepcion: '2024-06-05',
        usuario_captura: 'María Fernández (Akamba 1)',
        estado_revision: 'PENDIENTE',
        personaRelacionada: 'Lucía Morales García',
        carpeta_investigacion: 'CI-78952',
        autoridad_remitente: 'Fiscalía General de la República',
        autoridad_solicitante: 'Fiscalía General de la República', // Para compatibilidad
        descripcion: 'Investigación por defraudación fiscal mediante facturas falsas',
        asunto: 'Investigación por defraudación fiscal mediante facturas falsas', // Para compatibilidad
        oficio: 'FGR-DEF-2024-789',
        plazoAtencion: '20 días',
        prioridad: 'ALTA',
        tieneDocumentos: false,
        cantidadDocumentos: 0,
        erroresDetectados: []
      },
      {
        id: 'CAP-004',
        folio_interno: 'EUACAPE-0033',
        folio: 'EUACAPE-0033', // Para compatibilidad
        fecha_captura: '2024-06-09T09:45:00',
        fechaRecepcion: '2024-06-07',
        usuario_captura: 'Luis García (Akamba 1)',
        estado_revision: 'APROBADO',
        personaRelacionada: 'Fernando Jiménez Cruz',
        carpeta_investigacion: 'CI-78953',
        autoridad_remitente: 'Aduanas',
        autoridad_solicitante: 'Aduanas', // Para compatibilidad
        descripcion: 'Investigación por contrabando de mercancías',
        asunto: 'Investigación por contrabando de mercancías', // Para compatibilidad
        oficio: 'ADU-2024-567',
        plazoAtencion: '45 días',
        prioridad: 'BAJA',
        tieneDocumentos: true,
        cantidadDocumentos: 2,
        erroresDetectados: []
      },
      {
        id: 'CAP-005',
        folio_interno: 'EUACAPE-0034',
        folio: 'EUACAPE-0034', // Para compatibilidad
        fecha_captura: '2024-06-08T16:10:00',
        fechaRecepcion: '2024-06-02',
        usuario_captura: 'Sofía Herrera (Akamba 1)',
        estado_revision: 'PENDIENTE',
        personaRelacionada: 'Patricia Torres Ramírez',
        carpeta_investigacion: 'CI-78954',
        autoridad_remitente: 'UIF',
        autoridad_solicitante: 'UIF', // Para compatibilidad
        descripcion: 'Análisis de operaciones sospechosas de lavado de dinero',
        asunto: 'Análisis de operaciones sospechosas de lavado de dinero', // Para compatibilidad
        oficio: 'UIF-2024-890',
        plazoAtencion: '10 días',
        prioridad: 'ALTA',
        tieneDocumentos: true,
        cantidadDocumentos: 8,
        erroresDetectados: ['Fecha incorrecta', 'Falta firma digital']
      }
    ];
    
    console.log('✅ Datos de ejemplo cargados:', this.asuntosCapturados.length, 'asuntos');
    this.actualizarEstadisticas();
  }

  actualizarEstadisticas(): void {
    // 🆕 Calcular estadísticas para asuntos capturados
    this.estadisticas.totalCapturados = this.asuntosCapturados.length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    this.estadisticas.capturadosHoy = this.asuntosCapturados.filter(a => {
      const fechaCaptura = new Date(a.fecha_captura);
      fechaCaptura.setHours(0, 0, 0, 0);
      return fechaCaptura.getTime() === hoy.getTime();
    }).length;
    
    this.estadisticas.requierenCorreccion = this.asuntosCapturados.filter(a => 
      a.estado_revision === 'PENDIENTE').length;
    
    this.estadisticas.listosParaEnviar = this.asuntosCapturados.filter(a => 
      a.estado_revision === 'APROBADO').length;

    // ✅ Calcular estadísticas existentes para dictámenes
    this.estadisticas.totalPendientes = this.asuntosPendientes.length;
    
    this.estadisticas.pendientesHoy = this.asuntosPendientes.filter(a => {
      const fechaLimite = new Date(a.fechaLimite);
      fechaLimite.setHours(0, 0, 0, 0);
      return fechaLimite.getTime() === hoy.getTime();
    }).length;
    
    this.estadisticas.pendientesUrgentes = this.asuntosPendientes.filter(a => a.prioridad === 'Alta').length;
    
    this.estadisticas.totalRevisados = this.asuntosRevisados.length;
    this.estadisticas.aprobados = this.asuntosRevisados.filter(a => a.estadoAtencion === 'Aprobado').length;
    this.estadisticas.rechazados = this.asuntosRevisados.filter(a => a.estadoAtencion === 'Rechazado').length;
  }

  aprobarAsunto(asunto: Asunto): void {
    // Lógica para aprobar un asunto
    const index = this.asuntosPendientes.findIndex(a => a.id === asunto.id);
    
    if (index !== -1) {
      const asuntoAprobado = {...this.asuntosPendientes[index]};
      asuntoAprobado.estadoAtencion = 'Aprobado';
      asuntoAprobado.estado = 'Completado';
      
      this.asuntosPendientes.splice(index, 1);
      this.asuntosRevisados.unshift(asuntoAprobado);
      
      this.actualizarEstadisticas();
    }
  }

  rechazarAsunto(asunto: Asunto): void {
    // Lógica para rechazar un asunto
    const index = this.asuntosPendientes.findIndex(a => a.id === asunto.id);
    
    if (index !== -1) {
      const asuntoRechazado = {...this.asuntosPendientes[index]};
      asuntoRechazado.estadoAtencion = 'Rechazado';
      asuntoRechazado.estado = 'Completado';
      
      this.asuntosPendientes.splice(index, 1);
      this.asuntosRevisados.unshift(asuntoRechazado);
      
      this.actualizarEstadisticas();
    }
  }
  
  onFiltroTextChange(filtro: string): void {
    this.filtroText = filtro;
  }

  openRevisionDetalleModal(asunto: Asunto): void {
    const dialogRef = this.dialog.open(RevisionDetalleModalComponent, {
      data: { asunto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.accion === 'aprobar') {
          this.aprobarAsunto(result.asunto);
        } else if (result.accion === 'rechazar') {
          this.rechazarAsunto(result.asunto);
        }
      }
    });
  }

  // Métodos para las vistas alternativas de asuntos pendientes
  getAsuntosPendientesFiltered(): Asunto[] {
    let asuntosFiltrados = [...this.asuntosPendientes];
    
    // Aplicar filtro de prioridad
    if (this.filtroPrioridad !== 'Todas') {
      asuntosFiltrados = asuntosFiltrados.filter(a => a.prioridad === this.filtroPrioridad);
    }
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntosFiltrados = asuntosFiltrados.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    return asuntosFiltrados;
  }
  
  getAsuntosPendientesByPrioridad(prioridad: string): Asunto[] {
    let asuntos = this.asuntosPendientes.filter(a => a.prioridad === prioridad);
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntos = asuntos.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    return asuntos;
  }
  
  /**
   * Método para filtrar asuntos pendientes por rango de días transcurridos
   * @param minDias días mínimos
   * @param maxDias días máximos
   * @returns array de asuntos filtrados
   */
  getAsuntosPendientesPorDias(minDias: number, maxDias: number): Asunto[] {
    let asuntos = this.asuntosPendientes.filter(a => 
      a.diasTranscurridos >= minDias && a.diasTranscurridos <= maxDias
    );
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntos = asuntos.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    // Aplicar filtro de prioridad
    if (this.filtroPrioridad !== 'Todas') {
      asuntos = asuntos.filter(a => a.prioridad === this.filtroPrioridad);
    }
    
    return asuntos;
  }
  
  /**
   * Formatea una fecha para mostrarla en formato legible
   * @param date fecha a formatear
   * @returns fecha formateada como DD/MM/YYYY
   */
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // 🆕 MÉTODOS PARA MANEJO DE ASUNTOS CAPTURADOS

  /**
   * Alterna la selección de un asunto capturado
   * @param asuntoId ID del asunto a seleccionar/deseleccionar
   */
  toggleSeleccionAsunto(asuntoId: string): void {
    const index = this.asuntosSeleccionados.indexOf(asuntoId);
    if (index > -1) {
      this.asuntosSeleccionados.splice(index, 1);
    } else {
      this.asuntosSeleccionados.push(asuntoId);
    }
  }

  /**
   * Verifica si un asunto está seleccionado
   * @param asuntoId ID del asunto
   * @returns true si está seleccionado
   */
  isAsuntoSeleccionado(asuntoId: string): boolean {
    return this.asuntosSeleccionados.includes(asuntoId);
  }

  /**
   * Selecciona o deselecciona todos los asuntos listos para enviar
   */
  toggleSeleccionTodos(): void {
    const asuntosListos = this.asuntosCapturados.filter(a => a.estado_revision === 'APROBADO');
    const todosSeleccionados = asuntosListos.every(a => this.isAsuntoSeleccionado(a.id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los listos
      asuntosListos.forEach(a => {
        const index = this.asuntosSeleccionados.indexOf(a.id);
        if (index > -1) {
          this.asuntosSeleccionados.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos los listos
      asuntosListos.forEach(a => {
        if (!this.isAsuntoSeleccionado(a.id)) {
          this.asuntosSeleccionados.push(a.id);
        }
      });
    }
  }

  /**
   * Verifica si todos los asuntos listos están seleccionados
   * @returns true si todos están seleccionados
   */
  todosProntosSeleccionados(): boolean {
    const asuntosListos = this.asuntosCapturados.filter(a => a.estado_revision === 'APROBADO');
    return asuntosListos.length > 0 && asuntosListos.every(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Verifica si todos los asuntos aprobados están seleccionados
   * @returns true si todos están seleccionados
   */
  todosAprobadosSeleccionados(): boolean {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    return asuntosAprobados.length > 0 && asuntosAprobados.every(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Verifica si algunos asuntos aprobados están seleccionados
   * @returns true si algunos están seleccionados
   */
  algunosAprobadosSeleccionados(): boolean {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    return asuntosAprobados.some(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Selecciona o deselecciona todos los asuntos aprobados visibles
   */
  toggleTodosAprobados(event: any): void {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    const todosSeleccionados = this.todosAprobadosSeleccionados();
    
    if (todosSeleccionados) {
      // Deseleccionar todos los aprobados
      asuntosAprobados.forEach(a => {
        const index = this.asuntosSeleccionados.indexOf(a.id);
        if (index > -1) {
          this.asuntosSeleccionados.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos los aprobados
      asuntosAprobados.forEach(a => {
        if (!this.isAsuntoSeleccionado(a.id)) {
          this.asuntosSeleccionados.push(a.id);
        }
      });
    }
  }

  /**
   * Obtiene el color del estado de revisión
   * @param estadoRevision Estado del asunto capturado
   * @returns Clase CSS para el color
   */
  getColorEstadoCaptura(estadoRevision: string): string {
    switch (estadoRevision) {
      case 'PENDIENTE': return 'bg-sky-500 text-white';
      case 'APROBADO': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  /**
   * Obtiene la etiqueta del estado de revisión
   * @param estadoRevision Estado del asunto capturado
   * @returns Texto descriptivo del estado
   */
  getEtiquetaEstadoCaptura(estadoRevision: string): string {
    switch (estadoRevision) {
      case 'PENDIENTE': return 'Pendiente de Revisión';
      case 'APROBADO': return 'Aprobado para Akamba 3';
      default: return 'Estado Desconocido';
    }
  }

  /**
   * Envía los asuntos seleccionados al Akamba 3
   */
  enviarAsuntosSeleccionados(): void {
    if (this.asuntosSeleccionados.length === 0) {
      alert('No hay asuntos seleccionados para enviar');
      return;
    }

    const asuntosParaEnviar = this.asuntosCapturados.filter(a => 
      this.asuntosSeleccionados.includes(a.id) && a.estado_revision === 'APROBADO'
    );

    if (asuntosParaEnviar.length === 0) {
      alert('Solo se pueden enviar asuntos que estén "Listos para Enviar"');
      return;
    }

    const confirmacion = confirm(
      `¿Está seguro de enviar ${asuntosParaEnviar.length} asunto(s) al Administrador (Akamba 3)?`
    );

    if (confirmacion) {
      // TODO: Implementar llamada al servicio de envío
      console.log('Enviando asuntos:', asuntosParaEnviar);
      
      // Simular envío exitoso
      alert(`Se han enviado ${asuntosParaEnviar.length} asunto(s) exitosamente al Akamba 3`);
      
      // Limpiar selección
      this.asuntosSeleccionados = [];
      
      // En un escenario real, estos asuntos se eliminarían de la lista o cambiarían de estado
    }
  }

  /**
   * Abre el modal de corrección para un asunto capturado
   * @param asunto Asunto a corregir/revisar
   */
  abrirModalCorreccion(asunto: AsuntoCapturado): void {
    const dialogRef = this.dialog.open(RevisionCapturaModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      data: { asunto },
      disableClose: false,
      panelClass: 'revision-modal-panel'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Resultado de la corrección:', resultado);
        
        // Actualizar el asunto en la lista
        const index = this.asuntosCapturados.findIndex(a => a.id === asunto.id);
        if (index !== -1) {
          // Actualizar estado según la acción realizada
          switch (resultado.accion) {
            case 'CORREGIR':
              this.asuntosCapturados[index].estado_revision = 'PENDIENTE';
              break;
            case 'APROBAR':
              this.asuntosCapturados[index].estado_revision = 'APROBADO';
              break;
          }
          
          // Recalcular estadísticas
          this.actualizarEstadisticas();
        }
      }
    });
  }

  /**
   * Filtra asuntos capturados por texto de búsqueda
   * @returns Array de asuntos filtrados
   */
  getAsuntosCapturasFiltrados(): AsuntoCapturado[] {
    console.log('🔍 getAsuntosCapturasFiltrados() ejecutado');
    console.log('📊 this.asuntosCapturados.length:', this.asuntosCapturados.length);
    console.log('📋 this.asuntosCapturados:', this.asuntosCapturados);
    
    let asuntosFiltrados = [...this.asuntosCapturados];
    console.log('📝 Antes de filtros - asuntosFiltrados.length:', asuntosFiltrados.length);
    
    // Filtrar por texto
    if (this.filtroText) {
      console.log('🔎 Filtrando por texto:', this.filtroText);
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntosFiltrados = asuntosFiltrados.filter(a => 
        (a.folio_interno || '').toLowerCase().includes(textoBusqueda) ||
        (a.personaRelacionada || '').toLowerCase().includes(textoBusqueda) ||
        (a.carpeta_investigacion || '').toLowerCase().includes(textoBusqueda) ||
        (a.oficio || '').toLowerCase().includes(textoBusqueda) ||
        (a.usuario_captura || '').toLowerCase().includes(textoBusqueda)
      );
      console.log('📝 Después de filtro texto - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    // Filtrar por estado de revisión
    if (this.filtroEstadoCaptura !== 'TODOS') {
      console.log('📋 Filtrando por estado:', this.filtroEstadoCaptura);
      asuntosFiltrados = asuntosFiltrados.filter(a => a.estado_revision === this.filtroEstadoCaptura);
      console.log('📝 Después de filtro estado - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    // Filtrar por autoridad remitente
    if (this.filtroAutoridadRemitente !== 'Todas') {
      console.log('🏛️ Filtrando por autoridad:', this.filtroAutoridadRemitente);
      asuntosFiltrados = asuntosFiltrados.filter(a => a.autoridad_remitente === this.filtroAutoridadRemitente);
      console.log('📝 Después de filtro autoridad - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    console.log('✅ getAsuntosCapturasFiltrados() resultado final:', asuntosFiltrados.length, 'asuntos');
    console.log('📋 Asuntos filtrados:', asuntosFiltrados);
    return asuntosFiltrados;
  }

  // 🆕 MÉTODOS SENCILLOS PARA PAGINACIÓN
  calcularPaginacion(): void {
    const asuntosFiltrados = this.getAsuntosCapturasFiltrados();
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.asuntosPaginados = asuntosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.calcularPaginacion();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    const totalPaginas = Math.ceil(this.getAsuntosCapturasFiltrados().length / this.itemsPorPagina);
    if (this.paginaActual < totalPaginas) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  cambiarItemsPorPagina(nuevoValor: number): void {
    this.itemsPorPagina = nuevoValor;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.getAsuntosCapturasFiltrados().length / this.itemsPorPagina);
  }

  // 🆕 MÉTODO PARA TRUNCAR TEXTO LARGO
  truncarTexto(texto: string, longitud: number = 50): string {
    if (!texto) return '';
    if (texto.length <= longitud) return texto;
    return texto.substring(0, longitud) + '...';
  }

  // 🆕 MÉTODO PARA OBTENER TEXTO COMPLETO PARA TOOLTIP
  obtenerTextoCompleto(texto: string): string {
    return texto || '';
  }

  // 🆕 MÉTODO PARA INTERPRETAR PLAZO DE ATENCIÓN
  interpretarPlazoAtencion(plazo: number | null): string {
    if (plazo === null || plazo === undefined) {
      return 'Sin plazo definido';
    }
    
    if (plazo === 0) {
      return 'Urgente';
    }
    
    if (plazo >= 1 && plazo <= 5) {
      return `${plazo} día${plazo > 1 ? 's' : ''}`;
    }
    
    return `${plazo} días`;
  }

  // 🆕 MÉTODO PARA OBTENER CLASE CSS DEL PLAZO
  obtenerClasePlazo(plazo: number | null): string {
    if (plazo === null || plazo === undefined) {
      return 'bg-gray-100 text-gray-700';
    }
    
    if (plazo === 0) {
      return 'bg-red-100 text-red-700';
    }
    
    if (plazo <= 2) {
      return 'bg-orange-100 text-orange-700';
    }
    
    return 'bg-green-100 text-green-700';
  }

  // 🆕 MÉTODOS PARA PRIMERA Y ÚLTIMA PÁGINA
  primeraPagina(): void {
    this.cambiarPagina(1);
  }

  ultimaPagina(): void {
    this.cambiarPagina(this.obtenerTotalPaginas());
  }

  // 🆕 MÉTODO PARA OBTENER RANGO DE PÁGINAS VISIBLES
  obtenerRangoPaginas(): number[] {
    const totalPaginas = this.obtenerTotalPaginas();
    const paginas: number[] = [];
    
    // Mostrar máximo 5 páginas alrededor de la actual
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // 🆕 NUEVOS MÉTODOS PARA ESTADÍSTICAS Y FILTROS

  /**
   * Aplica filtros rápidos desde las tarjetas de estadísticas
   */
  aplicarFiltroRapido(tipo: string): void {
    switch (tipo) {
      case 'capturados':
        this.filtroEstadoCaptura = 'TODOS';
        break;
      case 'pendientes':
        this.filtroEstadoCaptura = 'PENDIENTE';
        break;
      case 'aprobados':
        this.filtroEstadoCaptura = 'APROBADO';
        break;
    }
  }

  /**
   * Obtiene el número de asuntos pendientes de revisión
   */
  getPendientesRevision(): number {
    return this.asuntosCapturados.filter(a => a.estado_revision === 'PENDIENTE').length;
  }

  /**
   * Obtiene el número de asuntos revisados hoy
   */
  getRevisadosHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return this.asuntosCapturados.filter(a => {
      const fechaCaptura = new Date(a.fecha_captura);
      fechaCaptura.setHours(0, 0, 0, 0);
      return fechaCaptura.getTime() === hoy.getTime() && a.estado_revision !== 'PENDIENTE';
    }).length;
  }

  /**
   * Obtiene la meta diaria de revisiones
   */
  getMeta(): number {
    return 15; // Meta diaria configurable
  }

  /**
   * Calcula el progreso del día en porcentaje
   */
  getProgresoDelDia(): number {
    const revisados = this.getRevisadosHoy();
    const meta = this.getMeta();
    return Math.min(Math.round((revisados / meta) * 100), 100);
  }

  /**
   * Obtiene el tiempo promedio de revisión
   */
  getTiempoPromedio(): string {
    return '8.5'; // Simulado - en una implementación real vendría del backend
  }

  /**
   * Obtiene el porcentaje de calidad de revisión
   */
  getCalidadRevision(): number {
    return 94; // Simulado - basado en revisiones sin errores
  }

  /**
   * Obtiene el número de estrellas para calidad
   */
  getEstrellas(): number {
    const calidad = this.getCalidadRevision();
    if (calidad >= 95) return 5;
    if (calidad >= 90) return 4;
    if (calidad >= 80) return 3;
    if (calidad >= 70) return 2;
    return 1;
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.filtroText = '';
    this.filtroEstadoCaptura = 'TODOS';
    this.filtroAutoridadRemitente = 'Todas';
    this.filtroPrioridad = 'Todas';
    this.filtroFechaRecepcion = '';
    this.filtroPlazoAtencion = 'Todos';
  }

  /**
   * Verifica si hay filtros activos
   */
  tienesFiltrosActivos(): boolean {
    return this.filtroText !== '' ||
           this.filtroEstadoCaptura !== 'TODOS' ||
           this.filtroAutoridadRemitente !== 'Todas' ||
           this.filtroPrioridad !== 'Todas' ||
           this.filtroFechaRecepcion !== '' ||
           this.filtroPlazoAtencion !== 'Todos';
  }

  /**
   * Obtiene la hora de captura formateada
   */
  getHoraCaptura(fechaCaptura: string): string {
    const fecha = new Date(fechaCaptura);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Abre el modal de revisión de captura
   */
  abrirModalRevisionCaptura(asunto: AsuntoCapturado): void {
    const dialogRef = this.dialog.open(RevisionCapturaModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        asunto: asunto,
        modo: asunto.estado_revision === 'PENDIENTE' ? 'REVISION' : 'EDICION'
      },
      panelClass: ['custom-dialog-container']
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Resultado de la revisión:', resultado);
        
        // Actualizar el asunto en la lista
        const index = this.asuntosCapturados.findIndex(a => a.id === asunto.id);
        if (index !== -1) {
          // Actualizar estado según la acción realizada
          switch (resultado.accion) {
            case 'CORREGIR':
              this.asuntosCapturados[index].estado_revision = 'PENDIENTE';
              break;
            case 'APROBAR':
              this.asuntosCapturados[index].estado_revision = 'APROBADO';
              break;
          }
          
          // Recalcular estadísticas
          this.actualizarEstadisticas();
        }
      }
    });
  }

  /**
   * Obtiene la timestamp de última actualización
   */
  getUltimaActualizacion(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Obtiene los asuntos que están seleccionados actualmente
   * @returns Array de asuntos seleccionados
   */
  getAsuntosSeleccionados(): AsuntoCapturado[] {
    return this.asuntosCapturados.filter(a => this.asuntosSeleccionados.includes(a.id));
  }

  /**
   * Limpia toda la selección de asuntos
   */
  limpiarSeleccion(): void {
    this.asuntosSeleccionados = [];
  }

  /**
   * Calcula el porcentaje de procesamiento de asuntos
   * @returns Porcentaje redondeado de asuntos procesados
   */
  getPorcentajeProcesamiento(): number {
    if (this.asuntosCapturados.length === 0) return 0;
    return Math.round((this.estadisticas.listosParaEnviar / this.asuntosCapturados.length) * 100);
  }

  /**
   * Cambia la pestaña activa y actualiza el dashboard
   */
  cambiarTab(tab: 'capturados' | 'dictamenes' | 'revisados'): void {
    this.tabActiva = tab;
    console.log('🔄 Pestaña cambiada a:', tab);
    
    // 🆕 Cargar datos automáticamente cuando se activa la pestaña de capturados
    if (tab === 'capturados') {
      console.log('📋 Cargando asuntos capturados automáticamente...');
      this.cargarAsuntosCapturados();
    }
  }

  // 📊 MÉTRICAS PARA DICTÁMENES PENDIENTES
  getDictamenesPendientes(): number {
    return this.asuntosPendientes.length;
  }

  getDictamenesEnProceso(): number {
    return Math.floor(this.asuntosPendientes.length * 0.3); // 30% en proceso
  }

  getDictamenesCompletados(): number {
    return Math.floor(this.asuntosPendientes.length * 0.6); // 60% completados
  }

  getTiempoPromedioDictamen(): string {
    return "12.3"; // minutos promedio
  }

  // 📚 MÉTRICAS PARA ASUNTOS REVISADOS (HISTÓRICO)
  getTotalRevisados(): number {
    return this.asuntosRevisados.length;
  }

  getRevisadosHoyHistorico(): number {
    return Math.floor(this.asuntosRevisados.length * 0.1); // 10% de hoy
  }

  getRevisadosEstaSemana(): number {
    return Math.floor(this.asuntosRevisados.length * 0.3); // 30% esta semana
  }

  getPromedioCalidad(): number {
    return 92; // Porcentaje de calidad promedio
  }

  getRevisorMasProductivo(): string {
    return "Ana Martínez";
  }

  /**
   * Maneja el cambio de pestañas y actualiza el dashboard
   */
  onTabChange(event: any): void {
    const tabIndex = event.index;
    switch (tabIndex) {
      case 0:
        this.cambiarTab('capturados');
        break;
      case 1:
        this.cambiarTab('dictamenes');
        break;
      case 2:
        this.cambiarTab('revisados');
        break;
      default:
        this.cambiarTab('capturados');
    }
  }
} 