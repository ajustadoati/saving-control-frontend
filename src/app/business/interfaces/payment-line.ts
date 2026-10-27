export interface PaymentLine {
  paymentTitle: string;
  amount: number;
  defaultPaymentsCount: number;
  totalCost: number;
  reason: string;
  supplyId?: number;
  supplyOrderId?: number;
  supplyBalance?: number;
  supplyLineOrigin?: 'automatic' | 'manual';
  legacySupplyDefault?: boolean;
}
