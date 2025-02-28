import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormComponent } from '../../../capture/components/stepper-base/third-step/preliminar-form/form/form.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { EditTackingTableService } from '../../../services/edit-tacking-table.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfAcuseService } from '../../../shared/services/pdf-acuse.service';
import { AsuntoService } from '../../../services/asunto.service';
import { ModalService } from '../../../shared/services/modal.service';
import { MatIcon } from '@angular/material/icon';



@Component({
  selector: 'app-edit-tacking-table',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,

    MatIcon,
  ],
  templateUrl: './edit-tacking-table.component.html',
  styleUrl: './edit-tacking-table.component.css'
})
export class EditTackingTableComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private updateSerivce: EditTackingTableService,
    private pdfAcuse: PdfAcuseService,
    private asuntoService: AsuntoService,
    private modalService: ModalService,

  ) { }
  botonHabilitado: boolean = false
  mostrarTabla: boolean = true
  @Output() showTable = new EventEmitter<void>()
  @Input() documents!: Asunto

  carpetaResultList: Asunto[] = [];

  isavailable: boolean = false;

  showInput: boolean = false;

  isTouched: boolean = false;

  documentoEscaneadoNameTracking: string = "";

  docuemntoEcaneadoFileTracking!: File;


  selectedFile!: File ;







  ngOnInit(): void {
    this.updateTableForm.controls['carpeta_investigacion'].setValue(this.documents.carpeta_investigacion !== null ? this.documents.carpeta_investigacion : "")
    //this.updateTableForm.controls['documento_escaneado'].setValue(this.documents.documento_escaneado)
  //  this.updateTableForm.controls['documento_escaneado_name'].setValue(this.documents.documento_escaneado), this.updateTableForm.controls["documento_escaneado_name"].disable()
    this.updateTableForm.controls['persona_relacionada'].setValue(this.documents.persona_relacionada !== null ? this.documents.persona_relacionada : "")
    this.updateTableForm.controls['fecha_recepcion'].setValue(this.documents.fecha_recepcion !== null ? this.documents.fecha_recepcion : "")
    this.updateTableForm.controls['folio_scanner'].setValue(this.documents.folio_scanner !== null ? this.documents.folio_scanner : "")
    this.updateTableForm.controls['volante_jefatura'].setValue(this.documents.volante_jefatura !== null ? this.documents.volante_jefatura : "")
    this.updateTableForm.controls['oficio'].setValue(this.documents.oficio !== null ? this.documents.oficio : "")
    this.updateTableForm.controls['autoridad_remitente'].setValue(this.documents.autoridad_remitente !== null ? this.documents.autoridad_remitente : "")
    this.updateTableForm.controls['folio_jupiter'].setValue(this.documents.folio_jupiter !== null ? this.documents.folio_jupiter : "")
    this.updateTableForm.controls['descripcion'].setValue(this.documents.descripcion !== null ? this.documents.descripcion : "")
    this.updateTableForm.controls['turno_jefatura'].setValue(this.documents.turno_jefatura !== null ? this.documents.turno_jefatura : "")
    this.updateTableForm.controls['id_administracion_fk'].setValue(this.getAdministracion(this.documents.administracion) !== null ? this.getAdministracion(this.documents.administracion) : null)
    this.updateTableForm.controls['id_atencion_fk'].setValue(this.getAtencion(this.documents.atencion) !== null ? this.getAtencion(this.documents.atencion) : null)
    this.updateTableForm.controls["descargo"].setValue(this.documents.descargo), this.updateTableForm.controls["descargo"].disable()
    this.updateTableForm.controls["tipo_asunto"].setValue(this.documents.tipo_asunto), this.updateTableForm.controls["tipo_asunto"].disable()
    this.updateTableForm.controls["id_asunto_historico"].setValue(this.documents.id_asunto_historico)
    this.updateTableForm.controls["id_asunto_nuevo"].setValue(this.documents.id_asunto_nuevo)
    this.updateTableForm.controls["id_tipo_fk"].setValue(this.getTipo(this.documents.tipo) !== null ? this.getTipo(this.documents.tipo) : null)
    this.updateTableForm.controls["id_documento_fk"].setValue(this.getDocumento(this.documents.documento) !== null ? this.getDocumento(this.documents.documento) : null)
    this.updateTableForm.controls["autor"].setValue(this.documents.autor), this.updateTableForm.controls["autor"].disable()
    this.updateTableForm.controls["folio"].setValue(this.documents.folio), this.updateTableForm.controls["folio"].disable()
    this.updateTableForm.controls["orden"].setValue(this.documents.orden), this.updateTableForm.controls["orden"].disable()
    this.updateTableForm.controls["fecha_atencion"].setValue(this.documents.fecha_atencion), this.updateTableForm.controls["fecha_atencion"].disable()
    this.updateTableForm.controls["areas_pendientes"].setValue(this.documents.areas_pendientes), this.updateTableForm.controls["areas_pendientes"].disable()
    this.updateTableForm.controls["area_pendiente"].setValue(this.documents.area_pendiente), this.updateTableForm.controls["area_pendiente"].disable()
    this.updateTableForm.controls["autoridad_solicitante"].setValue(this.documents.autoridad_solicitante), this.updateTableForm.controls["autoridad_solicitante"].disable()
    this.updateTableForm.controls["correo_electronico"].setValue(this.documents.correo_electronico), this.updateTableForm.controls["correo_electronico"].disable()
    this.updateTableForm.controls["que_solicita"].setValue(this.documents.que_solicita), this.updateTableForm.controls["que_solicita"].disable()
    this.updateTableForm.controls["fecha_numero_oficio_atencion"].setValue(this.documents.fecha_numero_oficio_atencion), this.updateTableForm.controls["fecha_numero_oficio_atencion"].disable()
    this.updateTableForm.controls["asuntos_enviados_correo_mara"].setValue(this.documents.asuntos_enviados_correo_mara), this.updateTableForm.controls["asuntos_enviados_correo_mara"].disable()
    this.updateTableForm.controls["atentas_notas_respuestas"].setValue(this.documents.atentas_notas_respuestas), this.updateTableForm.controls["atentas_notas_respuestas"].disable()
    this.updateTableForm.controls["fecha_turnado"].setValue(this.documents.fecha_turnado), this.updateTableForm.controls["fecha_turnado"].disable()
    this.updateTableForm.controls["hora_recepcion"].setValue(this.documents.hora_recepcion), this.updateTableForm.controls["hora_recepcion"].disable()
    this.updateTableForm.controls["unidad_administrativa_autoridad"].setValue(this.documents.unidad_administrativa_autoridad), this.updateTableForm.controls["unidad_administrativa_autoridad"].disable()
    this.updateTableForm.controls["fecha_descargo"].setValue(this.documents.fecha_descargo), this.updateTableForm.controls["fecha_descargo"].disable()
    this.updateTableForm.controls["fecha_oficio"].setValue(this.documents.fecha_oficio), this.updateTableForm.controls["fecha_oficio"].disable()
    this.updateTableForm.controls["reporte"].setValue(this.documents.reporte), this.updateTableForm.controls["reporte"].disable()
    this.updateTableForm.controls["acuse"].setValue(this.documents.acuse), this.updateTableForm.controls["acuse"].disable()
    this.updateTableForm.controls["piezas_fgr_administracion"].setValue(this.documents.piezas_fgr_administracion), this.updateTableForm.controls["piezas_fgr_administracion"].disable()
    this.updateTableForm.controls["base_captura_administracion"].setValue(this.documents.base_captura_administracion), this.updateTableForm.controls["base_captura_administracion"].disable()
    this.btnEdita();



    console.log(this.documents.documento_escaneado,"DOC_ESC");
    console.log(this.documents.folio_scanner,"Scanner");



  }

  public updateTableForm: FormGroup = this.fb.group({
    carpeta_investigacion: [[""], {  value: this.documents?.carpeta_investigacion !== null ? this.documents?.carpeta_investigacion : ""  }],
    persona_relacionada: [[""], { value: this.documents?.persona_relacionada !== null ? this.documents?.persona_relacionada : "" }],
    fecha_recepcion: [[""], { value: this.documents?.fecha_recepcion !== null ? this.documents?.fecha_recepcion : "" }],
    folio_scanner: [[], { value: this.documents?.folio_scanner !== null ? this.documents?.folio_scanner : "" }],
    volante_jefatura: [[""], { value: this.documents?.volante_jefatura !== null ? this.documents?.volante_jefatura : "" }],
    oficio: [[""], { value: this.documents?.oficio !== null ? this.documents?.oficio : "" }],
    autoridad_remitente: [[""], { value: this.documents?.autoridad_remitente !== null ? this.documents?.autoridad_remitente : "" }],
    folio_jupiter: [[""], { value: this.documents?.folio_jupiter !== null ? this.documents?.folio_jupiter : "" }],
    descripcion: [[""], { value: this.documents?.descripcion !== null ? this.documents?.descripcion : "" }],
    turno_jefatura: [["",], { value: this.documents?.turno_jefatura !== null ? this.documents?.turno_jefatura : "" }],
    documento_escaneado: [null],
    id_documento_fk: [[""], { value: this.documents?.documento }],
    id_tipo_fk: [[""], { value: this.documents?.tipo }],
    id_administracion_fk: [[""], { value: this.documents?.administracion }],
    id_atencion_fk: [[""], { value: this.documents?.atencion }],
    id_asunto_historico: [[""], { value: this.documents?.id_asunto_historico }],
    id_asunto_nuevo: [[""], { value: this.documents?.id_asunto_historico }],
    descargo: [[""], { value: this.documents?.descargo }],
    tipo_asunto: [[""], { value: this.documents?.tipo_asunto }],
    base_captura_administracion: [[""], { value: this.documents?.base_captura_administracion }],
    autor: [[""], { value: this.documents?.autor }],
    folio: [[""], { value: this.documents?.folio }],
    fecha_atencion: [[""], { value: this.documents?.fecha_atencion }],
    orden: [[""], { value: this.documents?.orden }],
    areas_pendientes: [[""], { value: this.documents?.areas_pendientes }],
    area_pendiente: [[""], { value: this.documents?.area_pendiente }],
    autoridad_solicitante: [[""], { value: this.documents?.autoridad_solicitante }],
    correo_electronico: [[""], { value: this.documents?.correo_electronico }],
    que_solicita: [[""], { value: this.documents?.que_solicita }],
    fecha_numero_oficio_atencion: [[""], { value: this.documents?.fecha_numero_oficio_atencion }],
    asuntos_enviados_correo_mara: [[""], { value: this.documents?.asuntos_enviados_correo_mara }],
    atentas_notas_respuestas: [[""], { value: this.documents?.atentas_notas_respuestas }],
    fecha_turnado: [[""], { value: this.documents?.fecha_turnado }],
    hora_recepcion: [[""], { value: this.documents?.hora_recepcion }],
    unidad_administrativa_autoridad: [[""], { value: this.documents?.unidad_administrativa_autoridad }],
    fecha_descargo: [[""], { value: this.documents?.fecha_descargo }],
    fecha_oficio: [[""], { value: this.documents?.fecha_oficio }],
    reporte: [[""], { value: this.documents?.reporte }],
    acuse: [[""], { value: this.documents?.acuse }],
    piezas_fgr_administracion: [[""], { value: this.documents?.piezas_fgr_administracion }],
  });




  getAtencion(atencion: String | null): number | null {
    if (atencion !== null) {
      if (atencion === "TOTAL") {
        return 1;
      } else if (atencion === "PARCIAL") {
        return 2
      } else if (atencion === "EN TRAMITE") {
        return 3
      } else if (atencion === "NO APLICA") {
        return 5
      } else if (atencion === "RECIBIDO") {
        return 4
      }
    }
    return null
  }

  getAdministracion(administracion: String | null): number | null {
    if (administracion === "a_1") {
      return 1;
    } else if (administracion === "a_2") {
      return 2
    } else if (administracion === "a_3") {
      return 3
    } else if (administracion === "a_4") {
      return 4
    } else if (administracion === "a_5") {
      return 5
    }
    return null
  }

  getDocumento(documento: String | null): number | null {
    if (documento !== null) {
      if (documento === "REQUERIMIENTO") {
        return 2;
      } else if (documento === "SOLICITUD INTERNA") {
        return 4
      } else if (documento === "RESPUESTA INTERNA") {
        return 5
      } else if (documento === "RESPUESTA A FGR") {
        return 6
      } else if (documento === "ALCANCE") {
        return 7
      }
    }
    return null
  }

  getTipo(tipo: String | null): number | null {
    if (tipo !== null) {
      if (tipo === "SEGUNDA PIEZA") {
        return 1;
      } else if (tipo === "APERTURA") {
        return 2
      }
    }
    return null
  }


  // onFileSelected(event: any) {
  //   const file: File = event.target.files[0];
  //   this.docuemntoEcaneadoFileTracking = file;
  //   console.log(this.docuemntoEcaneadoFileTracking, "FILE");
  //   if (this.docuemntoEcaneadoFileTracking) {
  //     this.documentoEscaneadoNameTracking = this.docuemntoEcaneadoFileTracking.name.toString().replaceAll(' ', '_')
  //   }
  // }

  onFileChanged(event: any) {
    const element = event.target as HTMLInputElement;
    this.selectedFile = event.target.files[0]
    if(this.selectedFile)
      this.updateTableForm.value.documento_escaneado = this.selectedFile.name.toString().replaceAll(' ','_')
  }

  saveUpdateForm(): void {
    this.showagain()
    if (this.updateTableForm.valid === true ) {
      const update = this.updateTableForm.value;
      const selectedFile = this.selectedFile;
      this.updateSerivce.updateTrackingTable(update,selectedFile).subscribe(
        response => {

          this.pdfAcuse.generatePDF(response)
       console.log(response, "RESPONSE");
        }
      )
      console.log(update, "UPADATE");


    } else {
      this.updateTableForm.markAllAsTouched();
    }

    // if (this.isTouched === true){
    //    this.saveDocEsca();
    // }

    // if(this.isTouched === true){
    //   this.onSubmit()
    // }
  }



