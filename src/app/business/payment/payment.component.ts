import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { SavingService } from '../core/services/saving.service';
import { map } from 'rxjs';
import { Saving } from '../interfaces/saving';
import Swal from 'sweetalert2';
import { PaymentReceiptComponent } from './receipt/payment-receipt/payment-receipt.component';
import { DefaultPaymentService } from '../core/services/default-payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaymentReceiptComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export default class PaymentComponent {

  constructor(private userService: UserService, private savingService: SavingService, 
    private defaultPaymentService: DefaultPaymentService) {
  
   }

  @ViewChild(PaymentReceiptComponent, { static: false })
  paymentReceiptComponent!: PaymentReceiptComponent; 


  currentDate: Date = new Date();
  
  associateFound: boolean = false;

  paymentsActivated: boolean = false;

  totalSavings!: number;
  
  paymentDate: string = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  defaultPayments = [
    { paymentTitle: 'Ahorro', hourlyRate: 75, defaultPaymentsCount: 1, totalCost: 75 }
  ];

  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  showReceiptModal = false; // Controla la visibilidad del modal
  totalPaid: number = 0; // Total de pagos realizados

  // Abre el modal
  openReceiptModal(): void {

    this.totalPaid = this.defaultPayments.reduce((sum, attendee) => sum + (attendee.hourlyRate * attendee.defaultPaymentsCount), 0);
    this.showReceiptModal = true;
  }

  ngAfterViewInit() {
    console.log(this.paymentReceiptComponent); // Esto debería mostrar el componente en la consola si está bien cargado
  }

  // Cierra el modal
  closeModal(): void {
    this.showReceiptModal = false;
  }

  // Genera el PDF
  generatePDF(): void {
    if (this.paymentReceiptComponent) {
      this.paymentReceiptComponent.generatePDF(); // Llama al método del componente hijo
      this.closeModal(); // Cierra el modal después de generar el PDF
    } else {
      console.error('Error: No se encontró el componente PaymentReceiptComponent');
    }
  }

  paymentTypes: string[] = [];

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;
        this.paymentsActivated = true; // Activa la sección de pagos

        // Ahora busca los ahorros de este socio
        this.savingService.getSavingsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            const totalSavings = response.savings.reduce((sum: number, saving: any) => sum + saving.amount, 0);
            this.totalSavings = totalSavings;
          },
          error: (error) => {
            console.error('Error al obtener los ahorros:', error);
            this.totalSavings = 0; // Si no se obtienen ahorros, saldo es 0
          }
        });

        this.defaultPaymentService.getDefaultPaymentsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            console.log('defaultpayments:', response);
            if (response.defaultPayments.length > 0){
              this.defaultPayments.pop();
              response.defaultPayments.forEach((defaultPayment: {id: number, paymentName: string, amount: number}) => {
   
                this.defaultPayments.push({paymentTitle: defaultPayment.paymentName, hourlyRate: defaultPayment.amount, defaultPaymentsCount: 1, totalCost: defaultPayment.amount});
                this.paymentTypes.push(defaultPayment.paymentName);
              })
              this.updateTotal();
            } else {
              this.defaultPayments.pop();
              this.paymentTypes.push('Ahorro');
              this.defaultPayments.push({paymentTitle: 'Ahorro', hourlyRate: 0, defaultPaymentsCount: 1, totalCost: 0});
         
            }
          }, 
          error: (error) => {
            console.error('Error al obtener los pagos por defecto:', error);
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
        this.paymentsActivated = false;
        this.totalSavings = 0; // Si no se encuentra el socio, no hay saldo
      },
    });
  }



  // Estado de   la aplicación
  location = 'US';
  frequency = 'daily';
  duration = 1;
 
  meetingTotal = 0;
  yearlyCost = 0;
  associateId: any;

  // Actualizar tarifas por hora basado en la ubicación seleccionada
  updateTotal() {
    this.defaultPayments.forEach(attendee => {
      this.updateTotalCost();
    });
  }


  // Función para actualizar el costo total de la reunión
  updateTotalCost() {
    console.log("attendes: ", this.defaultPayments)
    this.meetingTotal = this.defaultPayments.reduce((total, attendee) => {
      const attendeeCost = attendee.hourlyRate * attendee.defaultPaymentsCount * this.duration;
      attendee.totalCost = attendeeCost;
      return total + attendeeCost;
    }, 0);
  }


  // Agregar un nuevo asistente
  addAttendee() {
    this.paymentsActivated = true;
    this.defaultPayments.push({ paymentTitle: '', hourlyRate: 0, defaultPaymentsCount: 1, totalCost: 0 });
    this.updateTotalCost();
  }

  // Eliminar un asistente
  removeAttendee(index: number) {
    this.defaultPayments.splice(index, 1);
    this.updateTotalCost();
  }

  registerPayments(): void {

    const payments: Saving[] = this.defaultPayments.map((attendee) => ({
      savingId: 0,
      savingDate: this.paymentDate,
      amount: attendee.hourlyRate,
      associateId: attendee.paymentTitle.startsWith('Ahorro -') 
                    ? parseInt(attendee.paymentTitle.split('-')[3]) 
                    : null, 
    }));
    console.log("Id asociado", this.associateId);
    this.savingService.addSavingListByUserId(this.associateData.id, payments).subscribe(
      (response) => {
        console.log('Pagos registrados exitosamente:', response);
        this.paymentsActivated = false;
        this.savingService.getSavingsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            // Calcular el saldo total sumando los ahorros
            const totalSavings = response.savings.reduce((sum: number, saving: any) => sum + saving.amount, 0);
            this.totalSavings = totalSavings;
          },
          error: (error) => {
            console.error('Error al obtener los ahorros:', error);
            this.totalSavings = 0; // Si no se obtienen ahorros, saldo es 0
          }
        });
      },
      (error) => {
        console.error('Error registrando pagos:', error);
      }
    );
  }
}
