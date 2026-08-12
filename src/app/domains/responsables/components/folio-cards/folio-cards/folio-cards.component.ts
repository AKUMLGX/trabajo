import { Component, Input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { FolioCard, EstadisticoAtencionResponse } from '../../../../interfaces/foliocard.interface';

@Component({
    selector: 'app-folio-cards',
    imports: [MatIconModule],
    templateUrl: './folio-cards.component.html'
})
export class FolioCardsComponent {
    @Input() folios: FolioCard[] = [];
}
