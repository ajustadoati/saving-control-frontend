import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SavingService } from '../../../core/services/saving.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-associate-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './associate-setup.component.html',
  styleUrl: './associate-setup.component.css'
})
export default class AssociateSetupComponent {
defaultPayments: any;
removeDefaultPayment(_t44: number) {
throw new Error('Method not implemented.');
}
addDefaultPayment() {
throw new Error('Method not implemented.');
}

  constructor(private userService: UserService, private savingService: SavingService) {
  
  }

  associateFound: boolean = false;
  associateId: any;
  totalSavings!: number;
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

}
