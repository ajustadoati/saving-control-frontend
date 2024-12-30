import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FileService } from '../../core/services/file.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-file',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css'
})
export default class FileComponent {

  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  isDownloaded = false;

  constructor(private fileService: FileService) { }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.fileService.upload(this.currentFile).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            this.progress = 100; // Actualizamos el progreso al 100%
            this.message = 'Archivo subido con éxito.';
            this.isDownloaded = false;
          },
          error: (err) => {
            console.error('Error al subir el archivo:', err);
            this.progress = 0;
            this.message = 'No se pudo subir el archivo.';
          }
        });
      }

      this.selectedFiles = undefined;
    }
  }

  download(): void {
    this.fileService.download().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CAJA_AHORRO.xlsx';
      this.isDownloaded = true; 
      document.body.appendChild(a);
      this.message = 'Archivo descargado con éxito.';
      a.click();
      a.remove();
    }, error => {
      this.message = 'Archivo ya fue descargado anteriormente.';
    });
  }

}
