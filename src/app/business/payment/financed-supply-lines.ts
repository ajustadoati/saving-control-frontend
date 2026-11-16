import { GLOBAL_SUPPLY_LABEL } from '../core/constants/payment-catalog';
import { LubricantOrder } from '../interfaces/lubricant-order';
import { PaymentLine } from '../interfaces/payment-line';
import { Supplies } from '../interfaces/supplies';

export function summarizeSupplyDebt(supplies: Supplies[], orders: LubricantOrder[], date: string) {
  const balances = new Map(supplies
    .filter(supply => supply.supplyId != null && Number(supply.supplyBalance) > 0)
    .map(supply => [supply.supplyId!, Math.round(Number(supply.supplyBalance) * 100)]));
  const totalCents = [...balances.values()].reduce((sum, balance) => sum + balance, 0);
  let installmentCents = 0;
  for (const order of orders) {
    if (order.supplyId == null || !date || order.orderDate > date || order.status === 'PAID') continue;
    installmentCents += Math.min(balances.get(order.supplyId) ?? 0,
      Math.max(0, Math.round(Number(order.weeklyInstallment || 0) * 100)));
  }
  return { balance: totalCents / 100, suggestedAmount: installmentCents / 100 };
}

export function buildGlobalSupplyLine(amount: number): PaymentLine {
  return {
    paymentTitle: GLOBAL_SUPPLY_LABEL,
    amount,
    totalCost: amount,
    defaultPaymentsCount: 1,
    reason: '',
    automaticSupplyLine: true,
  };
}
