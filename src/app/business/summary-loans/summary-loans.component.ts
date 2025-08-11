import { Component } from '@angular/core';
import { LoanService } from '../core/services/loan.service';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../core/services/balance.service';
import { SharingFundsService } from '../core/services/sharing-funds.service';

@Component({
  selector: 'app-summary-loans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-loans.component.html',
  styleUrl: './summary-loans.component.css',
})
export default class SummaryLoansComponent {
  loans: any[] = [];
  isModalOpen: boolean = false;

  constructor(private loanService: LoanService, private balanceService: BalanceService, private sharingFundsService: SharingFundsService) {}


  funds: any;
  sharingFunds: any;

  ngOnInit(): void {
    this.getActiveLoans();
    this.loadBalance();
    this.loadSharingBalance();
  }

  getActiveLoans() {
    this.loanService.getLoansAssets().subscribe({
      next: (data) => (this.loans = data),
      error: (error) =>
        console.error('Error al cargar préstamos activos:', error),
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

  loadSharingBalance(){
    this.sharingFundsService.getBalance().subscribe({
      next: (response: any) => {
        console.log('Fondos obtenidos:', response); // Verificar los fondos obtenidos
        this.sharingFunds = response;
      },
      error: (e) => console.error(e),
    });
  }
}
