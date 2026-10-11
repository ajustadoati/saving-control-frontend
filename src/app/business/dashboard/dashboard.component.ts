import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SavingService } from '../core/services/saving.service';
import { BalanceService } from '../core/services/balance.service';
import { Funds } from '../interfaces/funds';
import { ReportService } from '../core/services/report.service';
import { DistributionService } from '../core/services/distribution.service';
import { LoanService } from '../core/services/loan.service';
import { DistributionInterestStatus } from '../interfaces/distribution-interest-status';
import { Loan } from '../interfaces/loan';
import { WeeklySummaryResponse } from '../interfaces/weeklySummaryResponse';
import { InterestReportComponent } from '../report/interest-report/interest-report.component';
import Swal from 'sweetalert2';
import { LogicBalance, LogicBalanceService } from '../core/services/logic-balance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, InterestReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  constructor(
    private savingService: SavingService,
    private balanceService: BalanceService,
    private reportService: ReportService,
    private distributionService: DistributionService,
    private loanService: LoanService,
    private logicBalanceService: LogicBalanceService
  ){}
  

  totalSavings: number = 0;
  totalUsers: number = 0;
  funds?: Funds;
  fundsError = '';
  loanBalanceP1: number = 0;
  loanBalanceP2: number = 0;
  loanBalanceExternal: number = 0;
  weeklySummary?: WeeklySummaryResponse;
  weeklySummaryDate: string = '';
  selectedDate: string = '';
  distributionStatus?: DistributionInterestStatus;
  isLoadingDistributionStatus: boolean = false;
  isRunningDistribution: boolean = false;
  showInterestDistributionModal: boolean = false;
  logicBalance?: LogicBalance;
  logicBalanceError = '';
  showLogicPaymentModal = false;
  logicPaymentDate = '';
  logicPaymentAmount: number | null = null;
  logicPaymentError = '';
  isSavingLogicPayment = false;
  private logicPaymentRequest?: { date: string; amount: number; id: string };


  ngOnInit(): void {
    this.loadBalance();
    this.loadSavingsResume();
    this.loadLoanBalances();
    this.loadLatestWednesdaySummary();
    this.loadLogicBalance();
  }

  loadLogicBalance() {
    this.logicBalanceError = '';
    this.logicBalanceService.getBalance().subscribe({
      next: balance => this.logicBalance = balance,
      error: () => this.logicBalanceError = 'No se pudo cargar el saldo.'
    });
  }

  openLogicPaymentModal() {
    if (!this.logicBalance || this.logicBalance.currentBalance <= 0) return;
    const today = new Date();
    this.logicPaymentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.logicPaymentAmount = null;
    this.logicPaymentError = '';
    this.logicPaymentRequest = undefined;
    this.showLogicPaymentModal = true;
  }

  closeLogicPaymentModal() {
    if (!this.isSavingLogicPayment) this.showLogicPaymentModal = false;
  }

  saveLogicPayment() {
    if (this.isSavingLogicPayment) return;
    const amount = Number(this.logicPaymentAmount);
    if (!this.logicPaymentDate || !Number.isFinite(amount) || amount <= 0
        || !this.logicBalance || amount > this.logicBalance.currentBalance
        || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
      this.logicPaymentError = 'Indica una fecha y un monto positivo, con hasta dos decimales, que no supere el saldo.';
      return;
    }
    // Keep the same identifier when retrying after a lost response.
    if (!this.logicPaymentRequest || this.logicPaymentRequest.date !== this.logicPaymentDate
        || this.logicPaymentRequest.amount !== amount) {
      this.logicPaymentRequest = { date: this.logicPaymentDate, amount, id: crypto.randomUUID() };
    }
    this.isSavingLogicPayment = true;
    this.logicPaymentError = '';
    this.logicBalanceService.registerPayment(this.logicPaymentDate, amount, this.logicPaymentRequest.id).subscribe({
      next: balance => {
        this.logicBalance = balance;
        this.isSavingLogicPayment = false;
        this.showLogicPaymentModal = false;
        Swal.fire({ icon: 'success', title: 'Abono registrado', text: 'El saldo de Lógica ha sido actualizado.' });
      },
      error: error => {
        this.isSavingLogicPayment = false;
        this.logicPaymentError = error.status === 400
          ? 'Revisa la fecha y el monto. El abono no puede superar el saldo actual.'
          : 'No se pudo confirmar el abono. Puedes reintentar con los mismos datos.';
      }
    });
  }

  loadSavingsResume(){
    this.savingService.getResume().subscribe(
      {
        next: (response: any) => {
          console.log('Ahorros obtenidos:', response.response.total); // Verificar los ahorros obtenidos
          this.totalSavings = response.response.total;
          this.totalUsers = response.response.totalUsers;
          console.log('Saldo total:', this.totalSavings);
        },
        error: (e) => console.error(e),
      });
  }

  loadBalance(){
    this.fundsError = '';
    this.balanceService.getBalance().subscribe({
      next: (response) => {
        this.funds = response;
      },
      error: () => this.fundsError = 'No se pudo cargar el fondo de caja.',
    });
  }

  loadLoanBalances() {
    this.loanService.getLoansAssets().subscribe({
      next: (loans: Loan[]) => {
        const balances = loans.reduce((acc, loan) => {
          const key = this.normalizeLoanType(loan.loanTypeName || '');
          if (!key) {
            return acc;
          }

          acc[key] += Number(loan.loanBalance || 0);
          return acc;
        }, { P1: 0, P2: 0, EXT: 0 });

        this.loanBalanceP1 = balances.P1;
        this.loanBalanceP2 = balances.P2;
        this.loanBalanceExternal = balances.EXT;
      },
      error: (error) => {
        console.error('Error al obtener saldos de préstamos:', error);
        this.loanBalanceP1 = 0;
        this.loanBalanceP2 = 0;
        this.loanBalanceExternal = 0;
      }
    });
  }

  loadLatestWednesdaySummary() {
    this.reportService.getLatestWednesdaySummary().subscribe({
      next: (response) => {
        this.weeklySummary = response;
        this.weeklySummaryDate = this.formatDate(response?.date);
        this.selectedDate = response?.date || '';
        this.loadDistributionStatus(response?.date);
      },
      error: (e) => console.error(e),
    });
  }

  loadWeeklySummaryByDate() {
    if (!this.selectedDate) return;
    this.reportService.getWeeklySummaryByDate(this.selectedDate).subscribe({
      next: (response) => {
        this.weeklySummary = response;
        this.weeklySummaryDate = this.formatDate(response?.date);
        this.loadDistributionStatus(response?.date);
      },
      error: (e) => console.error(e),
    });
  }

  runWeeklyDistribution() {
    const date = this.weeklySummary?.date;
    if (!date || this.isDistributionActionDisabled()) {
      return;
    }

    this.isRunningDistribution = true;
    this.distributionService.runDistribution(date).subscribe({
      next: () => {
        this.isRunningDistribution = false;
        this.loadDistributionStatus(date);
        Swal.fire({
          icon: 'success',
          title: 'Distribución realizada',
          text: `Los intereses del miércoles ${this.weeklySummaryDate} fueron distribuidos.`,
        });
      },
      error: (error) => {
        console.error('Error al distribuir intereses desde dashboard:', error);
        this.isRunningDistribution = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo distribuir',
          text: 'Revisa si ya estaba distribuido o si falta cerrar la semana anterior.',
        });
      }
    });
  }

  openInterestDistributionModal() {
    if (!this.weeklySummary?.date) {
      return;
    }
    this.showInterestDistributionModal = true;
  }

  closeInterestDistributionModal() {
    this.showInterestDistributionModal = false;
    if (this.weeklySummary?.date) {
      this.loadDistributionStatus(this.weeklySummary.date);
    }
  }

  isDistributionActionDisabled(): boolean {
    return !this.weeklySummary?.date
      || this.isLoadingDistributionStatus
      || this.isRunningDistribution
      || !!this.distributionStatus?.distributed
      || this.hasPreviousPendingBlock();
  }

  hasPreviousPendingBlock(): boolean {
    const previousPendingDate = this.distributionStatus?.previousPendingDate;
    return !!previousPendingDate && previousPendingDate !== this.weeklySummary?.date;
  }

  get consolidatedSavings(): number {
    const ahorro = Number(this.weeklySummary?.ahorro || 0);
    const fondoPrevisionUrbano = Number(this.weeklySummary?.fondoPrevisionUrbano || 0);
    const fondoPrevisionInterurbano = Number(this.weeklySummary?.fondoPrevisionInterurbano || 0);

    return ahorro + fondoPrevisionUrbano + fondoPrevisionInterurbano;
  }

  private loadDistributionStatus(date?: string) {
    if (!date) {
      this.distributionStatus = undefined;
      return;
    }

    this.isLoadingDistributionStatus = true;
    this.distributionService.getDistributionStatus(date).subscribe({
      next: (response) => {
        this.distributionStatus = response;
        this.isLoadingDistributionStatus = false;
      },
      error: (error) => {
        console.error('Error al cargar estado de distribución en dashboard:', error);
        this.distributionStatus = undefined;
        this.isLoadingDistributionStatus = false;
      }
    });
  }

  private normalizeLoanType(loanTypeName: string): 'P1' | 'P2' | 'EXT' | '' {
    const name = loanTypeName.trim().toLowerCase();
    if (name === 'préstamos1' || name === 'prestamos1') return 'P1';
    if (name === 'préstamos2' || name === 'prestamos2') return 'P2';
    if (name === 'externos') return 'EXT';
    return '';
  }

  private formatDate(date?: string): string {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('es-ES');
  }
}
