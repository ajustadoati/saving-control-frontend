import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SavingService } from '../core/services/saving.service';
import { BalanceService } from '../core/services/balance.service';
import { ReportService } from '../core/services/report.service';
import { WeeklySummaryResponse } from '../interfaces/weeklySummaryResponse';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  constructor(
    private savingService: SavingService,
    private balanceService: BalanceService,
    private reportService: ReportService
  ){}
  

  totalSavings: number = 0;
  totalUsers: number = 0;
  funds: any;
  weeklySummary?: WeeklySummaryResponse;
  weeklySummaryDate: string = '';
  selectedDate: string = '';


  ngOnInit(): void {
    this.loadBalance();
    this.loadSavingsResume();
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

  loadLatestWednesdaySummary() {
    this.reportService.getLatestWednesdaySummary().subscribe({
      next: (response) => {
        this.weeklySummary = response;
        this.weeklySummaryDate = this.formatDate(response?.date);
        this.selectedDate = response?.date || '';
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
      },
      error: (e) => console.error(e),
    });
  }

  private formatDate(date?: string): string {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('es-ES');
  }
}
