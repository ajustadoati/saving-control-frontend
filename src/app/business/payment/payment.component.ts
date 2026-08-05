import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../core/services/user.service';
import { DefaultPaymentService } from '../core/services/default-payment.service';
import { PaymentService } from '../core/services/payment.service';
import { ContributionService } from '../core/services/contribution.service';
import { ProductService } from '../core/services/product.service';
import { LoanService } from '../core/services/loan.service';
import { SuppliesService } from '../core/services/supplies.service';
import { UserBalanceService } from '../core/services/user-balance.service';
import { PaymentReceiptComponent } from './receipt/payment-receipt/payment-receipt.component';
import { Payment } from '../interfaces/payment';
import { Product } from '../interfaces/product';
import { Loan } from '../interfaces/loan';
import { PaymentLine } from '../interfaces/payment-line';
import { Supplies } from '../interfaces/supplies';
import { SPECIAL_PAYMENT_LABELS, mergePaymentOptions } from '../core/constants/payment-catalog';

type ResolvedPaymentType =
  | 'SAVING'
  | 'PARTNER_SAVING'
  | 'CHILDRENS_SAVING'
  | 'ADMINISTRATIVE'
  | 'SHARED_CONTRIBUTION'
  | 'LOAN_INTEREST_PAYMENT'
  | 'LOAN_PAYMENT'
  | 'LOAN_INTEREST_PAYMENT_EXTERNAL'
  | 'LOAN_PAYMENT_EXTERNAL'
  | 'LOAN_EXTERNAL'
  | 'LOAN_EXTERNAL_INTEREST'
  | 'LOAN_SHARING'
  | 'LOAN_SHARING_INTEREST'
  | 'URBAN_FORECAST_FUND'
  | 'INTERURBAN_FORECAST_FUND'
  | 'SUPPLIES'
  | 'WHEELS'
  | 'OTHER_PAYMENTS';

interface ResolvedPaymentSelection {
  paymentType: ResolvedPaymentType;
  referenceId: number | null;
  userId: number | null;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaymentReceiptComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export default class PaymentComponent {
  @ViewChild(PaymentReceiptComponent, { static: false })
  paymentReceiptComponent!: PaymentReceiptComponent;

  constructor(
    private userService: UserService,
    private defaultPaymentService: DefaultPaymentService,
    private paymentService: PaymentService,
    private contributionService: ContributionService,
    private productService: ProductService,
    private loanService: LoanService,
    private suppliesService: SuppliesService,
    private userBalance: UserBalanceService,
  ) {}

  showButtomPrint = false;
  currentDate: Date = new Date();
  associateFound = false;
  paymentsActivated = false;
  contributions: any[] = [];
  loans: any;
  supplies: Supplies[] = [];
  summary: any;
  isSaving = false;
  loanBalanceTotal = 0;
  loanSummaries: { label: string; balance: number }[] = [];
  loanBalanceTotalReceipt = 0;
  loanSummariesReceipt: { label: string; balance: number }[] = [];
  hasLoans = false;
  totalSavings!: number;
  isPrintEnabled = false;
  paymentDate: string = new Date().toISOString().split('T')[0];
  defaultPayments: PaymentLine[] = [this.createPaymentLine('Ahorro', 10)];
  configuredPaymentLines: PaymentLine[] = [];
  totalSupplyBalance = 0;
  associateQuery = '';
  associateResults: any[] = [];
  showAssociateResults = false;
  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };
  showReceiptModal = false;
  totalPaid = 0;
  paymentTypes: string[] = [];
  location = 'US';
  frequency = 'daily';
  duration = 1;
  meetingTotal = 0;
  yearlyCost = 0;
  associateId: any;

  payment: Payment = {
    userId: 0,
    date: '',
    payments: []
  };

  openReceiptModal(): void {
    this.totalPaid = this.defaultPayments.reduce(
      (sum, paymentLine) => sum + (paymentLine.amount * paymentLine.defaultPaymentsCount),
      0,
    );
    this.showReceiptModal = true;
  }

  ngAfterViewInit() {
    console.log(this.paymentReceiptComponent);
  }

  closeModal(): void {
    this.showReceiptModal = false;
  }

  generatePDF(): void {
    if (this.paymentReceiptComponent) {
      this.paymentReceiptComponent.generatePDF();
      this.closeModal();
      this.resetData();
    } else {
      console.error('Error: No se encontró el componente PaymentReceiptComponent');
    }
  }

