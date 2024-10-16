import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export default class TablesComponent {

  associateFound: boolean = false;

  paymentsActivated: boolean = false;

  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };


searchAssociate() {
  console.log('Socio encontrado:');
  this.associateFound = true;  // Habilita la tabla de pagos
 
  throw new Error('Method not implemented.');
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
    { jobTitle: 'Ahorro', hourlyRate: 75, attendeesCount: 1, totalCost: 75 }
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

}
