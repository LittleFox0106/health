'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizProgress } from '../components/QuizProgress';

export default function Step2Goal() {
  const router = useRouter();
  const { sessionId } = useSession();
  const { updateProgress, isLoading } = useQuiz({ sessionId });
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  const handleContinue = async () => {
    if (!selectedGoal) return;
    
    const success = await updateProgress(2, { goal: selectedGoal as 'lose_weight' | 'build_muscle' | 'maintain' });
    if (success) {
      router.push('/step-3-body');
    }
  };

  const goals = [
    { value: 'lose_weight', label: '减重', description: '燃烧脂肪，塑造身材', emoji: '🔥' },
    { value: 'build_muscle', label: '增肌', description: '增加肌肉量，提升力量', emoji: '💪' },
    { value: 'maintain', label: '保持', description: '维持当前健康状态', emoji: '⚖️' },
  ];

  return (
    <div className="space-y-8">
      <QuizProgress currentStep={2} />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">您的主要目标是？</h1>
        <p className="text-gray-600">选择最符合您当前需求的选项</p>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => setSelectedGoal(goal.value)}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              selectedGoal === goal.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{goal.emoji}</div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{goal.label}</div>
                <div className="text-sm text-gray-600">{goal.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedGoal || isLoading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors duration-200"
      >
        {isLoading ? '保存中...' : '继续'}
      </button>
    </div>
  );
}
