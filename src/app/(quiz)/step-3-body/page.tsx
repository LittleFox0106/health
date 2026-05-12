'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizProgress } from '../components/QuizProgress';

export default function Step3Body() {
  const router = useRouter();
  const { sessionId } = useSession();
  const { updateProgress, progress, isLoading } = useQuiz({ sessionId });
  
  const [formData, setFormData] = useState({
    age: progress?.quizData.age?.toString() || '',
    height: progress?.quizData.height?.toString() || '',
    weight: progress?.quizData.weight?.toString() || '',
    targetWeight: progress?.quizData.targetWeight?.toString() || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.age) {
      newErrors.age = '请输入年龄';
    } else if (parseInt(formData.age) < 10 || parseInt(formData.age) > 120) {
      newErrors.age = '年龄应在10-120之间';
    }
    
    if (!formData.height) {
      newErrors.height = '请输入身高';
    } else if (parseInt(formData.height) < 100 || parseInt(formData.height) > 250) {
      newErrors.height = '身高应在100-250cm之间';
    }
    
    if (!formData.weight) {
      newErrors.weight = '请输入体重';
    } else if (parseFloat(formData.weight) < 30 || parseFloat(formData.weight) > 300) {
      newErrors.weight = '体重应在30-300kg之间';
    }
    
    if (!formData.targetWeight) {
      newErrors.targetWeight = '请输入目标体重';
    } else if (parseFloat(formData.targetWeight) < 30 || parseFloat(formData.targetWeight) > 300) {
      newErrors.targetWeight = '目标体重应在30-300kg之间';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    
    const success = await updateProgress(3, {
      age: parseInt(formData.age),
      height: parseInt(formData.height),
      weight: parseFloat(formData.weight),
      targetWeight: parseFloat(formData.targetWeight),
    });
    
    if (success) {
      router.push('/step-4-exercise');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-8">
      <QuizProgress currentStep={3} />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">您的身体数据</h1>
        <p className="text-gray-600">请如实填写，我们会为您计算最合适的目标</p>
      </div>

      <div className="space-y-6">
        {/* 年龄 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年龄
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="请输入年龄"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.age ? 'border-red-500' : 'border-gray-200'
              } focus:border-blue-500 focus:outline-none transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">岁</span>
          </div>
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        {/* 身高 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            身高
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="请输入身高"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.height ? 'border-red-500' : 'border-gray-200'
              } focus:border-blue-500 focus:outline-none transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
        </div>

        {/* 当前体重 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            当前体重
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="请输入当前体重"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.weight ? 'border-red-500' : 'border-gray-200'
              } focus:border-blue-500 focus:outline-none transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
          {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        </div>

        {/* 目标体重 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目标体重
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              placeholder="请输入目标体重"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.targetWeight ? 'border-red-500' : 'border-gray-200'
              } focus:border-blue-500 focus:outline-none transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
          {errors.targetWeight && <p className="text-red-500 text-sm mt-1">{errors.targetWeight}</p>}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors duration-200"
      >
        {isLoading ? '保存中...' : '继续'}
      </button>
    </div>
  );
}
