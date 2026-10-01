import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  configurarPdfWorkerGlobal,
  precargarPdfWorkerBlob,
} from './app/domains/capture/utils/pdf-worker.utils';

// Ruta estática primero (síncrona) y después la comprobación del Content-Type
// con que el servidor publica el worker: si el MIME no es JavaScript, se
// republica como blob para que el module worker de PDF.js no sea rechazado.
configurarPdfWorkerGlobal();
void precargarPdfWorkerBlob();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
