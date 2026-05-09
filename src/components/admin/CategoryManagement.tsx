import React, { useState } from 'react';
import { 
  Building2, Calendar, Users, Plus, Edit2, Trash2, Search, Save, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CategoryItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export default function CategoryManagement() {
  const [activeTab, setActiveTab] = useState<'SEMESTER' | 'FACULTY' | 'CLASS'>('SEMESTER');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const [semesters, setSemesters] = useState<CategoryItem[]>([
    { id: '1', name: 'Học kỳ 1 (2025-2026)', code: 'HK12526' },
    { id: '2', name: 'Học kỳ 2 (2025-2026)', code: 'HK22526' },
    { id: '3', name: 'Học kỳ 1 (2024-2025)', code: 'HK12425' },
  ]);

  const [faculties, setFaculties] = useState<CategoryItem[]>([
    { id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
    { id: '2', name: 'Khoa Quản trị Kinh doanh', code: 'QTKD' },
    { id: '3', name: 'Khoa Điện - Điện tử', code: 'DDT' },
  ]);

  const [classes, setClasses] = useState<CategoryItem[]>([
    { id: '1', name: 'Lớp 20CNTT1', code: '20CNTT1', description: 'K20 - CNTT 1' },
    { id: '2', name: 'Lớp 20CNTT2', code: '20CNTT2', description: 'K20 - CNTT 2' },
    { id: '3', name: 'Lớp 20QTKD1', code: '20QTKD1', description: 'K20 - QTKD 1' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<CategoryItem> | null>(null);

  const getActiveData = () => {
    switch (activeTab) {
      case 'SEMESTER': return semesters;
      case 'FACULTY': return faculties;
      case 'CLASS': return classes;
    }
  };

  const getActiveSetter = () => {
    switch (activeTab) {
      case 'SEMESTER': return setSemesters;
      case 'FACULTY': return setFaculties;
      case 'CLASS': return setClasses;
    }
  };

  const handleCreate = () => {
    setCurrentItem({ name: '', code: '' });
    setIsEditing(true);
  };

  const handleEdit = (item: CategoryItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const setter = getActiveSetter();
      setter(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    if (!currentItem?.name) return;
    
    const setter = getActiveSetter();
    if (currentItem.id) {
      setter(prev => prev.map(item => item.id === currentItem.id ? (currentItem as CategoryItem) : item));
    } else {
      const newItem = {
        ...currentItem,
        id: Math.random().toString(36).substr(2, 9)
      } as CategoryItem;
      setter(prev => [...prev, newItem]);
    }
    setIsEditing(false);
    setCurrentItem(null);
  };

  const filteredData = getActiveData().filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.code?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic font-serif">Quản lý Danh mục</h1>
          <p className="text-slate-500 text-sm">Quản lý các thông tin nền tảng của hệ thống: Học kỳ, Khoa và Lớp học.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('SEMESTER')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
            activeTab === 'SEMESTER' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Calendar className="w-3.5 h-3.5" /> Học kỳ
        </button>
        <button 
          onClick={() => setActiveTab('FACULTY')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
            activeTab === 'FACULTY' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Building2 className="w-3.5 h-3.5" /> Khoa
        </button>
        <button 
          onClick={() => setActiveTab('CLASS')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
            activeTab === 'CLASS' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Users className="w-3.5 h-3.5" /> Lớp học
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-6">
            Tổng cộng: {filteredData.length} mục
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 italic text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-bold">Mã</th>
                <th className="px-6 py-4 font-bold">Tên danh mục</th>
                <th className="px-6 py-4 font-bold">Mô tả</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50 text-slate-700">
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.code || '-'}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500 italic">{item.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                    Không tìm thấy dữ liệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentItem?.id ? 'Biên dịch Danh mục' : 'Thêm Danh mục Mới'}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Tên danh mục</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold"
                      value={currentItem?.name || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      placeholder="VD: Học kỳ 1 (2025-2026)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Mã định danh</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                      value={currentItem?.code || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })}
                      placeholder="VD: HK12526"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Mô tả (Tùy chọn)</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[100px]"
                      value={currentItem?.description || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    />
                  </div>
               </div>
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-slate-900 text-white px-8 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest"
                  >
                    <Save className="w-4 h-4" /> Lưu thay đổi
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
