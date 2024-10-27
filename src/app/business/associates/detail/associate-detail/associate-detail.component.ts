import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SavingService } from '../../../core/services/saving.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-associate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associate-detail.component.html',
  styleUrl: './associate-detail.component.css'
})
export class AssociateDetailComponent implements OnInit{

  payments: any[] = [];        // Variable para almacenar los pagos del socio
  savings: any[] = []; 
  totalSavings!: number;

  constructor(
    private userService: UserService, 
    private savingService: SavingService // Inyectar servicios necesarios
  ) {}


  ngOnInit(): void {
    this.loadUserPayments();
  }

  loadUserPayments(): void {
    // Aquí haces la llamada al servicio para obtener los pagos
    if (this.selectedUser) {
     

      // Llama también a los ahorros si es necesario
      this.savingService.getSavingsByUserId(this.selectedUser.id).subscribe({
        next: (response: any) => {
          console.log('Ahorros obtenidos:', response.savings); // Verificar los ahorros obtenidos
          
          // Calcular el saldo total sumando los ahorros
          const totalSavings = response.savings.reduce((sum: number, saving: any) => sum + saving.amount, 0);
          this.totalSavings = totalSavings;
          this.savings = response.savings;
          console.log('Saldo total:', this.totalSavings);
        },
        error: (error) => {
          console.error('Error al obtener los ahorros:', error);
          this.savings = [];
          this.totalSavings = 0; // Si no se obtienen ahorros, saldo es 0
        }
      }
      );
    }
  }

  
  @Input() selectedUser: any;
  
  // Output para comunicar el cierre del modal al componente padre
  @Output() closeModalEvent = new EventEmitter<void>();

  // Método para emitir el evento de cierre
  closeModal(): void {
    this.closeModalEvent.emit();
  }


}
