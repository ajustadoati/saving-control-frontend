export interface ReversedPaymentDetail {
  paymentType: string;
  amount: number;
  description: string;
}

export interface RevertPaymentResponse {
  userId: number;
  paymentDate: string;
  reversalDateTime: string;
  totalReversedAmount: number;
  reversedPaymentsCount: number;
  reversedPayments: ReversedPaymentDetail[];
  reason?: string;
  message: string;
}
