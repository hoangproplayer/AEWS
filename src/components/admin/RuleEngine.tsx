import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, AlertTriangle, ShieldAlert, Plus, Save, Play, TrendingUp, Zap, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

const defaultRules = [
  { id: 'RULE-01', name: 'Ngành học GPA Thấp (Cảnh báo Đỏ)', condition: 'GPA < 1.0 AND Tín chỉ đạt < 50%', level: 'DANGER', status: 'Active' },
  { id: 'RULE-02', name: 'Điểm danh yếu (LMS Integration)', condition: 'Số buổi nghỉ > 30% OR Login vắng > 14 ngày', level: 'DANGER', status: 'Active' },
  { id: 'RULE-03', name: 'Dưới ngưỡng tích lũy (Cảnh báo Vàng)', condition: '1.0 <= GPA <= 2.0', level: 'WARNING', status: 'Active' },
  { id: 'RULE-04', name: 'Tương tác thấp (Behavior Analysis)', condition: 'Số bài nộp muộn > 2/3 bài tập', level: 'WARNING', status: 'Active' },
];

const patternData = [
  { day: 'T2', attendance: 85, submissions: 40 },
  { day: 'T3', attendance: 78, submissions: 65 },
  { day: 'T4', attendance: 92, submissions: 80 },
  { day: 'T5', attendance: 70, submissions: 35 },
  { day: 'T6', attendance: 65, submissions: 20 },
];

