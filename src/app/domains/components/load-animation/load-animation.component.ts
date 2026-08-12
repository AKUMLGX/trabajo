import { Component, inject} from '@angular/core';
import { LoadAnimationService } from '../../services/load-animation.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-load-animation',
    imports: [AsyncPipe, CommonModule],
    templateUrl: './load-animation.component.html',
    styleUrl: './load-animation.component.css'
})
export class LoadAnimationComponent {
  private readonly loadAnimationService = inject(LoadAnimationService);

  readonly isLoading$ = this.loadAnimationService.isLoading$;

  readonly loaderGifSrc = `${(environment.base ?? '').replace(
    /\/$/,
    ''
  )}/assets/animations/tlalcalli-animation.gif`;


  testLoader(): void {
  this.loadAnimationService.show();

  setTimeout(() => {
    this.loadAnimationService.hide();
  }, 3000);
}

}
