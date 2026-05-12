export interface QuizData {
  gender?: 'male' | 'female';
  goal?: 'lose_weight' | 'build_muscle' | 'maintain';
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  exerciseFreq?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface QuizProgress {
  currentStep: number;
  quizData: QuizData;
  isCompleted: boolean;
}

export interface HealthResult {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  targetDate?: string;
  daysToGoal?: number;
}

export interface Subscription {
  status: 'inactive' | 'active' | 'expired' | 'cancelled';
  planType?: 'monthly' | 'yearly' | 'lifetime';
  startedAt?: string;
  expiresAt?: string;
}

export interface ProgressCurvePoint {
  day: number;
  weight: number;
  date: string;
}

export interface FullReport extends HealthResult {
  progressCurve: ProgressCurvePoint[];
  recommendations: string[];
}
