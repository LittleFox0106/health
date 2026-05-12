import { NextResponse } from 'next/server';
import { isValidUUID } from '@/lib/validators';

export const dynamic = 'force-dynamic';

// GET /api/auth/me - 获取当前用户信息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '缺少 token 参数' },
        { status: 400 }
      );
    }

    if (!isValidUUID(token)) {
      return NextResponse.json(
        { success: false, error: 'token 格式无效' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 查找账号及关联信息
    const account = await prisma.account.findUnique({
      where: { id: token },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: '账号不存在' },
        { status: 404 }
      );
    }

    const user = account.user;

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        email: account.email,
        nickname: account.nickname,
        user: user ? {
          sessionId: user.sessionId,
        } : null,
        subscription: user?.subscription ? {
          status: user.subscription.status,
          planType: user.subscription.planType,
        } : null,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败', details: errorMessage },
      { status: 500 }
    );
  }
}
