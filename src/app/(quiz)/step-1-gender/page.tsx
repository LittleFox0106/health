'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizProgress } from '../components/QuizProgress';

export default function Step1Gender() {
  const router = useRouter();
  const { sessionId } = useSession();
  const { updateProgress, isLoading } = useQuiz({ sessionId });
  const [selectedGender, setSelectedGender] = useState<string>('');

  const handleContinue = async () => {
    if (!selectedGender) return;
    
    const success = await updateProgress(1, { gender: selectedGender as 'male' | 'female' });
    if (success) {
      router.push('/step-2-goal');
    }
  };

  const genders = [
    { value: 'male', label: '男性', emoji: '👨' },
    { value: 'female', label: '女性', emoji: '👩' },
  ];

  return (
    <div className="space-y-8">
      <QuizProgress currentStep={1} />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">您的性别是？</h1>
        <p className="text-gray-600">这将帮助我们为您定制更精准的健康方案</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {genders.map((gender) => (
          <button
            key={gender.value}
            onClick={() => setSelectedGender(gender.value)}
            className={`p-8 rounded-2xl border-2 transition-all duration-200 ${
              selectedGender === gender.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-2">{gender.emoji}</div>
            <div className="text-lg font-medium text-gray-900">{gender.label}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedGender || isLoading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors duration-200"
      >
        {isLoading ? '保存中...' : '继续'}
      </button>
    </div>
  );
}
