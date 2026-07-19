import { Component, Input } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReporteDiarioResponse } from '../../interfaces/reporteDiarioResponse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css'
})
export class ReceiptComponent {
  private readonly forecastFundTypes = ['FONDO_PREVISION_URBANO', 'FONDO_PREVISION_INTERURBANO'];

  @Input() reporte: any; // Datos del socio
  @Input() currentDate!: Date;

  generatePDF(): void {
    const DATA: HTMLElement = document.getElementById('printSection')!;

    const scale = 3; // Mejora la calidad
    html2canvas(DATA, {
      scale: scale,
      useCORS: true,
      scrollY: -window.scrollY, // Ajuste para evitar desplazamientos
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 80; // Ancho del recibo en mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight], // Dinámico según el contenido
      });

      // Añadir imagen con márgenes de 5 mm
      pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth - 10, pdfHeight - 10);
      let date = new Date();
      const day = date.getDate().toString().padStart(2, '0'); // Formato de dos dígitos
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Formato de dos dígitos
      const year = date.getFullYear();
      pdf.save('Resumen-'+`-${day}-${month}-${year}`+'.pdf');
    });
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getDisplayTotals(totalPorTipoPago: Record<string, number> | null | undefined): Record<string, number> {
    if (!totalPorTipoPago) {
      return {};
    }

    const displayTotals = { ...totalPorTipoPago };
    const totalForecastFunds = this.forecastFundTypes
      .reduce((sum, type) => sum + Number(displayTotals[type] || 0), 0);

    if (totalForecastFunds > 0) {
      displayTotals['AHORRO'] = Number(displayTotals['AHORRO'] || 0) + totalForecastFunds;
      this.forecastFundTypes.forEach((type) => delete displayTotals[type]);
    }

    return displayTotals;
  }

  getDisplayKeys(totalPorTipoPago: Record<string, number> | null | undefined): string[] {
    return Object.keys(this.getDisplayTotals(totalPorTipoPago));
  }

}
