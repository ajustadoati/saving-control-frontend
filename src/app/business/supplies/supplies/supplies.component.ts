import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { SuppliesService } from '../../core/services/supplies.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuppliesPaymentComponent } from '../../supplies-payment/supplies-payment/supplies-payment.component';


@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, SuppliesPaymentComponent],
  templateUrl: './supplies.component.html',
  styleUrl: './supplies.component.css'
})
export default class SuppliesComponent {
  associateId: any;
  loans: any[] = [];
  supplies: any[] = [];
  isModalOpen: boolean = false;
  associateFound: boolean = false;
  supplyForm: FormGroup;

  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  constructor(private userService: UserService, private suppliesService: SuppliesService, private fb: FormBuilder) {
   
    // Inicializar el formulario de suministro
    this.supplyForm = this.fb.group({
      supplyName: ['', [Validators.required]],
      supplyAmount: ['', [Validators.required, Validators.min(1)]],
      supplyDate: ['', [Validators.required]]
    });
  }

  @ViewChild('paymentModal') paymentModal!: SuppliesPaymentComponent;

  // Simular búsqueda de socio
  searchAssociate() {
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data;
        this.associateFound = true;
        this.loadSupplies();
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
  }

  loadSupplies() {
    this.suppliesService.getLoans(this.associateData.id).subscribe({
      next: (data: any) => {
        this.supplies = data;
        console.log(this.supplies)
      },
      error: (error) => {
        console.error('Error al obtener suministros:', error);
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.supplyForm.reset(); // Resetear el formulario
  }

  submitSupply() {
    if (this.supplyForm.valid) {
      const supplyData = this.supplyForm.value;
      supplyData.userId = this.associateData.id; // Agregar el ID del usuario
      console.log(supplyData)
      this.suppliesService.createSupply(supplyData).subscribe({
        next: (response) => {
          console.log('Suministro creado:', response);
          Swal.fire({
            icon: 'success',
            title: '¡Suministro creado!',
            text: 'El suministro ha sido creado con éxito.',
          });
          this.loadSupplies();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear suministro:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al crear el suministro. Por favor, inténtalo de nuevo.',
          });
        }
      });
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }

  viewDetails(supply: any) {
    this.paymentModal.supply = supply; // Pasa los datos del suministro al modal.
    this.paymentModal.openModal(); // Abre el modal llamando al método del componente hijo.
  }



}
