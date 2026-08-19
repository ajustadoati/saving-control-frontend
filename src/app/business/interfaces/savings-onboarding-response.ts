import { Summary } from './summary';
import { UserSavingsBox } from './userSavingBox';

export interface SavingsOnboardingResponse {
  summary: Summary;
  savingsBox: UserSavingsBox | null;
}
