export interface HealthMetrics {
  bmi: number;
  bmr: number;           // 基础代谢率
  tdee: number;          // 每日总能量消耗
  dailyCalories: number; // 建议摄入
  targetDate: Date;
  daysToGoal: number;
}

export interface UserData {
  gender: 'male' | 'female';
  age: number;
  height: number;        // cm
  weight: number;        // kg
  targetWeight: number;  // kg
  exerciseFreq: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'build_muscle' | 'maintain';
}

// 活动系数
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // 久坐不动
  light: 1.375,        // 轻度运动 (1-3天/周)
  moderate: 1.55,      // 中度运动 (3-5天/周)
  active: 1.725,       // 高强度运动 (6-7天/周)
  very_active: 1.9     // 专业运动员
};

// 目标调整系数
const GOAL_ADJUSTMENTS = {
  lose_weight: -500,   // 每日减少500大卡
  maintain: 0,
  build_muscle: 300    // 每日增加300大卡
};

export function calculateHealthMetrics(data: UserData): HealthMetrics {
  // 1. 计算BMI
  const heightInMeters = data.height / 100;
  const bmi = data.weight / (heightInMeters * heightInMeters);
  
  // 2. 计算BMR (Mifflin-St Jeor公式)
  let bmr: number;
  if (data.gender === 'male') {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
  } else {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
  }
  
  // 3. 计算TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[data.exerciseFreq];
  
  // 4. 计算建议摄入
  const dailyCalories = Math.round(tdee + GOAL_ADJUSTMENTS[data.goal]);
  
  // 5. 计算目标日期
  const weightDiff = Math.abs(data.targetWeight - data.weight);
  const weeklyChange = data.goal === 'lose_weight' ? 0.5 : 0.25; // kg/周
  const weeksToGoal = weightDiff / weeklyChange;
  const daysToGoal = Math.round(weeksToGoal * 7);
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToGoal);
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    targetDate,
    daysToGoal
  };
}

// BMI分类
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// 生成预测曲线数据
export function generateProgressCurve(
  startWeight: number,
  targetWeight: number,
  daysToGoal: number
): Array<{ day: number; weight: number; date: string }> {
  const curve = [];
  const weightDiff = targetWeight - startWeight;
  
  for (let day = 0; day <= daysToGoal; day += 7) {
    const progress = day / daysToGoal;
    // 使用非线性曲线模拟真实减重/增重过程
    const easedProgress = 1 - Math.pow(1 - progress, 1.5);
    const weight = startWeight + weightDiff * easedProgress;
    
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    curve.push({
      day,
      weight: Math.round(weight * 10) / 10,
      date: date.toISOString().split('T')[0]
    });
  }
  
  return curve;
}
