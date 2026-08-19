import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { SavingService } from '../../../core/services/saving.service';
import { UserService } from '../../../core/services/user.service';
import { DefaultPaymentComponent } from '../../default-payments/default-payment/default-payment.component';
import { DefaultPaymentService } from '../../../core/services/default-payment.service';
import { AssociateMemberComponent } from '../../associate-member/associate-member/associate-member.component';
import { AssociateService } from '../../../core/services/associate.service';
import { UserSavingBoxService } from '../../../core/services/user-saving-box.service';
import { UserBalanceService } from '../../../core/services/user-balance.service';
import { UserSavingsBox } from '../../../interfaces/userSavingBox';
import { Summary } from '../../../interfaces/summary';

@Component({
  selector: 'app-associate-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DefaultPaymentComponent, AssociateMemberComponent],
  templateUrl: './associate-setup.component.html',
  styleUrl: './associate-setup.component.css'
})
export default class AssociateSetupComponent {
  defaultPayments: any;
  associateMembers: any;
  summary: Summary | null = null;

  associateFound = false;
  associateId: any;
  associateQuery = '';
  associateResults: any[] = [];
  showAssociateResults = false;
  totalSavings = 0;
  showModal = false;
  showAssociateMemberModal = false;
  showSavingsOnboardingModal = false;
  onboardingSaving = false;

  associateData: any = {
    id: '14447876',
    name: 'Richard Rojas',
    email: 'richardroj@gmail.com'
  };

  userSavingsBox: UserSavingsBox | null = null;
  onboardingForm: FormGroup;

  constructor(
    private userService: UserService,
    private savingService: SavingService,
    private defaultPaymentService: DefaultPaymentService,
    private associateService: AssociateService,
    private userSavingBoxService: UserSavingBoxService,
    private userBalanceService: UserBalanceService,
    private fb: FormBuilder
  ) {
    this.onboardingForm = this.fb.group({
      joinSavingsBox: [true],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      interestEarned: [0, [Validators.required, Validators.min(0)]],
      boxCount: [1, [Validators.required, Validators.min(1)]],
      boxValue: [18, [Validators.required, Validators.min(0)]],
      effectiveDate: [this.formatDate(new Date()), [Validators.required]]
    });
  }

  removeDefaultPayment(userId: number, paymentId: number) {
    this.defaultPaymentService.deleteDefaultPayment(userId, paymentId).subscribe({
      next: () => {
        this.getDefaultPayments();
      },
      error: (err) => {
        console.error('Error al eliminar el pago por defecto:', err);
      }
    });
  }

