import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DistributionService } from '../../core/services/distribution.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interest-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interest-report.component.html',
  styleUrl: './interest-report.component.css'
})
export class InterestReportComponent implements OnInit, OnChanges {

  constructor(private distributionService: DistributionService) {}

  @Input() interestReport: any;
  @Input() reportDate: any;
  @Input() total: any;
  totalDistribuido: number = 0;
  totalBalance: number = 0;
  filteredInterestReport: any[] = [];

  ngOnInit(): void {
    this.applyReportData(this.interestReport);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['interestReport']) {
      this.applyReportData(this.interestReport);
    }
  }

  saveDistributions() {
    if (!this.reportDate) {
      console.error('Fecha requerida para distribuir');
      return;
    }

    this.distributionService.runDistribution(this.reportDate).subscribe({
      next: (response: any) => {
        console.log('Distribuciones ejecutadas:', response);
        if (Array.isArray(response)) {
          this.interestReport = response;
          this.applyReportData(this.interestReport);
        }
        Swal.fire({
          icon: 'success',
          title: '¡Distribución realizada!',
          text: 'El interés se ha agregado a cada usuario con éxito.',
        });
      },
      error: (error) => {
        console.error('Error al ejecutar distribución:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Posiblemente el interés ya fue distribuido para esa fecha.',
        });
      }
    });
  }

  private applyReportData(report: any) {
    if (report && Array.isArray(report)) {
      this.filteredInterestReport = report
        .filter(item => Number(item.totalBalance || 0) !== 0);
      this.totalDistribuido = this.filteredInterestReport
        .reduce((sum, item) => sum + Number(item.distributedAmount || 0), 0);
      this.totalBalance = this.filteredInterestReport
        .reduce((sum, item) => sum + Number(item.totalBalance || 0), 0);
    } else {
      this.filteredInterestReport = [];
      this.totalDistribuido = 0;
      this.totalBalance = 0;
    }
  }

}
