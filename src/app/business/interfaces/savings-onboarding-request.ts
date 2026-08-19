export interface SavingsOnboardingRequest {
  joinSavingsBox: boolean;
  initialBalance: number;
  interestEarned: number;
  boxCount: number;
  boxValue: number;
  effectiveDate: string;
}
