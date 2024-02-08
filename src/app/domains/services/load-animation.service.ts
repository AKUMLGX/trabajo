import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({ providedIn: 'root' })
export class LoadAnimationService {
  isLoading$ = new Subject<boolean>();
  count = 0;

  show(): void {
    this.count += 1;
    this.isLoading$.next(true);
  }

  hide(): void {
    this.count -= 1;
    if (this.count <= 0) {
      this.isLoading$.next(false);
      this.count = 0;
    }
  }
}
