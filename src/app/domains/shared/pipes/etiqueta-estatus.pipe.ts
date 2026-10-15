import { Pipe, PipeTransform } from '@angular/core';

import { etiquetaEstatus } from '../utils/catalogo-estatus.utils';

@Pipe({ name: 'etiquetaEstatus' })
export class EtiquetaEstatusPipe implements PipeTransform {
  transform(estatus: string | null | undefined): string {
    return etiquetaEstatus(estatus);
  }
}
