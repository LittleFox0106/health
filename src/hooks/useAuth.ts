'use client';

import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'health_auth_token';
const ACCOUNT_KEY = 'health_auth_account';

interface Account {
  id: string;
  email: string;
  nickname: string;
}

interface AuthState {
  account: Account | null;
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    account: null,
    token: null,
    isLoading: true,
  });

  // 从 localStorage 初始化，并验证 token 是否仍然有效
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const accountStr = localStorage.getItem(ACCOUNT_KEY);
        const account = accountStr ? JSON.parse(accountStr) : null;

        if (token) {
          // 有 token 时，向后端验证是否仍然有效
          try {
            const res = await fetch(`/api/auth/me?token=${token}`);
            const data = await res.json();

            if (data.success && data.data) {
              // token 有效，更新 account 信息
              setAuth({
                account: data.data,
                token,
                isLoading: false,
              });
              // 同步更新 localStorage 中的 account
              localStorage.setItem(ACCOUNT_KEY, JSON.stringify(data.data));
            } else {
              // token 无效，清除登录状态
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(ACCOUNT_KEY);
              setAuth({ account: null, token: null, isLoading: false });
            }
          } catch {
            // 验证请求失败，仍然使用本地缓存的 account
            setAuth({ account, token, isLoading: false });
          }
        } else {
          setAuth({ account: null, token: null, isLoading: false });
        }
      } catch {
        setAuth({ account: null, token: null, isLoading: false });
      }
    };

    initAuth();
  }, []);

  // 保存到 localStorage
  const saveAuth = useCallback((token: string, account: Account) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    setAuth({ account, token, isLoading: false });
  }, []);

  // 注册
  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success && data.data) {
      saveAuth(data.data.token, data.data.account);
      return { success: true };
    }

    return { success: false, message: data.message || '注册失败' };
  }, [saveAuth]);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success && data.data) {
      saveAuth(data.data.token, data.data.account);
      return { success: true };
    }

    return { success: false, message: data.message || '登录失败' };
  }, [saveAuth]);

  // 退出登录
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    setAuth({ account: null, token: null, isLoading: false });
  }, []);

  // 绑定 session（使用当前 auth.token）
  const bindSession = useCallback(async (sessionId: string) => {
    if (!auth.token) return { success: false, message: '未登录' };

    const res = await fetch('/api/auth/bind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: auth.token, sessionId }),
    });
    const data = await res.json();

    if (data.success) {
      return { success: true };
    }

    return { success: false, message: data.message || '绑定失败' };
  }, [auth.token]);

  // 验证 token
  const checkAuth = useCallback(async () => {
    if (!auth.token) {
      setAuth(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    try {
      const res = await fetch(`/api/auth/me?token=${auth.token}`);
      const data = await res.json();

      if (data.success && data.data) {
        setAuth(prev => ({
          ...prev,
          account: data.data,
          isLoading: false,
        }));
        return true;
      }

      // token 无效，清除
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ACCOUNT_KEY);
      setAuth({ account: null, token: null, isLoading: false });
      return false;
    } catch {
      setAuth(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [auth.token]);

  return {
    account: auth.account,
    token: auth.token,
    isLoading: auth.isLoading,
    register,
    login,
    logout,
    bindSession,
    checkAuth,
  };
}
