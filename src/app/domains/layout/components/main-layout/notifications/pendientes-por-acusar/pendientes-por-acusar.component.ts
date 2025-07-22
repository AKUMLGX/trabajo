import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-pendientes-por-acusar',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './pendientes-por-acusar.component.html',
  styleUrl: './pendientes-por-acusar.component.css'
})
export class PendientesPorAcusarComponent {

  public environment = environment;

  isEmptyList             = true;
  zeroColumnHeader        = 'Ver más';
  firstColumnHeader       = 'Documento escaneado';
  secondColumnHeader      = 'Folio interno';
  thirdColumnHeader       = 'Oficio';
  fourthColumnHeader      = 'Fecha de recepción';
  fifthColumnHeader       = 'Autoridad solicitante';
  sixthColumnHeader       = 'Persona relacionada';
  seventhColumnHeader     = 'Carpeta de investigación';
  eighthColumnHeader      = 'Descripción';
  ninthColumnHeader       = 'Administración';
  tenthColumnHeader       = 'Folio scanner';
  eleventhColumnHeader    = 'Turno jefatura';
  twelfthColumnHeader     = 'Atención';
  thirteenthColumnHeader  = 'Tipo de respuesta';
  fourteenthColumnHeader  = 'Tipo asunto';
  fifteenthColumnHeader   = 'Plazo de atención';
  sixteenthColumnHeader   = 'Folio Júpiter';
  seventeenthColumnHeader = 'Volante de jefatura';
  eighteenthColumnHeader  = 'Otras acciones';


  SEARCH_RESULTS = [
    { 
      id                    :  1, 
      documento_escaneado   : 'Documento escaneado 1',
      folio_interno         : 'Folio interno 1',
      oficio                : 'Oficio 1',
      fecha_recepcion       : 'Fecha de recepción 1',
      autoridad_solicitante : 'Autoridad solicitante 1',
      persona_relacionada   : 'Persona relacionada 1',
      carpeta_investigacion : 'Carpeta de investigación 1',
      descripcion           : 'Descripción 1',
      administracion        : 'Administración 1',
      folio_scanner         : 'Folio scanner 1',
      turno_jefatura        : 'Turno jefatura 1',
      atencion              : 'Atención 1',
      tipo_respuesta        : 'Tipo de respuesta 1',
      tipo_asunto           : 'Tipo asunto 1',
      plazo_atencion        : 'Plazo de atención 1',
      folio_jupiter         : 'Folio Júpiter 1',
      volante_jefatura      : 'Volante de jefatura 1',
    },
    { 
      id                    :  2, 
      documento_escaneado   : 'Documento escaneado 2',
      folio_interno         : 'Folio interno 2',
      oficio                : 'Oficio 2',
      fecha_recepcion       : 'Fecha de recepción 2',
      autoridad_solicitante : 'Autoridad solicitante 2',
      persona_relacionada   : 'Persona relacionada 2',
      carpeta_investigacion : 'Carpeta de investigación 2',
      descripcion           : 'Descripción 2',
      administracion        : 'Administración 2',
      folio_scanner         : 'Folio scanner 2',
      turno_jefatura        : 'Turno jefatura 2',
      atencion              : 'Atención 2',
      tipo_respuesta        : 'Tipo de respuesta 2',
      tipo_asunto           : 'Tipo asunto 2',
      plazo_atencion        : 'Plazo de atención 2',
      folio_jupiter         : 'Folio Júpiter 2',
      volante_jefatura      : 'Volante de jefatura 2',
    },
    { 
      id                    :  3, 
      documento_escaneado   : 'Documento escaneado 3',
      folio_interno         : 'Folio interno 3',
      oficio                : 'Oficio 3',
      fecha_recepcion       : 'Fecha de recepción 3',
      autoridad_solicitante : 'Autoridad solicitante 3',
      persona_relacionada   : 'Persona relacionada 3',
      carpeta_investigacion : 'Carpeta de investigación 3',
      descripcion           : 'Descripción 3',
      administracion        : 'Administración 3',
      folio_scanner         : 'Folio scanner 3',
      turno_jefatura        : 'Turno jefatura 3',
      atencion              : 'Atención 3',
      tipo_respuesta        : 'Tipo de respuesta 3',
      tipo_asunto           : 'Tipo asunto 3',
      plazo_atencion        : 'Plazo de atención 3',
      folio_jupiter         : 'Folio Júpiter 3',
      volante_jefatura      : 'Volante de jefatura 3',
    },
    { 
      id                    :  4, 
      documento_escaneado   : 'Documento escaneado 4',
      folio_interno         : 'Folio interno 4',
      oficio                : 'Oficio 4',
      fecha_recepcion       : 'Fecha de recepción 4',
      autoridad_solicitante : 'Autoridad solicitante 4',
      persona_relacionada   : 'Persona relacionada 4',
      carpeta_investigacion : 'Carpeta de investigación 4',
      descripcion           : 'Descripción 4',
      administracion        : 'Administración 4',
      folio_scanner         : 'Folio scanner 4',
      turno_jefatura        : 'Turno jefatura 4',
      atencion              : 'Atención 4',
      tipo_respuesta        : 'Tipo de respuesta 4',
      tipo_asunto           : 'Tipo asunto 4',
      plazo_atencion        : 'Plazo de atención 4',
      folio_jupiter         : 'Folio Júpiter 4',
      volante_jefatura      : 'Volante de jefatura 4',
    },
    
  ];

}
