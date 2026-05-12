'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { useQuiz } from '@/hooks/useQuiz';
import { useAuth } from '@/hooks/useAuth';
import { QuizProgress } from '../components/QuizProgress';
import { AuthModal } from '@/components/AuthModal';

export default function Step5Result() {
  const { sessionId } = useSession();
  const { result, fullReport, fetchResult, pay, isLoading } = useQuiz({ sessionId });
  const { account, bindSession } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchResult();
    }
  }, [sessionId, fetchResult]);

  useEffect(() => {
    if (fullReport) {
      setIsPaid(true);
    }
  }, [fullReport]);

  const handlePay = async () => {
    const amounts: Record<string, number> = {
      monthly: 29.99,
      yearly: 199.99,
      lifetime: 499.99,
    };

    const success = await pay(selectedPlan as 'monthly' | 'yearly' | 'lifetime', amounts[selectedPlan]);
    if (success) {
      setIsPaid(true);
    }
  };

  const handlePayClick = () => {
    if (!account) {
      setRequireAuth(true);
      setShowAuthModal(true);
    } else {
      handlePay();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // 登录成功后，将当前匿名 session 绑定到账号
    if (sessionId) {
      bindSession(sessionId).catch(() => {
        // 绑定失败不影响主流程
      });
    }
    if (requireAuth) {
      // 登录成功后自动继续付费流程
      setRequireAuth(false);
      handlePay();
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    setRequireAuth(false);
  };

  const plans = [
    { type: 'monthly', price: 29.99, period: '月', original: null },
    { type: 'yearly', price: 199.99, period: '年', original: 359.88, save: '44%' },
    { type: 'lifetime', price: 499.99, period: '永久', original: null, popular: true },
  ];

  const bmiCategoryText: Record<string, { text: string; color: string }> = {
    underweight: { text: '偏瘦', color: 'text-yellow-600' },
    normal: { text: '正常', color: 'text-green-600' },
    overweight: { text: '偏胖', color: 'text-orange-600' },
    obese: { text: '肥胖', color: 'text-red-600' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (isPaid && fullReport) {
    return (
      <div className="space-y-8">
        <QuizProgress currentStep={5} />

        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900">您的专属健康报告</h1>
        </div>

        {/* BMI 卡片 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">身体质量指数 (BMI)</h3>
          <div className="flex items-center justify-between">
            <div className="text-5xl font-bold text-blue-600">{fullReport.bmi}</div>
            <div className={`text-xl font-semibold ${bmiCategoryText[fullReport.bmiCategory]?.color || 'text-gray-600'}`}>
              {bmiCategoryText[fullReport.bmiCategory]?.text || fullReport.bmiCategory}
            </div>
          </div>
          <div className="mt-4 h-3 bg-gradient-to-r from-blue-200 via-green-200 to-yellow-200 rounded-full relative">
            <div
              className="absolute top-0 w-3 h-3 bg-blue-600 rounded-full shadow-lg"
              style={{ left: `${Math.min(Math.max((fullReport.bmi / 40) * 100, 0), 100)}%`, transform: 'translateX(-50%)' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>偏瘦</span>
            <span>正常</span>
            <span>偏胖</span>
            <span>肥胖</span>
          </div>
        </div>

        {/* 核心数据 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-gray-900">{fullReport.dailyCalories}</div>
            <div className="text-sm text-gray-600">每日建议摄入 (kcal)</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-gray-900">{fullReport.daysToGoal}</div>
            <div className="text-sm text-gray-600">预计达成天数</div>
          </div>
        </div>

        {/* 目标日期 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🎯</div>
            <div>
              <div className="text-sm opacity-80">预计达成目标日期</div>
              <div className="text-2xl font-bold">{fullReport.targetDate}</div>
            </div>
          </div>
        </div>

        {/* 进度曲线 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">目标进度预测</h3>
          {fullReport.progressCurve && fullReport.progressCurve.length > 1 ? (() => {
            const data = fullReport.progressCurve;
            const weights = data.map(p => p.weight);
            const minW = Math.min(...weights);
            const maxW = Math.max(...weights);
            const range = maxW - minW || 1;
            const padding = { top: 20, right: 20, bottom: 40, left: 45 };
            const chartW = 500;
            const chartH = 200;
            const innerW = chartW - padding.left - padding.right;
            const innerH = chartH - padding.top - padding.bottom;

            const points = data.map((p, i) => ({
              x: padding.left + (i / (data.length - 1)) * innerW,
              y: padding.top + (1 - (p.weight - minW) / range) * innerH,
              ...p,
            }));

            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaPath = linePath + ` L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;

            // Y轴刻度
            const yTicks = 5;
            const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minW + (range * i) / yTicks);

            // X轴标签（取6个均匀分布的点）
            const xLabelIndices = data.length <= 8 
              ? data.map((_, i) => i)
              : Array.from({ length: 6 }, (_, i) => Math.round(i * (data.length - 1) / 5));

            const formatDay = (day: number) => {
              if (day === 0) return '今天';
              if (day <= 7) return `第${day}天`;
              if (day <= 30) return `${Math.ceil(day / 7)}周`;
              return `${Math.round(day / 30)}月`;
            };

            return (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ minWidth: '300px' }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>

                  {/* Y轴网格线 */}
                  {yTickValues.map((val, i) => {
                    const y = padding.top + (1 - (val - minW) / range) * innerH;
                    return (
                      <g key={i}>
                        <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray={i === 0 ? '0' : '4'} />
                        <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">{val.toFixed(1)}</text>
                      </g>
                    );
                  })}

                  {/* 面积 */}
                  <path d={areaPath} fill="url(#areaGradient)" />

                  {/* 折线 */}
                  <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* 数据点 */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  ))}

                  {/* 起点和终点高亮 */}
                  <circle cx={points[0].x} cy={points[0].y} r="5" fill="#3b82f6" />
                  <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#6366f1" />
                  
                  {/* 起点标签 */}
                  <text x={points[0].x} y={points[0].y - 10} textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="600">{weights[0].toFixed(1)}kg</text>
                  {/* 终点标签 */}
                  <text x={points[points.length - 1].x} y={points[points.length - 1].y - 10} textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="600">{weights[weights.length - 1].toFixed(1)}kg</text>

                  {/* X轴标签 */}
                  {xLabelIndices.map((idx) => {
                    const p = points[idx];
                    return (
                      <text key={idx} x={p.x} y={chartH - 8} textAnchor="middle" fill="#9ca3af" fontSize="10">{formatDay(data[idx].day)}</text>
                    );
                  })}
                </svg>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-500">体重变化趋势</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-500">起点 {weights[0].toFixed(1)}kg</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs text-gray-500">目标 {weights[weights.length - 1].toFixed(1)}kg</span>
                  </div>
                </div>
              </div>
            );
          })() : (
            <p className="text-gray-400 text-center py-8">暂无进度数据</p>
          )}
        </div>

        {/* 个性化建议 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">个性化健康建议</h3>
          <ul className="space-y-3">
            {fullReport.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500 pt-4">
          恭喜您完成健康测评！
        </div>
      </div>
    );
  }

  // 未付费 - 显示预览和付费墙
  return (
    <div className="space-y-8">
      <QuizProgress currentStep={5} />

      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-3xl font-bold text-gray-900">您的健康报告已生成</h1>
        <p className="text-gray-600">订阅解锁完整报告和个性化方案</p>
      </div>

      {/* 预览数据 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">报告预览</h3>

        {result ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">BMI</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{result.bmi}</span>
                <span className={`ml-2 text-sm ${bmiCategoryText[result.bmiCategory]?.color || 'text-gray-600'}`}>
                  ({bmiCategoryText[result.bmiCategory]?.text || result.bmiCategory})
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">每日建议摄入</span>
              <span className="text-2xl font-bold text-gray-900">{result.dailyCalories} kcal</span>
            </div>
            <div className="flex justify-between items-center py-3 opacity-50">
              <span className="text-gray-400">目标日期</span>
              <span className="text-gray-400">🔒 解锁查看</span>
            </div>
            <div className="flex justify-between items-center py-3 opacity-50">
              <span className="text-gray-400">个性化建议</span>
              <span className="text-gray-400">🔒 解锁查看</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">正在加载预览...</p>
        )}
      </div>

      {/* 付费墙 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
          解锁完整报告
        </h3>

        <div className="space-y-4 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.type}
              onClick={() => setSelectedPlan(plan.type)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedPlan === plan.type
                  ? 'border-blue-500 bg-white shadow-md'
                  : 'border-gray-200 bg-white/50 hover:border-blue-300'
              } ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-2 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  最受欢迎
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900">{plan.period}订阅</span>
                  {plan.save && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      省{plan.save}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">¥{plan.price}</span>
                  {plan.original && (
                    <span className="text-sm text-gray-400 line-through ml-2">¥{plan.original}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handlePayClick}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {isLoading ? '支付中...' : '立即解锁完整报告'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          🔒 安全支付 · 支持微信、支付宝
        </p>
      </div>

      {/* 登录弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
