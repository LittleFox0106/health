import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

// GET /api/quiz/progress?sessionId=xxx - 获取进度
export async function GET(request: NextRequest) {
  try {
    // 动态导入prisma，避免构建时加载
    const { prisma } = await import('@/lib/prisma');
    
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
      include: { quizSession: true },
    });

    if (!user || !user.quizSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
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
      { success: false, error: 'Failed to get progress' },
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
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { quizSession: true },
    });

    if (!user || !user.quizSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
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
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
