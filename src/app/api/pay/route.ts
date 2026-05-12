import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

// 验证schema
const paySchema = z.object({
  sessionId: z.string(),
  planType: z.enum(['monthly', 'yearly', 'lifetime']),
  amount: z.number().positive(),
});

// 生成支付ID
function generatePaymentId(): string {
  return 'pay_' + crypto.randomBytes(16).toString('hex');
}

// 计算订阅到期时间
function calculateExpiryDate(planType: string): Date {
  const now = new Date();
  const expiry = new Date(now);
  
  switch (planType) {
    case 'monthly':
      expiry.setMonth(expiry.getMonth() + 1);
      break;
    case 'yearly':
      expiry.setFullYear(expiry.getFullYear() + 1);
      break;
    case 'lifetime':
      expiry.setFullYear(expiry.getFullYear() + 100);
      break;
    default:
      expiry.setMonth(expiry.getMonth() + 1);
  }
  
  return expiry;
}

// POST /api/pay - 模拟支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = paySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { sessionId, planType, amount } = validation.data;

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 生成支付ID
    const paymentId = generatePaymentId();
    const now = new Date();
    const expiresAt = calculateExpiryDate(planType);

    // 更新或创建订阅
    const subscription = user.subscription
      ? await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: 'active',
            planType,
            startedAt: now,
            expiresAt,
            paymentId,
            paidAmount: amount,
            paidAt: now,
          },
        })
      : await prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'active',
            planType,
            startedAt: now,
            expiresAt,
            paymentId,
            paidAmount: amount,
            paidAt: now,
          },
        });

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        status: 'success',
        subscription: {
          status: subscription.status,
          planType: subscription.planType,
          startedAt: subscription.startedAt?.toISOString(),
          expiresAt: subscription.expiresAt?.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Payment failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// 防止GET请求导致构建错误
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
