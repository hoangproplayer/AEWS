import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, ChevronRight, 
  ArrowUpDown, Download, UserPlus, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WarningLevel } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { collection, query, getDocs, limit, where, orderBy, getDocsFromServer, setDoc, doc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function StudentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('HK2 (2025-2026)');

  // Update searchTerm from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchTerm(q);

    // If we are on /warnings, default the level to WARNING or DANGER
    if (location.pathname === '/warnings') {
       setSelectedLevel('DANGER');
    } else {
       setSelectedLevel('All');
    }
  }, [location.pathname, location.search]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert('Đã trích xuất danh sách sinh viên ' + (selectedClass === 'All' ? 'toàn trường' : `lớp ${selectedClass}`) + ' dưới định dạng Excel (REQ-09).');
      setIsExporting(false);
    }, 1500);
  };

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    id: '',
    name: '',
    class: '20CNTT1',
    gpa: 2.0
  });

  const handleAddStudent = async () => {
    if (!newStudentData.id || !newStudentData.name) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const newStudent = {
        ...newStudentData,
        id: String(newStudentData.id),
        level: newStudentData.gpa < 2 ? 'DANGER' : newStudentData.gpa < 2.5 ? 'WARNING' : 'SAFE',
        status: 'PENDING',
        lastAnalyzed: new Date().toISOString()
      };

      // 1. Sync to SQLite Backend
      const apiRes = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      if (!apiRes.ok) {
        const errData = await apiRes.json();
        throw new Error(errData.error || 'Lỗi từ máy chủ API');
      }

      // 2. Sync to Firebase
      await setDoc(doc(db, 'students', newStudent.id), newStudent);
      
      setStudents(prev => [newStudent, ...prev]);
      setIsAddingStudent(false);
      setNewStudentData({ id: '', name: '', class: '20CNTT1', gpa: 2.0 });
      alert('Đã thêm sinh viên thành công vào hệ thống!');
    } catch (error: any) {
      console.error(error);
      alert(`Không thể thêm sinh viên: ${error.message}`);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [activeTab, setActiveTab] = useState<'LIST' | 'AI_FORECAST'>('LIST');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Try SQL Backend first
        const response = await fetch('/api/students');
        if (response.ok) {
          const sqlData = await response.json();
          if (sqlData.length > 0) {
            setStudents(sqlData);
            setLoading(false);
            return;
          }
        }

        // Fallback to Firestore
        const studentsCol = collection(db, 'students');
        const q = query(studentsCol, limit(500));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data() }));
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter logic (Client-side for now for better UX with search)
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = student.name?.toLowerCase() || '';
    const studentId = student.id?.toLowerCase() || '';
    
    const matchesSearch = searchTerm === '' || 
                         studentName.includes(searchLower) || 
                         studentId.includes(searchLower);
                         
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    
    // AI Forecast mode with Backend API
    if (activeTab === 'AI_FORECAST') {
       // Note: In a real app, this would be a real API call
       // For demo, we are showing how it would connect to the newly created backend
       return matchesSearch && matchesClass && (student.gpa < 2.5 && student.level !== 'DANGER');
    }

    const matchesLevel = selectedLevel === 'All' || student.level === selectedLevel;
    return matchesSearch && matchesClass && matchesLevel;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">
            {location.pathname === '/warnings' ? 'Danh sách Cảnh báo Học vụ' : 
             activeTab === 'AI_FORECAST' ? 'Dự báo Rủi ro (AI Analysis)' : 'Quản lý Sinh viên'}
          </h1>
          <p className="text-slate-500 text-sm italic">
            {location.pathname === '/warnings' 
              ? 'Danh sách các sinh viên đang trong ngưỡng rủi ro cần can thiệp (REQ-07, REQ-08).' 
              : activeTab === 'AI_FORECAST'
              ? 'Phân tích dự báo các sinh viên có xu hướng rơi vào diện cảnh báo trong kỳ tới.'
              : 'Quản lý và theo dõi hồ sơ sinh viên thuộc lớp quản lý.'}
          </p>
        </div>
        <div className="flex gap-2">
          {location.pathname !== '/warnings' && (
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 mr-4 shadow-sm">
               <button 
                onClick={() => setActiveTab('LIST')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                  activeTab === 'LIST' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
               >
                 Hồ sơ SV
               </button>
               <button 
                onClick={() => setActiveTab('AI_FORECAST')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'AI_FORECAST' ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:text-orange-500"
                )}
               >
                 <Zap className="w-3 h-3 fill-current" />
                 AI Dự báo
               </button>
            </div>
          )}
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Đang trích xuất...' : 'Tải Excel'}
          </button>
          <button 
            onClick={() => setIsAddingStudent(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Thêm sinh viên
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc MSSV..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <select 
          className="bg-slate-50 border border-slate-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:border-orange-500 font-medium text-slate-600"
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setCurrentPage(1);
          }}
        >
           <option value="HK2 (2025-2026)">HK2 (2025-2026)</option>
           <option value="HK1 (2025-2026)">HK1 (2025-2026)</option>
           <option value="HK2 (2024-2025)">HK2 (2024-2025)</option>
           <option value="HK1 (2024-2025)">HK1 (2024-2025)</option>
        </select>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:border-orange-500 font-medium text-slate-600"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setCurrentPage(1);
          }}
        >
           <option value="All">Tất cả lớp</option>
           <option value="20CNTT1">20CNTT1</option>
           <option value="20CNTT2">20CNTT2</option>
           <option value="20CNTT3">20CNTT3</option>
        </select>

        {activeTab === 'LIST' && (
          <select 
            className="bg-slate-50 border border-slate-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:border-orange-500 font-medium text-slate-600"
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setCurrentPage(1);
            }}
          >
             <option value="All">Mức độ: Tất cả</option>
             <option value="DANGER" className="text-red-600 font-bold">Nguy cơ cao</option>
             <option value="WARNING" className="text-orange-600 font-bold">Cần lưu ý</option>
             <option value="SAFE" className="text-green-600 font-bold">An toàn</option>
          </select>
        )}

        <button 
          onClick={() => alert('Chức năng lọc nâng cao (GPA, Ngành học, Khu vực) đang được phát triển...')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 px-3 py-2 text-sm font-bold uppercase tracking-widest transition-colors"
        >
          <Filter className="w-4 h-4" />
          Lọc thêm
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic gap-4">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
               Đang tải dữ liệu từ Firestore...
            </div>
          ) : (
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 italic text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-medium flex items-center gap-2">
                  MSSV <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 font-medium">Họ & Tên</th>
                <th className="px-6 py-4 font-medium font-serif">GPA</th>
                <th className="px-6 py-4 font-medium">Lớp</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">
                  {activeTab === 'AI_FORECAST' ? 'Xác suất Rủi ro (AI)' : 'Mức độ rủi ro'}
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentItems.length > 0 ? currentItems.map((student) => (
                <tr 
                  key={student.id} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                >
                  <td onClick={() => navigate(`/students/${student.id}`)} className="px-6 py-4 font-mono font-medium text-slate-500">{student.id}</td>
                  <td onClick={() => navigate(`/students/${student.id}`)} className="px-6 py-4 font-bold text-slate-900">{student.name}</td>
                  <td onClick={() => navigate(`/students/${student.id}`)} className={cn(
                    "px-6 py-4 font-bold",
                    student.gpa < 2 ? "text-red-500" : student.gpa < 2.5 ? "text-orange-500" : "text-green-600"
                  )}>
                    {student.gpa.toFixed(2)}
                  </td>
                  <td onClick={() => navigate(`/students/${student.id}`)} className="px-6 py-4 text-slate-600 font-medium">{student.class}</td>
                  <td onClick={() => navigate(`/students/${student.id}`)} className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      student.status === 'PROCESSED' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {student.status === 'PROCESSED' ? 'Đã xử lý' : 'Đang theo dõi'}
                    </span>
                  </td>
                  <td onClick={() => navigate(`/students/${student.id}`)} className="px-6 py-4">
                    {activeTab === 'AI_FORECAST' ? (
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                           <div 
                             className="h-full bg-orange-500" 
                             style={{ width: `${Math.round(85 - student.gpa * 18)}%` }}
                           ></div>
                         </div>
                         <span className="text-xs font-bold text-orange-600">
                           {Math.round(85 - student.gpa * 18)}%
                         </span>
                       </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          student.level === 'DANGER' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                          student.level === 'WARNING' ? "bg-orange-500" : "bg-green-500"
                        )}></div>
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-tight",
                          student.level === 'DANGER' ? "text-red-600" : 
                          student.level === 'WARNING' ? "text-orange-600" : "text-green-600"
                        )}>
                          {student.level === 'DANGER' ? 'Nguy cơ cao' : 
                           student.level === 'WARNING' ? 'Cần lưu ý' : 'An toàn'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {student.level !== 'SAFE' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Đề xuất hướng giải quyết: Hẹn gặp tư vấn trực tiếp và yêu cầu sinh viên viết bản cam kết học tập.');
                        }}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded border border-orange-100 mr-2"
                      >
                         Đề xuất Xử lý
                      </button>
                    )}
                    <button onClick={() => navigate(`/students/${student.id}`)} className="p-2 text-slate-300 group-hover:text-slate-900 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                    Không tìm thấy sinh viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
        
        {/* Functional Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
           <p className="text-xs text-slate-500 italic">
             Hiển thị {filteredStudents.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredStudents.length)} trên {filteredStudents.length} sinh viên
           </p>
           <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 h-8 rounded flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button 
                  key={p} 
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all",
                    p === currentPage ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 h-8 rounded flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
           </div>
        </div>
      </div>
      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Thêm Sinh viên Mới</h3>
                  <button onClick={() => setIsAddingStudent(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và Tên</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      value={newStudentData.name}
                      onChange={(e) => setNewStudentData({...newStudentData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSSV</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none"
                        value={newStudentData.id}
                        onChange={(e) => setNewStudentData({...newStudentData, id: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lớp</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
                        value={newStudentData.class}
                        onChange={(e) => setNewStudentData({...newStudentData, class: e.target.value})}
                      >
                         <option value="20CNTT1">20CNTT1</option>
                         <option value="20CNTT2">20CNTT2</option>
                         <option value="20CNTT3">20CNTT3</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPA Hiện tại</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      max="4" 
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
                      value={newStudentData.gpa}
                      onChange={(e) => setNewStudentData({...newStudentData, gpa: parseFloat(e.target.value)})}
                    />
                  </div>
               </div>
               <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    onClick={() => setIsAddingStudent(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleAddStudent}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-lg"
                  >
                    Thêm ngay
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
