export interface LubricantOrderItem {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface LubricantOrder {
  orderId: number;
  userId: number;
  userName: string;
  numberId: string;
  orderDate: string;
  totalAmount: number;
  balance: number;
  weeklyInstallment: number;
  installmentCount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
  supplyId: number | null;
  items: LubricantOrderItem[];
}
