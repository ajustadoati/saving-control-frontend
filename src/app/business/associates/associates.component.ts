import { Component, OnInit } from '@angular/core';
import { Associate } from '../interfaces/associate';
import { Member } from '../interfaces/member';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { AssociateDetailComponent } from './detail/associate-detail/associate-detail.component';
import { AssociateCreateComponent } from "./create/associate-create/associate-create.component";

import Swal from 'sweetalert2';

@Component({
  selector: 'app-associates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AssociateDetailComponent, AssociateCreateComponent],
  templateUrl: './associates.component.html',
  styleUrl: './associates.component.css'
})
export default class AssociatesComponent implements OnInit {
  deleteAssociate(arg0: number) {
    throw new Error('Method not implemented.');
  }

  showCreateModal: boolean = false;

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  associates: Associate[] = [];
  searchTerm: string = '';
  totalItems: number = 0;
  showModal: any;
  selectedUser: any;
  totalUsers = 0;
  page:number = 0;
  size:number = 15;
  totalPages = 0;
  firstItem: number = 1; // Primer elemento de la página actual
  lastItem: number = 10; // Último elemento de la página actual
  filteredAssociates: Associate[] = [];

  constructor(private userService: UserService) { }


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Getting users', this.page)
    this.userService.getUsers(this.page, this.size).subscribe(
      {
        next: (data: { users: Associate[]; totalItems: number; pageData: any; }) => {
          console.log(data);
          this.associates = data.users;  // Los usuarios vienen dentro de 'collection'
          this.totalItems = data.pageData.totalElements; // Total de elementos para la paginación
          this.totalPages = data.pageData.totalPages;
          this.filteredAssociates = this.associates;
          this.updatePagination();
        },
        error: (e) => console.error(e),
      });
  }

  updatePagination() {
    const pageIndex = this.page || 0;
    const pageSize = this.size || 1; // Evita dividir por 
    // Calcula el índice del primer y último elemento mostrado
    this.firstItem = (pageIndex * pageSize) + 1;
    this.lastItem = Math.min((pageIndex + 1) * pageSize, this.totalItems);
  } 

  changePage(pageOffset: number) {
    console.log("changing page",this.page);
    const newPage = this.page + pageOffset;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  changePageNumber(pageOffset: number) {
    console.log("changing page",this.page);
    const newPage = pageOffset;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  // Método para filtrar los usuarios basado en el término de búsqueda
  filterUsers(): Associate[] {
    return this.associates.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openModal(user: Associate): void {
    this.selectedUser = user;  // Almacena los detalles del socio seleccionado
    this.showModal = true;     // Muestra el modal
  }

  // Cierra el modal y limpia los datos del usuario seleccionado
  closeModal(): void {
    this.showModal = false;    // Oculta el modal
    this.selectedUser = null;  // Limpia el socio seleccionado
    this.loadUsers();
  }

  searchAssociates(): void {
    console.log("Filtering data");
    const term = this.searchTerm.toLowerCase();

    this.filteredAssociates = this.associates.filter(associate =>
      associate.numberId.toLowerCase().includes(term) ||
      (`${associate.firstName} ${associate.lastName}`).toLowerCase().includes(term)
    );
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        console.log('Usuario eliminado exitosamente', response.message);
        this.loadUsers(); 
        Swal.fire({
          icon: 'success',
          title: '¡Usuario eliminado!',
          text: 'El usuario ha sido eliminado con éxito.',
        });
      },
      error: (error) => {
        console.error('Error al eliminar el usuario', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al eliminar el usuario. Por favor, inténtalo de nuevo.',
        });
      },
      complete: () => {
        console.log('Operación de eliminación completada');
      }
    });
  }

}
