import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './domains/interceptors/auth.interceptor';
import { loadAnimationInterceptor } from './domains/interceptors/load-animation.interceptor';
import { errorInterceptor } from './domains/interceptors/error.interceptor';
import { successfullInterceptor } from './domains/interceptors/successful.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadAnimationInterceptor,
        errorInterceptor,
        successfullInterceptor
      ])
    ),
  ],
};
