import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parcial-page',
  standalone: true,
  imports: [RouterModule,MatIconModule,],
  templateUrl: './parcial-page.component.html',
  styleUrl: './parcial-page.component.css'
})
export class ParcialPageComponent {

}
