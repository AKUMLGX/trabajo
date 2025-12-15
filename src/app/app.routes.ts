import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';
import { CapturePageComponent } from './domains/capture/pages/capture-page/capture-page.component';
import { TrackingPageComponent } from './domains/tracking/pages/tracking-page/tracking-page.component';
import { ReportsPageComponent } from './domains/reports/pages/reports-page/reports-page.component';
import { AssistancePageComponent } from './domains/assistance/pages/assistance-page/assistance-page.component';
import { loginGuard } from './domains/guards/login.guard';
import { capturaGuard, atencionGuard, dictaminadorGuard, seguimientoGuard, reportesGuard, revisionFinalGuard } from './domains/guards/bandeja.guard';
import { AccessDeniedComponent } from './domains/shared/pages/access-denied/access-denied.component';
import { PdfViewerComponent } from './domains/components/pdf-viewer/pdf-viewer.component';
import { TramitePageComponent } from './domains/assistance/pages/tramite-page/tramite-page.component';
import { TrafficLightsAtencionComponent } from './domains/assistance/components/dashbord/TrafficLights/traffic-lights-atencion/traffic-lights-atencion.component';
import { ParcialPageComponent } from './domains/assistance/pages/parcial-page/parcial-page/parcial-page.component';
import { FinalizadoComponent } from './domains/assistance/pages/finalizado-page/finalizado/finalizado-page.component';
import { MsgReaderComponent } from './domains/components/msg-reader/msg-reader.component';
import { AsignacionPageComponent } from './domains/assistance/pages/asignacion-page/asignacion-page.component';
import { TramiteDetalleComponent } from './domains/assistance/pages/tramite-detalle/tramite-detalle.component';
import { AsuntoDetalleComponent } from './domains/assistance/pages/asunto-detalle/asunto-detalle.component';
import { ParcialDetalleComponent } from './domains/assistance/pages/parcial-detalle/parcial-detalle.component';
import { AsuntoParcialComponent } from './domains/assistance/pages/asunto-parcial/asunto-parcial.component';
import { DictaminadorPageComponent } from './domains/assistance/pages/dictaminador-page/dictaminador-page.component';
import { DictaminadorDetalleComponent } from './domains/assistance/pages/dictaminador-detalle/dictaminador-detalle.component';
import { RevisionFinalComponent } from './domains/assistance/pages/revision-final/revision-final.component';
import { ResponsablesPageComponent } from './domains/responsables/pages/responsables-page/responsables-page.component';
import { DashboardPageComponent } from './domains/dashboard/pages/dashboard-page/dashboard-page.component';
import { AtencionCierrePageComponent } from './domains/responsables/pages/atencion-cierre-page/atencion-cierre-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'layout',
    component: MainLayoutComponent,
    canActivate: [loginGuard],
    children: [
      {
        path: 'capture',
        component: CapturePageComponent,
        canActivate: [capturaGuard],
      },
      {
        path: 'assistance',
        component: AssistancePageComponent,
        canActivate: [atencionGuard],
      },
      {
        path: "tramite-card",
        component: TramitePageComponent,
      },
      {
        path: "tramite-detalle",
        component: TramiteDetalleComponent,
      },
      {
        path: "asunto-detalle/:id",
        component: AsuntoDetalleComponent,
      },
      {
        path: "parcial-detalle",
        component: ParcialDetalleComponent,
      },
      {
        path: "asunto-parcial/:id",
        component: AsuntoParcialComponent,
      },
      {
        path: "semaforo",
        component: TrafficLightsAtencionComponent
      },
      {
        path: "parcial-card",
        component: ParcialPageComponent,
      },
      {
        path: "finalizado-card",
        component: FinalizadoComponent,
      },
      {
        path: 'tracking',
        component: TrackingPageComponent,
        canActivate: [seguimientoGuard]
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
        canActivate: [reportesGuard]
      },
      {
        path: 'asignacion',
        component: AsignacionPageComponent
      },
      {
        path: 'tracking',
        component: TrackingPageComponent,
        children: [
          {
            path: 'pdfViewer',
            component: PdfViewerComponent
          },
          {
            path: 'msgReader',
            component: MsgReaderComponent
          }
        ],
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
      },
      {
        path: 'dictaminador',
        component: DictaminadorPageComponent,
        canActivate: [dictaminadorGuard],
      },
      {
        path: 'dictaminador/detalle/:id',
        component: DictaminadorDetalleComponent,
        canActivate: [dictaminadorGuard],
      },
      {
        path: 'revision-final',
        component: RevisionFinalComponent,
        canActivate: [revisionFinalGuard],
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent
      },
      {
        path: 'responsables',
        component: ResponsablesPageComponent
      },
      {
        path: 'atencion-cierre',
        component: AtencionCierrePageComponent
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent
      }
    ]
  },
  // {
  //     path: '**',
  //     component: MainLayoutComponent
  // },
];
