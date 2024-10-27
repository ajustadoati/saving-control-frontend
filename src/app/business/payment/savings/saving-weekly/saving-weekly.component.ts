import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-saving-weekly',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saving-weekly.component.html',
  styleUrl: './saving-weekly.component.css'
})
export default class SavingWeeklyComponent {

  currentDate: Date = new Date(); // Fecha actual
  weeks: { weekNumber: number; start: string; end: string; wednesday:string }[] = [];

  users: User[] = [];
  totalUsers: number = 0;

  totalByWeek: number[] = [];
  totalRecaudado: number = 0;

  page: number = 0; // Página actual (indexada desde 0)
  size: number = 20; // Tamaño de la página
  totalPages: number = 1; // Número total de páginas

  constructor(private userService: UserService) {
    this.generateWeeksOfMonth(this.currentDate);
    this.loadPaymentsForCurrentMonth(); // Cargar los pagos del mes actual
  }

  generateWeeksOfMonth(date: Date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.weeks = [];
  
    let currentWeekStart = startOfMonth;
  
    // Generar semanas hasta el final del mes actual
    while (currentWeekStart <= endOfMonth) {
      const currentWeekEnd = new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() + (6 - currentWeekStart.getDay())
      );

      const wednesday = new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() + (3 - currentWeekStart.getDay())
      );

      /*if (wednesday >= startOfMonth && wednesday <= endOfMonth) {
        this.weeks.push({
          weekNumber: this.weeks.length + 1,
          wednesday: wednesday.getDate(), // Extraer solo el número del día
        });
      }*/
  
      this.weeks.push({
        weekNumber: this.weeks.length + 1,
        start: this.formatDate(currentWeekStart),
        end: currentWeekEnd <= endOfMonth
          ? this.formatDate(currentWeekEnd)
          : this.formatDate(endOfMonth),
          wednesday: this.formatWednesday(wednesday)
      });
  
      currentWeekStart = new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() + 7
      );
    }
  }

  formatWednesday(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0'); // Formato de dos dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Formato de dos dígitos
    return `${day}-${month}`; // Retorna el formato "03-10"
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  changePage(pageOffset: number) {
    console.log("changing page",this.page);
    const newPage = this.page + pageOffset;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadPaymentsForCurrentMonth();
    }
  }

  changeMonth(offset: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
    this.page = 0;
    this.generateWeeksOfMonth(this.currentDate);
    this.loadPaymentsForCurrentMonth();
  }

  // Aquí hacemos la llamada única al backend para obtener los pagos del mes
  loadPaymentsForCurrentMonth() {
    const startOfMonth = this.weeks[0].start;
    const endOfMonth = this.weeks[this.weeks.length - 1].end;

    // Llamada al backend para obtener todos los pagos dentro del rango de fechas del mes
    this.userService.getUsersWithSavings(startOfMonth, endOfMonth, this.page, this.size).subscribe({
      next: (data) => {
        console.log("data",data);
        this.users = data.users; // Actualiza los usuarios con los datos recibidos
        this.totalPages = data.totalPages; // Actualiza el número total de páginas
        this.totalUsers = data.totalElements; //
        this.calculateWeeklyPayments(); // Procesar los pagos semanales
      },
      error: (e) => console.error(e),
    });
  }


  // Dividir los pagos del mes en semanas y calcular los totales
  calculateWeeklyPayments() {
    this.totalByWeek = Array(this.weeks.length).fill(0); // Inicializa los totales por semana
    this.totalRecaudado = 0; // Reinicia el total recaudado
  
    this.users.forEach((user) => {
      // Crea un arreglo para almacenar los pagos de cada semana
      user.weeklyPayments = Array(this.weeks.length).fill(0);
  
      user.savings.forEach((saving) => {
        const paymentDate = new Date(saving.savingDate);
        const formattedPaymentDate = this.formatWednesday(paymentDate);
  
        // Verifica si la fecha del pago coincide con el miércoles de alguna semana
        const weekIndex = this.weeks.findIndex(
          week => formattedPaymentDate === week.wednesday
        );
  
        if (weekIndex !== -1) {
          // Si el pago corresponde al miércoles de esa semana, suma el monto al índice correspondiente
          user.weeklyPayments[weekIndex] += saving.amount;
          this.totalByWeek[weekIndex] += saving.amount; // Sumar al total de la semana
        }
      });
  
      // Suma el total recaudado por cada usuario
      user.totalRecaudado = user.weeklyPayments.reduce((acc, payment) => acc + payment, 0);
      this.totalRecaudado += user.totalRecaudado;
    });
  }
  
  
  /**
   * const weekIndex = this.weeks.findIndex(
        week => paymentDate.toISOString().split('T')[0] === new Date(week.wednesday).toISOString().split('T')[0]
      );

      if (weekIndex !== -1) {
        // Si el pago corresponde a un miércoles, se suma el monto del pago a la semana correspondiente
        this.totalByWeek[weekIndex] += saving.amount;
        user.weeklyPayments[weekIndex] = saving.amount;
      }
   */
}
