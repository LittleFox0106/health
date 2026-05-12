import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="text-6xl mb-4">💪</div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          健康测评系统
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          5分钟完成专业健康评估，获取个性化健康方案
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">BMI分析</h3>
            <p className="text-sm text-gray-600">精准计算身体质量指数</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="font-semibold text-gray-900">热量建议</h3>
            <p className="text-sm text-gray-600">每日摄入目标定制</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900">目标预测</h3>
            <p className="text-sm text-gray-600">达成目标时间预估</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/step-1-gender"
          className="inline-block w-full md:w-auto px-12 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                     hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          开始健康测评
        </Link>

        {/* Trust indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-4">
          <span className="flex items-center">
            <span className="mr-1">✓</span> 免费测评
          </span>
          <span className="flex items-center">
            <span className="mr-1">✓</span> 科学算法
          </span>
          <span className="flex items-center">
            <span className="mr-1">✓</span> 隐私保护
          </span>
        </div>
      </div>
    </div>
  );
}
