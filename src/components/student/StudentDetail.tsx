import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Mail, Phone, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, Info, ChevronLeft, MessageSquarePlus, Filter,
  Sparkles
} from 'lucide-react';
import { WarningLevel } from '@/src/types';
import { cn, formatPercent } from '@/src/lib/utils';
import AIInsightCard from '@/src/components/shared/AIInsightCard';
import { PredictionResult, predictStudentRisk } from '@/src/services/predictionService';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

const gpaData = [
  { semester: 'HK1 - 2021', gpa: 3.2 },
  { semester: 'HK2 - 2021', gpa: 2.8 },
  { semester: 'HK1 - 2022', gpa: 2.5 },
  { semester: 'HK2 - 2022', gpa: 2.1 },
  { semester: 'HK1 - 2023', gpa: 1.8 },
];

const mockAcademicRecords = [
  { code: 'IT101', name: 'Lập trình C', credits: 4, grade: 3.5, semester: 'HK1 - 2023' },
  { code: 'IT202', name: 'Mạng máy tính', credits: 4, grade: 4.5, semester: 'HK1 - 2023' },
  { code: 'IT305', name: 'Cơ sở dữ liệu', credits: 3, grade: 8.5, semester: 'HK2 - 2022' },
  { code: 'MAT101', name: 'Toán cao cấp', credits: 3, grade: 7.0, semester: 'HK2 - 2022' },
  { code: 'IT401', name: 'Hệ điều hành', credits: 4, grade: 5.5, semester: 'HK1 - 2022' },
  { code: 'ENG201', name: 'Tiếng Anh 2', credits: 2, grade: 2.0, semester: 'HK1 - 2022' },
];

const attendanceData = [
  { subject: 'Toán RR', rate: 0.95 },
  { subject: 'Lập trình C', rate: 0.65 },
  { subject: 'CSDL', rate: 0.8 },
  { subject: 'Mạng máy tính', rate: 0.4 },
  { subject: 'HĐH', rate: 0.75 },
];

