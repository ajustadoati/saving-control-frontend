import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-receipt.component.html',
  styleUrl: './payment-receipt.component.css'
})
export class PaymentReceiptComponent {
  @Input() associateData: any;  // Datos del socio
  @Input() defaultPayments: any[] = []; // Lista de pagos
  @Input() totalAmount!: number;
  @Input() total!: number;
  @Input() currentDate!: Date;


  // Método para generar el PDF
  generatePDF(): void {
    const DATA: HTMLElement = document.getElementById('printSection')!;
  
    // Configuramos una escala para mejorar la resolución y ajustamos la impresión
    const scale = window.devicePixelRatio || 2;
  
    html2canvas(DATA, {
      scale: scale, // Aumenta la calidad
      useCORS: true, // Asegura la carga correcta de recursos externos
      scrollY: -window.scrollY, // Evita scroll al capturar
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 80; // Ancho del recibo en mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight], // Dinámico en base al contenido
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('recibo-pago.pdf');
    });
  }
  
  

}


