import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { LubricantService } from '../../core/services/lubricant.service';
import { SuppliesService } from '../../core/services/supplies.service';
import { UserService } from '../../core/services/user.service';
import { LubricantOrder } from '../../interfaces/lubricant-order';
import { LubricantProduct } from '../../interfaces/lubricant-product';
import { LubricantStockMovement } from '../../interfaces/lubricant-stock-movement';
import { LubricantWeeklyCollection } from '../../interfaces/lubricant-weekly-collection';
import { Supplies } from '../../interfaces/supplies';
import { User } from '../../interfaces/user';
import { SuppliesPaymentComponent } from '../../supplies-payment/supplies-payment/supplies-payment.component';

type LubricantView = 'summary' | 'inventory' | 'orders' | 'collection';

interface LubricantDraftItem {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-supplies',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, SuppliesPaymentComponent],
  templateUrl: './supplies.component.html',
  styleUrl: './supplies.component.css'
})
export default class SuppliesComponent implements OnInit {
  @ViewChild('paymentModal') paymentModal!: SuppliesPaymentComponent;

  activeLubricantView: LubricantView = 'summary';
  associateQuery = '';
  associateSuggestions: User[] = [];
  associateFound = false;
  associateData: User | null = null;

  supplies: Supplies[] = [];
  products: LubricantProduct[] = [];
  productMovements: LubricantStockMovement[] = [];
  selectedProductForMovements: LubricantProduct | null = null;
  selectedProductIdForStock: number | null = null;
  showProductForm = false;
  showStockForm = false;
  associateOrders: LubricantOrder[] = [];
  weeklyCollection: LubricantWeeklyCollection[] = [];
  weeklyCollectionDate: string;
  orderDraftItems: LubricantDraftItem[] = [];

  productForm: FormGroup;
  stockForm: FormGroup;
  orderForm: FormGroup;
  orderItemForm: FormGroup;

