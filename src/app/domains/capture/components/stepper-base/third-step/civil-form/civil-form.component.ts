import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-civil-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,

  ],
  templateUrl: './civil-form.component.html',
  styleUrl: './civil-form.component.css'
})
export class CivilFormComponent {

  constructor(
    private fb: FormBuilder,
    ){ }

  public civilForm: FormGroup = this.fb.group({
    oficio: ['', ],
    turnoJefatura: [null,],
    folioInterno: ['',],
    folioScanner: ['',],
  });

  saveCivilForm(): void {
    console.log(this.civilForm.value);
  }

}
