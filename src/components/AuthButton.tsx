'use client';

import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';

export function AuthButton() {
  const { account, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{account.nickname}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>退出</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        <User className="w-4 h-4" />
        <span>登录</span>
      </button>
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setShowModal(false)}
      />
    </>
  );
}