//  getFormData(formValue:{
//   carpeta_investigacion:String;
//   persona_relacionada:String;
//   folio_scanner:String;
//   volante_jefatura:String;
//   oficio: String;
//   autoridad_remitente: String;
//   folio_jupiter: String;
//   descripcion: string;
//   turno_jefatura: String
//   documento_escaneado: String;
//   documento: String | null;
//   tipo: String | null;
//   administracion: String | null;
//   atencion:String|null;
//   id_asunto_historico: number | null ;
//   id_asunto_nuevo:number | null  ;
// })  { return{
//   carpeta_investigacion:    formValue.  carpeta_investigacion,
//   persona_relacionada:      formValue. persona_relacionada,
//   folio_scanner:            formValue.folio_scanner,
//   volante_jefatura:         formValue.volante_jefatura,
//   oficio:                   formValue.oficio,
//   autoridad_remitente:      formValue.autoridad_remitente,
//   folio_jupiter:            formValue.folio_jupiter,
//   descripcion:              formValue.descripcion,
//   turno_jefatura:           formValue.turno_jefatura,
//   documento_escaneado:      formValue.documento_escaneado,
//   documento:                formValue.documento,
//   tipo:                     formValue.tipo,
//   administracion:           formValue.administracion,
//   atencion:                 formValue.atencion,
//   id_asunto_historico:      formValue.id_asunto_historico,
//   id_asunto_nuevo:          formValue.id_asunto_nuevo
// }
// }


  // onSubmit():void{
  //   if ( this.selectedFile  && this.updateTableForm.valid === true ) {
  //     const data: any = {
  //       carpeta_investigacion: this.updateTableForm.value.carpeta_investigacion,
  //       persona_relacionada: this.updateTableForm.value.persona_relacionada,
  //       folio_scanner: this.updateTableForm.value.folio_scanner,
  //       volante_jefatura: this.updateTableForm.value.volante_jefatura,
  //       oficio: this.updateTableForm.value.oficio,
  //       autoridad_remitente: this.updateTableForm.value.autoridad_remitente,
  //       folio_jupiter: this.updateTableForm.value.folio_jupiter,
  //       descripcion: this.updateTableForm.value.descripcion,
  //       turno_jefatura: this.updateTableForm.value.turno_jefatura,
  //       documento_escaneado: this.updateTableForm.value.documento_escaneado,
  //       documento: this.updateTableForm.value.id_documento_fk,
  //       tipo: this.updateTableForm.value.id_tipo_fk,
  //       administracion: this.updateTableForm.value.id_administracion_fk,
  //       atencion: this.updateTableForm.value.id_atencion_fk,
  //       id_asunto_historico: this.updateTableForm.value.id_asunto_historico,
  //       id_asunto_nuevo: this.updateTableForm.value.id_asunto_nuevo
  //     };

  //    //const data = this.getFormData(this.updateTableForm.value)

  //     // const data : Asunto = {
  //     //   carpeta_investigacion: this.updateTableForm.value.carpeta_investigacion,
  //     //   persona_relacionada: this.updateTableForm.value.persona_relacionada,
  //     //   folio_scanner: this.updateTableForm.value.folio_scanner,
  //     //   volante_jefatura: this.updateTableForm.value.volante_jefatura,
  //     //   oficio: this.updateTableForm.value.oficio,
  //     //   autoridad_remitente: this.updateTableForm.value.autoridad_remitente,
  //     //   folio_jupiter: this.updateTableForm.value.folio_jupiter,
  //     //   descripcion: this.updateTableForm.value.descripcion,
  //     //   turno_jefatura: this.updateTableForm.value.turno_jefatura,
  //     //   documento_escaneado: this.updateTableForm.value.documento_escaneado,
  //     //   documento: this.updateTableForm.value.id_documento_fk,
  //     //   tipo: this.updateTableForm.value.id_tipo_fk,
  //     //   administracion: this.updateTableForm.value.id_administracion_fk,
  //     //   atencion: this.updateTableForm.value.id_atencion_fk,
  //     //   id_asunto_historico: this.updateTableForm.value.id_asunto_historico,
  //     //   id_asunto_nuevo: this.updateTableForm.value.id_asunto_nuevo

  //     // }


  //     this.updateSerivce.updateDocumento(data,this.selectedFile!).subscribe(
  //       result => {
  //         console.log(result,"result");
  //       }
  //     );
  // }
  // }


