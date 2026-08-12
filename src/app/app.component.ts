import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadAnimationComponent } from './domains/components/load-animation/load-animation.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, LoadAnimationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Akamba';
}
