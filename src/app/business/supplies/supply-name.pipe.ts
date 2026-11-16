import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'supplyName', standalone: true })
export class SupplyNamePipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (name?.startsWith('SALDO INICIAL SUMINISTROS|')) {
      return 'Saldo inicial de suministros';
    }
    return name ?? '';
  }
}
