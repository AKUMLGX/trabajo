import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { TrakingFormComponent } from '../../components/traking-form/traking-form.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [InitTemplateComponent, TrakingFormComponent],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css'
})
export class TrackingPageComponent {
  public consultForm: FormGroup = this.fb.group({
    name: [''],
    price: [0],
    inStorage: [0],
  }); 
  constructor(private fb: FormBuilder) {}
}