  resetData(): void {
    this.associateId = '';
    this.associateQuery = '';
    this.associateResults = [];
    this.showAssociateResults = false;
    this.associateFound = false;
    this.paymentsActivated = false;
    this.defaultPayments = [this.createPaymentLine('Ahorro', 10)];
    this.configuredPaymentLines = [];
    this.supplies = [];
    this.totalSupplyBalance = 0;
    this.totalSavings = 0;
    this.paymentTypes = [];
    this.isPrintEnabled = false;
    this.isSaving = false;
  }

  searchAssociate() {
    const query = (this.associateQuery || '').trim();
    if (!query) {
      Swal.fire({
        icon: 'info',
        title: 'Búsqueda vacía',
        text: 'Ingresa nombre o cédula para buscar.'
      });
      return;
    }

    if (this.isNumericQuery(query)) {
      this.userService.getAssociateByNumberId(query).subscribe({
        next: (data) => {
          this.handleAssociateFound(data);
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
          this.totalSavings = 0;
        },
      });
      return;
    }

    this.userService.searchAssociatesByName(query).subscribe({
      next: (users: any[]) => {
        this.associateResults = users;
        this.showAssociateResults = true;
        if (users.length === 1) {
          this.selectAssociate(users[0]);
        }
        if (users.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron socios con ese nombre.'
          });
        }
      },
      error: (error) => {
        console.error('Error al buscar socios por nombre:', error);
      }
    });
  }

  selectAssociate(user: any) {
    this.showAssociateResults = false;
    this.associateResults = [];
    this.associateId = user.numberId || user.id || '';
    this.handleAssociateFound(user);
  }

  loadBalance(rebuildPaymentLines: boolean = false) {
    this.loanService.getLoans(this.associateData.id).subscribe({
      next: (data: Loan[]) => {
        console.log('loans for the user:', data);
        if (data.length > 0) {
          this.loans = data;
          this.loanBalanceTotal = this.calculateLoanBalanceTotal(data);
          this.loanSummaries = this.buildLoanSummaries(data);
          this.loanBalanceTotalReceipt = this.calculateLoanBalanceTotalByType(data, true);
          this.loanSummariesReceipt = this.buildLoanSummaries(data, true);
          this.hasLoans = this.loanBalanceTotal > 0;
        } else {
          console.log('No hay prestamos');
          this.loans = { loanId: 0, loanBalance: 0, loanAmount: 0 };
          this.loanBalanceTotal = 0;
          this.loanSummaries = [];
          this.loanBalanceTotalReceipt = 0;
          this.loanSummariesReceipt = [];
          this.hasLoans = false;
        }
      },
      error: (error) => {
        console.error('Error al obtener los préstamos:', error);
      }
    });

    this.suppliesService.getSupplies(this.associateData.id).subscribe({
      next: (supplies: Supplies[]) => {
        console.log('supplies for the user:', supplies);
        this.supplies = supplies;
        this.totalSupplyBalance = this.calculateTotalSupplyBalance(supplies);
        if (rebuildPaymentLines) {
          this.rebuildInitialPaymentLines();
        }
      },
      error: (error) => {
        console.error('Error al obtener los suministros:', error);
        this.supplies = [];
        this.totalSupplyBalance = 0;
        if (rebuildPaymentLines) {
          this.rebuildInitialPaymentLines();
        }
      }
    });

    this.userBalance.getSummary(this.associateData.id).subscribe({
      next: (data: any) => {
        this.summary = data;
      },
      error: (error) => {
        console.error('Error al obtener el resumen:', error);
      }
    });
  }

  updateTotal() {
    this.recalculateTotals();
  }

  addPaymentLine() {
    this.paymentsActivated = true;
    this.defaultPayments.push(this.createPaymentLine('', 0));
    this.recalculateTotals();
  }

  removePaymentLine(index: number) {
    this.defaultPayments.splice(index, 1);
    this.recalculateTotals();
  }

  registerPayments(): void {
    if (this.isSaving) return;
    if (!this.validateOtherReasons()) return;

    this.isSaving = true;
    const processedPayments = this.defaultPayments.map((paymentLine) =>
      this.mapPaymentToPayload(paymentLine)
    );

    this.payment.payments = processedPayments;
    this.payment.userId = this.associateData.id;
    this.payment.date = this.paymentDate;

    this.paymentService.addPaymentListByUserId(this.associateData.id, this.payment).subscribe({
      next: (response: any) => {
        console.log('Pagos registrados exitosamente:', response);
        this.paymentsActivated = false;

        this.userService.getAssociateById(this.associateData.id).subscribe({
          next: (associateResponse: any) => {
            this.totalSavings = associateResponse.totalSavings;
            this.refreshLoanBalances(() => {
              this.isPrintEnabled = true;
              this.showButtomPrint = true;
              this.loadBalance(false);
              Swal.fire({
                icon: 'success',
                title: '¡Pago registrado!',
                text: 'El pago ha sido registrado con éxito.',
              });
            });
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

  isOtherPayment(paymentTitle: string): boolean {
    if (!paymentTitle) return false;
    return paymentTitle.trim().toLowerCase().startsWith('otros');
  }

  private handleAssociateFound(data: any) {
    this.paymentTypes = [];
    this.defaultPayments = [this.createPaymentLine('', 0)];
    this.configuredPaymentLines = [];
    this.associateData = data;
    console.log('Datos del socio:', this.associateData);
    this.associateFound = true;
    this.paymentsActivated = true;
    this.totalSavings = data.totalSavings;
    this.isSaving = false;
    this.loadPaymentOptions();

    this.defaultPaymentService.getDefaultPaymentsByUserId(this.associateData.id).subscribe({
      next: (response: any) => {
        console.log('defaultpayments:', response);
        this.configuredPaymentLines = response.defaultPayments
          .map((defaultPayment: { paymentName: string; amount: number }) =>
            this.createPaymentLine(defaultPayment.paymentName, defaultPayment.amount)
          );
        this.rebuildInitialPaymentLines();
      },
      error: (error) => {
        console.error('Error al obtener los pagos por defecto:', error);
        this.configuredPaymentLines = [];
        this.rebuildInitialPaymentLines();
      }
    });

    this.contributionService.getContributions().subscribe({
      next: (data: any) => {
        this.contributions = data;
      },
      error: (error) => {
        console.error('Error al obtener las contribuciones:', error);
      }
    });

    this.loadBalance(true);
  }

  private isNumericQuery(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  private refreshLoanBalances(onDone?: () => void) {
    this.loanService.getLoans(this.associateData.id).subscribe({
      next: (data: Loan[]) => {
        this.loans = data;
        this.loanBalanceTotal = this.calculateLoanBalanceTotal(data);
        this.loanSummaries = this.buildLoanSummaries(data);
        this.hasLoans = this.loanBalanceTotal > 0;
        if (onDone) onDone();
      },
      error: (error) => {
        console.error('Error al obtener los préstamos:', error);
        if (onDone) onDone();
      }
    });
  }

  private calculateLoanBalanceTotal(loans: Loan[]): number {
    return this.calculateLoanBalanceTotalByType(loans, false);
  }

  private calculateLoanBalanceTotalByType(loans: Loan[], receiptOnly: boolean): number {
    const perTypeSum: Record<string, number> = {};
    loans.forEach((loan) => {
      const key = this.normalizeLoanLabel(loan.loanTypeName || '');
      if (!key) return;
      if (receiptOnly && (key === 'EXT' || key === 'COMP')) return;
      const balance = loan.loanBalance || 0;
      perTypeSum[key] = (perTypeSum[key] || 0) + balance;
    });
    return Object.values(perTypeSum).reduce((sum, value) => sum + value, 0);
  }

  private buildLoanSummaries(loans: Loan[], receiptOnly: boolean = false): { label: string; balance: number }[] {
    const summaries: Record<string, number> = {};
    loans.forEach((loan) => {
      const label = this.normalizeLoanLabel(loan.loanTypeName || '');
      if (!label) return;
      if (receiptOnly && (label === 'EXT' || label === 'COMP')) return;
      summaries[label] = (summaries[label] || 0) + (loan.loanBalance || 0);
    });
    return Object.entries(summaries).map(([label, balance]) => ({ label, balance }));
  }

  private normalizeLoanLabel(loanTypeName: string): string {
    const name = loanTypeName.trim().toLowerCase();
    if (name === 'préstamos1' || name === 'prestamos1') return 'P1';
    if (name === 'préstamos2' || name === 'prestamos2') return 'P2';
    if (name === 'externos') return 'EXT';
    if (name === 'compartir') return 'COMP';
    return '';
  }

  private recalculateTotals() {
    this.meetingTotal = this.defaultPayments.reduce((total, paymentLine) => {
      const lineTotal = paymentLine.amount * paymentLine.defaultPaymentsCount * this.duration;
      paymentLine.totalCost = lineTotal;
      return total + lineTotal;
    }, 0);
  }

  private loadPaymentOptions(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log('Searching products', products);
        this.paymentTypes = mergePaymentOptions(products.map((product) => product.name));
      },
      error: () => {
        this.paymentTypes = this.mergeUniquePaymentNames(this.defaultPayments.map((paymentLine) => paymentLine.paymentTitle));
      },
    });
  }

  private resolvePaymentSelection(paymentTitle: string): ResolvedPaymentSelection {
    console.log('Payment title', paymentTitle);

    if (paymentTitle.startsWith('Caja de Ahorro')) {
      return this.buildResolvedSelection('SAVING', null, this.extractSavingUserId(paymentTitle));
    }
    if (paymentTitle.startsWith('Esposa(o)')) {
      return this.buildResolvedSelection('PARTNER_SAVING', null, this.extractSavingUserId(paymentTitle));
    }
    if (paymentTitle.startsWith('Hijos')) {
      return this.buildResolvedSelection('CHILDRENS_SAVING', null, this.extractSavingUserId(paymentTitle));
    }
    if (paymentTitle.startsWith('Administrativo')) {
      const contribution = this.findContributionByDescription(paymentTitle);
      return this.buildResolvedSelection('ADMINISTRATIVE', contribution?.id ?? null, null);
    }
    if (paymentTitle.startsWith('Compartir')) {
      const contribution = this.findContributionByDescription(paymentTitle);
      return this.buildResolvedSelection('SHARED_CONTRIBUTION', contribution?.id ?? null, null);
    }
    if (paymentTitle.startsWith('Interés de préstamo')) {
      return this.buildResolvedSelection('LOAN_INTEREST_PAYMENT', null, null);
    }
    if (paymentTitle.startsWith('Abono a préstamo')) {
      return this.buildResolvedSelection('LOAN_PAYMENT', null, null);
    }
    if (paymentTitle.startsWith('Interés préstamos 2')) {
      return this.buildResolvedSelection('LOAN_INTEREST_PAYMENT_EXTERNAL', null, null);
    }
    if (paymentTitle.startsWith('Abono préstamos 2')) {
      return this.buildResolvedSelection('LOAN_PAYMENT_EXTERNAL', null, null);
    }
    if (paymentTitle.startsWith('Abono préstamo externo')) {
      return this.buildResolvedSelection('LOAN_EXTERNAL', null, null);
    }
    if (paymentTitle.startsWith('Interés préstamo externo')) {
      return this.buildResolvedSelection('LOAN_EXTERNAL_INTEREST', null, null);
    }
    if (paymentTitle.startsWith('Abono préstamo compartir')) {
      return this.buildResolvedSelection('LOAN_SHARING', null, null);
    }
    if (paymentTitle.startsWith('Interés préstamo compartir')) {
      return this.buildResolvedSelection('LOAN_SHARING_INTEREST', null, null);
    }
    if (paymentTitle.startsWith(SPECIAL_PAYMENT_LABELS[0])) {
      return this.buildResolvedSelection('URBAN_FORECAST_FUND', null, null);
    }
    if (paymentTitle.startsWith(SPECIAL_PAYMENT_LABELS[1])) {
      return this.buildResolvedSelection('INTERURBAN_FORECAST_FUND', null, null);
    }
    if (paymentTitle.startsWith('Suministro')) {
      return this.buildResolvedSelection('SUPPLIES', this.getLegacySupplyReferenceId(), null);
    }
    if (paymentTitle.startsWith('Cauchos')) {
      return this.buildResolvedSelection('WHEELS', null, null);
    }

    return this.buildResolvedSelection('OTHER_PAYMENTS', null, null);
  }

  private mapPaymentToPayload(payment: PaymentLine): any {
    const selection = this.resolvePaymentSelection(payment.paymentTitle);

    switch (selection.paymentType) {
      case 'SAVING':
        return {
          paymentType: 'SAVING',
          referenceId: selection.referenceId,
          userId: selection.userId,
          amount: payment.amount,
        };
      case 'PARTNER_SAVING':
        return {
          paymentType: 'PARTNER_SAVING',
          referenceId: selection.referenceId,
          userId: selection.userId,
          amount: payment.amount,
        };
      case 'CHILDRENS_SAVING':
        return {
          paymentType: 'CHILDRENS_SAVING',
          referenceId: selection.referenceId,
          userId: selection.userId,
          amount: payment.amount,
        };
      case 'ADMINISTRATIVE':
        return {
          paymentType: 'ADMINISTRATIVE',
          referenceId: selection.referenceId,
          amount: payment.amount,
        };
      case 'SHARED_CONTRIBUTION':
        return {
          paymentType: 'SHARED_CONTRIBUTION',
          referenceId: selection.referenceId,
          amount: payment.amount,
        };
      case 'LOAN_INTEREST_PAYMENT':
        return this.buildLoanPaymentPayload('LOAN_INTEREST_PAYMENT', payment.amount);
      case 'LOAN_PAYMENT':
        return this.buildLoanPaymentPayload('LOAN_PAYMENT', payment.amount);
      case 'LOAN_EXTERNAL_INTEREST':
        return this.buildLoanPaymentPayload('LOAN_EXTERNAL_INTEREST', payment.amount);
      case 'LOAN_EXTERNAL':
        return this.buildLoanPaymentPayload('LOAN_EXTERNAL', payment.amount);
      case 'LOAN_SHARING_INTEREST':
        return this.buildLoanPaymentPayload('LOAN_SHARING_INTEREST', payment.amount);
      case 'LOAN_SHARING':
        return this.buildLoanPaymentPayload('LOAN_SHARING', payment.amount);
      case 'LOAN_PAYMENT_EXTERNAL':
        return this.buildLoanPaymentPayload('LOAN_PAYMENT_EXTERNAL', payment.amount);
      case 'LOAN_INTEREST_PAYMENT_EXTERNAL':
        return this.buildLoanPaymentPayload('LOAN_INTEREST_PAYMENT_EXTERNAL', payment.amount);
      case 'SUPPLIES':
        return {
          paymentType: 'SUPPLIES',
          referenceId: selection.referenceId,
          amount: payment.amount,
        };
      case 'WHEELS':
        return {
          paymentType: 'WHEELS',
          referenceId: selection.referenceId,
          amount: payment.amount,
        };
      default:
        return {
          paymentType: selection.paymentType,
          referenceId: selection.referenceId,
          amount: payment.amount,
          reason: this.isOtherPayment(payment.paymentTitle) ? payment.reason || null : null,
        };
    }
  }

  private buildLoanPaymentPayload(paymentType: string, amount: number) {
    return {
      paymentType,
      referenceId: null,
      amount,
    };
  }

  private validateOtherReasons(): boolean {
    const missingReason = this.defaultPayments.some((paymentLine) =>
      this.isOtherPayment(paymentLine.paymentTitle) && (!paymentLine.reason || !paymentLine.reason.trim())
    );
    if (missingReason) {
      Swal.fire({
        icon: 'error',
        title: 'Motivo requerido',
        text: 'Debes indicar el motivo cuando el tipo de pago es Otros.'
      });
      return false;
    }
    return true;
  }

  private rebuildInitialPaymentLines(): void {
    const configuredLines = this.configuredPaymentLines.map((paymentLine) => ({ ...paymentLine }));
    this.defaultPayments = [...configuredLines];
    if (this.defaultPayments.length === 0) {
      this.defaultPayments = [this.createPaymentLine('', 0)];
    }
    this.recalculateTotals();
    this.paymentTypes = this.mergeUniquePaymentNames([
      ...this.paymentTypes,
      ...this.defaultPayments.map((paymentLine) => paymentLine.paymentTitle),
    ]);
  }

  private createPaymentLine(paymentTitle: string, amount: number): PaymentLine {
    return {
      paymentTitle,
      amount,
      defaultPaymentsCount: 1,
      totalCost: amount,
      reason: '',
    };
  }

  private buildResolvedSelection(paymentType: ResolvedPaymentType, referenceId: number | null, userId: number | null): ResolvedPaymentSelection {
    return { paymentType, referenceId, userId };
  }

  private extractSavingUserId(paymentTitle: string): number | null {
    return paymentTitle.startsWith('Caja de Ahorro -')
      ? parseInt(paymentTitle.split('-')[2])
      : null;
  }

  private findContributionByDescription(paymentTitle: string): { id: number; description: string } | undefined {
    return this.contributions.find((contribution: { description: string }) => contribution.description === paymentTitle);
  }

  private calculateTotalSupplyBalance(supplies: Supplies[]): number {
    return supplies.reduce((total, supply) => total + Number(supply.supplyBalance || 0), 0);
  }

  private mergeUniquePaymentNames(paymentNames: string[]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];

    paymentNames.forEach((paymentName) => {
      const value = (paymentName || '').trim();
      if (!value) {
        return;
      }

      const key = value.toLowerCase();
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      merged.push(value);
    });

    return merged;
  }

  private getLegacySupplyReferenceId(): number | null {
    const activeSupply = this.supplies.find((supply) => Number(supply.supplyBalance || 0) > 0);
    return activeSupply?.supplyId ?? null;
  }
}
