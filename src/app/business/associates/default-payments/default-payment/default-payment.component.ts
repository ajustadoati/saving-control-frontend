import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DefaultPaymentService } from '../../../core/services/default-payment.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../../core/services/product.service';
import { Associate } from '../../../interfaces/associate';
import { User } from '../../../interfaces/user';
import { ContributionService } from '../../../core/services/contribution.service';

@Component({
  selector: 'app-default-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './default-payment.component.html',
  styleUrl: './default-payment.component.css'
})
export class DefaultPaymentComponent implements OnInit {
  paymentForm: FormGroup;
  products: Product[] = []; // Lista de productos obtenidos del servicio
  selectedPaymentName: any; // Pago seleccionado en el select
  amount: number = 0;
  selectedAssociation: number | null = null;


  @Output() paymentAdded = new EventEmitter<void>();

  @Input() associateData!: any; 
  isMemberSelected = false;
  isSharingSelected = false;
  isSupplySelected = false;
  isLoanPaymentSelected = false;
  isAdministrativeSelected = false;
  isLoanInterestSelected = false;
  isSavingSelected = false;
  contributions: any;

  constructor(
    private fb: FormBuilder,
    private defaultPaymentService: DefaultPaymentService,
    private productService: ProductService,
    private contributionService: ContributionService
  ) {
    this.paymentForm = this.fb.group({
      defaultPaymentName: [''],
      selectedAssociation:[0],
      selectedPaymentSharing:[0],
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadContributions();
  }

  loadProducts(): void {
    
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data; // Asigna la lista de productos
        this.paymentForm.patchValue({ defaultPaymentName: this.products[0].name });
        this.isMemberSelected = this.products[0].name === 'Esposa(o)';
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  loadContributions(): void {
    console.log("locading contributions");
    this.contributionService.getContributions().subscribe({
      next: (data: any) => {
        console.log("locading contributions", data);
        this.contributions = data;
      },
      error: (err) => {
        console.error('Error al cargar las contribuciones:', err);
      }
    });
  }

  onPaymentNameChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.isMemberSelected = selectedValue === 'Esposa(o)' || selectedValue === 'Hijos';
    this.isSharingSelected = selectedValue === 'Compartir' || selectedValue === 'Administrativo';
    this.isLoanInterestSelected = selectedValue === 'Interés de préstamo';
    this.isLoanPaymentSelected = selectedValue === 'Abono a préstamo';
    this.isSupplySelected = selectedValue === 'Suministro';
    this.isSavingSelected = selectedValue === 'Caja de Ahorro';

    if (selectedValue === 'Compartir' || selectedValue === 'Administrativo') {
      this.selectedPaymentName = this.contributions.find(
        (contribution: { description: string; }) => contribution.description === selectedValue
      );
      console.log("Selected payment name", this.selectedPaymentName);
    } else {
      console.log("Selected payment name", selectedValue);
      this.selectedPaymentName = selectedValue;
    } 

    

  }

  onSubmit() {
      console.log("saving form", this.paymentForm.value);
      if (this.paymentForm.valid) {
        const paymentData = this.paymentForm.value;
      
        // Revisar si "Ahorro Miembro" ha sido seleccionado y formatear el nombre del pago en consecuencia
        if (this.isMemberSelected) {
          /*const selectedAssociationId = paymentData.selectedAssociation;
        
          const selectedMember = this.associateData.associates.find(
            (member: { id: any }) => member.id === +selectedAssociationId
          );

          if (selectedMember) {
            //paymentData.defaultPaymentName = `Caja de Ahorro - ${this.selectedPaymentName} - ${selectedMember.id}`;
            paymentData.defaultPaymentName = `Caja de Ahorro - ${this.selectedPaymentName}`;
          }*/
          paymentData.defaultPaymentName = this.selectedPaymentName;
        } else if ( this.isSharingSelected) {
          console.log ("Selected sharing", this.selectedPaymentName);
  
            paymentData.defaultPaymentName = this.selectedPaymentName.description;
            //paymentData.amount = this.selectedPaymentName.amount;
          
        } else {
          if (paymentData.defaultPaymentName !== 'Caja de Ahorro') {
            paymentData.defaultPaymentName = this.selectedPaymentName;
          }
          
        }

        const payload = {defaultPaymentName: paymentData.defaultPaymentName, amount: paymentData.amount};
        this.defaultPaymentService.registerPayment(this.associateData.id, payload).subscribe({
          next: () => {
            console.log('Pago registrado exitosamente');
            this.paymentForm.reset({ amount: 0 });
            this.paymentAdded.emit();
          },
          error: (err) => console.error('Error al registrar el pago:', err)
        });
    }
  }

  
  // Output para comunicar el cierre del modal al componente padre
  @Output() closeModalEvent = new EventEmitter<void>();

  // Método para emitir el evento de cierre
  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
