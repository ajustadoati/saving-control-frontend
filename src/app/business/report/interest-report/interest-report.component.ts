import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DistributionService } from '../../core/services/distribution.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interest-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interest-report.component.html',
  styleUrl: './interest-report.component.css'
})
export class InterestReportComponent implements OnInit {

  constructor(private distributionService: DistributionService) {}

  @Input() interestReport: any;
  @Input() reportDate: any;
  @Input() total: any;
  totalDistribuido: number = 0;
  totalBalance: number = 0;
  filteredInterestReport: any[] = [];

  ngOnInit(): void {
    console.log(this.interestReport);
    if (this.interestReport && Array.isArray(this.interestReport)) {
      // Filtrar los items donde totalBalance no es 0
      this.filteredInterestReport = this.interestReport
        .filter(item => Number(item.totalBalance || 0) !== 0);
      console.log("total",this.filteredInterestReport.length);
      this.totalDistribuido = this.filteredInterestReport
        .reduce((sum, item) => sum + Number(item.distributedAmount || 0), 0);
      this.totalBalance = this.filteredInterestReport
        .reduce((sum, item) => sum + Number(item.totalBalance || 0), 0);
    }
  }

  saveDistributions() {
  if (!this.interestReport || !Array.isArray(this.interestReport)) {
    console.error('Datos incompletos para enviar');
    return;
  }

  const payload = {
    date: this.reportDate,
    distributionInterestList: this.interestReport.map((item: any) => ({
      userId: item.userId,
      name: item.name,
      totalBalance: item.totalBalance,
      interest: item.interest,
      distributedAmount: item.distributedAmount
    }))
  };

  this.distributionService.saveDistributions(payload).subscribe({
    next: (response) => {
      console.log('Distribuciones guardadas:', response);
      Swal.fire({
        icon: 'success',
        title: '¡Pago registrado!',
        text: 'El interés se ha agregado a cada usuario con éxito.',
      });
    },
    error: (error) => {
      console.error('Error al guardar distribuciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Posiblemente el usuario ya tiene interés distribuido para esa fecha.',
      });
    }
  });
}

}
