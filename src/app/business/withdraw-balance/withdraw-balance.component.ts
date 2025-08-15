import { Component, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SavingService } from '../core/services/saving.service';
import { UserService } from '../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AssociateService } from '../core/services/associate.service';
import { UserSavingBoxService } from '../core/services/user-saving-box.service';
import { UserSavingsBox } from '../interfaces/userSavingBox';
import { UserSavingBoxComponent } from '../associates/user-saving-box/user-saving-box.component';

@Component({
  selector: 'app-withdraw-balance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,UserSavingBoxComponent,],
  templateUrl: './withdraw-balance.component.html',
  styleUrl: './withdraw-balance.component.css'
})
export default class WithdrawBalanceComponent {

  associateMembers: any;
  supplies: any[] = [];
  loans: any[] = [];
  userId : number | undefined;
  isModalOpen = false
  withdrawForm: FormGroup;

  constructor(private fb: FormBuilder,private userService: UserService, private savingService: SavingService, 
    private associateService: AssociateService,private userSavingBoxService: UserSavingBoxService,){

  this.withdrawForm = this.fb.group({
    Balance: ['',[Validators.required]] 
  });
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
  userSavingsBox: UserSavingsBox | null = null;

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;
        this.totalSavings = data.totalSavings;
        this.getUserSavingsBox();
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

  getUserSavingsBox() {
    this.userSavingBoxService.getSavingBox(this.associateData.id).subscribe({
      next: (data) => {
        if (data.response.length > 0) {
          this.userSavingsBox = data.response[0];
          this.totalSavings = data.response[0].boxValue;

          const balanceControl = this.withdrawForm.get('Balance');
          if (balanceControl) {
            balanceControl.setValidators([
              Validators.required,
              Validators.max(this.totalSavings),
              Validators.min(1)
            ]);
            balanceControl.updateValueAndValidity();
          }
        } else {
          this.userSavingsBox = null;
          this.totalSavings = 0;
        }
      },
      error: (error) => {
        console.error('Error al obtener la caja de ahorro del usuario:', error);
        this.totalSavings = 0;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
