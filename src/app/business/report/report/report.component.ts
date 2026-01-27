import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../../core/services/report.service';
import { ReporteDiarioResponse } from '../../interfaces/reporteDiarioResponse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptComponent } from "../receipt/receipt.component";
import { InterestReportComponent } from "../interest-report/interest-report.component";

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceiptComponent, InterestReportComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export default class ReportComponent implements OnInit {

  reporte: any;
  fecha: string = '2026-01-14'; // Puedes ajustar la fecha según tus necesidades
  showReceiptModal = false;
  showInterestReportModal = false;
  @ViewChild(ReceiptComponent, { static: false })
  receiptComponent!: ReceiptComponent; 
  currentDate: Date = new Date();

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.obtenerReporte();
  }

  obtenerReporte(): void {
    this.reportService.getReporteDiario(this.fecha).subscribe(
      (data) => this.reporte = data,
      (error) => console.error('Error al obtener el reporte', error)
    );
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  closeModal(): void {
    this.showReceiptModal = false;
    this.showInterestReportModal = false;
  }

  // Genera el PDF
  generatePDF(): void {
    if (this.receiptComponent) {
      this.receiptComponent.generatePDF(); // Llama al método del componente hijo
      this.closeModal(); // Cierra el modal después de generar el PDF
        
    } else {
      console.error('Error: No se encontró el componente PaymentReceiptComponent');
    }
  }

  openReceiptModal(): void {
    this.showReceiptModal = true;
  }

  openInterestReportModal() {
    this.showInterestReportModal = true;
  }
  
}
