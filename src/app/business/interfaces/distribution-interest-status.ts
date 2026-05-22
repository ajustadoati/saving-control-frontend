export interface DistributionInterestItem {
  userId: number;
  name: string;
  totalBalance: number;
  interest: number;
  distributedAmount: number;
  date?: string;
}

export interface DistributionInterestStatus {
  date: string;
  distributed: boolean;
  previousPendingDate?: string | null;
  distributions: DistributionInterestItem[];
}