  removeAssociateMember(userId: number, associateId: number) {
    this.associateService.removeAssociate(userId, associateId).subscribe({
      next: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Miembro eliminado',
          text: 'Miembro eliminado correctamente'
        });
        this.getAssociates();
      },
      error: (err) => {
        console.error('Error al eliminar el asociado:', err);
      }
    });
  }

  searchAssociate() {
    const query = (this.associateQuery || '').trim();
    if (!query) {
      void Swal.fire({
        icon: 'info',
        title: 'Búsqueda vacía',
        text: 'Ingresa nombre o cédula para buscar.'
      });
      return;
    }

    if (this.isNumericQuery(query)) {
      this.userService.getAssociateByNumberId(query).subscribe({
        next: (data) => this.handleAssociateFound(data),
        error: (error) => {
          console.error('Socio no encontrado:', error);
          void Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'Por favor, verifica la cédula e intenta de nuevo.'
          });
          this.associateFound = false;
          this.totalSavings = 0;
          this.summary = null;
          this.userSavingsBox = null;
        },
      });
      return;
    }

    this.userService.searchAssociatesByName(query).subscribe({
      next: (users: any[]) => {
        this.associateResults = users;
        this.showAssociateResults = true;
        if (users.length === 1) {
          this.selectAssociate(users[0]);
        }
        if (users.length === 0) {
          void Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron socios con ese nombre.'
          });
        }
      },
      error: (error) => {
        console.error('Error al buscar socios por nombre:', error);
      }
    });
  }

  selectAssociate(user: any) {
    this.showAssociateResults = false;
    this.associateResults = [];
    this.associateId = user.numberId || user.id || '';
    this.handleAssociateFound(user);
  }

  private handleAssociateFound(data: any) {
    this.associateData = data;
    this.associateFound = true;
    this.totalSavings = data.totalSavings ?? 0;
    this.getDefaultPayments();
    this.getAssociates();
    this.loadFinancialSetup();
    this.savingService.getResume();
  }

  private isNumericQuery(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  loadFinancialSetup() {
    this.getSummary();
    this.getUserSavingsBox();
  }

  getSummary() {
    this.userBalanceService.getSummary(this.associateData.id).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.totalSavings = summary.currentBalance;
      },
      error: (error) => {
        console.error('Error al obtener el resumen financiero:', error);
        this.summary = null;
      }
    });
  }

  getUserSavingsBox() {
    this.userSavingBoxService.getSavingBox(this.associateData.id).subscribe({
      next: (data) => {
        if (data.response.length === 0) {
          this.userSavingsBox = null;
          return;
        }

        const latestBox = [...data.response]
          .sort((a: UserSavingsBox, b: UserSavingsBox) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
        this.userSavingsBox = latestBox;

        if (!this.summary) {
          this.totalSavings = latestBox.boxValue;
        }
      },
      error: (error) => {
        console.error('Error al obtener la caja de ahorro del usuario:', error);
        this.userSavingsBox = null;
        if (!this.summary) {
          this.totalSavings = 0;
        }
      }
    });
  }

  getDefaultPayments() {
    this.defaultPaymentService.getDefaultPaymentsByUserId(this.associateData.id).subscribe({
      next: (response: any) => {
        this.defaultPayments = response.defaultPayments;
      },
      error: (error) => {
        console.error('Error al obtener los pagos por defecto:', error);
        this.defaultPayments = [];
      }
    });
  }

  getAssociates() {
    this.associateService.getAssociatesByUserId(this.associateData.id).subscribe({
      next: (response: any) => {
        this.associateMembers = response.members;
      },
      error: (error) => {
        console.error('Error al obtener los asociados:', error);
        this.associateMembers = [];
      }
    });
  }

  openModal(userId: number): void {
    this.associateId = userId;
    this.showModal = true;
  }

  openAssociateMemberModal(): void {
    this.showAssociateMemberModal = true;
  }

  openSavingsOnboardingModal(): void {
    this.onboardingForm.reset({
      joinSavingsBox: true,
      initialBalance: this.summary?.initialBalance ?? 0,
      interestEarned: this.summary?.interestEarned ?? 0,
      boxCount: this.userSavingsBox?.boxCount ?? 1,
      boxValue: this.userSavingsBox?.boxValue ?? 18,
      effectiveDate: this.formatDate(new Date())
    });
    this.showSavingsOnboardingModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.associateId = null;
    this.getDefaultPayments();
  }

  closeAssociateMemberModal(): void {
    this.showAssociateMemberModal = false;
    this.getAssociates();
  }

  closeSavingsOnboardingModal(): void {
    this.showSavingsOnboardingModal = false;
  }

  saveSavingsOnboarding(): void {
    if (!this.associateData?.id || this.onboardingForm.invalid || this.onboardingSaving) {
      return;
    }

    const raw = this.onboardingForm.getRawValue();
    this.onboardingSaving = true;
    this.userBalanceService.saveSavingsOnboarding(this.associateData.id, {
      joinSavingsBox: !!raw.joinSavingsBox,
      initialBalance: Number(raw.initialBalance),
      interestEarned: Number(raw.interestEarned),
      boxCount: Number(raw.boxCount),
      boxValue: Number(raw.boxValue),
      effectiveDate: String(raw.effectiveDate)
    }).subscribe({
      next: () => {
        this.onboardingSaving = false;
        this.closeSavingsOnboardingModal();
        this.loadFinancialSetup();
        void Swal.fire({
          icon: 'success',
          title: 'Configuración guardada',
          text: 'El socio quedó configurado para caja de ahorro con su saldo inicial.'
        });
      },
      error: (error) => {
        this.onboardingSaving = false;
        console.error('Error configurando ingreso a caja:', error);
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar',
          text: error?.error?.message || 'Revisa la configuración financiera del socio.'
        });
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
