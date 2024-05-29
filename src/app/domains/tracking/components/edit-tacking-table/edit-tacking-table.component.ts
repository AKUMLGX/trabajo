
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormComponent } from '../../../capture/components/stepper-base/third-step/preliminar-form/form/form.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { EditTackingTableService } from '../../../services/edit-tacking-table.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfAcuseService } from '../../../shared/services/pdf-acuse.service';




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
    private pdfAcuse: PdfAcuseService
  ) { }
  botonHabilitado: boolean = false
  mostrarTabla: boolean = true
  @Output() showTable = new EventEmitter<void>()
  @Input() documents!: Asunto


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
    this.updateTableForm.controls['administracion'].setValue(this.documents.administracion)
    this.updateTableForm.controls["id_asunto_historico"].setValue(this.documents.id_asunto_historico)
    this.updateTableForm.controls["id_asunto_nuevo"].setValue(this.documents.id_asunto_nuevo)
    this.btnEdita()
  }

  public updateTableForm: FormGroup = this.fb.group({
    carpeta_investigacion:     [["", Validators.required], { value: this.documents?.carpeta_investigacion }],
    persona_relacionada:       [["", Validators.required], { value: this.documents?.persona_relacionada }],
    folio_scanner:             [["", Validators.required], { value: this.documents?.folio_scanner }],
    volante_jefatura:          [["", Validators.required], { value: this.documents?.volante_jefatura }],
    oficio:                    [["", Validators.required], { value: this.documents?.oficio }],
    autoridad_remitente:       [["", Validators.required], { value: this.documents?.autoridad_remitente }],
    folio_jupiter:             [["", Validators.required], { value: this.documents?.folio_jupiter }],
    descripcion:               [["", Validators.required], { value: this.documents?.descripcion }],
    turno_jefatura:            [["", Validators.required], { value: this.documents?.turno_jefatura }],
    administracion:            [["", Validators.required], { value: this.documents?.administracion }],
    id_asunto_historico:       [["", Validators.required], { value: this.documents?.id_asunto_historico }],
    id_asunto_nuevo:           [["", Validators.required], { value: this.documents?.id_asunto_historico }]
  });


  saveUpdateForm(): void {
    console.log(this.updateTableForm.value);
    this.showagain()
    if (this.updateTableForm.valid === true) {
      console.log(this.updateTableForm.valid, "Valido");  
      const update = this.updateTableForm.value;
      this.updateSerivce.updateTrackingTable(update).subscribe(
        response => {
          console.log('Actualizado:', response);
          this.pdfAcuse.generatePDF(response)
        }
      )
    } else {
      this.updateTableForm.markAllAsTouched();
      console.log('El formulario no es válido');
    }
  }

  btnEdita() {
    this.updateTableForm.valueChanges.subscribe(() => {
      const camposModificados = Object.keys(this.updateTableForm.controls)
        .some(k => this.updateTableForm.get(k)?.dirty)
      this.botonHabilitado = camposModificados
      console.log(camposModificados);
      console.log(this.botonHabilitado);
      console.log("Form", this.updateTableForm.valid);

    });

    this.botonHabilitado = this.updateTableForm.dirty && this.updateTableForm.valid

    console.log(this.botonHabilitado);
    console.log("Dirty", this.updateTableForm.dirty);

  }


  showagain() {
    this.showTable.emit()
    this.mostrarTabla = false
    console.log(this.mostrarTabla,"showagain-PT!");
  }

}


