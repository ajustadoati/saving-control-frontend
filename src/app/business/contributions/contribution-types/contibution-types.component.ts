import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contibution-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contibution-types.component.html',
  styleUrl: './contibution-types.component.css'
})
export class ContibutionTypesComponent {
contributionTypes: any;
  deleteContributionType(arg0: any) {
    throw new Error('Method not implemented.');
  }
  openAddContributionTypeModal() {
    throw new Error('Method not implemented.');
  }

}
