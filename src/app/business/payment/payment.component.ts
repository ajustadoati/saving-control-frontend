import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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
import { GLOBAL_SUPPLY_LABEL, SPECIAL_PAYMENT_LABELS, isSupplyPaymentName, mergePaymentOptions } from '../core/constants/payment-catalog';
import { LubricantService } from '../core/services/lubricant.service';
import { LubricantOrder } from '../interfaces/lubricant-order';
import { buildGlobalSupplyLine, summarizeSupplyDebt } from './financed-supply-lines';

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
  | 'SUPPLIES_GLOBAL'
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
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaymentReceiptComponent, RouterLink],
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
    private lubricantService: LubricantService,
  ) {}

  showButtomPrint = false;
  currentDate: Date = new Date();
  associateFound = false;
  paymentsActivated = false;
  contributions: any[] = [];
  loans: any;
  supplies: Supplies[] = [];
  financedSupplyOrders: LubricantOrder[] = [];
  hasLegacySupplyDefault = false;
  isLoadingDefaultPayments = false;
  defaultPaymentsError = '';
  financedSupplyError = '';
  isLoadingFinancedSupplies = false;
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
  private catalogPaymentTypes: string[] = [];
  readonly globalSupplyLabel = GLOBAL_SUPPLY_LABEL;

  get paymentTypes(): string[] {
    return mergePaymentOptions([
      ...this.catalogPaymentTypes,
      ...this.configuredPaymentLines.map(line => line.paymentTitle),
      ...(!this.hasLegacySupplyDefault && this.totalSupplyBalance > 0 ? [GLOBAL_SUPPLY_LABEL] : []),
    ]);
  }

  get canSavePayments(): boolean {
    return !this.isSaving && !this.isLoadingFinancedSupplies && !this.isLoadingDefaultPayments
      && !this.hasLegacySupplyDefault && !this.financedSupplyError && !this.defaultPaymentsError;
  }
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
    this.financedSupplyOrders = [];
    this.supplies = [];
    this.totalSupplyBalance = 0;
    this.hasLegacySupplyDefault = false;
    this.defaultPaymentsError = '';
    this.isLoadingDefaultPayments = false;
    this.isLoadingFinancedSupplies = false;
    this.financedSupplyError = '';
    this.associateId = '';
    this.associateQuery = '';
    this.associateResults = [];
    this.showAssociateResults = false;
    this.associateFound = false;
    this.paymentsActivated = false;
    this.defaultPayments = [this.createPaymentLine('Ahorro', 10)];
    this.configuredPaymentLines = [];
    this.totalSavings = 0;
    this.catalogPaymentTypes = [];
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
    const userId = this.associateData.id;
    this.isLoadingFinancedSupplies = true;
    forkJoin({
      orders: this.lubricantService.getOrdersByUser(userId),
      supplies: this.suppliesService.getSupplies(userId),
    }).subscribe({
      next: ({ orders, supplies }) => {
        if (!this.associateFound || this.associateData.id !== userId) return;
        this.financedSupplyOrders = orders;
        this.supplies = supplies;
        this.totalSupplyBalance = summarizeSupplyDebt(supplies, orders, this.paymentDate).balance;
        this.isLoadingFinancedSupplies = false;
        this.financedSupplyError = '';
        if (rebuildPaymentLines) this.syncGlobalSupplyLine();
      },
      error: () => {
        if (!this.associateFound || this.associateData.id !== userId) return;
        this.isLoadingFinancedSupplies = false;
        this.financedSupplyError = 'No se pudo consultar la deuda de suministros. Vuelve a buscar al socio antes de registrar pagos.';
      },
    });
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
    if (!this.canSavePayments || !this.validateOtherReasons()) return;
    const supplyLines = this.defaultPayments.filter(line => line.paymentTitle === GLOBAL_SUPPLY_LABEL);
    if (supplyLines.length > 1) {
      Swal.fire({ icon: 'warning', title: 'Abono duplicado', text: 'Usa una sola línea de Suministros.' });
      return;
    }
    if (supplyLines.some(line => !Number.isFinite(line.amount) || line.amount <= 0
        || Math.abs(line.amount * 100 - Math.round(line.amount * 100)) > 1e-7
        || line.amount > this.totalSupplyBalance)) {
      Swal.fire({ icon: 'error', title: 'Abono inválido',
        text: 'El abono debe ser positivo, tener hasta dos decimales y no superar el saldo global.' });
      return;
    }

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
        const result = response.paymentResponse ?? response;
        const failed = result.paymentStatuses?.filter((status: { status: string }) => status.status !== 'SUCCESS') || [];
        if (failed.length) {
          this.isSaving = false;
          this.paymentsActivated = false;
          this.isPrintEnabled = false;
          this.showButtomPrint = false;
          Swal.fire({ icon: 'warning', title: 'Revisar resultado del pago',
            text: 'Hay conceptos que no se pudieron registrar. Revisa el reporte antes de reintentar para no duplicar los pagos confirmados.' });
          return;
        }
        this.paymentsActivated = false;

        this.userService.getAssociateById(this.associateData.id).subscribe({
          next: (associateResponse: any) => {
            this.totalSavings = associateResponse.totalSavings;
            this.refreshLoanBalances(() => {
              this.isSaving = false;
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
            this.isSaving = false;
            console.error('Error al obtener los ahorros:', error);
            this.totalSavings = 0;
          },
        });
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error al registrar los pagos:', error);
        const detail = error.error?.detail;
        const alreadyRegistered = detail === 'Payments already registered for user';
        Swal.fire({
          icon: alreadyRegistered ? 'warning' : 'error',
          title: alreadyRegistered ? 'Pago ya registrado' : 'No se pudo registrar el pago',
          text: alreadyRegistered
            ? `Este socio ya tiene pagos registrados para el ${this.payment.date}. No se ha guardado otro pago. Revisa el reporte; para corregir el existente utiliza la opción de reversión.`
            : typeof detail === 'string' && detail.trim()
              ? detail
              : 'No se pudo confirmar el pago. Revisa el reporte antes de reintentar para evitar duplicados.',
        });
      },
    });
  }

  isOtherPayment(paymentTitle: string): boolean {
    if (!paymentTitle) return false;
    return paymentTitle.trim().toLowerCase().startsWith('otros');
  }

  private handleAssociateFound(data: any) {
    this.financedSupplyOrders = [];
    this.supplies = [];
    this.totalSupplyBalance = 0;
    this.hasLegacySupplyDefault = false;
    this.defaultPaymentsError = '';
    this.financedSupplyError = '';
    this.catalogPaymentTypes = [];
    this.defaultPayments = [this.createPaymentLine('', 0)];
    this.configuredPaymentLines = [];
    this.associateData = data;
    console.log('Datos del socio:', this.associateData);
    this.associateFound = true;
    this.paymentsActivated = true;
    this.totalSavings = data.totalSavings;
    this.isSaving = false;
    this.loadPaymentOptions();

    const userId = this.associateData.id;
    this.isLoadingDefaultPayments = true;
    this.defaultPaymentService.getDefaultPaymentsByUserId(userId).subscribe({
      next: ({ defaultPayments: defaults }) => {
        if (!this.associateFound || this.associateData.id !== userId) return;
        this.hasLegacySupplyDefault = defaults.some(payment => isSupplyPaymentName(payment.paymentName));
        this.configuredPaymentLines = defaults.filter(payment => !isSupplyPaymentName(payment.paymentName))
          .map(payment => this.createPaymentLine(payment.paymentName, payment.amount));
        this.isLoadingDefaultPayments = false;
        this.rebuildInitialPaymentLines();
      },
      error: () => {
        if (!this.associateFound || this.associateData.id !== userId) return;
        this.isLoadingDefaultPayments = false;
        this.defaultPaymentsError = 'No se pudieron consultar los pagos por defecto. Vuelve a buscar al socio.';
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
        this.catalogPaymentTypes = products.map(product => product.name).filter(name => !isSupplyPaymentName(name));
      },
      error: error => console.error('No se pudo cargar el catálogo de pagos', error),
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
    if (paymentTitle === GLOBAL_SUPPLY_LABEL) {
      return this.buildResolvedSelection('SUPPLIES_GLOBAL', null, null);
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
      case 'SUPPLIES_GLOBAL':
        return {
          paymentType: 'SUPPLIES_GLOBAL',
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
    this.syncGlobalSupplyLine();
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

  syncGlobalSupplyLine(): void {
    const lines = this.defaultPayments.filter(line => !line.automaticSupplyLine);
    const suggested = summarizeSupplyDebt(this.supplies, this.financedSupplyOrders, this.paymentDate).suggestedAmount;
    if (!this.hasLegacySupplyDefault && !this.isLoadingDefaultPayments && suggested > 0
        && !lines.some(line => line.paymentTitle === GLOBAL_SUPPLY_LABEL)) {
      this.defaultPayments = [...lines.filter(line => line.paymentTitle || lines.length > 1), buildGlobalSupplyLine(suggested)];
    } else {
      this.defaultPayments = lines;
    }
    this.recalculateTotals();
  }

  onPaymentTypeChange(line: PaymentLine): void {
    if (line.paymentTitle === GLOBAL_SUPPLY_LABEL && !(line.amount > 0)) {
      line.amount = summarizeSupplyDebt(this.supplies, this.financedSupplyOrders, this.paymentDate).suggestedAmount;
    }
    this.recalculateTotals();
  }
}
