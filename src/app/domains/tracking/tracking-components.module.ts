import { NgModule } from '@angular/core';
import { TrackingFormComponent } from './components/tracking-form/tracking-form.component';
import { TrackingTableComponent } from './components/tracking-table/tracking-table.component';

/**
 * Módulo que exporta los componentes de tracking para uso en TrackingPageComponent.
 * Evita el error TS-992012 cuando los componentes standalone no se resuelven correctamente.
 */
@NgModule({
  imports: [TrackingFormComponent, TrackingTableComponent],
  exports: [TrackingFormComponent, TrackingTableComponent],
})
export class TrackingComponentsModule {}
