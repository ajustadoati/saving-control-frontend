export interface RevertPaymentRequest {
  userId: number;
  date: string; // Será convertido a LocalDate en el backend
  reason?: string; // Opcional según el backend
}
