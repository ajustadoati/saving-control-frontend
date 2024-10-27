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
    const DATA: any = document.getElementById('printSection'); // Captura la sección a convertir en PDF
    html2canvas(DATA).then(canvas => {
      const fileWidth = 208;
      const fileHeight = (canvas.height * fileWidth) / canvas.width;

      const fileURI = canvas.toDataURL('image/png'); // Convierte la sección a imagen PNG
      const PDF = new jsPDF('p', 'mm', 'a4');
      const position = 0;

      PDF.addImage(fileURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('recibo-pago.pdf');  // Guarda el archivo PDF
    });
  }

}


