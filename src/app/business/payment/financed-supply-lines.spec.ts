import { LubricantOrder } from '../interfaces/lubricant-order';
import { Supplies } from '../interfaces/supplies';
import { buildGlobalSupplyLine, summarizeSupplyDebt } from './financed-supply-lines';

const debt = (supplyId: number, supplyBalance: number): Supplies =>
  ({ supplyId, supplyBalance, userId: 1, supplyName: '', supplyAmount: 120, supplyDate: '2026-10-01' });

const order = (supplyId: number, weeklyInstallment: number, orderDate = '2026-10-28'): LubricantOrder =>
  ({ supplyId, weeklyInstallment, orderDate, status: 'PENDING' } as LubricantOrder);

describe('global supplies', () => {
  it('sums real balances and caps each due installment', () => {
    const result = summarizeSupplyDebt([debt(1, 80), debt(2, 18), debt(3, 22)],
      [order(1, 30), order(2, 52)], '2026-10-28');
    expect(result).toEqual({ balance: 120, suggestedAmount: 48 });
  });

  it('displays future debt without suggesting an installment before its date', () => {
    expect(summarizeSupplyDebt([debt(1, 80)], [order(1, 30)], '2026-10-27'))
      .toEqual({ balance: 80, suggestedAmount: 0 });
  });

  it('rounds in cents and ignores fully paid or unlinked orders', () => {
    expect(summarizeSupplyDebt([debt(1, 0.1), debt(2, 0.2), debt(3, 0)],
      [order(1, 5), order(2, 5), order(3, 5), order(4, 5)], '2026-10-28'))
      .toEqual({ balance: 0.3, suggestedAmount: 0.3 });
  });

  it('uses one generic line for the amount and receipt', () => {
    expect(buildGlobalSupplyLine(48)).toEqual({
      paymentTitle: 'Suministros', amount: 48, totalCost: 48,
      defaultPaymentsCount: 1, reason: '', automaticSupplyLine: true,
    });
  });
});
