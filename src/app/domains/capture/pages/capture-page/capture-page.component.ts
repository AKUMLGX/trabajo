import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { StepperTlalcalliComponent } from '../../components/stepper-base/stepper-tlalcalli/stepper-tlalcalli.component';
import { TemporalExpedienteService } from '../../services/temporal-expediente.service';

@Component({
    selector: 'app-capture-page',
    imports: [
        StepperTlalcalliComponent,
    ],
    templateUrl: './capture-page.component.html'
})
export class CapturePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly temporalService = inject(TemporalExpedienteService);

  mostrarStepper = false;
  stepperKey = 0;

  ngOnInit(): void {
    void this.evaluarEntradaCaptura();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        void this.evaluarEntradaCaptura();
      });
  }

  private async evaluarEntradaCaptura(): Promise<void> {
    if (!this.router.url.includes('/layout/capture')) {
      return;
    }

    this.temporalService.logKeysCapturaOnce();
    await this.temporalService.prepararEntradaCaptura();
    this.recrearStepper();
  }

  private recrearStepper(): void {
    this.mostrarStepper = false;
    setTimeout(() => {
      this.stepperKey += 1;
      this.mostrarStepper = true;
    }, 0);
  }
}
