import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsablesTableComponent } from '../../components/responsables-table/responsables-table.component';

@Component({
  selector: 'app-responsables-page',
  standalone: true,
  imports: [
    CommonModule,
    ResponsablesTableComponent
  ],
  templateUrl: './responsables-page.component.html',
  styleUrl: './responsables-page.component.css'
})
export class ResponsablesPageComponent {
}

