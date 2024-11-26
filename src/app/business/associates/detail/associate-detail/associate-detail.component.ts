import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SavingService } from '../../../core/services/saving.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-associate-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './associate-detail.component.html',
  styleUrl: './associate-detail.component.css'
})
export class AssociateDetailComponent implements OnInit{

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.editForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      mobileNumber: [''],
      email: [''],
      company: [''],
    });
  }

  @Input() selectedUser: any;
  isEditing = false;
  editForm: FormGroup;
  // Output para comunicar el cierre del modal al componente padre
  @Output() closeModalEvent = new EventEmitter<void>();
  editUser: any = {};

  ngOnInit(): void {
    this.editUser = { ...this.selectedUser };
  }
  
  
  // Método para emitir el evento de cierre
  closeModal(): void {
    this.closeModalEvent.emit();
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.editForm.patchValue(this.selectedUser);
  }

  saveChanges(): void {

    if (!this.editUser || !this.editUser.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pueden guardar los cambios. Datos del usuario no válidos.'
      });
      return;
    }

    const updates: any = {};
  for (const key in this.editUser) {
    if (this.editUser[key] !== this.selectedUser[key]) {
      updates[key] = this.editUser[key];
    }
  }

  // Verificar si hay cambios antes de enviar
  if (Object.keys(updates).length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin Cambios',
      text: 'No se realizaron cambios para guardar.'
    });
    return;
  }

    this.userService.updateUser(this.editUser.id, updates).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Cambios Guardados',
          text: 'El usuario ha sido actualizado correctamente.'
        });
        this.closeModal(); // Emitir evento para cerrar modal
      },
      error: (error) => {
        console.error('Error actualizando el usuario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los cambios.'
        });
      }
    });

  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm.reset();
  }


}
