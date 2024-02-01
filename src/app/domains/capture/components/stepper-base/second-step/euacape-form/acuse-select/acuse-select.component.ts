import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-acuse-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './acuse-select.component.html',
  styleUrl: './acuse-select.component.css'
})
export class AcuseSelectComponent {
  acuse = '';
}
