import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-finalizado',
  standalone: true,
  imports: [RouterModule,MatIconModule,],
  templateUrl: './finalizado-page.component.html',
  styleUrl: './finalizado-page.component.css'
})
export class FinalizadoComponent {

}
