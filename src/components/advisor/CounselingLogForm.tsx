import React, { useState, useEffect } from 'react';
import { 
  Save, X, Calendar, User, 
  MessageSquare, Target, ClipboardCheck, Search,
  History, Plus, Edit2, Trash2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function CounselingLogForm() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    studentId: '',
    studentName: '',
    reason: '',
    notes: '',
    commitment: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchLogs();
    fetchStudents();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/counseling');
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSelectStudent = (s: any) => {
    setFormData({
      ...formData,
      studentId: s.id,
      studentName: s.name
    });
    setSearchStudent(s.name);
    setShowResults(false);
  };

  const handleSave = async () => {
    if (!formData.studentId || !formData.reason || !formData.notes) {
      setNotification({ message: 'Vui lòng nhập đầy đủ thông tin!', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const isUpdate = !!formData.id;
      const url = isUpdate ? `/api/counseling/${formData.id}` : '/api/counseling';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Lỗi từ server');

      setNotification({ message: isUpdate ? 'Đã cập nhật nhật ký!' : 'Đã tạo nhật ký mới!', type: 'success' });
      fetchLogs();
      setView('LIST');
      resetForm();
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Lỗi khi lưu dữ liệu.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) return;
    try {
      const res = await fetch(`/api/counseling/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Đã xóa nhật ký tư vấn.', type: 'success' });
        fetchLogs();
      }
    } catch (e) {
      setNotification({ message: 'Lỗi khi xóa dữ liệu.', type: 'error' });
    }
  };

  const handleEditInit = (log: any) => {
    setFormData({
      id: log.id,
      studentId: log.studentId,
      studentName: log.studentName,
      reason: log.reason,
      notes: log.notes,
      commitment: log.commitment || '',
      date: log.date
    });
    setSearchStudent(log.studentName);
    setView('FORM');
  };

  const resetForm = () => {
    setFormData({
      id: undefined,
      studentId: '',
      studentName: '',
      reason: '',
      notes: '',
      commitment: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSearchStudent('');
  };

  const filteredStudents = students.filter(s => {
    const search = searchStudent.toLowerCase();
    return s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search);
  }).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            {notification.type === 'success' ? <ClipboardCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 italic font-serif">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          Quản lý Nhật ký tư vấn
        </h1>
        <div className="flex gap-2">
          <a 
            href="/templates/student_template.csv" 
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all"
          >
            <Download className="w-4 h-4" />
            Tải File Mẫu
          </a>
          <button 
            onClick={() => setView('LIST')}
            className={cn(
               "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
               view === 'LIST' ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
            )}
          >
            <History className="w-4 h-4" />
            Lịch sử
          </button>
          <button 
            onClick={() => {
              resetForm();
              setView('FORM');
            }}
            className={cn(
               "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
               view === 'FORM' ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
            )}
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {loadingLogs ? (
              <div className="py-20 text-center text-slate-400 italic">Đang tải lịch sử...</div>
            ) : logs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 italic">
                Chưa có nhật ký tư vấn nào được ghi nhận.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logs.map((log) => (
                  <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditInit(log)}
                        className="p-1 text-slate-400 hover:text-blue-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                         <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.studentName}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{log.studentId} • {log.date}</p>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2"><span className="font-bold text-slate-400 uppercase text-[9px] mr-1">Lý do:</span> {log.reason}</p>
                        <p className="text-xs text-slate-500 italic line-clamp-3"><span className="font-bold text-slate-400 uppercase text-[9px] mr-1">Ghi chú:</span> {log.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    {formData.id ? 'Sinh viên' : 'Tìm kiếm Sinh viên'}
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      readOnly={!!formData.id}
                      className={cn(
                        "w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                        formData.id && "bg-slate-100 text-slate-500 cursor-not-allowed"
                      )}
                      placeholder="Nhập tên hoặc MSSV..."
                      value={searchStudent}
                      onChange={(e) => {
                        setSearchStudent(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => !formData.id && setShowResults(true)}
                    />
                    {showResults && !formData.id && searchStudent.length > 0 && (
                      <div className="absolute z-60 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-900/10 overflow-hidden">
                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                          <button 
                            key={s.id}
                            onClick={() => handleSelectStudent(s)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors flex justify-between items-center"
                          >
                            <span className="font-bold text-slate-700">{s.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
                          </button>
                        )) : (
                          <div className="px-4 py-2 text-sm text-slate-400 italic">Không tìm thấy sinh viên</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ngày tư vấn</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm font-bold focus:outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide text-[11px]">
                    <Target className="w-4 h-4 text-orange-500" />
                    Nguyên nhân sa sút
                  </label>
                  <textarea 
                    placeholder="VD: Nghỉ học nhiều do đi làm thêm, mất căn bản môn lập trình..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-24"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide text-[11px]">
                    <ClipboardCheck className="w-4 h-4 text-blue-500" />
                    Nội dung buổi gặp & Giải pháp
                  </label>
                  <textarea 
                    placeholder="Nội dung chi tiết buổi tư vấn..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-40"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide text-[11px]">
                    <Save className="w-4 h-4 text-green-500" />
                    Cam kết của sinh viên
                  </label>
                  <textarea 
                    placeholder="Hứa tham gia đầy đủ các buổi học bù, làm bài tập về nhà..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-24"
                    value={formData.commitment}
                    onChange={(e) => setFormData({...formData, commitment: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setView('LIST')} 
                className="px-6 py-2 rounded-md text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                Hủy bỏ
              </button>
              <button 
                disabled={isSaving}
                onClick={handleSave}
                className="bg-slate-900 text-white px-8 py-2 rounded-md text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'ĐANG LƯU...' : 'Lưu nhật ký'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
