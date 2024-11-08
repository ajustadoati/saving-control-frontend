import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SavingService } from '../../core/services/saving.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import ECPaymentComponent from '../ec-payment/ec-payment.component';



@Component({
  selector: 'app-ec-search-member',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ECPaymentComponent],
  templateUrl: './ec-search-member.component.html',
  styleUrls: ['./ec-search-member.component.css']
})
export default class ECSearchMemberComponent {
  removePayment(_t42: number) {
  throw new Error('Method not implemented.');
  }
  defaultPayments: any;
  associateFound: boolean = false;
  associateId: any;
  totalSavings!: number;
  showModal: boolean = false;
  associateData: any = null;

  constructor(private userService: UserService, private savingService: SavingService) {}

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;

        // Ahora busca los ahorros de este socio
        this.savingService.getSavingsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            const totalSavings = response.savings.reduce((sum: number, saving: any) => sum + saving.amount, 0);
            this.totalSavings = totalSavings;
            console.log('Saldo total:', this.totalSavings);
          },
          error: (error) => {
            console.error('Error al obtener los ahorros:', error);
            this.totalSavings = 0; // Si no se obtienen ahorros, saldo es 0
          }
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
        this.totalSavings = 0; // Si no se encuentra el socio, no hay saldo
      },
    });
  }

  openModal(userId: number): void {
    this.associateId = userId;  // Almacena los detalles del socio seleccionado
    this.showModal = true;     // Muestra el modal
  }

  // Cierra el modal y limpia los datos del usuario seleccionado
  closeModal(): void {
    this.showModal = false;    // Oculta el modal
    this.associateId = null;  // Limpia el socio seleccionado
  }
}
