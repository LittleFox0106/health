import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/auth/bind - 绑定匿名会话到账号
export async function POST(request: Request) {
  try {
    const { token, sessionId } = await request.json();

    if (!token || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'token 和 sessionId 不能为空' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 查找账号是否存在
    const account = await prisma.account.findUnique({
      where: { id: token },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: '账号不存在' },
        { status: 404 }
      );
    }

    // 查找匿名用户
    const user = await prisma.user.findUnique({
      where: { sessionId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      );
    }

    if (user.accountId) {
      return NextResponse.json(
        { success: false, error: '该会话已绑定账号' },
        { status: 400 }
      );
    }

    // 绑定账号
    await prisma.user.update({
      where: { sessionId },
      data: { accountId: token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('绑定账号失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: '绑定账号失败', details: errorMessage },
      { status: 500 }
    );
  }
}