export default function RuleEngine() {
  const [rules, setRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      setLoadingRules(true);
      try {
        // Try SQL Backend first
        const response = await fetch('/api/rules');
        if (response.ok) {
          const sqlRules = await response.json();
          if (sqlRules.length > 0) {
            setRules(sqlRules);
            setLoadingRules(false);
            return;
          }
        }

        const rulesCol = collection(db, 'rules');
        const q = query(rulesCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setRules(defaultRules);
        } else {
          setRules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        setRules(defaultRules);
      } finally {
        setLoadingRules(false);
      }
    };
    fetchRules();
  }, []);

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleData, setNewRuleData] = useState({
    name: '',
    condition: '',
    level: 'WARNING'
  });

  const handleAddRule = async () => {
    if (!newRuleData.name || !newRuleData.condition) {
      alert('Vui lòng nhập tên và điều kiện!');
      return;
    }
    try {
      const newRule = {
        ...newRuleData,
        status: 'Active',
        createdAt: serverTimestamp()
      };
      
      // Save to SQL
      await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'rules'), newRule);
      setRules([{ id: docRef.id, ...newRule }, ...rules]);
      setIsAddingRule(false);
      alert('Đã thêm quy tắc mới thành công!');
    } catch (error) {
       console.error(error);
       alert('Lỗi khi lưu quy tắc.');
    }
  };

  const [isScanning, setIsScanning] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRunScan = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setNotification({
        message: 'Đã hoàn tất quét lại rủi ro cho toàn bộ sinh viên!',
        type: 'success'
      });
    }, 2000);
  };

  const toggleRuleStatus = (id: string) => {
    setRules(prev => prev.map(r => 
      r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
    ));
    setNotification({
      message: 'Đã cập nhật trạng thái quy tắc thành công!',
      type: 'success'
    });
  };

  const [editingRule, setEditingRule] = useState<any | null>(null);

  const startEdit = (rule: any) => {
    setEditingRule(rule);
    setNewRuleData({
      name: rule.name,
      condition: rule.condition,
      level: rule.level
    });
    setIsAddingRule(true);
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={cn(
              "fixed top-0 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm flex items-center gap-2",
              notification.type === 'success' ? "bg-emerald-500" : "bg-red-500"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Cấu hình Rule Engine & Phân tích Quy luật</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích quy trình học và rút ra các quy tắc cảnh báo (REQ-04, REQ-08)</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => {
               setEditingRule(null);
               setNewRuleData({ name: '', condition: '', level: 'WARNING' });
               setIsAddingRule(true);
             }}
             className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
           >
              <Plus className="w-4 h-4" /> Thêm quy tắc mới
           </button>
           <button 
             onClick={handleRunScan}
             disabled={isScanning}
             className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
           >
              <Play className={cn("w-4 h-4", isScanning && "animate-spin")} /> 
              {isScanning ? 'Đang quét...' : 'Chạy quét toàn bộ SV'}
           </button>
        </div>
      </div>

      {/* Logic Explanation Card */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm mb-6">
        <div className="flex gap-4">
          <div className="bg-orange-100 p-3 rounded-xl h-fit flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-orange-900 font-bold mb-1 italic font-serif">Cơ sở Logic Cảnh báo (Knowledge Base)</h3>
            <p className="text-sm text-orange-800 leading-relaxed max-w-4xl">
              Hệ thống Rule Engine (REQ-05) hoạt động dựa trên 3 trụ cột dữ liệu chính: 
              <span className="font-bold"> (1) Điểm trung bình tích lũy (GPA) </span> - xác định ngưỡng học vụ yếu; 
              <span className="font-bold"> (2) Tương tác LMS </span> - đo lường tần suất nộp bài và thời gian login; 
              <span className="font-bold"> (3) Tỉ lệ chuyên cần </span> - theo dõi vắng học cơ hữu. 
              Các quy tắc này sẽ được hệ thống quét định kỳ để phân loại sinh viên vào các mức độ rủi ro <span className="text-red-600 font-bold">Đỏ (Nguy cơ)</span> và <span className="text-yellow-600 font-bold">Vàng (Cần lưu ý)</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         {/* Learning Process Analysis Chart */}
         <div className="xl:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                  <TrendingUp className="w-4 h-4 text-white" />
               </div>
               <div>
                  <h3 className="font-bold italic font-serif">Phân tích Quy luật Học tập (LMS Data Analysis)</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dữ liệu tổng hợp từ 2,000+ sinh viên để rút ra ngưỡng cảnh báo</p>
               </div>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patternData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                     <YAxis hide />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                     <Line type="monotone" dataKey="attendance" name="Tỉ lệ hiện diện" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="submissions" name="Tỉ lệ nộp bài" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex gap-2 items-center">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-slate-600 italic font-medium">Phát hiện: Tỉ lệ tương tác giảm mạnh vào Thứ 6. Hệ thống tự cập nhật trọng số cảnh báo cho các hoạt động cuối tuần.</span>
               </div>
            </div>
         </div>

         <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Quy tắc Cảnh báo Học vụ hiện tại</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border",
                    rules.some(r => r.status === 'Active') 
                      ? "text-green-600 bg-green-50 border-green-100" 
                      : "text-slate-400 bg-slate-50 border-slate-200"
                  )}>
                    {rules.some(r => r.status === 'Active') ? 'Đang hoạt động' : 'Tất cả đã tắt'}
                  </span>
               </div>
               
               <div className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <div key={rule.id} className={cn("p-6 hover:bg-slate-50 transition-colors group", rule.status !== 'Active' && "opacity-60")}>
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                             {rule.level === 'DANGER' ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                             <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{rule.name}</h4>
                             {rule.status !== 'Active' && <span className="text-[9px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">OFF</span>}
                          </div>
                          <span className="text-[10px] font-mono p-1 bg-slate-100 rounded text-slate-500">{rule.id}</span>
                       </div>
                       <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 mb-4">
                          <code className="text-xs font-mono text-slate-700">{rule.condition}</code>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">Đã áp dụng cho <span className="font-bold text-slate-700">2,450 sinh viên</span></p>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => startEdit(rule)}
                               className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors p-1"
                             >
                               Chỉnh sửa
                             </button>
                             <button 
                               onClick={() => toggleRuleStatus(rule.id)}
                               className={cn(
                                 "text-[10px] font-bold uppercase tracking-widest transition-colors p-1",
                                 rule.status === 'Active' ? "text-red-400 hover:text-red-600" : "text-green-400 hover:text-green-600"
                               )}
                             >
                               {rule.status === 'Active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="xl:col-span-4 space-y-6 min-w-[280px]">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-500 p-2 rounded-lg">
                     <Sliders className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold italic font-serif">Tham số Ngưỡng</h3>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngưỡng GPA (Cảnh báo Đỏ)</label>
                        <span className="text-xs font-mono text-red-400">1.0</span>
                     </div>
                     <input type="range" min="0" max="4" step="0.1" defaultValue="1.0" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  </div>

                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tỉ lệ vắng học (%)</label>
                        <span className="text-xs font-mono text-orange-400">30%</span>
                     </div>
                     <input type="range" min="0" max="100" defaultValue="30" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  </div>

                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all mt-4">
                     Cập nhật Tham số
                  </button>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm italic text-sm text-slate-500 leading-relaxed">
               <div className="flex items-center gap-2 mb-3 text-orange-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Lưu ý:</span>
               </div>
               "Mọi thay đổi trên Rule Engine sẽ có hiệu lực ngay lập tức cho lần quét (Sync) tiếp theo từ dữ liệu LMS và Phòng đào tạo."
            </div>
         </div>
      </div>
      {/* Add/Edit Rule Modal */}
      <AnimatePresence>
        {isAddingRule && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{editingRule ? 'Chỉnh sửa Quy tắc' : 'Thêm Quy tắc mới'}</h3>
                  <button onClick={() => setIsAddingRule(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên quy tắc</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      placeholder="VD: Cảnh báo nghỉ học quá hạn"
                      value={newRuleData.name}
                      onChange={(e) => setNewRuleData({...newRuleData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Điều kiện Logic</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none h-24"
                      placeholder="VD: GPA < 2.0 AND Attendance < 70%"
                      value={newRuleData.condition}
                      onChange={(e) => setNewRuleData({...newRuleData, condition: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mức độ Cảnh báo</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
                      value={newRuleData.level}
                      onChange={(e) => setNewRuleData({...newRuleData, level: e.target.value})}
                    >
                       <option value="DANGER">Nguy cơ cao (Đỏ)</option>
                       <option value="WARNING">Cần lưu ý (Vàng)</option>
                       <option value="SAFE">An toàn (Xanh)</option>
                    </select>
                  </div>
               </div>
               <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    onClick={() => setIsAddingRule(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleAddRule}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors uppercase tracking-widest shadow-lg"
                  >
                    {editingRule ? 'Cập nhật' : 'Lưu Quy tắc'}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
