import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-tipo-respuesta-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './tipo-respuesta-select.component.html',
  styleUrl: './tipo-respuesta-select.component.css'
})
export class TipoRespuestaSelectComponent {
  tipoRespuesta = '';
}
