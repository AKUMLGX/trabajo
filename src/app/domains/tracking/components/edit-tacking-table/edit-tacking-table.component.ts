
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


@Component({
  selector: 'app-edit-tacking-table',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    FormComponent
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

  docuemntoEcaneadoFileTracking?:File;

  ngOnInit(): void {
    this.updateTableForm.controls['carpeta_investigacion'].setValue(this.documents.carpeta_investigacion)
    this.updateTableForm.controls['persona_relacionada'].setValue(this.documents.persona_relacionada)
    this.updateTableForm.controls['folio_scanner'].setValue(this.documents.folio_scanner)
    this.updateTableForm.controls['volante_jefatura'].setValue(this.documents.volante_jefatura)
    this.updateTableForm.controls['oficio'].setValue(this.documents.oficio)
    this.updateTableForm.controls['autoridad_remitente'].setValue(this.documents.autoridad_remitente)
    this.updateTableForm.controls['folio_jupiter'].setValue(this.documents.folio_scanner)
    this.updateTableForm.controls['descripcion'].setValue(this.documents.descripcion)
    this.updateTableForm.controls['turno_jefatura'].setValue(this.documents.turno_jefatura)
    // this.updateTableForm.controls['administracion'].setValue(this.documents.administracion)
    this.updateTableForm.controls["id_asunto_historico"].setValue(this.documents.id_asunto_historico)
    this.updateTableForm.controls["id_asunto_nuevo"].setValue(this.documents.id_asunto_nuevo),
    this.updateTableForm.controls["descargo"].setValue(this.documents.descargo), this.updateTableForm.controls["descargo"].disable()
    this.updateTableForm.controls["tipo_asunto"].setValue(this.documents.tipo_asunto), this.updateTableForm.controls["tipo_asunto"].disable()
    this.updateTableForm.controls["autor"].setValue(this.documents.autor), this.updateTableForm.controls["autor"].disable()
    this.updateTableForm.controls["folio"].setValue(this.documents.folio), this.updateTableForm.controls["folio"].disable()
    this.updateTableForm.controls["orden"].setValue(this.documents.orden), this.updateTableForm.controls["orden"].disable()
    this.updateTableForm.controls["fecha_atencion"].setValue(this.documents.fecha_atencion), this.updateTableForm.controls["fecha_atencion"].disable()
    this.updateTableForm.controls["documento"].setValue(this.documents.documento), this.updateTableForm.controls["documento"].disable()
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
    this.updateTableForm.controls["tipo"].setValue(this.documents.tipo), this.updateTableForm.controls["tipo"].disable()
    this.updateTableForm.controls["unidad_administrativa_autoridad"].setValue(this.documents.unidad_administrativa_autoridad), this.updateTableForm.controls["unidad_administrativa_autoridad"].disable()
    this.updateTableForm.controls["fecha_descargo"].setValue(this.documents.fecha_descargo), this.updateTableForm.controls["fecha_descargo"].disable()
    this.updateTableForm.controls["fecha_oficio"].setValue(this.documents.fecha_oficio), this.updateTableForm.controls["fecha_oficio"].disable()
    this.updateTableForm.controls["reporte"].setValue(this.documents.reporte), this.updateTableForm.controls["reporte"].disable()
    this.updateTableForm.controls["acuse"].setValue(this.documents.acuse), this.updateTableForm.controls["acuse"].disable()
    this.updateTableForm.controls["piezas_fgr_administracion"].setValue(this.documents.piezas_fgr_administracion), this.updateTableForm.controls["piezas_fgr_administracion"].disable()
    this.updateTableForm.controls["base_captura_administracion"].setValue(this.documents.base_captura_administracion), this.updateTableForm.controls["base_captura_administracion"].disable()
    this.btnEdita()
  }

  public updateTableForm: FormGroup = this.fb.group({
    carpeta_investigacion: [["", Validators.required], { value: this.documents?.carpeta_investigacion }],
    persona_relacionada: [["", Validators.required], { value: this.documents?.persona_relacionada }],
    folio_scanner: [["", Validators.required], { value: this.documents?.folio_scanner }],
    volante_jefatura: [["", Validators.required], { value: this.documents?.volante_jefatura }],
    oficio: [["", Validators.required], { value: this.documents?.oficio }],
    autoridad_remitente: [["", Validators.required], { value: this.documents?.autoridad_remitente }],
    folio_jupiter: [["", Validators.required], { value: this.documents?.folio_jupiter }],
    descripcion: [["", Validators.required], { value: this.documents?.descripcion }],
    turno_jefatura: [["", Validators.required], { value: this.documents?.turno_jefatura }],
    // administracion:            [["", Validators.required], { value: this.documents?.administracion }],
    administracion: ["null", [Validators.required]],
    id_asunto_historico: [["", Validators.required], { value: this.documents?.id_asunto_historico }],
    id_asunto_nuevo: [["", Validators.required], { value: this.documents?.id_asunto_historico }],
    atencion:[[""],[],{value:this.documents.atencion}],
    documento_escaneado:[["null"],{value:this.documents.documento_escaneado}],
    descargo: [["", Validators.required], { value: this.documents?.descargo }],
    tipo_asunto: [["", Validators.required], { value: this.documents?.tipo_asunto }],
    base_captura_administracion: [["", Validators.required], { value: this.documents?.base_captura_administracion }],
    autor: [["", Validators.required], { value: this.documents?.autor }],
    folio: [["", Validators.required], { value: this.documents?.folio }],
    fecha_atencion: [["", Validators.required], { value: this.documents?.fecha_atencion }],
    orden: [["", Validators.required], { value: this.documents?.orden }],
    documento: [["", Validators.required], { value: this.documents?.documento }],
    areas_pendientes: [["", Validators.required], { value: this.documents?.areas_pendientes }],
    area_pendiente: [["", Validators.required], { value: this.documents?.area_pendiente }],
    autoridad_solicitante: [["", Validators.required], { value: this.documents?.autoridad_solicitante }],
    correo_electronico: [["", Validators.required], { value: this.documents?.correo_electronico }],
    que_solicita: [["", Validators.required], { value: this.documents?.que_solicita }],
    fecha_numero_oficio_atencion: [["", Validators.required], { value: this.documents?.fecha_numero_oficio_atencion }],
    asuntos_enviados_correo_mara: [["", Validators.required], { value: this.documents?.asuntos_enviados_correo_mara }],
    atentas_notas_respuestas: [["", Validators.required], { value: this.documents?.atentas_notas_respuestas }],
    fecha_turnado: [["", Validators.required], { value: this.documents?.fecha_turnado }],
    hora_recepcion: [["", Validators.required], { value: this.documents?.hora_recepcion }],
    tipo: [["", Validators.required], { value: this.documents?.tipo }],
    unidad_administrativa_autoridad: [["", Validators.required], { value: this.documents?.unidad_administrativa_autoridad }],
    fecha_descargo: [["", Validators.required], { value: this.documents?.fecha_descargo }],
    fecha_oficio: [["", Validators.required], { value: this.documents?.fecha_oficio }],
    reporte: [["", Validators.required], { value: this.documents?.reporte }],
    acuse: [["", Validators.required], { value: this.documents?.acuse }],
    piezas_fgr_administracion: [["", Validators.required], { value: this.documents?.piezas_fgr_administracion }],
  });

  onFileSelected(event:any){
    const file: File = event.target.files[0];
    this.docuemntoEcaneadoFileTracking = file;
    if (this.docuemntoEcaneadoFileTracking) {
      this.documentoEscaneadoNameTracking = this.docuemntoEcaneadoFileTracking.name.toString().replaceAll(' ','_')
    }
  }

  saveUpdateForm(): void {
    this.showagain()
    if (this.updateTableForm.valid === true) {
      const update = this.updateTableForm.value;
      const updateDocumentoEscaneado= this.updateTableForm.value.documento_escaneado;
      this.updateSerivce.updateTrackingTable(update,updateDocumentoEscaneado).subscribe(
        response => {
          this.pdfAcuse.generatePDF(response)
        }
      )
    } else {
      this.updateTableForm.markAllAsTouched();
    }
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
  }

  openCustomModalWithTemplate(template: TemplateRef<any>) {
    if (this.isTouched === true) {
      this.asuntoService.checkNameCarpetaInvestigacionUpdate(
        this.updateTableForm
      ).subscribe((res) => {
        this.carpetaResultList = res;
        if (this.carpetaResultList.length > 0) {
          this.modalService.openCustomDialogWithTemplate({
            template
          })
        }
      })
    } else {
      if (this.carpetaResultList.length === 0) {
        this.isavailable = true;
        this.saveUpdateForm()
      }
    }
  }

  availability() {
    this.asuntoService.checkNameCarpetaInvestigacionUpdate(
      this.updateTableForm
    ).subscribe((res) => {
      this.carpetaResultList = res
      if (this.carpetaResultList.length === 0) {
        this.isavailable = true;
        this.saveUpdateForm()
      }
    })
  }

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
      this.updateTableForm.controls["persona_relacionada"].disable()
      this.updateTableForm.controls["folio_scanner"].disable()
      this.updateTableForm.controls["volante_jefatura"].disable()
      this.updateTableForm.controls["oficio"].disable()
      this.updateTableForm.controls["autoridad_remitente"].disable()
      this.updateTableForm.controls["folio_jupiter"].disable()
      this.updateTableForm.controls["descripcion"].disable()
      this.updateTableForm.controls["turno_jefatura"].disable()
      this.updateTableForm.controls["administracion"].disable()
    }
  }

}
