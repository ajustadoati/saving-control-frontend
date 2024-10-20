import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { SavingService } from '../core/services/saving.service';
import { map } from 'rxjs';
import { Saving } from '../interfaces/saving';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export default class PaymentComponent {

  constructor(private userService: UserService, private savingService: SavingService) { }

  associateFound: boolean = false;

  paymentsActivated: boolean = false;

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
            this.paymentsActivated = true; // Activa la sección de pagos
      
            // Ahora busca los ahorros de este socio
            this.savingService.getSavingsByUserId(this.associateData.id).subscribe({
              next: (response: any) => {
                console.log('Ahorros obtenidos:', response.savings); // Verificar los ahorros obtenidos
                
                // Calcular el saldo total sumando los ahorros
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
      Interes: 7,
      Capital: 100,
      Compartir: 2,
      Lubricantes: 100,
    },
    EU: {
      Ahorro: 75,
      Interes: 60,
      Capital: 75,
      Compartir: 30,
      Lubricantes: 20,
    }
  };

  // Estado de   la aplicación
  location = 'US';
  frequency = 'daily';
  duration = 1;
  attendees = [
    { jobTitle: 'Ahorro', hourlyRate: 30, attendeesCount: 1, totalCost: 75 }
  ];
  meetingTotal = 0;
  yearlyCost = 0;
  associateId: any;

  // Actualizar tarifas por hora basado en la ubicación seleccionada
  updateHourlyRates() {
    this.attendees.forEach(attendee => {
      attendee.hourlyRate = this.hourlyRates[this.location][attendee.jobTitle];
      this.updateTotalCost();
    });
  }

  // Aplicar la plantilla de "Daily Stand-up"
  applyDailyStandUp() {
    this.frequency = 'daily';
    this.duration = 1; // 15 minutos
    this.attendees = [
      { jobTitle: 'Developer', hourlyRate: 75, attendeesCount: 1, totalCost: 75 },
      { jobTitle: 'QA', hourlyRate: 75, attendeesCount: 1, totalCost: 75 }
    ];
    this.updateTotalCost();
  }

  // Función para actualizar el costo total de la reunión
  updateTotalCost() {
    this.meetingTotal = this.attendees.reduce((total, attendee) => {
      const attendeeCost = attendee.hourlyRate * attendee.attendeesCount * this.duration;
      attendee.totalCost = attendeeCost;
      return total + attendeeCost;
    }, 0);
    this.updateYearlyCost();
  }

  // Actualizar el costo anual basado en la frecuencia
  updateYearlyCost() {
    let yearlyMultiplier = 1;
    switch (this.frequency) {
      case 'daily':
        yearlyMultiplier = 260; // Suponiendo 260 días laborables por año
        break;
      case 'weekly':
        yearlyMultiplier = 52; // Suponiendo 52 semanas laborales por año
        break;
      case 'monthly':
        yearlyMultiplier = 12;
        break;
      case 'quarterly':
        yearlyMultiplier = 4;
        break;
      case 'yearly':
        yearlyMultiplier = 1;
        break;
    }
    this.yearlyCost = this.meetingTotal * yearlyMultiplier;
  }

  // Agregar un nuevo asistente
  addAttendee() {
    this.paymentsActivated = true;
    this.attendees.push({ jobTitle: '', hourlyRate: 0, attendeesCount: 1, totalCost: 0 });
    this.updateTotalCost();
  }

  // Eliminar un asistente
  removeAttendee(index: number) {
    this.attendees.splice(index, 1);
    this.updateTotalCost();
  }

  registerPayments(): void {
    const today = new Date().toISOString().split('T')[0]; 
    const payments: Saving[] = this.attendees.map((attendee) => ({
      savingId: 0,
      savingDate: '2024-10-16',
      amount: attendee.hourlyRate,

    }));

    this.savingService.addSavingByUserId(this.associateData.id, payments[0]).subscribe(
      (response) => {
        console.log('Pagos registrados exitosamente:', response);
        this.paymentsActivated = false;
        this.savingService.getSavingsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            console.log('Ahorros obtenidos:', response.savings); // Verificar los ahorros obtenidos    
            // Calcular el saldo total sumando los ahorros
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
      (error) => {
        console.error('Error registrando pagos:', error);
      }
    );
  }
}
