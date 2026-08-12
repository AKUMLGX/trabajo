import { Component } from '@angular/core';

import { AtencionCierreTableComponent } from '../../components/atencion-cierre-table/atencion-cierre-table.component';

@Component({
    selector: 'app-atencion-cierre-page',
    imports: [
    AtencionCierreTableComponent
],
    templateUrl: './atencion-cierre-page.component.html',
    styleUrl: './atencion-cierre-page.component.css'
})
export class AtencionCierrePageComponent {
  constructor() {}
}

