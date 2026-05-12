'use client';

import { useEffect, useState, useCallback } from 'react';

const SESSION_KEY = 'health_quiz_session';

interface Session {
  sessionId: string;
  userId: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 创建新会话
  const createSession = useCallback(async (): Promise<Session> => {
    const res = await fetch('/api/session', { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
      const newSession = data.data;
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return newSession;
    }
    throw new Error('Failed to create session');
  }, []);

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      try {
        // 1. 检查localStorage
        const stored = localStorage.getItem(SESSION_KEY);
        
        // 2. 检查URL参数（支持分享/测试）
        const params = new URLSearchParams(window.location.search);
        const urlSessionId = params.get('session');

        if (urlSessionId) {
          // 如果URL中有session，使用它
          const sessionData = { sessionId: urlSessionId, userId: '' };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
          setSession(sessionData);
        } else if (stored) {
          // 使用存储的session
          setSession(JSON.parse(stored));
        } else {
          // 创建新会话
          await createSession();
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [createSession]);

  // 获取sessionId
  const sessionId = session?.sessionId || null;

  return { sessionId, isLoading, createSession };
}