// saveDocEsca():void{
//   // debugger
//     const updateDocEsc = this.updateTableForm.value;
//     this.onBlur()
//     const updatedDocEscFile = this.docuemntoEcaneadoFileTracking;
//     console.log(updatedDocEscFile.size, "SIZE");
//     if ( updatedDocEscFile.size > 0) {
//       debugger
//       this.updateSerivce.updateDocumentoEscaneado(updatedDocEscFile , updateDocEsc).subscribe(
//         res => {
//           console.log(res);
//         }
//       )
//   }
// }


getToday(): string {
  return new Date().toISOString().split('T')[0]
}


  btnEdita() {
    this.updateTableForm.valueChanges.subscribe(() => {
      const camposModificados = Object.keys(this.updateTableForm.controls)
        .some(k => this.updateTableForm.get(k)?.dirty)
      this.botonHabilitado = camposModificados

    });
    this.botonHabilitado = this.updateTableForm.dirty && this.updateTableForm.valid
  }

  showagain() {
    this.showTable.emit()
    this.mostrarTabla = false
  }

  onBlur(): void {
    this.isTouched = true
    console.log(this.isTouched);

  }

  // openCustomModalWithTemplate(template: TemplateRef<any>) {
  //   if (this.isTouched === true) {
  //     this.asuntoService.checkNameCarpetaInvestigacionUpdate(
  //       this.updateTableForm
  //     ).subscribe((res) => {
  //       this.carpetaResultList = res;
  //       if (this.carpetaResultList.length > 0) {
  //         this.modalService.openCustomDialogWithTemplate({
  //           template
  //         })
  //       }
  //     })
  //   } else {
  //     if (this.carpetaResultList.length === 0) {
  //       this.isavailable = true;
  //       this.saveUpdateForm()
  //     }
  //   }
  // }

  // availability() {
  //   this.asuntoService.checkNameCarpetaInvestigacionUpdate(
  //     this.updateTableForm
  //   ).subscribe((res) => {
  //     this.carpetaResultList = res
  //     if (this.carpetaResultList.length === 0) {
  //       this.isavailable = true;
  //       this.saveUpdateForm()
  //     }
  //   })
  // }

  getRol(): string {
    let sessionInfo = localStorage.getItem('sessionInfo');
    if (sessionInfo !== null) {
      let parse = JSON.parse(sessionInfo);
      let rol = parse.roles;
      return rol;
    }
    return "";
  }

  showInputAkambaUno() {
    if (this.getRol() === "SIAT_AKAMBA_001_CAPTURA") {
      this.showInput = true
      this.updateTableForm.controls["carpeta_investigacion"].disable()
      this.updateTableForm.controls["id_atencion_fk"].disable()
      this.updateTableForm.controls["persona_relacionada"].disable()
      this.updateTableForm.controls["folio_scanner"].disable()
      this.updateTableForm.controls["volante_jefatura"].disable()
      this.updateTableForm.controls["oficio"].disable()
      this.updateTableForm.controls["autoridad_remitente"].disable()
      this.updateTableForm.controls["folio_jupiter"].disable()
      this.updateTableForm.controls["descripcion"].disable()
      this.updateTableForm.controls["turno_jefatura"].disable()
      this.updateTableForm.controls["id_administracion_fk"].disable()
    }
  }
}
