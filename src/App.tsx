/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sliders, Sparkles, ArrowRight, Bell, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/layout/Layout';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';
import StudentDetail from '@/src/components/student/StudentDetail';
import CounselingLogForm from '@/src/components/advisor/CounselingLogForm';
import StudentList from '@/src/components/student/StudentList';
import Reports from '@/src/components/manager/Reports';
import Login from '@/src/components/auth/Login';
import RuleEngine from '@/src/components/admin/RuleEngine';
import DataImport from '@/src/components/admin/DataImport';
import CategoryManagement from '@/src/components/admin/CategoryManagement';

// Detailed Dashboard based on Roles
const Dashboard = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const isStudent = user?.role === 'STUDENT';
  
  const [selectedClass, setSelectedClass] = React.useState('All');
  
  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            alert(`Đang yêu cầu hệ thống thực hiện quét lại rủi ro dựa trên bộ Rule Engine mới cho ${selectedClass === 'All' ? 'toàn bộ sinh viên' : `lớp ${selectedClass}`}...`);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Tổng quan học tập</h1>
            <p className="text-slate-500 text-sm">Xin chào {user.displayName}, đây là tóm tắt kết quả của bạn.</p>
          </div>
          <button 
            onClick={() => navigate('/my-results')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20"
          >
            Xem bảng điểm chi tiết
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">GPA Tích lũy</p>
              <h3 className="text-2xl font-bold text-red-500">1.82</h3>
              <p className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-widest italic">Dưới ngưỡng cảnh báo (2.0)</p>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Số tín chỉ đạt</p>
              <h3 className="text-2xl font-bold text-slate-900">45</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest italic">Kế hoạch: 120 TC</p>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Thông báo mới</p>
              <h3 className="text-2xl font-bold text-orange-500">02</h3>
              <p className="text-[10px] text-orange-400 font-bold mt-1 uppercase tracking-widest italic">Cần kiểm tra ngay</p>
           </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
              <Sparkles className="w-12 h-12 text-orange-500 opacity-20" />
           </div>
           <h3 className="text-lg font-bold mb-2 italic font-serif">Gợi ý từ Trợ lý AI</h3>
           <p className="text-sm text-slate-400 leading-relaxed max-w-2xl italic">
             Dựa trên kết quả học kỳ này, bạn nên tập trung cải thiện điểm số môn "Mạng máy tính" và tham gia đầy đủ các buổi phụ đạo được tổ chức bởi Khoa. 
           </p>
           <button 
             onClick={() => navigate('/notifications')}
             className="mt-6 text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-2"
           >
             Xem chi tiết gợi ý <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    );
  }

    const getStats = () => {
      let multiplier = 1;
      if (selectedClass === '20CNTT1') multiplier = 0.35;
      if (selectedClass === '20CNTT2') multiplier = 0.32;
      if (selectedClass === '20CNTT3') multiplier = 0.33;

      return [
        { label: 'Tổng sinh viên', value: Math.round(2450 * multiplier).toLocaleString(), change: '+12%', color: 'blue' },
        { label: 'Nguy cơ cao (Đỏ)', value: Math.round(85 * multiplier).toLocaleString(), change: '+5%', color: 'red' },
        { label: 'Cần lưu ý (Vàng)', value: Math.round(142 * multiplier).toLocaleString(), change: '-2%', color: 'yellow' },
        { label: 'Đã xử lý (REQ-10)', value: Math.round(45 * multiplier).toLocaleString(), change: '+15%', color: 'green' },
      ];
    };

    const stats = getStats();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Tổng quan Hệ thống</h1>
            <p className="text-slate-500 text-sm">Chào mừng bạn quay trở lại, đây là tóm tắt tình trạng học vụ hôm nay.</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none shadow-sm"
            >
               <option value="All">Tất cả SV</option>
               <option value="20CNTT1">Lớp 20CNTT1</option>
               <option value="20CNTT2">Lớp 20CNTT2</option>
               <option value="20CNTT3">Lớp 20CNTT3</option>
            </select>
            <button 
              onClick={() => alert('Hệ thống đang trích xuất báo cáo tổng quan tình trạng học vụ cho ' + (selectedClass === 'All' ? 'toàn bộ sinh viên' : `lớp ${selectedClass}`) + '...')}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Xuất báo cáo
            </button>
            <button 
              onClick={handleRunScan}
              disabled={isScanning}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-shadow shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isScanning ? `Đang quét ${scanProgress}%` : 'Chạy quét Cảnh báo'}
            </button>
          </div>
        </div>
  
        {isScanning && (
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-700">Đang thực hiện quét rủi ro cho 2,450 sinh viên...</span>
                <span className="text-xs font-bold text-orange-700">{scanProgress}%</span>
             </div>
             <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
             </div>
          </div>
        )}
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              stat.change.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>

    {/* System Agents & ETL Module Status */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Agent (REQ-02)</p>
             <p className="text-sm font-bold">LMS Sync: Active</p>
          </div>
       </div>
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
             <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phòng đào tạo (REQ-01)</p>
             <p className="text-sm font-bold text-slate-900">Last Import: 4 giờ trước</p>
          </div>
       </div>
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
             <Sliders className="w-5 h-5 text-orange-500" />
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rule Engine (REQ-04)</p>
             <p className="text-sm font-bold text-slate-900">3 Thresholds Active</p>
          </div>
       </div>
    </div>

    {/* Bottom Content Area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-6 italic font-serif">Danh sách Cảnh báo Mới nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 italic text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-medium">MSSV</th>
                <th className="pb-3 font-medium">Họ & Tên</th>
                <th className="pb-3 font-medium">Lớp</th>
                <th className="pb-3 font-medium">Mức độ</th>
                <th className="pb-3 font-medium">Lý do</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: '2012001', name: 'Nguyễn Văn A', class: '20CNTT1', level: 'RED', reason: 'Nghỉ > 25%' },
                { id: '2012042', name: 'Trần Thị B', class: '20CNTT1', level: 'YELLOW', reason: 'Điểm GK < 4.0' },
                { id: '2012115', name: 'Lê Văn C', class: '20CNTT2', level: 'RED', reason: 'Nghỉ > 30%' },
              ].map((row, i) => (
                <tr 
                  key={i} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                  onClick={() => navigate(`/students/${row.id}`)}
                >
                  <td className="py-4 font-mono font-medium text-slate-600">{row.id}</td>
                  <td className="py-4 font-bold text-slate-900">{row.name}</td>
                  <td className="py-4 text-slate-600">{row.class}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      row.level === 'RED' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                    )}>
                      {row.level === 'RED' ? 'Nguy cơ cao' : 'Cần lưu ý'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 font-medium">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-6 italic font-serif">Hoạt động Tư vấn</h3>
        <div className="space-y-6">
          {[
            { user: 'Advisor Nam', action: 'Ghi nhật ký', student: 'Nguyễn Văn A', time: '2 giờ trước' },
            { user: 'Advisor Hoa', action: 'Đặt lịch hẹn', student: 'Trần Thị B', time: '5 giờ trước' },
            { user: 'System', action: 'Gửi cảnh báo tự động', student: 'Lê Văn C', time: '1 ngày trước' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-1 px-0.5 bg-slate-100 rounded-full h-12 self-center shrink-0"></div>
              <div>
                <p className="text-sm">
                  <span className="font-bold text-slate-900">{item.user}</span>
                  <span className="text-slate-500 mx-1">{item.action} cho</span>
                  <span className="font-bold text-slate-900">{item.student}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-widest border-t border-slate-100 pt-4">
          Xem tất cả hoạt động
        </button>
      </div>
    </div>
    </div>
  );
};

// Notifications page component
const Notifications = ({ user }: { user: any }) => {
  const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'ADVISOR';
  const [showCreate, setShowCreate] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', content: '', type: 'INFO' });

  const [notifications, setNotifications] = useState([
    { title: 'Yêu cầu hỗ trợ từ sinh viên', content: 'Sinh viên Nguyễn Văn A (2012001) đã gửi yêu cầu được tư vấn về lộ trình học tập.', time: '2 giờ trước', type: 'DANGER' },
    { title: 'Đồng bộ dữ liệu LMS bất thường', content: 'Phát hiện 120 sinh viên có tỉ lệ nộp bài giảm đột biến trong 7 ngày qua.', time: '5 giờ trước', type: 'INFO' },
    { title: 'Hệ thống AI đã cập nhật Rule Engine', content: 'Các quy tắc dự báo rủi ro đã được cập nhật dựa trên dữ liệu mới nhất.', time: '1 tuần trước', type: 'INFO' },
  ]);

  const handleSend = () => {
    if (!newNotif.title || !newNotif.content) return;
    setNotifications([
      { ...newNotif, time: 'Vừa xong' },
      ...notifications
    ]);
    setShowCreate(false);
    setNewNotif({ title: '', content: '', type: 'INFO' });
    alert('Thông báo đã được gửi đi thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Thông báo Hệ thống</h1>
          <p className="text-sm text-slate-500">Kênh truyền thông tin tức và cảnh báo học vụ.</p>
        </div>
        {isAdminOrManager && (
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Bell className="w-4 h-4" /> {showCreate ? 'Đóng' : 'Phát thông báo'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-orange-500" /> Tạo thông báo mới
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Tiêu đề</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      value={newNotif.title}
                      onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                      placeholder="VD: Cập nhật lịch thi học kỳ 2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Mức độ</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      value={newNotif.type}
                      onChange={(e) => setNewNotif({ ...newNotif, type: e.target.value })}
                    >
                      <option value="INFO">Thông tin (Xanh)</option>
                      <option value="DANGER">Quan trọng/Cảnh báo (Đỏ)</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Nội dung chi tiết</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm min-h-[100px] focus:outline-none"
                    value={newNotif.content}
                    onChange={(e) => setNewNotif({ ...newNotif, content: e.target.value })}
                    placeholder="Nhập nội dung cần truyền tải đến sinh viên hoặc cán bộ..."
                  />
               </div>
               <div className="flex justify-end">
                  <button 
                    onClick={handleSend}
                    className="bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 uppercase tracking-widest"
                  >
                    Gửi ngay <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {notifications.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start group hover:border-orange-200 transition-colors"
          >
            <div className={cn(
              "w-2 h-12 rounded-full shrink-0 transition-all group-hover:scale-y-110",
              item.type === 'DANGER' ? "bg-red-500" : "bg-blue-500"
            )}></div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{item.content}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{item.time}</p>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-20 text-slate-400 italic">Hiện không có thông báo nào.</div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/import" element={<DataImport />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/counseling" element={<CounselingLogForm />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/my-results" element={<StudentDetail />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          <Route path="/settings" element={<RuleEngine />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
