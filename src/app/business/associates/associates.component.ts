import { Component, OnInit } from '@angular/core';
import { Associate } from '../interfaces/associate';
import { Member } from '../interfaces/member';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-associates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './associates.component.html',
  styleUrl: './associates.component.css'
})
export default class AssociatesComponent implements OnInit {
  associates: Associate[] = [];
  searchTerm: string = '';
  currentPage: number = 0;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  constructor(private userService: UserService) {}


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Getting users')
    this.userService.getUsers(this.currentPage, this.itemsPerPage).subscribe(
      { next: (data: { users: Associate[]; totalItems: number; }) => {
          console.log(data);
          this.associates = data.users;  // Los usuarios vienen dentro de 'collection'
          this.totalItems = data.totalItems; // Total de elementos para la paginación
        }, 
      error: (e) => console.error(e),     
    });
  }

  changePage(newPage: number): void {
    this.currentPage = newPage;
    this.loadUsers();
  }

  // Método para filtrar los usuarios basado en el término de búsqueda
  filterUsers(): Associate[] {
    return this.associates.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
