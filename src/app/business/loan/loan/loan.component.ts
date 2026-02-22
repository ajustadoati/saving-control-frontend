import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ContributionService } from '../../core/services/contribution.service';
import { DefaultPaymentService } from '../../core/services/default-payment.service';
import { UserService } from '../../core/services/user.service';
import { LoanService } from '../../core/services/loan.service';
import { LoanTypeService } from '../../core/services/loan-type.service';
import { LoanPaymentComponent } from "../../loan-payment/loan-payment/loan-payment.component";

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, LoanPaymentComponent],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export default class LoanComponent implements OnInit{

   @ViewChild('loanModal') loanModal!: LoanPaymentComponent;
  viewDetailsLoan(loan: any){
    this.loanModal.loan = loan;
    this.loanModal.openModal();
  }

  ngOnInit() {
    // Cargar tipos de préstamos
    this.loanTypeService.getLoanTypes().subscribe({
      next: (data: any) => {
        this.loanTypes = data
      },
      error: (error) => {
        console.error('Error al obtener los tipos de préstamo:', error); 
      }
    });

  }

  loanForm: FormGroup;
  selectedAssociate: any = null; // Datos del socio seleccionado
  loanBalance: number = 0;
  payments: { date: string; principal: number; interest: number; balance: number }[] = [];
  isModalOpen: boolean = false;
  associateId: any;
  associateQuery: string = '';
  associateResults: any[] = [];
  showAssociateResults: boolean = false;
  associateFound: boolean = false;
  loanTypes: any[] = [];
  loans: any[] = [];


  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  constructor(private fb: FormBuilder, private userService: UserService, private defaultPaymentService: DefaultPaymentService, 
    private contributionService: ContributionService, private loanService: LoanService, private loanTypeService: LoanTypeService) {
   


    // Formulario de creación de préstamo
    this.loanForm = this.fb.group({
      loanAmount: ['', [Validators.required, Validators.min(1)]],
      interestRate: ['', [Validators.required, Validators.min(0)]],
      loanTypeId: ['', Validators.required],
      loanBalance: [''],
      reason:[''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  // Simular búsqueda de socio
  searchAssociate() {
    const query = (this.associateQuery || '').trim();
    if (!query) {
      Swal.fire({
        icon: 'info',
        title: 'Búsqueda vacía',
        text: 'Ingresa nombre o cédula para buscar.'
      });
      return;
    }

    if (this.isNumericQuery(query)) {
      this.userService.getAssociateByNumberId(query).subscribe({
        next: (data) => {
          this.handleAssociateFound(data);
        },
        error: (error) => {
          console.error('Socio no encontrado:', error);
          Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'Por favor, verifica la cédula e intenta de nuevo.'
          });
          this.associateFound = false;
        },
      });
      return;
    }

    this.userService.searchAssociatesByName(query).subscribe({
      next: (users: any[]) => {
        this.associateResults = users;
        this.showAssociateResults = true;
        if (users.length === 1) {
          this.selectAssociate(users[0]);
        }
        if (users.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron socios con ese nombre.'
          });
        }
      },
      error: (error) => {
        console.error('Error al buscar socios por nombre:', error);
      }
    });
  }

  selectAssociate(user: any) {
    this.showAssociateResults = false;
    this.associateResults = [];
    this.associateId = user.numberId || user.id || '';
    this.handleAssociateFound(user);
  }

  private handleAssociateFound(data: any) {
    this.associateData = data; // Almacena los datos del socio
    console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
    this.associateFound = true;
    this.loanService.getLoans(this.associateData.id).subscribe({
      next: (data: any) => {
        this.loans = data
      },
      error: (error) => {
        console.error('Error al obtener préstamos:', error); 
      }
    });
  }

  private isNumericQuery(value: string): boolean {
    return /^[0-9]+$/.test(value);
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

  // Abrir el modal
  openModal() {
    this.isModalOpen = true;
  }

  // Cerrar el modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Crear préstamo
  submitLoan() {
    if (this.loanForm.valid) {
      const loanData = this.loanForm.value;
      this.loanBalance = loanData.loanAmount; // Inicializar balance con el monto del préstamo
      loanData.userId = this.associateData.id;
      loanData.loanBalance = this.loanBalance;
      this.loanService.saveLoan(loanData).subscribe({
        next: (response) => {
          console.log('Préstamo añadido exitosamente', response.loanResponse);
          Swal.fire({
            icon: 'success',
            title: '¡Préstamo creado!',
            text: 'El préstamo ha sido creado con éxito.',
          });
          this.loadLoans();
        },
        error: (error) => {
          console.error('Error al añadir préstamo', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al registrar el préstamo. Por favor, inténtalo de nuevo.',
          });
        },
        complete: () => {
          console.log('Operación completada');
        }
      });
      this.addPayment(loanData.loanAmount, 2); // Agregar el pago inicial
      this.isModalOpen = false; // Cerrar el modal
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }

  

  // Simular un pago (abono e interés)
  addPayment(principal: number, interest: number) {
    const paymentDate = new Date().toLocaleDateString();
    this.loanBalance -= principal; // Reducir balance con el monto principal
    this.payments.push({
      date: paymentDate,
      principal,
      interest,
      balance: this.loanBalance,
    });
  }

}
