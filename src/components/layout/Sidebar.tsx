import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  FileText, 
  Settings, 
  LogOut,
  GraduationCap,
  Bell,
  Upload,
  Tags
} from 'lucide-react';
import { UserRole } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const { logout } = useAuth();
  const menuItems = [
    {
      title: 'Tổng quan',
      icon: LayoutDashboard,
      path: '/',
      roles: [UserRole.ADMIN, UserRole.ADVISOR, UserRole.STUDENT, UserRole.MANAGER]
    },
    {
      title: 'Quản lý Sinh viên',
      icon: Users,
      path: '/students',
      roles: [UserRole.ADMIN, UserRole.ADVISOR, UserRole.MANAGER]
    },
    {
      title: 'Nhật ký Tư vấn',
      icon: FileText,
      path: '/counseling',
      roles: [UserRole.ADVISOR, UserRole.MANAGER, UserRole.ADMIN]
    },
    {
      title: 'Nhập dữ liệu (REQ-01)',
      icon: Upload,
      path: '/import',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ADVISOR]
    },
    {
      title: 'Báo cáo & Thống kê',
      icon: FileText,
      path: '/reports',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ADVISOR]
    },
    {
      title: 'Quản lý Danh mục',
      icon: Tags,
      path: '/categories',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    },
    {
      title: 'Kết quả học tập',
      icon: GraduationCap,
      path: '/my-results',
      roles: [UserRole.STUDENT]
    },
    {
      title: 'Thông báo',
      icon: Bell,
      path: '/notifications',
      roles: [UserRole.ADMIN, UserRole.ADVISOR, UserRole.STUDENT, UserRole.MANAGER]
    },
    {
      title: 'Cấu hình Rule Engine',
      icon: Settings,
      path: '/settings',
      roles: [UserRole.ADMIN, UserRole.MANAGER]
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-md">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-xl italic font-serif">AEWS</span>
        </div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">
          Khoa Công nghệ Thông tin
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
