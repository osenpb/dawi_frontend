import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencySol', standalone: true })
export class CurrencySolPipe implements PipeTransform {
  transform(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
