import { Component, EventEmitter, Input, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Associate } from '../../../interfaces/associate';
import { Member } from '../../../interfaces/member';
import { User } from '../../../interfaces/user';
import { AssociateService } from '../../../core/services/associate.service';

@Component({
  selector: 'app-associate-member',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './associate-member.component.html',
  styleUrl: './associate-member.component.css'
})
export class AssociateMemberComponent {

  constructor(private userService: UserService, private associateService: AssociateService) { }

  associateId : string = '';
  associateData : any;
  associateFound = false;
  relationship = '';
  relationshipExists = false;

  @Output() closeAssociateMemberModalEvent = new EventEmitter<void>();
  @Input() mainAssociate: any;
  @Input() associates: any;
  @Input() userId: number = 0;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() associateAdded = new EventEmitter<Member>();
  
  searchAssociate() {
    // Primero buscar el socio por el número de identificación
    this.userService.getAssociateByNumberId(this.associateId).subscribe({
      next: (data) => {
        this.associateData = data; // Almacena los datos del socio
        this.associateFound = true;
        this.relationshipExists = this.associates.some(
          (associate: { id: any; }) => associate.id === this.associateData.id
        );
      },
      error: (error) => {
        console.error('Socio no encontrado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Usuario no encontrado',
          text: 'Por favor, verifica la cédula e intenta de nuevo.'
        });

      },
    });
  }

  addMember() {
    if (this.relationshipExists) {
      Swal.fire({
        icon: 'error',
        title: 'Relación duplicada',
        text: 'Ya existe un miembro con esta relación.'
      });
      return;
    }

    const newAssociate = {
      id: this.associateData.id,
      name: this.associateData.firstName,
      lastName: this.associateData.lastName,
      relationship: this.relationship
    };

    this.associateService.addAssociate(this.mainAssociate.id, this.associateData.id, this.relationship).subscribe({
      next: (response)=>{
        console.log("");
         // Emitir el nuevo miembro al componente padre
        this.associateAdded.emit(newAssociate);

        Swal.fire({
          icon: 'success',
          title: 'Miembro Asociado',
          text: 'El miembro ha sido asociado correctamente.'
        });

        // Resetear campos
        this.associateFound = false;
        this.associateId = '';
        this.relationship = '';
        this.closeAssociateMemberModal();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Miembro Asociado',
          text: 'El miembro no ha sido asociado correctamente.'
        });
      }
    })

   
  }

  closeAssociateMemberModal(): void {
    console.log("Closing app");
    this.closeAssociateMemberModalEvent.emit();
  }

}
