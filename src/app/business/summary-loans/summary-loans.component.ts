import { Component } from '@angular/core';
import { LoanService } from '../core/services/loan.service';
import { CommonModule } from '@angular/common';

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

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.getActiveLoans();
  }

  getActiveLoans() {
    this.loanService.getLoansAssets().subscribe({
      next: (data) => (this.loans = data),
      error: (error) =>
        console.error('Error al cargar préstamos activos:', error),
    });
  }
}
