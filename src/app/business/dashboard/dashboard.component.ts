import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { User } from '../interfaces/user';
import { SavingService } from '../core/services/saving.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  constructor(private savingService: SavingService){}
  

  totalSavings: number = 0;
  totalUsers: number = 0;


  ngOnInit(): void {
    
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
}
