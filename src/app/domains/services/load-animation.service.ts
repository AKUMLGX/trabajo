import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadAnimationService {
  private requests = 0;
  private minTime = 800;
  private startedAt = 0;

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  show(): void {
    this.requests++;

    if (this.requests === 1) {
      this.startedAt = Date.now();
      this.isLoadingSubject.next(true);
    }
  }

  hide(): void {
    this.requests--;

    if (this.requests <= 0) {
      this.requests = 0;

      const elapsed = Date.now() - this.startedAt;
      const remaining = Math.max(this.minTime - elapsed, 0);

      setTimeout(() => {
        if (this.requests === 0) {
          this.isLoadingSubject.next(false);
        }
      }, remaining);
    }
  }
}
