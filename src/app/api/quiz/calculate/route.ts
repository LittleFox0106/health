import { NextRequest, NextResponse } from 'next/server';
import { calculateHealthMetrics, getBMICategory, UserData } from '@/lib/calculator';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

type ExerciseFreq = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

// POST /api/quiz/calculate - 提交并计算结果
export async function POST(request: NextRequest) {
  try {
    // 动态导入prisma，避免构建时加载
    const { prisma } = await import('@/lib/prisma');
    
    const body = await request.json();
    const { sessionId, data } = body;

    if (!sessionId || !data || !data.exerciseFreq) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 获取用户和测评数据
    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: {
        quizSession: true,
        subscription: true,
      },
    });

    if (!user || !user.quizSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const quizSession = user.quizSession;

    // 检查是否已完成所有必填步骤
    if (!quizSession.gender || !quizSession.goal || !quizSession.age || 
        !quizSession.height || !quizSession.weight || !quizSession.targetWeight) {
      return NextResponse.json(
        { success: false, error: 'Incomplete quiz data' },
        { status: 400 }
      );
    }

    // 准备计算数据
    const userData: UserData = {
      gender: quizSession.gender as 'male' | 'female',
      age: quizSession.age,
      height: quizSession.height,
      weight: quizSession.weight,
      targetWeight: quizSession.targetWeight,
      exerciseFreq: data.exerciseFreq as ExerciseFreq,
      goal: quizSession.goal as 'lose_weight' | 'build_muscle' | 'maintain',
    };

    // 计算健康指标
    const metrics = calculateHealthMetrics(userData);

    // 更新数据库
    await prisma.quizSession.update({
      where: { userId: user.id },
      data: {
        exerciseFreq: data.exerciseFreq,
        currentStep: 5,
        isCompleted: true,
        bmi: metrics.bmi,
        dailyCalories: metrics.dailyCalories,
        targetDate: metrics.targetDate,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bmi: metrics.bmi,
        bmiCategory: getBMICategory(metrics.bmi),
        dailyCalories: metrics.dailyCalories,
        targetDate: metrics.targetDate.toISOString().split('T')[0],
        daysToGoal: metrics.daysToGoal,
        subscriptionStatus: user.subscription?.status || 'inactive',
      },
    });
  } catch (error) {
    console.error('Failed to calculate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate results' },
      { status: 500 }
    );
  }
}
