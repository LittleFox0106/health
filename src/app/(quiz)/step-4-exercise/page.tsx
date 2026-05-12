'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizProgress } from '../components/QuizProgress';

export default function Step4Exercise() {
  const router = useRouter();
  const { sessionId } = useSession();
  const { calculate, isLoading } = useQuiz({ sessionId });
  const [selectedFreq, setSelectedFreq] = useState<string>('');

  const exerciseOptions = [
    { 
      value: 'sedentary', 
      label: '久坐不动', 
      description: '大部分时间坐着，几乎不运动',
      emoji: '🪑'
    },
    { 
      value: 'light', 
      label: '轻度运动', 
      description: '每周1-3天轻度运动',
      emoji: '🚶'
    },
    { 
      value: 'moderate', 
      label: '中度运动', 
      description: '每周3-5天中等强度运动',
      emoji: '🏃'
    },
    { 
      value: 'active', 
      label: '高强度运动', 
      description: '每周6-7天高强度运动',
      emoji: '🏋️'
    },
    { 
      value: 'very_active', 
      label: '专业运动员', 
      description: '每天高强度训练或体力工作',
      emoji: '🏅'
    },
  ];

  const handleContinue = async () => {
    if (!selectedFreq) return;
    
    const success = await calculate(selectedFreq as any);
    if (success) {
      router.push('/step-5-result');
    }
  };

  return (
    <div className="space-y-8">
      <QuizProgress currentStep={4} />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">您的运动频率是？</h1>
        <p className="text-gray-600">这将帮助我们计算您的每日能量消耗</p>
      </div>

      <div className="space-y-4">
        {exerciseOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedFreq(option.value)}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              selectedFreq === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{option.emoji}</div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedFreq || isLoading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors duration-200"
      >
        {isLoading ? '计算中...' : '查看结果'}
      </button>
    </div>
  );
}
