import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SavingService } from '../../../core/services/saving.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefaultPaymentComponent } from "../../default-payments/default-payment/default-payment.component";
import { Associate } from '../../../interfaces/associate';
import { DefaultPaymentService } from '../../../core/services/default-payment.service';
import { AssociateMemberComponent } from "../../associate-member/associate-member/associate-member.component";

@Component({
  selector: 'app-associate-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DefaultPaymentComponent, AssociateMemberComponent],
  templateUrl: './associate-setup.component.html',
  styleUrl: './associate-setup.component.css'
})
export default class AssociateSetupComponent {

  defaultPayments: any;

  constructor(private userService: UserService, private savingService: SavingService, 
    private defaultPaymentService: DefaultPaymentService) {
  
  }

  removeDefaultPayment(userId: number, paymentId: number) {
    
    this.defaultPaymentService.deleteDefaultPayment(userId, paymentId).subscribe({
      next: () => {
        console.log('Pago por defecto eliminado correctamente');
        // Aquí puedes actualizar la lista de pagos por defecto si es necesario
        this.getDefaultPayments(); // Volver a cargar los pagos por defecto
      },
      error: (err) => {
        console.error('Error al eliminar el pago por defecto:', err);
      }
    });
  }
  
  addDefaultPayment() {

  throw new Error('Method not implemented.');
  }

  associateFound: boolean = false;
  associateId: any;
  totalSavings!: number;
  showModal: boolean =false;
  showAssociateMemberModal: boolean = false;
  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };


  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;
        this.getDefaultPayments();
        this.totalSavings = data.totalSavings;

        this.savingService.getResume()
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });
        this.associateFound = false;
        this.totalSavings = 0; // Si no se encuentra el socio, no hay saldo
      },
    });
  }

  getDefaultPayments(){

    this.defaultPaymentService.getDefaultPaymentsByUserId(this.associateData.id).subscribe({
      next: (response: any) => {
        console.log("defaultPayments: ", response);
        this.defaultPayments = response.defaultPayments;

      },
      error: (error) => {
        console.error('Error al obtener los pagos por defecto:', error);
        this.defaultPayments = []; // Si no se obtienen ahorros, saldo es 0
      }
    });
  }



  openModal(userId: number): void {
    this.associateId = userId;  // Almacena los detalles del socio seleccionado
    this.showModal = true;     // Muestra el modal
  }

  openAssociateMemberModal(): void {
    this.showAssociateMemberModal = true;     // Muestra el modal
  }

  // Cierra el modal y limpia los datos del usuario seleccionado
  closeModal(): void {
    this.showModal = false;    // Oculta el modal
    this.associateId = null;  // Limpia el socio seleccionado
    this.getDefaultPayments();
  }

  closeAssociateMemberModal(): void {
    this.showAssociateMemberModal = false;
  }

}
