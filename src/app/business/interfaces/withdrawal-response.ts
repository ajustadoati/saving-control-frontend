export interface WithdrawalResponse {
  userId: number;
  withdrawalAmount: number;
  previousBalance: number;
  newBalance: number;
  description?: string;
  transactionDate: string;
  message: string;
}
