import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../core/services/report.service';
import { ReporteDiarioResponse } from '../../interfaces/reporteDiarioResponse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export default class ReportComponent implements OnInit {

  reporte: ReporteDiarioResponse | any;
  fecha: string = '2025-01-16'; // Puedes ajustar la fecha según tus necesidades

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

}
