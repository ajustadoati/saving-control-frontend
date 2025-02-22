import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserSavingsBox } from '../../interfaces/userSavingBox';
import { UserSavingBoxService } from '../../core/services/user-saving-box.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-saving-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-saving-box.component.html',
  styleUrl: './user-saving-box.component.css'
})
export class UserSavingBoxComponent {
  @Input() userId!: number; // ID del socio, pasado desde el componente padre
  @Output() boxAdded = new EventEmitter<UserSavingsBox>(); // Emite el nuevo registro

  boxForm: FormGroup;
  showModal: boolean = false;
  @Input() userSavingsBox: UserSavingsBox | null = null;

  constructor(
    private fb: FormBuilder,
    private userSavingBoxService: UserSavingBoxService
  ) {
    this.boxForm = this.fb.group({
      boxCount: [null, [Validators.required, Validators.min(1)]],
      boxValue: [18.00, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.boxForm.valid) {
      const formData = this.boxForm.value;
      formData.userId = this.userId;
      formData.updatedAt = new Date();
      // Llamada al servicio para crear o actualizar la caja de ahorro del socio
      this.userSavingBoxService.saveSavingBox(formData)
        .subscribe({
          next: (data: UserSavingsBox) => {
            this.boxAdded.emit(data);
            this.closeModal();
          },
          error: (err) => {
            console.error('Error al agregar caja de ahorro', err);
          }
        });
    }
  }
}