  constructor(
    private userService: UserService,
    private suppliesService: SuppliesService,
    private lubricantService: LubricantService,
    private fb: FormBuilder
  ) {
    const today = this.formatDate(new Date());
    this.weeklyCollectionDate = today;

    this.productForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      costPrice: ['', [Validators.required, Validators.min(0.01)]],
      salePrice: ['', [Validators.required, Validators.min(0.01)]],
      initialStock: [0, [Validators.required, Validators.min(0)]]
    });

    this.stockForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      movementDate: [today, [Validators.required]],
      notes: ['']
    });

    this.orderForm = this.fb.group({
      orderDate: [today, [Validators.required]],
      weeklyInstallment: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.orderItemForm = this.fb.group({
      productId: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWeeklyCollection();
  }

  setActiveLubricantView(view: LubricantView): void {
    this.activeLubricantView = view;
  }

  onOrderProductChange(): void {
    const product = this.selectedOrderProduct;
    if (!product) {
      this.orderItemForm.patchValue({ unitPrice: '' });
      return;
    }

    const currentUnitPrice = this.orderItemForm.get('unitPrice')?.value;
    if (currentUnitPrice === '' || currentUnitPrice == null || Number(currentUnitPrice) <= 0) {
      this.orderItemForm.patchValue({ unitPrice: Number(product.salePrice) });
    }
  }

  toggleProductForm(): void {
    this.showProductForm = !this.showProductForm;
  }

  toggleStockForm(product?: LubricantProduct): void {
    this.showStockForm = !this.showStockForm;
    if (product) {
      this.selectedProductIdForStock = product.id;
    }
  }

  onAssociateQueryChange(): void {
    const query = this.associateQuery.trim();
    if (!query || /^\d+$/.test(query) || query.length < 3) {
      this.associateSuggestions = [];
      return;
    }

    this.userService.searchAssociatesByName(query).subscribe({
      next: (users) => {
        this.associateSuggestions = users;
      },
      error: () => {
        this.associateSuggestions = [];
      }
    });
  }

  searchAssociate(): void {
    const query = this.associateQuery.trim();

    if (!query) {
      void Swal.fire({
        icon: 'warning',
        title: 'Dato requerido',
        text: 'Ingrese nombre o cédula del socio.'
      });
      return;
    }

    if (/^\d+$/.test(query)) {
      this.userService.getAssociateByNumberId(query).subscribe({
        next: (data) => {
          this.selectAssociate(data as User);
        },
        error: (error) => {
          console.error('Socio no encontrado:', error);
          this.resetAssociateState();
          void Swal.fire({
            icon: 'error',
            title: 'Usuario no encontrado',
            text: 'Por favor, verifica la cédula e intenta de nuevo.'
          });
        }
      });
      return;
    }

    if (this.associateSuggestions.length === 1) {
      this.selectAssociate(this.associateSuggestions[0]);
      return;
    }

    this.userService.searchAssociatesByName(query).subscribe({
      next: (users) => {
        this.associateSuggestions = users;
        if (users.length === 1) {
          this.selectAssociate(users[0]);
          return;
        }
        if (users.length === 0) {
          this.resetAssociateState();
          void Swal.fire({
            icon: 'error',
            title: 'Sin resultados',
            text: 'No se encontraron socios con ese nombre.'
          });
          return;
        }
        void Swal.fire({
          icon: 'info',
          title: 'Seleccione un socio',
          text: 'Hay varios resultados con ese nombre. Elige uno de la lista.'
        });
      },
      error: (error) => {
        console.error('Error buscando socio:', error);
        this.resetAssociateState();
      }
    });
  }

  selectAssociate(user: User): void {
    this.associateData = user;
    this.associateFound = true;
    this.associateSuggestions = [];
    this.associateQuery = this.formatAssociate(user);
    this.activeLubricantView = 'orders';
    this.loadSupplies();
    this.loadAssociateOrders();
  }

  loadSupplies(): void {
    if (!this.associateData) {
      this.supplies = [];
      return;
    }

    this.suppliesService.getSupplies(this.associateData.id).subscribe({
      next: (data) => {
        this.supplies = data;
      },
      error: (error) => {
        console.error('Error al obtener suministros:', error);
        this.supplies = [];
      }
    });
  }

  viewDetails(supply: Supplies): void {
    this.paymentModal.supply = [supply, this.associateData?.id ?? null];
    this.paymentModal.openModal();
  }

  loadProducts(): void {
    this.lubricantService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error al cargar productos de lubricantes:', error);
        this.products = [];
      }
    });
  }

  submitProduct(): void {
    if (this.productForm.invalid) {
      void Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete el formulario del producto.'
      });
      return;
    }

    const raw = this.productForm.getRawValue();
    this.lubricantService.createProduct({
      code: String(raw.code).trim(),
      name: String(raw.name).trim(),
      costPrice: Number(raw.costPrice),
      salePrice: Number(raw.salePrice),
      initialStock: Number(raw.initialStock ?? 0)
    }).subscribe({
      next: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'El producto quedó disponible en inventario.'
        });
        this.productForm.reset({
          code: '',
          name: '',
          costPrice: '',
          salePrice: '',
          initialStock: 0
        });
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo crear',
          text: this.extractErrorMessage(error, 'Revise los datos del producto.')
        });
      }
    });
  }

  submitStockEntry(): void {
    if (this.selectedProductIdForStock == null) {
      void Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Seleccione un producto para registrar la entrada.'
      });
      return;
    }

    if (this.stockForm.invalid) {
      void Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete la entrada de inventario.'
      });
      return;
    }

    const raw = this.stockForm.getRawValue();
    this.lubricantService.addStock(this.selectedProductIdForStock, {
      quantity: Number(raw.quantity),
      movementDate: String(raw.movementDate),
      notes: String(raw.notes ?? '')
    }).subscribe({
      next: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Inventario actualizado',
          text: 'La entrada de stock fue registrada.'
        });
        this.stockForm.reset({
          quantity: '',
          movementDate: this.formatDate(new Date()),
          notes: ''
        });
        this.showStockForm = false;
        this.loadProducts();
        if (this.selectedProductForMovements?.id === this.selectedProductIdForStock) {
          this.showMovements(this.selectedProductForMovements);
        }
      },
      error: (error) => {
        console.error('Error registrando entrada:', error);
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar',
          text: this.extractErrorMessage(error, 'Revise la cantidad ingresada.')
        });
      }
    });
  }

  showMovements(product: LubricantProduct): void {
    this.selectedProductForMovements = product;
    this.lubricantService.getMovements(product.id).subscribe({
      next: (movements) => {
        this.productMovements = movements;
      },
      error: (error) => {
        console.error('Error cargando movimientos:', error);
        this.productMovements = [];
      }
    });
  }

  addOrderItem(): void {
    if (this.orderItemForm.invalid) {
      void Swal.fire({
        icon: 'warning',
        title: 'Producto incompleto',
        text: 'Seleccione producto y cantidad.'
      });
      return;
    }

    const raw = this.orderItemForm.getRawValue();
    const productId = Number(raw.productId);
    const quantity = Number(raw.quantity);
    const product = this.products.find((item) => item.id === productId);

    if (!product) {
      void Swal.fire({
        icon: 'error',
        title: 'Producto no encontrado',
        text: 'Seleccione un producto válido.'
      });
      return;
    }

    if (quantity > product.stock) {
      void Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `Solo hay ${product.stock} unidades disponibles para ${product.name}.`
      });
      return;
    }

    const unitPrice = raw.unitPrice === '' || raw.unitPrice == null
      ? Number(product.salePrice)
      : Number(raw.unitPrice);

    this.orderDraftItems = [
      ...this.orderDraftItems,
      {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity
      }
    ];

    this.orderItemForm.reset({
      productId: '',
      quantity: '',
      unitPrice: ''
    });
  }

  removeOrderItem(index: number): void {
    this.orderDraftItems = this.orderDraftItems.filter((_, currentIndex) => currentIndex !== index);
  }

  submitLubricantOrder(): void {
    if (!this.associateData) {
      void Swal.fire({
        icon: 'warning',
        title: 'Socio requerido',
        text: 'Busque y seleccione un socio antes de crear el pedido.'
      });
      return;
    }

    if (this.orderDraftItems.length === 0) {
      void Swal.fire({
        icon: 'warning',
        title: 'Pedido vacío',
        text: 'Agregue al menos un producto al pedido.'
      });
      return;
    }

    if (this.orderForm.invalid) {
      void Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete la fecha y la cuota semanal del pedido.'
      });
      return;
    }

    const raw = this.orderForm.getRawValue();
    this.lubricantService.createOrder({
      userId: this.associateData.id,
      orderDate: String(raw.orderDate),
      weeklyInstallment: Number(raw.weeklyInstallment),
      items: this.orderDraftItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }).subscribe({
      next: () => {
        void Swal.fire({
          icon: 'success',
          title: 'Pedido registrado',
          text: 'El pedido financiado quedó creado y enlazado al saldo semanal.'
        });
        this.orderDraftItems = [];
        this.orderForm.reset({
          orderDate: this.formatDate(new Date()),
          weeklyInstallment: ''
        });
        this.activeLubricantView = 'summary';
        this.loadProducts();
        this.loadAssociateOrders();
        this.loadSupplies();
        this.loadWeeklyCollection();
      },
      error: (error) => {
        console.error('Error creando pedido:', error);
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo crear el pedido',
          text: this.extractErrorMessage(error, 'Revise stock, cuota y datos del pedido.')
        });
      }
    });
  }

  loadAssociateOrders(): void {
    if (!this.associateData) {
      this.associateOrders = [];
      return;
    }

    this.lubricantService.getOrdersByUser(this.associateData.id).subscribe({
      next: (orders) => {
        this.associateOrders = orders;
      },
      error: (error) => {
        console.error('Error al obtener pedidos del socio:', error);
        this.associateOrders = [];
      }
    });
  }

  loadWeeklyCollection(): void {
    this.lubricantService.getWeeklyCollection(this.weeklyCollectionDate).subscribe({
      next: (collection) => {
        this.weeklyCollection = collection;
      },
      error: (error) => {
        console.error('Error al obtener cobranza semanal:', error);
        this.weeklyCollection = [];
      }
    });
  }

  getDraftTotal(): number {
    return this.orderDraftItems.reduce((total, item) => total + item.lineTotal, 0);
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get totalStockUnits(): number {
    return this.products.reduce((total, product) => total + product.stock, 0);
  }

  get inventorySaleValue(): number {
    return this.products.reduce((total, product) => total + (product.stock * Number(product.salePrice)), 0);
  }

  get lowStockProducts(): LubricantProduct[] {
    return this.products
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);
  }

  get pendingOrdersCount(): number {
    return this.weeklyCollection.length;
  }

  get pendingWeeklyBalance(): number {
    return this.weeklyCollection.reduce((total, item) => total + Number(item.balance), 0);
  }

  get pendingWeeklySuggested(): number {
    return this.weeklyCollection.reduce((total, item) => total + Number(item.suggestedPayment), 0);
  }

  get associatePendingBalance(): number {
    return this.associateOrders.reduce((total, order) => total + Number(order.balance), 0);
  }

  get manualSuppliesBalance(): number {
    return this.supplies.reduce((total, supply) => total + Number(supply.supplyBalance), 0);
  }

  get collectionPreview(): LubricantWeeklyCollection[] {
    return this.weeklyCollection.slice(0, 5);
  }

  get selectedProductNameForStock(): string {
    if (this.selectedProductIdForStock == null) {
      return 'Seleccione un producto';
    }

    const product = this.products.find((item) => item.id === this.selectedProductIdForStock);
    return product ? `${product.code} - ${product.name}` : 'Seleccione un producto';
  }

  get selectedOrderProduct(): LubricantProduct | null {
    const productId = Number(this.orderItemForm.get('productId')?.value);
    if (!productId) {
      return null;
    }

    return this.products.find((item) => item.id === productId) ?? null;
  }

  get selectedOrderUnitPrice(): number {
    const product = this.selectedOrderProduct;
    const typedValue = Number(this.orderItemForm.get('unitPrice')?.value);

    if (typedValue > 0) {
      return typedValue;
    }

    return product ? Number(product.salePrice) : 0;
  }

  get selectedOrderQuantity(): number {
    const quantity = Number(this.orderItemForm.get('quantity')?.value);
    return quantity > 0 ? quantity : 0;
  }

  get selectedOrderLineTotal(): number {
    return this.selectedOrderQuantity * this.selectedOrderUnitPrice;
  }

  private resetAssociateState(): void {
    this.associateFound = false;
    this.associateData = null;
    this.supplies = [];
    this.associateOrders = [];
    this.orderDraftItems = [];
  }

  private formatAssociate(user: User): string {
    return `${user.firstName} ${user.lastName} - ${user.numberId}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = (error as { error?: unknown }).error;
      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }
      if (typeof apiError === 'object' && apiError !== null && 'message' in apiError) {
        const message = (apiError as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }
    return fallback;
  }
}
