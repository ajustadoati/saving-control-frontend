import { Component, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SavingService } from '../../core/services/saving.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefaultPaymentComponent } from "../default-payments/default-payment/default-payment.component";
import { DefaultPaymentService } from '../../core/services/default-payment.service';
import { AssociateMemberComponent } from "../associate-member/associate-member/associate-member.component";
import { AssociateService } from '../../core/services/associate.service';
import { UserSavingBoxService } from '../../core/services/user-saving-box.service';
import { UserSavingsBox } from '../../interfaces/userSavingBox';
import { UserSavingBoxComponent } from '../user-saving-box/user-saving-box.component';
import { SuppliesService } from '../../core/services/supplies.service';
import { SuppliesPaymentComponent } from '../../supplies-payment/supplies-payment/supplies-payment.component';
import { LoanService } from '../../core/services/loan.service';
import { LoanPaymentComponent } from '../../loan-payment/loan-payment/loan-payment.component';



@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,UserSavingBoxComponent,SuppliesPaymentComponent,LoanPaymentComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export default class SummaryComponent {

  associateMembers: any;
  supplies: any[] = [];
  loans: any[] = [];
  userId : number | undefined;

  constructor(private userService: UserService, private savingService: SavingService, 
    private associateService: AssociateService,private userSavingBoxService: UserSavingBoxService,
    private suppliesService: SuppliesService,private loanService: LoanService)
  {}

  @ViewChild('paymentModal') paymentModal!: SuppliesPaymentComponent;
  @ViewChild('loanModal') loanModal!: LoanPaymentComponent;

  
  removeAssociateMember(userId: number, associateId: number) {
    this.associateService.removeAssociate(userId, associateId).subscribe({
      next: () => {
        console.log('Asociado eliminado');
        Swal.fire({
          icon: 'success',
          title: 'Miembro eliminado !',
          text: 'Miembro eliminado correctamente'
        });
      },
      error: (err) => {
        console.error('Error al eliminar el Associado por defecto:', err);
      }
    })
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
        this.loadSupplies();
        this.loadLoans();
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
        console.log('Caja de ahorro del usuario:', data);
        if (data.response.length === 0) {
          this.userSavingsBox = null;
        } else {
          // Si esperas un solo registro, toma el primero
          this.userSavingsBox = data.response[0];
          this.totalSavings = data.response[0].boxValue;
  
        }
        
      },
      error: (error) => {
        console.error('Error al obtener la caja de ahorro del usuario:', error);
        this.totalSavings = 0; // Si no se obtienen ahorros, saldo es 0
      }
    });
  }

  loadSupplies() {
    this.suppliesService.getSupplies(this.associateData.id).subscribe({
      next: (data: any) => {
        this.supplies = data;
        console.log(this.supplies)
      },
      error: (error) => {
        console.error('Error al obtener suministros:', error);
      }
    });
  }
  
  viewDetails(supply: any) {
    this.paymentModal.supply = supply; // Pasa los datos del suministro al modal.
    this.paymentModal.openModal(); // Abre el modal llamando al método del componente hijo.
    this.userId = this.associateData.id
  }

  viewDetailsLoan(loan: any){
    this.loanModal.loan = loan;
    this.loanModal.openModal();
  }

  loadLoans() {
    this.loanService.getLoans(this.associateData.id).subscribe({
      next: (data: any) => {
        this.loans = data
      },
      error: (error) => {
        console.error('Error al obtener préstamos:', error); 
      }
    });
  }
  
  viewDetail(arg0: any,arg1: any) {
    throw new Error('Method not implemented.');
  }

}


