import { LubricantOrder } from '../interfaces/lubricant-order';
import { PaymentLine } from '../interfaces/payment-line';

export function financedSupplyTitle(order: LubricantOrder): string {
  return `Suministro #${order.orderId}`;
}

export function availableFinancedSupplies(orders: LubricantOrder[]): LubricantOrder[] {
  return orders.filter(order => order.supplyId != null && order.balance > 0
    && order.status !== 'PAID' && order.weeklyInstallment > 0);
}

export function selectFinancedSupply(line: PaymentLine, orders: LubricantOrder[]): PaymentLine {
  const order = availableFinancedSupplies(orders).find(order => financedSupplyTitle(order) === line.paymentTitle);
  const cleared = { ...line, supplyId: undefined, supplyOrderId: undefined, supplyBalance: undefined,
    supplyLineOrigin: undefined, legacySupplyDefault: false };
  if (!order) return cleared;
  const suggested = Math.round(Math.min(Number(order.weeklyInstallment), Number(order.balance)) * 100) / 100;
  return { ...cleared, supplyId: order.supplyId!, supplyOrderId: order.orderId,
    supplyBalance: Number(order.balance), supplyLineOrigin: 'manual',
    amount: Number.isFinite(line.amount) && line.amount > 0 ? line.amount : suggested };
}

export function buildFinancedSupplyLines(orders: LubricantOrder[], date: string): PaymentLine[] {
  return availableFinancedSupplies(orders).filter(order => order.orderDate <= date)
    .map(order => {
      const amount = Math.round(Math.min(Number(order.weeklyInstallment), Number(order.balance)) * 100) / 100;
      return {
        paymentTitle: financedSupplyTitle(order),
        amount, totalCost: amount, defaultPaymentsCount: 1, reason: '',
        supplyId: order.supplyId!, supplyOrderId: order.orderId, supplyBalance: Number(order.balance),
        supplyLineOrigin: 'automatic',
      };
    });
}
