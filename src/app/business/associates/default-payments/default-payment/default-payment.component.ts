import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DefaultPaymentService } from '../../../core/services/default-payment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './default-payment.component.html',
  styleUrl: './default-payment.component.css'
})
export class DefaultPaymentComponent {
  paymentForm: FormGroup;

  @Output() paymentAdded = new EventEmitter<void>();

  @Input() userId!: number; 



  constructor(
    private fb: FormBuilder,
    private defaultPaymentService: DefaultPaymentService
  ) {
    this.paymentForm = this.fb.group({
      paymentName: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const paymentData = this.paymentForm.value;
      this.defaultPaymentService.registerPayment(this.userId, paymentData).subscribe({
        next: () => {
          console.log('Pago registrado exitosamente');
          this.paymentForm.reset({ amount: 0 });
          this.paymentAdded.emit();
        },
        error: (err) => console.error('Error al registrar el pago:', err)
      });
    }
  }

  
  // Output para comunicar el cierre del modal al componente padre
  @Output() closeModalEvent = new EventEmitter<void>();

  // Método para emitir el evento de cierre
  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
