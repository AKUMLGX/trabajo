import { Component } from '@angular/core';
import { LoadAnimationService } from '../../services/load-animation.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-load-animation',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './load-animation.component.html',
  styleUrl: './load-animation.component.css',
})
export class LoadAnimationComponent {
  isLoading$ = this.loadAnimationService.isLoading$;
  constructor(private loadAnimationService: LoadAnimationService) {}
  


}
