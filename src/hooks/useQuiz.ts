'use client';

import { useState, useCallback } from 'react';
import { QuizData, QuizProgress, HealthResult, FullReport } from '@/types';

interface UseQuizProps {
  sessionId: string | null;
}

export function useQuiz({ sessionId }: UseQuizProps) {
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [result, setResult] = useState<HealthResult | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取进度
  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/quiz/progress?sessionId=${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 更新进度
  const updateProgress = useCallback(async (step: number, data: Partial<QuizData>) => {
    if (!sessionId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/quiz/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, step, data }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        setProgress(prev => prev ? { ...prev, currentStep: step, quizData: { ...prev.quizData, ...data } } : null);
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('Failed to update progress');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 计算结果
  const calculate = useCallback(async (exerciseFreq: QuizData['exerciseFreq']) => {
    if (!sessionId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/quiz/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, data: { exerciseFreq } }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError('Failed to calculate');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 获取结果
  const fetchResult = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/quiz/result?sessionId=${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        if (data.data.subscriptionStatus === 'active') {
          setFullReport(data.data.fullReport);
        } else {
          setResult(data.data.preview);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch result');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 支付
  const pay = useCallback(async (planType: 'monthly' | 'yearly' | 'lifetime', amount: number) => {
    if (!sessionId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, planType, amount }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // 支付成功后重新获取结果
        await fetchResult();
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError('Payment failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, fetchResult]);

  return {
    progress,
    result,
    fullReport,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
    calculate,
    fetchResult,
    pay,
  };
}
