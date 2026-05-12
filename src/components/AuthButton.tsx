'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';

export function AuthButton() {
  const { account, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 已登录：显示默认头像 + 下拉菜单
  if (account) {
    const initial = (account.nickname || account.email || 'U').charAt(0).toUpperCase();

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          {/* 默认头像 */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:shadow-md transition-shadow">
            {initial}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* 下拉菜单 */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn z-50">
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {account.nickname || '用户'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {account.email}
                  </div>
                </div>
              </div>
            </div>

            {/* 退出按钮 */}
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 未登录：显示登录按钮
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        <User className="w-4 h-4" />
        <span>登录 / 注册</span>
      </button>
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          window.location.reload();
        }}
      />
    </>
  );
}
