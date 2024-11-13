import { Component, EventEmitter, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { DefaultPaymentService } from '../../../core/services/default-payment.service';
import { SavingService } from '../../../core/services/saving.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefaultPaymentComponent } from '../../default-payments/default-payment/default-payment.component';

@Component({
  selector: 'app-associate-member',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DefaultPaymentComponent],
  templateUrl: './associate-member.component.html',
  styleUrl: './associate-member.component.css'
})
export class AssociateMemberComponent {

  constructor(private userService: UserService) { }

  associateId : string = '';
  associateData : any;

  @Output() closeAssociateMemberModalEvent = new EventEmitter<void>();
  
  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });

      },
    });
  }

  closeAssociateMemberModal(): void {
    this.closeAssociateMemberModalEvent.emit();
  }

}
