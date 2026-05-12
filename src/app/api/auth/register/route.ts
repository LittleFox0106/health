import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// 使用 scrypt 加密密码，返回 salt(hex):hash(hex) 格式
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt.toString('hex') + ':' + derivedKey.toString('hex'));
    });
  });
}

// 生成随机 sessionId
function generateSessionId(): string {
  return 'sess_' + crypto.randomBytes(16).toString('hex');
}

// POST /api/auth/register - 注册新账号
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    // 检查邮箱是否已注册
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建 Account、User、QuizSession、Subscription
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        users: {
          create: {
            sessionId: generateSessionId(),
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token: account.id,
        account: {
          id: account.id,
          email: account.email,
          nickname: account.nickname,
        },
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: '注册失败', details: errorMessage },
      { status: 500 }
    );
  }
}
