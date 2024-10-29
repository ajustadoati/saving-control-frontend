import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { SavingService } from '../core/services/saving.service';
import { map } from 'rxjs';
import { Saving } from '../interfaces/saving';
import Swal from 'sweetalert2';
import { PaymentReceiptComponent } from './receipt/payment-receipt/payment-receipt.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaymentReceiptComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export default class PaymentComponent {

  constructor(private userService: UserService, private savingService: SavingService) {
  
   }

  @ViewChild(PaymentReceiptComponent, { static: false })
  paymentReceiptComponent!: PaymentReceiptComponent; 


  currentDate: Date = new Date();
  
  associateFound: boolean = false;

  paymentsActivated: boolean = false;

  totalSavings!: number;
  
  paymentDate: string = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD


  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  showReceiptModal = false; // Controla la visibilidad del modal
  totalPaid: number = 0; // Total de pagos realizados

  // Abre el modal
  openReceiptModal(): void {
    console.log("calling modal");
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

  paymentTypes: string[] = ['Ahorro', 'Interes', 'Lubricantes', 'Compartir'];

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;
        this.paymentsActivated = true; // Activa la sección de pagos

        if (this.associateData.associates && this.associateData.associates.length > 0) {
          this.associateData.associates.forEach((associate: { id: any; relationship: string}) => {
            this.paymentTypes.push(`Ahorro-${associate.relationship}-${associate.id}`);
          });
        }

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
        this.paymentsActivated = false;
        this.totalSavings = 0; // Si no se encuentra el socio, no hay saldo
      },
    });
  }

  hourlyRates: any = {
    US: {
      Ahorro: 75,
      AhorroAsociado: 10,
      Interes: 7,
      Capital: 100,
      Compartir: 2,
      Lubricantes: 100,
    }
  };

  // Estado de   la aplicación
  location = 'US';
  frequency = 'daily';
  duration = 1;
  defaultPayments = [
    { paymentTitle: 'Ahorro', hourlyRate: 75, defaultPaymentsCount: 1, totalCost: 75 }
  ];
  meetingTotal = 0;
  yearlyCost = 0;
  associateId: any;

  // Actualizar tarifas por hora basado en la ubicación seleccionada
  updateHourlyRates() {
    this.defaultPayments.forEach(attendee => {
      //attendee.hourlyRate = this.hourlyRates[this.location][attendee.paymentTitle];
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
      associateId: attendee.paymentTitle.startsWith('Ahorro-') 
                    ? parseInt(attendee.paymentTitle.split('-')[2]) 
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
