import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-atencion-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './atencion-select.component.html',
  styleUrl: './atencion-select.component.css'
})
export class AtencionSelectComponent {
  atencion = '';
}
