import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1"></div>

      <div className="flex items-center gap-6">
        <Link to="/notifications" className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.displayName || 'Guest User'}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase font-medium">{user?.role || 'Visitor'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
