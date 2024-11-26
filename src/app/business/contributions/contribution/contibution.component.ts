import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContributionService } from '../../core/services/contribution.service';
import { ContributionTypesService } from '../../core/services/contribution-types.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contibution',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contibution.component.html',
  styleUrl: './contibution.component.css'
})
export default class ContibutionComponent {


  contributionForm: any; // Formulario para registrar contribuciones
  contributionTypes: any[] = []; // Lista de tipos de contribuciones
  contributions: any[] = [];
  showAddContributionModal: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private contributionService: ContributionService,
    private contributionTypesService: ContributionTypesService
  ) {
    this.contributionForm = this.fb.group({
      contributionTypeId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      name: ['', Validators.required]
    });
    this.contributions.push({
      id: this.contributions.length + 1,
      contributionTypeName: 'Compartir',
      name: 'Test',
      amount: this.newContribution.amount,
      date: this.newContribution.name,
    });
  }
  

  ngOnInit(): void {
    this.loadContributionTypes();
    this.loadContributions();
  }

  /**
   * Carga los tipos de contribuciones desde el servicio.
   */
  loadContributionTypes(): void {
    this.contributionTypesService.getContributionTypes().subscribe({
      next: (data: any) => {
        this.contributionTypes = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de contribuciones:', err);
      }
    });
  }

  selectedContributionType: any;
 
  newContribution: { contributionTypeId: number; amount: number; name: string } = {
    contributionTypeId: 0,
    amount: 0,
    name: '',
  };

  openAddContributionModal(): void {
    this.showAddContributionModal = true; // Muestra el modal
    this.newContribution = { contributionTypeId: 0, amount: 0, name: '' }; // Reinicia los datos del formulario
  }

  closeAddContributionModal(): void {
    this.showAddContributionModal = false; // Oculta el modal
  }

  saveContribution(): void {
    if (
      this.newContribution.contributionTypeId &&
      this.newContribution.amount > 0 &&
      this.newContribution.name
    ) {

      const contType = this.contributionTypes.find(
        (type) => type.id === +this.newContribution.contributionTypeId // Asegura que los tipos coincidan
      );

    this.contributionService.addContribution(this.newContribution).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Aporte especial registrado!',
          text: 'Aporte especial ha sido registrado exitosamente.'
        });
        this.contributionForm.reset({
          contributionTypeId: '',
          amount: 0,
          contributionDate: new Date().toISOString().split('T')[0]
        });
        this.loadContributions(); // Recargar la lista de contribuciones
      },
      error: (err: any) => {
        console.error('Error al registrar la contribución:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: 'No se pudo registrar. Intenta de nuevo más tarde.'
        });
      }
    });
      this.closeAddContributionModal(); // Cierra el modal después de guardar
    } else {
      alert('Por favor, completa todos los campos antes de guardar.');
    }
  }

  /**
   * Carga las contribuciones registradas desde el servicio.
   */
  loadContributions(): void {
    this.contributionService.getContributions().subscribe({
      next: (data: any) => {
        this.contributions = data;
      },
      error: (err) => {
        console.error('Error al cargar las contribuciones:', err);
      }
    });
  }

  /**
   * Envía los datos del formulario para registrar una nueva contribución.
   */
  registerContribution(): void {
    if (this.contributionForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos correctamente.'
      });
      return;
    }

    const contributionData = this.contributionForm.value;
    this.contributionService.addContribution(contributionData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Aporte especial registrado!',
          text: 'El aporte especial ha sido registrado exitosamente.'
        });
        this.contributionForm.reset({
          contributionTypeId: '',
          amount: 0,
          contributionDate: new Date().toISOString().split('T')[0]
        });
        this.loadContributions(); // Recargar la lista de contribuciones
      },
      error: (err: any) => {
        console.error('Error al registrar Aporte:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: 'No se pudo registrar el aporte especial. Intenta de nuevo más tarde.'
        });
      }
    });
  }

  /**
   * Elimina una contribución.
   * @param contributionId ID de la contribución a eliminar.
   */
  deleteContribution(contributionId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contributionService.delete(contributionId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Contribución eliminada!',
              text: 'El aporte ha sido eliminado exitosamente.'
            });
            this.loadContributions(); // Recargar la lista de contribuciones
          },
          error: (error: any) => {
            console.error('Error al eliminar el aporte especial:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: 'No se pudo eliminar el aporte especial. Intenta de nuevo más tarde.'
            });
          }
        });
      }
    });
  }
}
