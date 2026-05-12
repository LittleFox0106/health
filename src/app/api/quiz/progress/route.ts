import { NextRequest, NextResponse } from 'next/server';
import {
  isValidSessionId,
  isValidStep,
  isValidGender,
  isValidGoal,
  isValidAge,
  isValidHeight,
  isValidWeight,
  isValidExerciseFreq,
} from '@/lib/validators';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

// GET /api/quiz/progress?sessionId=xxx - 获取进度
export async function GET(request: NextRequest) {
  try {
    // 动态导入prisma，避免构建时加载
    const { prisma } = await import('@/lib/prisma');

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId || !isValidSessionId(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Session ID 格式无效' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { quizSession: true },
    });

    if (!user || !user.quizSession) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      );
    }

    const quizSession = user.quizSession;

    return NextResponse.json({
      success: true,
      data: {
        currentStep: quizSession.currentStep,
        quizData: {
          gender: quizSession.gender,
          goal: quizSession.goal,
          age: quizSession.age,
          height: quizSession.height,
          weight: quizSession.weight,
          targetWeight: quizSession.targetWeight,
          exerciseFreq: quizSession.exerciseFreq,
        },
        isCompleted: quizSession.isCompleted,
      },
    });
  } catch (error) {
    console.error('Failed to get progress:', error);
    return NextResponse.json(
      { success: false, error: '获取进度失败' },
      { status: 500 }
    );
  }
}

// PUT /api/quiz/progress - 更新进度
export async function PUT(request: NextRequest) {
  try {
    // 动态导入prisma，避免构建时加载
    const { prisma } = await import('@/lib/prisma');

    const body = await request.json();
    const { sessionId, step, data } = body;

    if (!sessionId || !step || !data) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Session ID 格式无效' },
        { status: 400 }
      );
    }

    if (!isValidStep(step)) {
      return NextResponse.json(
        { success: false, error: '步骤参数无效，必须为1-5的整数' },
        { status: 400 }
      );
    }

    // 根据步骤验证对应字段
    if (step === 1 && data.gender !== undefined) {
      if (!isValidGender(data.gender)) {
        return NextResponse.json(
          { success: false, error: '性别参数无效' },
          { status: 400 }
        );
      }
    }

    if (step === 2 && data.goal !== undefined) {
      if (!isValidGoal(data.goal)) {
        return NextResponse.json(
          { success: false, error: '目标参数无效' },
          { status: 400 }
        );
      }
    }

    if (step === 3) {
      if (data.age !== undefined && !isValidAge(data.age)) {
        return NextResponse.json(
          { success: false, error: '年龄参数无效，必须为1-150的整数' },
          { status: 400 }
        );
      }
      if (data.height !== undefined && !isValidHeight(data.height)) {
        return NextResponse.json(
          { success: false, error: '身高参数无效，必须为50-300的整数' },
          { status: 400 }
        );
      }
      if (data.weight !== undefined && !isValidWeight(data.weight)) {
        return NextResponse.json(
          { success: false, error: '体重参数无效' },
          { status: 400 }
        );
      }
      if (data.targetWeight !== undefined && !isValidWeight(data.targetWeight)) {
        return NextResponse.json(
          { success: false, error: '目标体重参数无效' },
          { status: 400 }
        );
      }
    }

    if (step === 4 && data.exerciseFreq !== undefined) {
      if (!isValidExerciseFreq(data.exerciseFreq)) {
        return NextResponse.json(
          { success: false, error: '运动频率参数无效' },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { quizSession: true },
    });

    if (!user || !user.quizSession) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      );
    }

    // 构建更新数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, unknown> = {
      currentStep: step,
    };

    // 根据步骤更新对应字段
    if (step === 1 && data.gender) {
      updateData.gender = data.gender;
    } else if (step === 2 && data.goal) {
      updateData.goal = data.goal;
    } else if (step === 3) {
      if (data.age !== undefined) updateData.age = data.age;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.targetWeight !== undefined) updateData.targetWeight = data.targetWeight;
    } else if (step === 4 && data.exerciseFreq) {
      updateData.exerciseFreq = data.exerciseFreq;
    }

    await prisma.quizSession.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentStep: step,
        nextStep: step < 5 ? step + 1 : 5,
      },
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: '更新进度失败', details: errorMessage },
      { status: 500 }
    );
  }
}
