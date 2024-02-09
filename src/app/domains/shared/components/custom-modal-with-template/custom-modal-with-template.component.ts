import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TemplateModalData } from '../../models/template-modal-data.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-modal-with-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-modal-with-template.component.html',
  styleUrl: './custom-modal-with-template.component.css'
})
export class CustomModalWithTemplateComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: TemplateModalData) {

  }
}
