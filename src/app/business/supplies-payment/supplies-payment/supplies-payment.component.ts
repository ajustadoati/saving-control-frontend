import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SuppliesPaymentService } from '../../core/services/supplies-payment.service';

@Component({
  selector: 'app-supplies-payment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './supplies-payment.component.html',
  styleUrl: './supplies-payment.component.css'
})

export class SuppliesPaymentComponent {
  @Input() supply: any; // Recibe los datos del suministro desde el componente padre.
  isOpen = false; 
  supplyForm: any;
  suppliesPayment: any[] = [];
  supplyId: any;

  constructor(private suppliesPaymentService: SuppliesPaymentService) {
  }

  openModal() {
    this.isOpen = true;
    this.suppliesPayment = []
    this.supplyId = this.supply[0]?.supplyId; // Asignación del supplyId al nuevo atributo
    this.loadPayment()
    console.log('supply ID:', this.supplyId); // Para verificar que el valor se asignó correctamente    
    console.log(this.supply)
  }

  closeModal() {
    this.isOpen = false;
  }

  loadPayment(){
    this.suppliesPaymentService.getSuppliesPayment(this.supplyId).subscribe({
      next: (data: any) => {
        this.suppliesPayment = data;
        console.log(this.suppliesPayment)
      },
      error: (error) => {
        console.log('Error al obtener los pagos de los suministros')
      }
    })
  }
}