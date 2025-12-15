import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtencionCierreTableComponent } from '../../components/atencion-cierre-table/atencion-cierre-table.component';

@Component({
  selector: 'app-atencion-cierre-page',
  standalone: true,
  imports: [
    CommonModule,
    AtencionCierreTableComponent
  ],
  templateUrl: './atencion-cierre-page.component.html',
  styleUrl: './atencion-cierre-page.component.css'
})
export class AtencionCierrePageComponent {
  constructor() {}
}

