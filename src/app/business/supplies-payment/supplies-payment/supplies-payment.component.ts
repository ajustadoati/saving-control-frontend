import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplies-payment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './supplies-payment.component.html',
  styleUrl: './supplies-payment.component.css'
})

export class SuppliesPaymentComponent {
  @Input() supply: any; // Recibe los datos del suministro desde el componente padre.
  isOpen = false; // Controla si el modal está visible.

  pagos: string[] = ["suministro","prestamo"]

  pago: string = this.pagos[0]

  

  openModal() {
    this.isOpen = true;
    if (this.supply == null)
      this.pago = this.pagos[1]
    else(
      this.pago = this.pagos[0]
    )
  }

  closeModal() {
    this.isOpen = false;
  }
}
