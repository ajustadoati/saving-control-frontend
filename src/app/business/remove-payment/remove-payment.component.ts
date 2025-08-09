import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../core/services/payment.service';

@Component({
  selector: 'app-remove-payment',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './remove-payment.component.html',
  styleUrl: './remove-payment.component.css',
})
export default class RemovePaymentComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private paymentService : PaymentService) {
    this.contactForm = this.fb.group({
      cedula: ['', Validators.required],
      date: ['', [Validators.required]],
    });
  }

onSubmit() {
  if (this.contactForm.valid) {
    const { cedula, date } = this.contactForm.value;
    this.paymentService.removePaymentByDateAndCedula(cedula, date).subscribe({
      next: (res) => {
        console.log('Pago eliminado:', res);
      },
      error: (err) => {
        console.error('Error al eliminar el pago:', err);
      }
    });
  } else {
    console.log('Formulario inválido');
  }
}

}
