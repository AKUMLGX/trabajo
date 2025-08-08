import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plazo',
  standalone: true
})
export class PlazoPipe implements PipeTransform {

  transform(value: number | null): string {
    if (value === null) {
      return `sin plazo definido`
    }
    if (value === 0) {
      return `urgente (${value})`
    }
    return `  ${value} días`
  }

}
