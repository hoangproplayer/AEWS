import React, { useState } from 'react';
import { ShieldAlert, LogIn, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Map pseudo-username to email if needed
      const email = username.includes('@') ? username : `${username}@university.edu`;
      await signInWithEmail(email, password);
    } catch (err) {
      setError('Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side: Branding */}
        <div className="bg-slate-900 p-12 flex flex-col justify-between text-white border-r border-slate-800">
          <div>
            <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight italic font-serif">AEWS</h1>
            <p className="text-slate-400 mt-2 font-medium">Academic Early Warning System</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold leading-tight">
              Đồng hành cùng sự nghiệp học tập của sinh viên.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hệ thống hỗ trợ khoa Công nghệ Thông tin trong việc nhận diện sớm các nguy cơ học vụ và triển khai giải pháp hỗ trợ kịp thời.
            </p>
          </div>
          
          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            Project Version 1.0 (Draft)
          </div>
        </div>

        {/* Right Side: Login Action */}
        <div className="p-12 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight italic font-serif">Đăng nhập hệ thống</h3>
          <p className="text-slate-500 text-sm mb-8">Vui lòng sử dụng tài khoản email sinh viên/giảng viên để truy cập.</p>
          
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
            <div className="relative">
               <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Tài khoản (admin/advisor/user)" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                 required
               />
            </div>
            <div className="relative">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="password" 
                 placeholder="Mật khẩu" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                 required
               />
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>}
            <button
               type="submit"
               disabled={loading}
               className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
            >
               {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-bold tracking-widest">Hoặc</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="group w-full flex items-center justify-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition-all text-center"
          >
            <LogIn className="w-6 h-6 text-slate-400 group-hover:text-orange-600" />
            <span className="text-sm font-bold text-slate-900">Đăng nhập với Google</span>
          </button>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium italic">
                Cổng thông tin nội bộ Khoa Công nghệ Thông tin
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
