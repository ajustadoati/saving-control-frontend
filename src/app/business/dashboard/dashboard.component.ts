import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { User } from '../interfaces/user';
import { SavingService } from '../core/services/saving.service';
import { BalanceService } from '../core/services/balance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  constructor(private savingService: SavingService, private balanceService: BalanceService){}
  

  totalSavings: number = 0;
  totalUsers: number = 0;
  funds: any;


  ngOnInit(): void {
    this.loadBalance();
    this.loadSavingsResume();
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
}
