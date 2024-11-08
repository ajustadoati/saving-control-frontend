import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DefaultPaymentService } from '../../core/services/default-payment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ec-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ec-payment.component.html',
  styleUrls: ['./ec-payment.component.css']
})
export default class ECPaymentComponent implements OnInit {
  @Input() userId!: number; 
  @Output() closeModalEvent = new EventEmitter<void>();
  paymentForm: FormGroup;
  paymentTypes: string[] = ['Ahorro', 'Interes', 'Lubricantes', 'Compartir'];

  constructor(
    private fb: FormBuilder,
    private defaultPaymentService: DefaultPaymentService
  ) {
    this.paymentForm = this.fb.group({
      defaultPaymentName: ['', Validators.required],  
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.paymentForm.valid) {
      const paymentData = this.paymentForm.value;
      console.log(paymentData); 

      this.defaultPaymentService.registerPayment(this.userId, paymentData).subscribe({
        next: () => {
          console.log('Pago registrado exitosamente');
          this.paymentForm.reset({ amount: 0, defaultPaymentName: '' });
        },
        error: (err) => console.error('Error al registrar el pago:', err)
      });
    }
  }

  closeModal() {
    this.closeModalEvent.emit(); // Emitimos el evento para cerrar el modal
  }
}
