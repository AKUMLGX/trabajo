import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { LoadAnimationComponent } from './domains/components/load-animation/load-animation.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadAnimationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Akamba';
}
