import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../core/services/payment.service';
import { UserService } from '../core/services/user.service';
import { RevertPaymentRequest } from '../interfaces/revert-payment-request';
import { RevertPaymentResponse } from '../interfaces/revert-payment-response';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-remove-payment',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './remove-payment.component.html',
  styleUrl: './remove-payment.component.css',
})
export default class RemovePaymentComponent {
  revertForm: FormGroup;
  associateFound: boolean = false;
  associateId: any;
  associateData: any = {};
  isProcessingRevert: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService,
    private userService: UserService
  ) {
    this.revertForm = this.fb.group({
      date: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  searchAssociate() {
    if (!this.associateId) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingresa la cédula del asociado.'
      });
      return;
    }

    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data;
        console.log('Datos del socio:', this.associateData);
        this.associateFound = true;
        
        Swal.fire({
          icon: 'success',
          title: 'Asociado encontrado',
          text: `${this.associateData.firstName} ${this.associateData.lastName}`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });
        this.associateFound = false;
        this.associateData = {};
      }
    });
  }

  onSubmit() {
    if (!this.associateFound) {
      Swal.fire({
        icon: 'warning',
        title: 'Asociado requerido',
        text: 'Primero debes buscar y seleccionar un asociado válido.'
      });
      return;
    }

    if (this.revertForm.valid && !this.isProcessingRevert) {
      const { date, reason } = this.revertForm.value;
      
      // Confirmación antes de revertir
      Swal.fire({
        title: '¿Estás seguro?',
        html: `
          <div class="text-left">
            <p><strong>Asociado:</strong> ${this.associateData.firstName} ${this.associateData.lastName}</p>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Razón:</strong> ${reason}</p>
            <br>
            <p class="text-red-600 font-semibold">⚠️ Esta acción no se puede deshacer</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, revertir pagos',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.processRevert();
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.'
      });
    }
  }

  private processRevert() {
    const { date, reason } = this.revertForm.value;
    
    const revertRequest: RevertPaymentRequest = {
      userId: this.associateData.id,
      date: date,
      reason: reason
    };

    this.isProcessingRevert = true;

    this.paymentService.revertPayment(revertRequest).subscribe({
      next: (response: RevertPaymentResponse) => {
        console.log('Pagos revertidos exitosamente:', response);
        
        if (response.reversedPaymentsCount > 0) {
          // Crear lista de pagos revertidos para mostrar
          const paymentsList = response.reversedPayments.map(payment => 
            `<li>${payment.paymentType}: $${payment.amount.toLocaleString()} - ${payment.description}</li>`
          ).join('');

          Swal.fire({
            icon: 'success',
            title: '¡Pagos revertidos exitosamente!',
            html: `
              <div class="text-left">
                <p><strong>Fecha de los pagos:</strong> ${response.paymentDate}</p>
                <p><strong>Total revertido:</strong> $${response.totalReversedAmount.toLocaleString()}</p>
                <p><strong>Cantidad de pagos:</strong> ${response.reversedPaymentsCount}</p>
                <p><strong>Fecha de reversión:</strong> ${new Date(response.reversalDateTime).toLocaleString()}</p>
                <br>
                <p><strong>Pagos revertidos:</strong></p>
                <ul class="list-disc list-inside">${paymentsList}</ul>
              </div>
            `,
            confirmButtonText: 'Entendido',
            width: '600px'
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin pagos para revertir',
            text: response.message || 'No se encontraron pagos para la fecha especificada.',
            confirmButtonText: 'Entendido'
          });
        }
        
        // Limpiar formulario
        this.revertForm.reset();
        this.associateFound = false;
        this.associateData = {};
        this.associateId = null;
        this.isProcessingRevert = false;
      },
      error: (error) => {
        console.error('Error al revertir pagos:', error);
        
        let errorMessage = 'Ocurrió un error inesperado al revertir los pagos.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al revertir pagos',
          text: errorMessage
        });
        
        this.isProcessingRevert = false;
      }
    });
  }

  resetForm() {
    this.revertForm.reset();
    this.associateFound = false;
    this.associateData = {};
    this.associateId = null;
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
