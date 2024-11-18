// types/stats.ts

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