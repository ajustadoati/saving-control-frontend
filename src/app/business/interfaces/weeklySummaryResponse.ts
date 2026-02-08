export interface WeeklySummaryResponse {
  date?: string;
  ahorro?: number;
  intereses1?: number;
  capital1?: number;
  capital2?: number;
  capitalExt?: number;
  ingresos?: number;
  egresos?: number;
  totalDia?: number;
  saldoAnterior?: number;
  saldoFinal?: number;
  interestIncome?: number;
  savingsIncome?: number;
  loanPrincipalIncome?: number;
  loansOutflow?: number;
  message?: string;
}
