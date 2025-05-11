import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-interest-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interest-report.component.html',
  styleUrl: './interest-report.component.css'
})
export class InterestReportComponent implements OnInit {

  @Input() interestReport: any;
  @Input() total: any;
  totalDistribuido: number = 0;

  ngOnInit(): void {
    console.log(this.interestReport);
    if (this.interestReport && Array.isArray(this.interestReport)) {
      this.totalDistribuido = this.interestReport
        .reduce((sum, item) => sum + Number(item.distributedAmount || 0), 0);
    }
  }

}
