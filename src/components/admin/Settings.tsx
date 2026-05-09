import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, Sliders, ShieldCheck } from 'lucide-react';
import { WarningThreshold, WarningLevel } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState<WarningThreshold[]>([
    { id: '1', name: 'Nghỉ học quá nhiều', type: 'ATTENDANCE', operator: '<', value: 0.8, level: WarningLevel.DANGER },
    { id: '2', name: 'Điểm GPA thấp', type: 'GPA', operator: '<', value: 2.0, level: WarningLevel.DANGER },
    { id: '3', name: 'Không hoạt động LMS', type: 'LMS_INACTIVITY', operator: '>', value: 7, level: WarningLevel.WARNING },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-400 font-serif italic" />
          Cấu hình Hệ thống
        </h1>
        <p className="text-slate-500 text-sm">Thiết lập các ngưỡng cảnh báo và tham số vận hành cho Rule Engine.</p>
      </div>

      {/* Rule Engine Config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Bộ xử lý Luật (Rule Engine)</h2>
           </div>
           <button className="text-orange-500 hover:text-orange-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" />
              Thêm luật mới
           </button>
        </div>
        
        <div className="p-6">
           <div className="space-y-4">
              {thresholds.map((rule) => (
                <div key={rule.id} className="group flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                  <div className={cn(
                    "w-2 h-10 rounded-full",
                    rule.level === WarningLevel.DANGER ? "bg-red-500" : "bg-orange-500"
                  )}></div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tên luật</p>
                      <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Loại điều kiện</p>
                      <p className="text-xs font-medium text-slate-600 uppercase font-mono tracking-tight">{rule.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tham số</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{rule.operator}</span>
                        <span className="text-sm font-bold text-slate-900">{rule.type === 'ATTENDANCE' ? `${rule.value * 100}%` : rule.value}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Security & Access */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
           <ShieldCheck className="w-4 h-4 text-green-600" />
           <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Phân quyền & Bảo mật</h2>
        </div>
        <div className="p-6 space-y-6">
           <div className="flex items-center justify-between py-2">
              <div>
                 <p className="text-sm font-bold text-slate-900">Giới hạn quyền Cố vấn học tập</p>
                 <p className="text-xs text-slate-500">Chỉ cho phép CVHT xem sinh viên thuộc lớp quản lý.</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative p-1 cursor-pointer">
                 <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow"></div>
              </div>
           </div>
           <div className="flex items-center justify-between py-2 border-t border-slate-50 pt-4">
              <div>
                 <p className="text-sm font-bold text-slate-900">Email Cảnh báo Tự động</p>
                 <p className="text-xs text-slate-500">Tự động gửi thông báo khi sinh viên rơi vào nhóm "Nguy cơ cao".</p>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                 <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow"></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2 rounded-md text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
            Hủy thay đổi
          </button>
          <button className="bg-slate-900 text-white px-8 py-2 rounded-md text-sm font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-lg flex items-center gap-2">
            <Save className="w-4 h-4" />
            Lưu cấu hình
          </button>
      </div>
    </div>
  );
}
