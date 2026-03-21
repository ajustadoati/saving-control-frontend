
export interface Loan {
  loanId?: number;
  userId:number;
  loanAmount: number;
  interestRate: number;
  loanBalance: number;
  startDate: string;
  endDate: string;
  loanTypeName: string;
}
