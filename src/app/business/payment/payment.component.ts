import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { SavingService } from '../core/services/saving.service';
import { map } from 'rxjs';
import { Saving } from '../interfaces/saving';
import Swal from 'sweetalert2';
import { PaymentReceiptComponent } from './receipt/payment-receipt/payment-receipt.component';
import { DefaultPaymentService } from '../core/services/default-payment.service';
import { PaymentService } from '../core/services/payment.service';
import { Payment } from '../interfaces/payment';
import { PaymentDetail } from '../interfaces/paymentDetail';
import { ContributionService } from '../core/services/contribution.service';
import { ProductService } from '../core/services/product.service';
import { Product } from '../interfaces/product';
import { LoanService } from '../core/services/loan.service';
import { SuppliesService } from '../core/services/supplies.service';
import { Loan } from '../interfaces/loan';
import { UserBalanceService } from '../core/services/user-balance.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaymentReceiptComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export default class PaymentComponent {
  showButtomPrint: boolean = false;
  

  constructor(private userService: UserService, private savingService: SavingService, 
    private defaultPaymentService: DefaultPaymentService, private paymentService: PaymentService,
    private contributionService: ContributionService, private productService: ProductService, private loanService: LoanService, 
    private suppliesService:SuppliesService, private userBalance: UserBalanceService) {
  
   }

  @ViewChild(PaymentReceiptComponent, { static: false })
  paymentReceiptComponent!: PaymentReceiptComponent; 

  currentDate: Date = new Date();
  associateFound: boolean = false;
  paymentsActivated: boolean = false;
  referenceId: any;
  contributions: any;
  loans: any;
  supplies: any;
  summary: any;
  isSaving: boolean = false;

  payment: Payment = {
    userId: 0,
    date: '',
    payments: []
  };

  totalSavings!: number;

  isPrintEnabled: boolean = false;
  
  paymentDate: string = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  defaultPayments = [
    { paymentTitle: 'Ahorro', hourlyRate: 10, defaultPaymentsCount: 1, totalCost: 10 }
  ];

  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  showReceiptModal = false; // Controla la visibilidad del modal
  totalPaid: number = 0; // Total de pagos realizados

  // Abre el modal
  openReceiptModal(): void {

    this.totalPaid = this.defaultPayments.reduce((sum, attendee) => sum + (attendee.hourlyRate * attendee.defaultPaymentsCount), 0);
    this.showReceiptModal = true;
  }

  ngAfterViewInit() {
    console.log(this.paymentReceiptComponent); // Esto debería mostrar el componente en la consola si está bien cargado
  }

  // Cierra el modal
  closeModal(): void {
    this.showReceiptModal = false;
  }

  // Genera el PDF
  generatePDF(): void {
    if (this.paymentReceiptComponent) {
      this.paymentReceiptComponent.generatePDF(); // Llama al método del componente hijo
      this.closeModal(); // Cierra el modal después de generar el PDF
      this.resetData(); // Restablece los datos
        
    } else {
      console.error('Error: No se encontró el componente PaymentReceiptComponent');
    }
  }

  resetData(): void {
    this.associateId = ''; // Restablece el campo de búsqueda
      this.associateFound = false;
      this.paymentsActivated = false;
      this.defaultPayments = [{ paymentTitle: 'Ahorro', hourlyRate: 10, defaultPaymentsCount: 1, totalCost: 10 }];
      this.totalSavings = 0;
      this.paymentTypes = [];
      this.isPrintEnabled = false; 
      this.isSaving = false;
 
  }

  paymentTypes: string[] = [];

  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        console.log('Datos del socio:', this.associateData); // Verificar los datos del socio
        this.associateFound = true;
        this.paymentsActivated = true; // Activa la sección de pagos
        this.totalSavings = data.totalSavings;
        this.isSaving = false;
        this.defaultPaymentService.getDefaultPaymentsByUserId(this.associateData.id).subscribe({
          next: (response: any) => {
            console.log('defaultpayments:', response);
            if (response.defaultPayments.length > 0){
              this.defaultPayments.pop();
              response.defaultPayments.forEach((defaultPayment: {id: number, paymentName: string, amount: number}) => {
   
                this.defaultPayments.push({paymentTitle: defaultPayment.paymentName, hourlyRate: defaultPayment.amount, defaultPaymentsCount: 1, totalCost: defaultPayment.amount});
                this.paymentTypes.push(defaultPayment.paymentName);
              })
              this.updateTotal();
            } else {
              this.meetingTotal = 0;
              this.defaultPayments.pop();
              this.loadProducts();
              //this.paymentTypes.push('Ahorro');
              //this.defaultPayments.push({paymentTitle: 'Ahorro', hourlyRate: 0, defaultPaymentsCount: 1, totalCost: 0})
         
            }
          }, 
          error: (error) => {
            console.error('Error al obtener los pagos por defecto:', error);
          }
        });

        this.contributionService.getContributions().subscribe({
          next: (data: any) => {
            this.contributions = data
          },  
        error: (error) => {
          console.error('Error al obtener las contribuciones:', error); 
        }});
        this.loadBalance();
        
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });
        this.associateFound = false;
        this.paymentsActivated = false;
        this.totalSavings = 0; // Si no se encuentra el socio, no hay saldo
      },
    });
  }

  loadBalance() {
    this.loanService.getLoans(this.associateData.id).subscribe({
      next: (data: Loan[]) => {
        console.log("loans for the user:", data);
        if (data.length > 0) {
          this.loans = data.filter(loan => loan.loanBalance > 0)[0];
        } else {
          console.log("No hay prestamos");
          this.loans = {loanId: 0, loanBalance: 0, loanAmount: 0};

        }
  
      },error: (error) => { 
        console.error('Error al obtener los préstamos:', error); 
      }
      });
    
    this.suppliesService.getSupplies(this.associateData.id).subscribe({
      next: (data: any) => {
        console.log("supplies for the user:", data);
        if (data.length > 0) {
          this.supplies = data.filter((supply: { supplyBalance: number; }) => supply.supplyBalance > 0 )[0];
        } else {
          console.log("No hay suministros");
          this.supplies = {supplyId: 0, supplyBalance: 0, supplyAmount: 0};
        }
      },  
      error: (error) => {
        console.error('Error al obtener los suministros:', error); 
      }
    });
    this.userBalance.getSummary(this.associateData.id).subscribe({  
      next: (data: any) => {
        this.summary = data
      },  
      error: (error) => {
        console.error('Error al obtener el resumen:', error); 
      }
    });
  }

  // Estado de   la aplicación
  location = 'US';
  frequency = 'daily';
  duration = 1;
 
  meetingTotal = 0;
  yearlyCost = 0;
  associateId: any;

  // Actualizar tarifas por hora basado en la ubicación seleccionada
  updateTotal() {
    this.defaultPayments.forEach(attendee => {
      this.updateTotalCost();
    });
  }

  updateTotalCost() {
    this.meetingTotal = this.defaultPayments.reduce((total, attendee) => {
      const attendeeCost = attendee.hourlyRate * attendee.defaultPaymentsCount * this.duration;
      attendee.totalCost = attendeeCost;
      return total + attendeeCost;
    }, 0);
  }


  addAttendee() {
    this.paymentsActivated = true;
    this.loadProducts();
    this.updateTotalCost();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log("Searching products", products)
        // Mapea los productos a sus nombres para mostrarlos en el select
        this.paymentTypes = products.map((product) => product.name);

        // Agrega una nueva fila con opciones dinámicas
        this.defaultPayments.push({
          paymentTitle: '', // Deja el título vacío para que el usuario lo seleccione
          hourlyRate: 0,
          defaultPaymentsCount: 1,
          totalCost: 0,
        });
      },
      error: (error) => {
        this.defaultPayments.push({ paymentTitle: '', hourlyRate: 0, defaultPaymentsCount: 1, totalCost: 0 });
      },
    });
  }

  removeAttendee(index: number) {
    this.defaultPayments.splice(index, 1);
    this.updateTotalCost();
  }

  registerPayments(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    // Group defaultPayments by type
    const groupedPayments = this.defaultPayments.reduce((acc, payment) => {
      const type = this.getPaymentType(payment.paymentTitle); // Determine payment type dynamically
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(payment);
      return acc;
    }, {} as { [key: string]: any[] });
  
    // Process grouped payments
    const processedPayments = Object.keys(groupedPayments).flatMap((type) =>
      groupedPayments[type].map((payment) => {
        return this.mapPaymentToPayload(type, payment);
      })
    );
  
    // Prepare the final payload
    this.payment.payments = processedPayments;
    this.payment.userId = this.associateData.id;
    this.payment.date = this.paymentDate;
  
    // Send the payment list to the backend
    this.paymentService.addPaymentListByUserId(this.associateData.id, this.payment).subscribe({
      next: (response: any) => {
        console.log('Pagos registrados exitosamente:', response);
        this.paymentsActivated = false;
  
        this.userService.getAssociateById(this.associateData.id).subscribe({
          next: (response: any) => {
            this.totalSavings = response.totalSavings;
            this.isPrintEnabled = true;
            Swal.fire({
              icon: 'success',
              title: '¡Pago registrado!',
              text: 'El pago ha sido registrado con éxito.',
            });
            this.showButtomPrint = true;
            this.loadBalance();

          },
          error: (error) => {
            console.error('Error al obtener los ahorros:', error);
            this.totalSavings = 0;
          },
        });
      },
      error: (error) => {
        console.error('Error al registrar los pagos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Posiblemente el usuario ya tiene pagos registrados para la fecha, inténtalo de nuevo.',
        });
      },
    });
  }

  getPaymentType(paymentTitle: string): string {
    console.log("Payment title", paymentTitle);

    if (paymentTitle.startsWith('Caja de Ahorro')) {
      return 'SAVING';
    } if (paymentTitle.startsWith('Esposa(o)')) {
      return 'PARTNER_SAVING';
    }if (paymentTitle.startsWith('Hijos')) {
      return 'CHILDRENS_SAVING';
    } else if (paymentTitle.startsWith('Administrativo') ) {
      let paymentType = this.contributions.find((contribution: { description: string; }) => contribution.description === paymentTitle);
      this.referenceId = paymentType.id;
      return 'ADMINISTRATIVE';
    }  else if (paymentTitle.startsWith('Compartir') ) {
      let paymentType = this.contributions.find((contribution: { description: string; }) => contribution.description === paymentTitle);
      this.referenceId = paymentType.id;
      return 'SHARED_CONTRIBUTION';
    } else if (paymentTitle.startsWith('Interés de préstamo')) {
      return 'LOAN_INTEREST_PAYMENT';
    } else if (paymentTitle.startsWith('Abono a préstamo')) {
      return 'LOAN_PAYMENT';
    }else if (paymentTitle.startsWith('Interés préstamos 2')) {
      return 'LOAN_INTEREST_PAYMENT_EXTERNAL';
    } else if (paymentTitle.startsWith('Abono préstamos 2')) {
      return 'LOAN_PAYMENT_EXTERNAL';
    }else if (paymentTitle.startsWith('Suministro')) {
      return 'SUPPLIES';
    }if (paymentTitle.startsWith('Cauchos')) {
      return 'WHEELS';
    }
    // Add more types as needed
    return 'OTHER_PAYMENTS'; // Default type for unknown payment types
  }

  mapPaymentToPayload(type: string, payment: any): any {
    switch (type) {
      case 'SAVING':
        return {
          paymentType: 'SAVING',
          referenceId: null,
          userId: payment.paymentTitle.startsWith('Caja de Ahorro -')
            ? parseInt(payment.paymentTitle.split('-')[2])
            : null,
          amount: payment.hourlyRate,
        };
        
      case 'PARTNER_SAVING':
        return {
          paymentType: 'PARTNER_SAVING',
          referenceId: null,
          userId: payment.paymentTitle.startsWith('Caja de Ahorro -')
            ? parseInt(payment.paymentTitle.split('-')[2])
            : null,
          amount: payment.hourlyRate,
        };
      
      case 'CHILDRENS_SAVING':
        return {
          paymentType: 'CHILDRENS_SAVING',
          referenceId: null,
          userId: payment.paymentTitle.startsWith('Caja de Ahorro -')
            ? parseInt(payment.paymentTitle.split('-')[2])
            : null,
          amount: payment.hourlyRate,
        };

      case 'CONTRIBUTION':
        return {
          paymentType: 'CONTRIBUTION',
          referenceId: this.referenceId,
          amount: payment.hourlyRate,
        };

      case 'ADMINISTRATIVE':
        return {
          paymentType: 'ADMINISTRATIVE',
          referenceId: this.referenceId,
          amount: payment.hourlyRate,
        };
      
      case 'SHARED_CONTRIBUTION':
        return {
          paymentType: 'SHARED_CONTRIBUTION',
          referenceId: this.referenceId,
          amount: payment.hourlyRate,
        };
      
      case 'LOAN_INTEREST_PAYMENT':
        console.log("Loans", this.loans);
        if (this.loans != null) {
          
            return {
              paymentType: 'LOAN_INTEREST_PAYMENT',
              referenceId: this.loans.loanId,
              amount: payment.hourlyRate,
            };
        } else {
          console.log("No Loans", this.loans);
          return {
            paymentType: 'LOAN_INTEREST_PAYMENT',
            referenceId: null,
            amount: payment.hourlyRate,
          };
        }
      case 'LOAN_PAYMENT':
        console.log("adding loan", this.loans);
        if (this.loans != null ) {
          return {
            paymentType: 'LOAN_PAYMENT',
            referenceId: this.loans.loanId,
            amount: payment.hourlyRate,
          };
        } else {
          return {
            paymentType: 'LOAN_PAYMENT',
            referenceId: null,
            amount: payment.hourlyRate,
          };
        }
      
      case 'LOAN_PAYMENT_EXTERNAL':
        console.log("adding loan", this.loans);
        if (this.loans != null ) {
          return {
            paymentType: 'LOAN_PAYMENT_EXTERNAL',
            referenceId: this.loans.loanId,
            amount: payment.hourlyRate,
          };
        } else {
          return {
            paymentType: 'LOAN_PAYMENT_EXTERNAL',
            referenceId: null,
            amount: payment.hourlyRate,
          };
        }
      
      case 'LOAN_INTEREST_PAYMENT_EXTERNAL':
        console.log("Loans", this.loans);
        if (this.loans != null) {
          
            return {
              paymentType: 'LOAN_INTEREST_PAYMENT_EXTERNAL',
              referenceId: this.loans.loanId,
              amount: payment.hourlyRate,
            };
        } else {
          console.log("No Loans", this.loans);
          return {
            paymentType: 'LOAN_INTEREST_PAYMENT_EXTERNAL',
            referenceId: null,
            amount: payment.hourlyRate,
          };
        }
        
      case 'SUPPLIES':
        console.log("adding supplies", this.supplies);
        if (this.supplies != null) {
          console.log("Supplies", this.supplies);
          return {
            paymentType: 'SUPPLIES',
            referenceId: this.supplies.supplyId,
            amount: payment.hourlyRate,
          };
        } else {
          return {
            paymentType: 'SUPPLIES',
            referenceId: null,
            amount: payment.hourlyRate,
          };
        }
      case 'WHEELS':
        return {
          paymentType: 'WHEELS',
          referenceId: null,
          amount: payment.hourlyRate,
        };
  
      default:
        return {
          paymentType: type,
          referenceId: null,
          amount: payment.hourlyRate,
        };
    }
  }
  
}
