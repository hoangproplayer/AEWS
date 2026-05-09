import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, TrendingUp, Users, AlertCircle, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const classWarningData = [
  { name: '20CNTT1', red: 12, yellow: 25, green: 63 },
  { name: '20CNTT2', red: 8, yellow: 18, green: 74 },
  { name: '20CNTT3', red: 15, yellow: 30, green: 55 },
  { name: '21CNTT1', red: 5, yellow: 12, green: 83 },
  { name: '21CNTT2', red: 10, yellow: 22, green: 68 },
];

const subjectWarningData = [
  { name: 'Cấu trúc dữ liệu', count: 45 },
  { name: 'Toán rời rạc', count: 38 },
  { name: 'Nguyên lý HĐH', count: 22 },
  { name: 'Lập trình Java', count: 18 },
  { name: 'Mạng máy tính', count: 35 },
].sort((a, b) => b.count - a.count);

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const semesterTrendData = [
  { name: 'HK1-2023', danger: 150, warning: 280 },
  { name: 'HK2-2023', danger: 180, warning: 300 },
  { name: 'HK1-2024', danger: 140, warning: 260 },
  { name: 'HK2-2024', danger: 210, warning: 340 },
  { name: 'HK1-2025', danger: 190, warning: 310 },
  { name: 'HK2-2025', danger: 242, warning: 380 },
];

export default function Reports() {
  const [loading, setLoading] = React.useState(false);

  const handleExport = (type: 'PDF' | 'EXCEL') => {
    setLoading(true);
    setTimeout(() => {
      alert(`Đã trích xuất báo cáo học vụ dưới định dạng ${type} (REQ-05, REQ-09).`);
      setLoading(false);
    }, 1500);
  };

  const [selectedFaculty, setSelectedFaculty] = React.useState('All');
  const [selectedReportTime, setSelectedReportTime] = React.useState('HK2 (2025-2026)');
  const [displayData, setDisplayData] = React.useState({
    classWarning: classWarningData,
    subjectWarning: subjectWarningData,
    trend: semesterTrendData
  });

  const handleFilter = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Simulate data change based on filter
      let multiplier = 1;
      if (selectedFaculty === 'CNTT') multiplier = 1.2;
      if (selectedFaculty === 'QTKD') multiplier = 0.8;
      if (selectedFaculty === 'DDT') multiplier = 0.9;
      
      if (selectedReportTime.includes('2024')) multiplier *= 0.9;

      setDisplayData({
        classWarning: classWarningData.map(d => ({
          ...d,
          red: Math.round(d.red * multiplier),
          yellow: Math.round(d.yellow * multiplier),
          green: Math.round(d.green / multiplier)
        })),
        subjectWarning: subjectWarningData.map(d => ({
          ...d,
          count: Math.round(d.count * multiplier)
        })),
        trend: semesterTrendData.map(d => ({
          ...d,
          danger: Math.round(d.danger * multiplier),
          warning: Math.round(d.warning * multiplier)
        }))
      });

      alert(`Đã cập nhật báo cáo cho phân khoa ${selectedFaculty === 'All' ? 'Toàn trường' : selectedFaculty} trong kỳ ${selectedReportTime}.`);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Existing Header... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Báo cáo & Thống kê đa kỳ</h1>
          <p className="text-slate-500 text-sm">Phân tích dữ liệu học vụ theo chuỗi thời gian và dự báo xu hướng (REQ-05, REQ-09)</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <select 
             className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm focus:outline-none"
             value={selectedFaculty}
             onChange={(e) => setSelectedFaculty(e.target.value)}
           >
              <option value="All">Toàn trường</option>
              <option value="CNTT">Khoa CNTT</option>
              <option value="QTKD">Khoa QTKD</option>
              <option value="DDT">Khoa Điện - Điện tử</option>
           </select>
           <select 
             className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm focus:outline-none"
             value={selectedReportTime}
             onChange={(e) => setSelectedReportTime(e.target.value)}
           >
              <option>HK2 (2025-2026)</option>
              <option>HK1 (2025-2026)</option>
              <option>HK2 (2024-2025)</option>
           </select>
           <button 
             onClick={handleFilter}
             disabled={loading}
             className="bg-slate-900 border border-slate-900 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
           >
             <Filter className="w-4 h-4" />
             Lọc báo cáo
           </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉ lệ cảnh báo chung</p>
               <h3 className="text-2xl font-bold text-slate-900">{selectedFaculty === 'CNTT' ? '22.4%' : selectedFaculty === 'All' ? '18.5%' : '15.2%'}</h3>
               <p className={cn("text-xs mt-1 font-medium", selectedFaculty === 'QTKD' ? "text-green-500" : "text-red-500")}>
                 {selectedFaculty === 'QTKD' ? '-1.5%' : '+2.1%'} so với học kỳ trước
               </p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-red-50 p-3 rounded-lg"><AlertCircle className="w-6 h-6 text-red-600" /></div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng SV Nguy cơ cao</p>
               <h3 className="text-2xl font-bold text-slate-900">{selectedFaculty === 'QTKD' ? '185' : '242'}</h3>
               <p className="text-xs text-slate-500 mt-1 font-medium">Trên tổng số 2,450 sinh viên</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-green-50 p-3 rounded-lg"><Users className="w-6 h-6 text-green-600" /></div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉ lệ can thiệp thành công</p>
               <h3 className="text-2xl font-bold text-slate-900">65%</h3>
               <p className="text-xs text-green-600 mt-1 font-medium">SV thoát khỏi diện cảnh báo</p>
            </div>
         </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest italic font-serif">
             Tỉ lệ cảnh báo theo từng Lớp (REQ-11)
           </h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData.classWarning} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="red" name="Nguy cơ cao" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="yellow" name="Cần lưu ý" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="green" name="An toàn" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest italic font-serif">
             Top môn học có tỉ lệ cảnh báo cao nhất (REQ-12)
           </h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData.subjectWarning} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" name="Số SV bị cảnh báo" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 p-4 bg-blue-50 rounded-lg flex gap-3 items-start">
             <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
             <p className="text-xs text-blue-700 leading-relaxed italic font-medium">
               <span className="font-bold">Đề xuất:</span> Môn "Cấu trúc dữ liệu" và "Toán rời rạc" có tỉ lệ trượt cao đột biến. Đề nghị Khoa tổ chức các lớp phụ đạo hoặc xem xét lại đề thi.
             </p>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 text-white">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="bg-orange-500 p-2 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h3 className="font-bold tracking-tight italic font-serif">Xu hướng Cảnh báo học vụ qua các kỳ</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dữ liệu phân tích chuỗi thời gian (REQ-05)</p>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Nguy cơ cao</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cần lưu ý</span>
               </div>
            </div>
         </div>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={displayData.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="danger" name="Nguy cơ cao" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="warning" name="Cần lưu ý" fill="#fb923c" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-800">
            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-slate-800">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
               <p className="text-xs text-slate-400 leading-relaxed italic">
                 Học kỳ 2 (2024-2025) ghi nhận tỉ lệ nguy cơ cao tăng <span className="text-white font-bold">50%</span>. Đây là giai đoạn cần chú ý đặc biệt trong quy trình tư vấn.
               </p>
            </div>
            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-slate-800">
               <Users className="w-5 h-5 text-orange-400 shrink-0" />
               <p className="text-xs text-slate-400 leading-relaxed italic">
                 Dự báo kỳ tiếp theo: Tỉ lệ cảnh báo có thể giảm <span className="text-white font-bold">12%</span> nhờ áp dụng AI để phát hiện sớm các sinh viên vắng học trên LMS.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
