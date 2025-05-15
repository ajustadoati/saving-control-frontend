import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoanPaymentService } from '../../core/services/loan-payment.service';

@Component({
  selector: 'app-loan-payment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './loan-payment.component.html',
  styleUrl: './loan-payment.component.css'
})

export class LoanPaymentComponent {
   @Input() loan: any;  
    isOpen = false; 
    loanPayment: any[] = [];
    loanId: any;
    constructor(private loanPaymentService: LoanPaymentService){}

  openModal(){
    this.loanPayment = []; // Limpiar los datos previos
    this.loanId = this.loan[0]?.loanId; 
    this.isOpen = true; 
    this.loadPayment(); // Cargar los pagos del préstamo actual
    console.log('Loan ID:', this.loanId); // Para verificar que el valor se asignó correctamente    
    console.log(this.loan)
  }


  closeModal(){
    this.isOpen = false
  }

  loadPayment(){
    this.loanPaymentService.getLoansPayment(this.loanId).subscribe({
      next: (data: any) => {
        this.loanPayment = data;
        console.log(this.loanPayment,this.loanId)
      },
      error: (error) => {
        console.log('Error al obtener los pagos de los suministros')
      }
    })
  }
  

}


