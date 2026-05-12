import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

// 生成唯一的session ID
function generateSessionId(): string {
  return 'sess_' + crypto.randomBytes(16).toString('hex');
}

// POST /api/session - 创建新用户会话
export async function POST() {
  try {
    const sessionId = generateSessionId();
    
    // 创建用户和关联的quiz session、subscription
    const user = await prisma.user.create({
      data: {
        sessionId,
        quizSession: {
          create: {
            currentStep: 1,
            isCompleted: false,
          },
        },
        subscription: {
          create: {
            status: 'inactive',
          },
        },
      },
      include: {
        quizSession: true,
        subscription: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: user.sessionId,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session',
      },
      { status: 500 }
    );
  }
}
