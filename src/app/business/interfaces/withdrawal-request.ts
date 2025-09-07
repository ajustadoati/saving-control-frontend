export interface WithdrawalRequest {
  userId: number;
  amount: number;
  description?: string;
  withdrawalType: 'INTEREST' | 'TOTAL_BALANCE';
}
