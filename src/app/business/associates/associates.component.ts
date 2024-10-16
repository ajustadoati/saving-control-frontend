import { Component } from '@angular/core';
import { Associate } from '../interfaces/associate';
import { Member } from '../interfaces/member';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-associates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './associates.component.html',
  styleUrl: './associates.component.css'
})
export default class AssociatesComponent {
  socios = [
    { id: 1, name: 'Socio 1', associates: [{ id: 2, name: 'Miembro 1' }, { id: 3, name: 'Miembro 2' }] },
    { id: 4, name: 'Socio 2', associates: [{ id: 5, name: 'Miembro 3' }] },
    { id: 6, name: 'Socio 3', associates: [] }
  ];

  filteredSocios: any[] = [];
  selectedSocio: any = null;
  searchTerm: string = '';

  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      payments: this.fb.array([])  // FormArray para múltiples pagos
    });
  }

  ngOnInit(): void {
    this.filteredSocios = this.socios;
  }

  // Método para filtrar la lista de socios
  filterSocios(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredSocios = this.socios.filter(socio =>
      socio.name.toLowerCase().includes(searchTermLower)
    );
  }

  // Método para seleccionar un soci

  onSelectSocio(selectedSocio: any): void {
    this.selectedSocio = selectedSocio;
    this.buildPaymentForms();  // Crea los formularios de pago para el socio y asociados
    console.log('Socio seleccionado:', selectedSocio);  // Para verificar que el socio se ha seleccionado correctamente
  }

  // Método para construir los formularios de pago para el socio y sus asociados
  buildPaymentForms(): void {
    const paymentsArray = this.paymentForm.get('payments') as FormArray;
    paymentsArray.clear();  // Limpiar formularios anteriores

    // Formulario para el socio principal
    paymentsArray.push(this.fb.group({
      userId: [this.selectedSocio.id, Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentDate: ['', Validators.required]
    }));

    // Formularios para los miembros asociados
    this.selectedSocio.associates.forEach((associate: any) => {
      paymentsArray.push(this.fb.group({
        userId: [associate.id, Validators.required],
        amount: ['', [Validators.required, Validators.min(0.01)]],
        paymentDate: ['', Validators.required]
      }));
    });
  }

  // Método para enviar los pagos
  onSubmit(): void {
    if (this.paymentForm.valid) {
      const paymentData = this.paymentForm.value.payments;
      console.log('Datos de los pagos:', paymentData);

      // Lógica para enviar los datos al backend
      // this.http.post('/api/multiple-payments', paymentData).subscribe(...);
    }
  }

  get paymentsControls() {
    return (this.paymentForm.get('payments') as FormArray).controls;
  }


}
