import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SavingService } from '../../../core/services/saving.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-associate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associate-detail.component.html',
  styleUrl: './associate-detail.component.css'
})
export class AssociateDetailComponent implements OnInit{

  constructor() {}


  ngOnInit(): void {

  }
  
  @Input() selectedUser: any;
  
  // Output para comunicar el cierre del modal al componente padre
  @Output() closeModalEvent = new EventEmitter<void>();

  // Método para emitir el evento de cierre
  closeModal(): void {
    this.closeModalEvent.emit();
  }

}
