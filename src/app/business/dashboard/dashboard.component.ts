import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SavingService } from '../core/services/saving.service';
import { BalanceService } from '../core/services/balance.service';
import { ReportService } from '../core/services/report.service';
import { DistributionService } from '../core/services/distribution.service';
import { LoanService } from '../core/services/loan.service';
import { DistributionInterestStatus } from '../interfaces/distribution-interest-status';
import { Loan } from '../interfaces/loan';
import { WeeklySummaryResponse } from '../interfaces/weeklySummaryResponse';
import { InterestReportComponent } from '../report/interest-report/interest-report.component';
import Swal from 'sweetalert2';

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
    private loanService: LoanService
  ){}
  

  totalSavings: number = 0;
  totalUsers: number = 0;
  funds: any;
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


  ngOnInit(): void {
    this.loadBalance();
    this.loadSavingsResume();
    this.loadLoanBalances();
    this.loadLatestWednesdaySummary();
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
    this.balanceService.getBalance().subscribe({
      next: (response: any) => {
        console.log('Fondos obtenidos:', response); // Verificar los fondos obtenidos
        this.funds = response;
      },
      error: (e) => console.error(e),
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
