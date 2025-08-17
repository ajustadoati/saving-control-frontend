import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { UserService } from '../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserSavingBoxService } from '../core/services/user-saving-box.service';
import { UserBalanceService } from '../core/services/user-balance.service';
import { UserSavingsBox } from '../interfaces/userSavingBox';
import { UserSavingBoxComponent } from '../associates/user-saving-box/user-saving-box.component';
import { WithdrawalRequest } from '../interfaces/withdrawal-request';

@Component({
  selector: 'app-withdraw-balance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,UserSavingBoxComponent,],
  templateUrl: './withdraw-balance.component.html',
  styleUrl: './withdraw-balance.component.css'
})
export default class WithdrawBalanceComponent {

  isModalOpen = false;
  withdrawForm: FormGroup;
  associateFound: boolean = false;
  associateId: any;
  associateData: any = {};
  userSavingsBox: UserSavingsBox | null = null;
  currentBalance: number = 0;
  isProcessingWithdrawal: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, 
    private userSavingBoxService: UserSavingBoxService,
    private userBalanceService: UserBalanceService){

    this.withdrawForm = this.fb.group({
      Balance: ['', [Validators.required]] 
    });
  }

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData);
        this.associateFound = true;
        this.getUserSavingsBox();
        this.getUserBalance(); // Obtener el balance real del usuario
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });
        this.associateFound = false;
        this.currentBalance = 0;
      },
    });
  }

  getUserSavingsBox() {
    this.userSavingBoxService.getSavingBox(this.associateData.id).subscribe({
      next: (data) => {
        if (data.response.length > 0) {
          this.userSavingsBox = data.response[0];
        } else {
          this.userSavingsBox = null;
        }
      },
      error: (error) => {
        console.error('Error al obtener la caja de ahorro del usuario:', error);
        this.userSavingsBox = null;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.withdrawForm.reset();
  }

  getUserBalance() {
    if (this.associateData && this.associateData.id) {
      this.userBalanceService.getSummary(this.associateData.id).subscribe({
        next: (summary) => {
          this.currentBalance = summary.currentBalance;
          console.log('Balance actual del usuario:', this.currentBalance);
          this.updateValidators();
        },
        error: (error) => {
          console.error('Error al obtener el balance del usuario:', error);
          this.currentBalance = 0;
          this.updateValidators();
        }
      });
    }
  }

  updateValidators() {
    const balanceControl = this.withdrawForm.get('Balance');
    if (balanceControl) {
      balanceControl.setValidators([
        Validators.required,
        Validators.max(this.currentBalance),
        Validators.min(0.01)
      ]);
      balanceControl.updateValueAndValidity();
    }
  }

  processWithdrawal() {
    if (this.withdrawForm.valid && !this.isProcessingWithdrawal) {
      const amount = this.withdrawForm.get('Balance')?.value;
      
      if (amount > this.currentBalance) {
        Swal.fire({
          icon: 'error',
          title: 'Fondos insuficientes',
          text: `El monto solicitado (${amount}) excede el balance disponible (${this.currentBalance}).`
        });
        return;
      }

      const withdrawalRequest: WithdrawalRequest = {
        userId: this.associateData.id,
        amount: amount,
        description: `Retiro de fondos - Usuario: ${this.associateData.firstName} ${this.associateData.lastName}`
      };

      this.isProcessingWithdrawal = true;

      this.userBalanceService.withdrawFunds(withdrawalRequest).subscribe({
        next: (response) => {
          console.log('Retiro exitoso:', response);
          
          Swal.fire({
            icon: 'success',
            title: '¡Retiro exitoso!',
            html: `
              <div class="text-left">
                <p><strong>Monto retirado:</strong> $${response.withdrawalAmount.toLocaleString()}</p>
                <p><strong>Balance anterior:</strong> $${response.previousBalance.toLocaleString()}</p>
                <p><strong>Nuevo balance:</strong> $${response.newBalance.toLocaleString()}</p>
                <p><strong>Fecha:</strong> ${new Date(response.transactionDate).toLocaleDateString()}</p>
              </div>
            `,
            confirmButtonText: 'Entendido'
          });

          // Actualizar el balance actual
          this.currentBalance = response.newBalance;
          this.updateValidators();
          
          // Cerrar modal y resetear formulario
          this.closeModal();
          this.isProcessingWithdrawal = false;
        },
        error: (error) => {
          console.error('Error en el retiro:', error);
          
          let errorMessage = 'Ocurrió un error inesperado.';
          if (error.error && error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error en el retiro',
            text: errorMessage
          });
          
          this.isProcessingWithdrawal = false;
        }
      });
    }
  }
}
