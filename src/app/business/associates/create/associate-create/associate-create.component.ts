import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-associate-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './associate-create.component.html',
  styleUrl: './associate-create.component.css'
})
export class AssociateCreateComponent {

  @Input() associate: any = null; // Recibe los datos del socio si se va a editar
  @Output() closeModalEvent = new EventEmitter<void>();
  associateForm: FormGroup;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.associateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      numberId: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: ['']
    });
  }

  ngOnInit(): void {
    if (this.associate) {
      this.isEditMode = true;
      this.associateForm.patchValue(this.associate);
    }
  }

  onSubmit(): void {
    if (this.associateForm.valid) {
      const formData = this.associateForm.value;
      formData.roles = ['ASSOCIATE']; 
      console.log('Datos del socio antes de enviar:', formData);
  
      if (this.isEditMode) {
        // Lógica para editar el socio
      } else {
        this.userService.addUsers(formData).subscribe({
          next: (response) => {
            console.log('Socio añadido exitosamente', response.associate);
            this.closeModal();
            Swal.fire({
              icon: 'success',
              title: '¡Usuario registrado!',
              text: 'El usuario ha sido registrado con éxito.',
            });
          },
          error: (error) => {
            console.error('Error al añadir socio', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.',
            });
          },
          complete: () => {
            console.log('Operación completada');
          }
        });
      }
    }
  }
  
  

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
