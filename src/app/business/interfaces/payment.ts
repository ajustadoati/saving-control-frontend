import { PaymentDetail } from "./paymentDetail";

export interface Payment {
  userId:number;
  date: string;
  payments: PaymentDetail[];
}
