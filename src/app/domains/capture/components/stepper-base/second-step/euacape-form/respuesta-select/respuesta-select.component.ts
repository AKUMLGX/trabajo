import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-respuesta-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './respuesta-select.component.html',
  styleUrl: './respuesta-select.component.css'
})
export class RespuestaSelectComponent {
  respuesta = '';
}
