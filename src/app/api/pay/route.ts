import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  isValidSessionId,
  isValidPlanType,
  validatePaymentAmount,
} from '@/lib/validators';

// 强制动态渲染，避免构建时收集页面数据
export const dynamic = 'force-dynamic';

type PlanType = 'monthly' | 'yearly' | 'lifetime';

interface PayRequestBody {
  sessionId: string;
  planType: PlanType;
  amount: number;
}

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
    // 动态导入prisma，避免构建时加载
    const { prisma } = await import('@/lib/prisma');

    const body: PayRequestBody = await request.json();

    if (!body.sessionId || !body.planType || !body.amount) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：sessionId、planType、amount' },
        { status: 400 }
      );
    }

    const { sessionId, planType, amount } = body;

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Session ID 格式无效' },
        { status: 400 }
      );
    }

    if (!isValidPlanType(planType)) {
      return NextResponse.json(
        { success: false, error: '订阅计划类型无效' },
        { status: 400 }
      );
    }

    if (!validatePaymentAmount(planType, amount)) {
      return NextResponse.json(
        { success: false, error: '支付金额与套餐不匹配' },
        { status: 400 }
      );
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { sessionId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
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
      { success: false, error: '支付处理失败' },
      { status: 500 }
    );
  }
}
