// types/stats.ts

// Para el ComparisonChart
export interface ComparisonData {
  userId: string;
  userName: string;
  score: number;
  classCode: string;
  country: string;
  countryRole?: {
    country: string;
    language: string;
    flag: string;
  };
  age: number;
  completedAt: number;
}

export interface FormStats {
  median: number;
  totalUsers: number;
  min: number;
  max: number;
  belowMedian: number;
  aboveMedian: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
}
