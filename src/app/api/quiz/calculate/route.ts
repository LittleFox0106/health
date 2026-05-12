import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHealthMetrics, getBMICategory, UserData } from '@/lib/calculator';
import { z } from 'zod';

// 验证schema
const calculateSchema = z.object({
  sessionId: z.string(),
  data: z.object({
    exerciseFreq: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  }),
});

// POST /api/quiz/calculate - 提交并计算结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = calculateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { sessionId, data } = validation.data;

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
      exerciseFreq: data.exerciseFreq,
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
