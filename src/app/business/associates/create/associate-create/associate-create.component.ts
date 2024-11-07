import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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
      console.log('Datos del socio:', formData);
      // Aquí puedes enviar la información al backend para guardar
      this.closeModal();
    }
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
