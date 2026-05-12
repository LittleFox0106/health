import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 验证schema
const updateProgressSchema = z.object({
  sessionId: z.string(),
  step: z.number().min(1).max(5),
  data: z.record(z.any()),
});

// GET /api/quiz/progress?sessionId=xxx - 获取进度
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
      },
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
    const body = await request.json();
    const validation = updateProgressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { sessionId, step, data } = validation.data;

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
    const updateData: any = {
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
