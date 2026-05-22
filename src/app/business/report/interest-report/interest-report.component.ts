import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DistributionService } from '../../core/services/distribution.service';
import { DistributionInterestStatus } from '../../interfaces/distribution-interest-status';
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
  distributionStatus: 'DISTRIBUTED' | 'NOT_DISTRIBUTED' = 'NOT_DISTRIBUTED';
  previousPendingDate: string | null = null;
  isLoadingStatus: boolean = false;

  ngOnInit(): void {
    this.loadDistributionStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportDate']) {
      this.loadDistributionStatus();
      return;
    }
    if (changes['interestReport'] && !this.reportDate) {
      this.applyReportData(this.interestReport);
    }
  }

  saveDistributions() {
    if (!this.reportDate) {
      console.error('Fecha requerida para distribuir');
      return;
    }
    if (this.isDistributionActionDisabled()) {
      return;
    }

    this.distributionService.runDistribution(this.reportDate).subscribe({
      next: (response: any) => {
        console.log('Distribuciones ejecutadas:', response);
        if (Array.isArray(response)) {
          this.applyReportData(response);
        }
        this.distributionStatus = 'DISTRIBUTED';
        this.previousPendingDate = null;
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

  hasPreviousPendingBlock(): boolean {
    return !!this.previousPendingDate && this.previousPendingDate !== this.reportDate;
  }

  isDistributionActionDisabled(): boolean {
    return this.distributionStatus === 'DISTRIBUTED'
      || this.hasPreviousPendingBlock()
      || this.isLoadingStatus;
  }

  private loadDistributionStatus() {
    if (!this.reportDate) {
      this.distributionStatus = 'NOT_DISTRIBUTED';
      this.previousPendingDate = null;
      this.applyReportData(this.interestReport);
      return;
    }
    this.isLoadingStatus = true;
    this.distributionService.getDistributionStatus(this.reportDate).subscribe({
      next: (response: DistributionInterestStatus) => {
        this.distributionStatus = response.distributed ? 'DISTRIBUTED' : 'NOT_DISTRIBUTED';
        this.previousPendingDate = response.previousPendingDate || null;
        this.interestReport = response.distributions;
        this.applyReportData(response.distributions);
        this.isLoadingStatus = false;
      },
      error: (error) => {
        console.error('Error al cargar estado de distribución:', error);
        this.distributionStatus = 'NOT_DISTRIBUTED';
        this.previousPendingDate = null;
        this.isLoadingStatus = false;
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
