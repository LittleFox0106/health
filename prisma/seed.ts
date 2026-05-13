import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

async function main() {
  console.log('开始创建种子数据...');

  // 清理旧数据（按依赖顺序删除）
  await prisma.subscription.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();

  // 创建 VIP 测试账号
  const vipPassword = await hashPassword('123456');
  const vipAccount = await prisma.account.create({
    data: {
      email: 'vip@test.com',
      password: vipPassword,
      nickname: 'VIP用户',
      user: {
        create: {
          sessionId: 'sess_vip_' + crypto.randomBytes(16).toString('hex'),
          quizSession: {
            create: {
              currentStep: 1,
              isCompleted: false,
            },
          },
          subscription: {
            create: {
              status: 'active',
              planType: 'lifetime',
            },
          },
        },
      },
    },
  });
  console.log(`已创建 VIP 账号: ${vipAccount.email} (${vipAccount.id})`);

  // 创建普通测试账号
  const freePassword = await hashPassword('123456');
  const freeAccount = await prisma.account.create({
    data: {
      email: 'free@test.com',
      password: freePassword,
      nickname: '普通用户',
      user: {
        create: {
          sessionId: 'sess_free_' + crypto.randomBytes(16).toString('hex'),
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
  console.log(`已创建普通账号: ${freeAccount.email} (${freeAccount.id})`);

  console.log('种子数据创建完成！');
  console.log('--- 测试账号 ---');
  console.log('VIP用户: vip@test.com / 123456');
  console.log('普通用户: free@test.com / 123456');
}

main()
  .catch((e) => {
    console.error('种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
