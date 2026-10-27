import { availableFinancedSupplies, buildFinancedSupplyLines, financedSupplyTitle, selectFinancedSupply } from './financed-supply-lines';
import { LubricantOrder } from '../interfaces/lubricant-order';

const order = (changes: Partial<LubricantOrder> = {}): LubricantOrder => ({
  orderId: 1, userId: 1, userName: 'Test', numberId: 'test', orderDate: '2026-10-28',
  totalAmount: 195, balance: 195, weeklyInstallment: 75, installmentCount: 3,
  status: 'PENDING', supplyId: 10, items: [], ...changes,
});

describe('buildFinancedSupplyLines', () => {
  it('links each installment to its own supply', () => {
    const lines = buildFinancedSupplyLines([order(), order({ orderId: 2, supplyId: 20 })], '2026-10-28');
    expect(lines.map(line => line.supplyId)).toEqual([10, 20]);
    expect(lines[0].amount).toBe(75);
    expect(lines[0].paymentTitle).toBe('Suministro #1');
  });
  it('caps the last installment at the remaining balance', () => {
    expect(buildFinancedSupplyLines([order({ balance: 18, weeklyInstallment: 52 })], '2026-10-28')[0].amount).toBe(18);
  });
  it('does not include future, paid, zero or unlinked debts', () => {
    expect(buildFinancedSupplyLines([
      order({ orderDate: '2026-11-04' }), order({ status: 'PAID' }),
      order({ balance: 0 }), order({ supplyId: null }),
    ], '2026-10-28')).toEqual([]);
  });
  it('offers future orders for explicit early payments, without generating an automatic installment', () => {
    expect(availableFinancedSupplies([order()]).length).toBe(1);
    expect(buildFinancedSupplyLines([order()], '2026-10-26')).toEqual([]);
  });
  it('links a manually selected short label and preserves the entered 100 payment', () => {
    const line = selectFinancedSupply({ paymentTitle: financedSupplyTitle(order()), amount: 100,
      totalCost: 100, defaultPaymentsCount: 1, reason: '' }, [order()]);
    expect(line.supplyId).toBe(10);
    expect(line.supplyOrderId).toBe(1);
    expect(line.amount).toBe(100);
    expect(line.supplyLineOrigin).toBe('manual');
  });
  it('clears the previous reference when changing the payment type', () => {
    const line = selectFinancedSupply({ ...buildFinancedSupplyLines([order()], '2026-10-28')[0],
      paymentTitle: 'Administrativo' }, [order()]);
    expect(line.supplyId).toBe(undefined);
    expect(line.supplyOrderId).toBe(undefined);
  });
});