export default function StudentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [activeTab, setActiveTab] = useState('Kết quả học tập');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const effectiveId = id || user?.studentId || user?.uid;

  useEffect(() => {
    const fetchStudent = async () => {
      if (!effectiveId || (user?.role === 'ADMIN' && !id)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. Try SQL Backend first
        const sqlRes = await fetch('/api/students');
        if (sqlRes.ok) {
          const sqlStudents = await sqlRes.json();
          const found = sqlStudents.find((s: any) => String(s.id) === String(effectiveId));
          if (found) {
            setStudent(found);
            setLoadingAI(true);
            const aiRes = await predictStudentRisk(found as any, mockAcademicRecords);
            setPrediction(aiRes);
            setLoadingAI(false);
            setLoading(false);
            return;
          }
        }

        const studentDoc = await getDoc(doc(db, 'students', effectiveId));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          setStudent(data);
          
          // Trigger AI Analysis
          setLoadingAI(true);
          const res = await predictStudentRisk(data as any, mockAcademicRecords);
          setPrediction(res);
          setLoadingAI(false);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [effectiveId]);

  const semesters = ['All', ...new Set(mockAcademicRecords.map(r => r.semester))];
  
  const filteredRecords = selectedSemester === 'All' 
    ? mockAcademicRecords 
    : mockAcademicRecords.filter(r => r.semester === selectedSemester);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic gap-4">
         <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
         Đang tải hồ sơ sinh viên...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center">
         <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy sinh viên</h1>
         <button onClick={() => navigate('/students')} className="mt-4 text-orange-500 font-bold hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'ADVISOR') && (
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Mail className="w-4 h-4" />
              Gửi Email nhắc nhở
            </button>
            <button 
              onClick={() => navigate(`/counseling?studentId=${id}`)}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Tạo Nhật ký tư vấn
            </button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900 leading-normal">
        <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-700"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-8 items-start">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg border border-slate-100 shrink-0">
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold">
                NV
              </div>
            </div>
            <div className="flex-1 pt-10">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  student.level === 'DANGER' ? "bg-red-100 text-red-600" :
                  student.level === 'WARNING' ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-600"
                )}>
                  {student.level === 'DANGER' ? 'Nguy cơ cao (Đỏ)' :
                   student.level === 'WARNING' ? 'Cần lưu ý (Vàng)' : 'An toàn (Xanh)'}
                </span>
              </div>
              <div className="flex gap-6 mt-4 text-sm text-slate-500 font-medium flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400" />
                  Mã SV: <span className="text-slate-900 font-mono font-bold tracking-tight">{student.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Khóa: <span className="text-slate-900">2020 - 2024</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Lớp: <span className="text-slate-900">{student.class}</span>
                </div>
              </div>
            </div>
            <div className="pt-10 flex gap-4 pr-4">
               <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">GPA Hiện tại</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    student.gpa < 2 ? "text-red-500" : student.gpa < 2.5 ? "text-orange-500" : "text-green-600"
                  )}>{student.gpa.toFixed(2)}</p>
               </div>
               <div className="w-px h-10 bg-slate-100 self-center"></div>
               <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉ lệ vắng</p>
                  <p className="text-2xl font-bold text-red-500">28%</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Prediction Section */}
      <AIInsightCard prediction={prediction} loading={loadingAI} />

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest italic font-serif flex items-center gap-2">
            Xu hướng học tập (GPA)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="semester" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <YAxis 
                  domain={[0, 4]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              <span className="font-bold">Nhận xét:</span> Điểm GPA có xu hướng sụt giảm liên tục trong 3 học kỳ gần nhất. Cần theo dõi sát sao việc đăng ký học phần trong kỳ tới.
            </p>
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest italic font-serif flex items-center gap-2">
            Tỉ lệ tham gia lớp học
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="subject" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={index} fill={entry.rate < 0.7 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-orange-50 rounded-lg flex gap-3 items-start">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-xs text-orange-700 leading-relaxed font-medium">
              <span className="font-bold">Cảnh báo điểm danh:</span> Tỉ lệ vắng học trong học phần <span className="font-bold underline">Mạng máy tính</span> đã vượt ngưỡng 50%.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs / Tables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 justify-between items-center pr-6">
          <div className="flex">
            {['Kết quả học tập', 'Lịch sử tư vấn', 'Hoạt động LMS'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
                  activeTab === tab ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <Filter className="w-4 h-4 text-slate-400" />
             <select 
               className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
               value={selectedSemester}
               onChange={(e) => setSelectedSemester(e.target.value)}
             >
                {semesters.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'Tất cả học kỳ' : s}</option>
                ))}
             </select>
          </div>
        </div>
        
        <div className="p-6">
           {activeTab === 'Kết quả học tập' && (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="italic text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-3 px-2">Học kỳ</th>
                      <th className="pb-3">Mã HP</th>
                      <th className="pb-3">Tên học phần</th>
                      <th className="pb-3 text-center">Số TC</th>
                      <th className="pb-3 text-center">Điểm số</th>
                      <th className="pb-3 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredRecords.length > 0 ? filteredRecords.map((row, i) => (
                      <tr key={`${row.code}-${i}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-medium text-slate-500 whitespace-nowrap">{row.semester}</td>
                        <td className="py-4 font-mono text-slate-400">{row.code}</td>
                        <td className="py-4 font-bold text-slate-900">{row.name}</td>
                        <td className="py-4 text-center text-slate-600 font-medium">{row.credits}</td>
                        <td className={cn(
                          "py-4 text-center font-bold text-base font-serif italic",
                          row.grade < 5 ? "text-red-500" : "text-green-600"
                        )}>{row.grade.toFixed(1)}</td>
                        <td className="py-4 px-4">
                          {row.grade < 5 ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-500 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                              <AlertTriangle className="w-3 h-3" /> Học lại
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-600 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                              <CheckCircle2 className="w-3 h-3" /> Đạt
                            </div>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                          Không có hồ sơ học tập nào cho bộ lọc này.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
             </div>
           )}

           {activeTab === 'Lịch sử tư vấn' && (
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest italic font-serif">Các buổi tư vấn gần nhất (REQ-04)</h4>
                   <button 
                     onClick={() => navigate(`/counseling?studentId=${id}`)}
                     className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2 uppercase tracking-widest"
                   >
                     <MessageSquarePlus className="w-4 h-4" /> Thêm nhật ký
                   </button>
                </div>
                {[
                  { date: '2026-04-15', expert: 'ThS. Nguyễn Văn Advisor', content: 'Sinh viên hứa sẽ tập trung hơn vào môn Mạng máy tính.', outcome: 'FOLLOW_UP' },
                  { date: '2026-03-10', expert: 'ThS. Nguyễn Văn Advisor', content: 'Gặp gỡ lần đầu, sinh viên có khó khăn về tài chính gia đình.', outcome: 'SUPPORTED' },
                ].map((log, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                      <MessageSquarePlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{log.expert}</span>
                        <span className="text-[10px] text-slate-400 font-medium">• {log.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic">"{log.content}"</p>
                    </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'Hoạt động LMS' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Hoạt động đồng bộ từ LMS (REQ-02)</h4>
                  <div className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-widest">Đồng bộ cuối: 15 phút trước</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Login cuối cùng</p>
                      <p className="text-sm font-bold text-slate-900 text-center">2026-04-30 14:15</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Số bài chưa nộp</p>
                      <p className="text-sm font-bold text-red-500 text-center">03 Bài tập</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Tương tác tuần qua</p>
                      <p className="text-sm font-bold text-orange-500 text-center">Thấp (-15%)</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                        <tr className="italic text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="pb-3 px-2">Thời gian</th>
                          <th className="pb-3">Hoạt động</th>
                          <th className="pb-3">Khóa học</th>
                          <th className="pb-3 px-4">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { time: '2026-04-30 14:15', action: 'Login hệ thống', course: '-', status: 'SUCCESS' },
                          { time: '2026-04-29 09:30', action: 'Nộp bài Lab 3', course: 'Lập trình C', status: 'LATE' },
                          { time: '2026-04-28 10:00', action: 'Xem bài giảng', course: 'Mạng máy tính', status: 'SUCCESS' },
                        ].map((log, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-2 font-mono text-slate-500">{log.time}</td>
                            <td className="py-4 font-bold text-slate-900">{log.action}</td>
                            <td className="py-4 text-slate-600 font-medium">{log.course}</td>
                            <td className="py-4 px-4">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                                log.status === 'SUCCESS' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              )}>{log.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
