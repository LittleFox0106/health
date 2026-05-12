import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBMICategory, generateProgressCurve } from '@/lib/calculator';

// GET /api/quiz/result?sessionId=xxx - 获取结果（带权限校验）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

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
    const subscription = user.subscription;

    // 检查是否已完成测评
    if (!quizSession.isCompleted) {
      return NextResponse.json(
        { success: false, error: 'Quiz not completed' },
        { status: 400 }
      );
    }

    const subscriptionStatus = subscription?.status || 'inactive';

    // 非会员：返回部分脱敏数据
    if (subscriptionStatus !== 'active') {
      return NextResponse.json({
        success: true,
        data: {
          subscriptionStatus: 'inactive',
          preview: {
            bmi: quizSession.bmi,
            bmiCategory: getBMICategory(quizSession.bmi || 0),
            dailyCalories: quizSession.dailyCalories,
          },
          lockedContent: {
            targetDate: true,
            daysToGoal: true,
            progressCurve: true,
            recommendations: true,
          },
          upgradeMessage: '订阅查看完整报告和个性化方案',
          upgradePlans: [
            { type: 'monthly', price: 29.99, period: '月' },
            { type: 'yearly', price: 199.99, period: '年' },
            { type: 'lifetime', price: 499.99, period: '永久' },
          ],
        },
      });
    }

    // 会员：返回完整数据
    const daysToGoal = quizSession.targetDate 
      ? Math.ceil((quizSession.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const progressCurve = generateProgressCurve(
      quizSession.weight || 0,
      quizSession.targetWeight || 0,
      daysToGoal
    );

    // 生成个性化建议
    const recommendations = generateRecommendations(quizSession);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionStatus: 'active',
        fullReport: {
          bmi: quizSession.bmi,
          bmiCategory: getBMICategory(quizSession.bmi || 0),
          dailyCalories: quizSession.dailyCalories,
          targetDate: quizSession.targetDate?.toISOString().split('T')[0],
          daysToGoal,
          progressCurve,
          recommendations,
        },
      },
    });
  } catch (error) {
    console.error('Failed to get result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get result' },
      { status: 500 }
    );
  }
}

// 生成个性化建议
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateRecommendations(quizSession: Record<string, unknown>): string[] {
  const recommendations: string[] = [];
  
  if (!quizSession) return recommendations;

  // 基于BMI的建议
  const bmi = (quizSession.bmi as number) || 0;
  if (bmi < 18.5) {
    recommendations.push('您的BMI偏低，建议增加营养摄入，配合力量训练增加肌肉量。');
  } else if (bmi >= 25) {
    recommendations.push('您的BMI偏高，建议控制饮食热量，增加有氧运动。');
  } else {
    recommendations.push('您的BMI在正常范围内，保持当前的生活方式即可。');
  }

  // 基于目标的建议
  const goal = quizSession.goal as string;
  if (goal === 'lose_weight') {
    recommendations.push('建议每周进行3-5次有氧运动，每次30-60分钟。');
    recommendations.push('控制饮食中的碳水化合物摄入，增加蛋白质比例。');
  } else if (goal === 'build_muscle') {
    recommendations.push('建议每周进行3-4次力量训练，注重大肌群的锻炼。');
    recommendations.push('确保每日蛋白质摄入量达到每公斤体重1.6-2.2克。');
  }

  // 基于运动频率的建议
  const exerciseFreq = quizSession.exerciseFreq as string;
  if (exerciseFreq === 'sedentary') {
    recommendations.push('您目前的运动量较少，建议从每天步行30分钟开始。');
  } else if (exerciseFreq === 'very_active') {
    recommendations.push('您的运动量很大，注意适当休息和恢复，避免过度训练。');
  }

  return recommendations;
}
