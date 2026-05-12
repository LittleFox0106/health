import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isValidEmail } from '@/lib/validators';

export const dynamic = 'force-dynamic';

// 使用 scrypt 验证密码
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === hashHex);
    });
  });
}

// POST /api/auth/login - 登录
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式无效' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { success: false, error: '密码不能为空' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 查找账号
    const account = await prisma.account.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: '账号不存在' },
        { status: 404 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token: account.id,
        account: {
          id: account.id,
          email: account.email,
          nickname: account.nickname,
        },
        sessionId: account.user?.sessionId || null,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: '登录失败', details: errorMessage },
      { status: 500 }
    );
  }
}
