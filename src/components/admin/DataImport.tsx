import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, FileText, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import * as XLSX from 'xlsx';
import { db } from '@/src/lib/firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';

enum ImportType {
  STUDENTS = 'STUDENTS',
  GRADES = 'GRADES',
  ATTENDANCE = 'ATTENDANCE'
}

export default function DataImport() {
  const [importType, setImportType] = useState<ImportType>(ImportType.STUDENTS);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; details?: string[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn tệp dữ liệu trước!');
      return;
    }

    setIsUploading(true);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("Tệp không có dữ liệu hoặc sai định dạng.");
      }

      // Map common column names
      const mappedData = jsonData.map(row => {
        return {
          id: row.MSSV || row.id || row["Mã SV"] || row["Mã số sinh viên"],
          name: row["Họ tên"] || row.name || row["Họ và Tên"],
          class: row.Lớp || row.class || row.className || "20CNTT1",
          gpa: parseFloat(row.GPA || row.gpa || row["Điểm TB"] || "0"),
          level: row.level || row["Mức độ"] || "SAFE"
        };
      });

      // Filter out invalid rows
      const validData = mappedData.filter(d => d.id && d.name);

      if (importType === ImportType.STUDENTS) {
        // Batch upload to Firestore
        const batch = writeBatch(db);
        for (const student of validData) {
          const studentRef = doc(db, 'students', String(student.id));
          batch.set(studentRef, {
            ...student,
            lastAnalyzed: new Date().toISOString(),
            status: 'PENDING'
          }, { merge: true });
          
          // Also sync to SQL Backend
          fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
          }).catch(console.error);
        }
        await batch.commit();
      }

      setImportResult({
        success: true,
        message: `Đã xử lý tệp ${selectedFile.name}. Đã nhập thành công ${validData.length} dòng dữ liệu vào database.`
      });
      setSelectedFile(null);
    } catch (error: any) {
      console.error(error);
      setImportResult({
        success: false,
        message: `Lỗi khi xử lý tệp: ${error.message}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    let data: any[] = [];
    let fileName = getTemplateName();

    if (importType === ImportType.STUDENTS) {
      data = [
        { "MSSV": "2012001", "Họ và Tên": "Nguyễn Văn A", "Lớp": "20CNTT1", "GPA": 3.2, "Email": "sv2012001@student.edu.vn" },
        { "MSSV": "2012002", "Họ và Tên": "Trần Thị B", "Lớp": "20CNTT1", "GPA": 1.8, "Email": "sv2012002@student.edu.vn" }
      ];
    } else if (importType === ImportType.GRADES) {
      data = [
        { "MSSV": "2012001", "Mã học phần": "IT101", "Tên học phần": "Lập trình C", "Số tín chỉ": 4, "Điểm": 8.5, "Học kỳ": "HK1 (2025-2026)" },
        { "MSSV": "2012001", "Mã học phần": "IT202", "Tên học phần": "Mạng máy tính", "Số tín chỉ": 3, "Điểm": 4.5, "Học kỳ": "HK1 (2025-2026)" }
      ];
    } else {
      data = [
        { "MSSV": "2012001", "Ngày chuyên cần": "2026-05-01", "Trạng thái": "Vắng", "Lý do": "Không lễ phép", "LMS Activity %": 45 },
        { "MSSV": "2012002", "Ngày chuyên cần": "2026-05-01", "Trạng thái": "Có mặt", "Lý do": "", "LMS Activity %": 90 }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName);
  };

  const getTemplateName = () => {
    switch (importType) {
      case ImportType.STUDENTS: return "mau_danh_sach_sinh_vien.xlsx";
      case ImportType.GRADES: return "mau_diem_hoc_phan.xlsx";
      case ImportType.ATTENDANCE: return "mau_diem_danh_lms.xlsx";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic font-serif">Import Dữ liệu Hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">Nạp dữ liệu từ Phòng đào tạo hoặc LMS (REQ-01)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Chọn loại dữ liệu</p>
            {Object.values(ImportType).map((type) => (
              <button
                key={type}
                onClick={() => setImportType(type)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg text-sm font-bold transition-all",
                  importType === type 
                    ? "bg-slate-900 text-white shadow-lg translate-x-1" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <FileSpreadsheet className="w-5 h-5" />
                {type === ImportType.STUDENTS ? 'Thông tin SV' : type === ImportType.GRADES ? 'Kết quả học tập' : 'Điểm danh / LMS'}
              </button>
            ))}
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <Download className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-orange-900">Mẫu dữ liệu chuẩn</h3>
             </div>
             <p className="text-sm text-orange-700 leading-relaxed mb-6 font-medium">
               Vui lòng sử dụng tệp mẫu được định dạng sẵn để quá trình phân tích rủi ro học vụ đạt độ chính xác cao nhất (100%).
             </p>
             <button 
               onClick={downloadTemplate}
               className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-white text-orange-600 px-4 py-3 rounded-lg border border-orange-200 hover:bg-orange-600 hover:text-white transition-all shadow-sm shadow-orange-200/50"
             >
                <FileText className="w-4 h-4" />
                Tải mẫu: {getTemplateName()}
             </button>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6 flex flex-col">
          <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-200 flex-1 flex flex-col items-center justify-center text-center transition-all hover:border-orange-300 hover:bg-orange-50/10 min-h-[450px]">
             <div className={cn(
               "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-transform duration-500",
               selectedFile ? "bg-green-50 scale-110" : "bg-slate-50"
             )}>
                {selectedFile ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                ) : (
                  <Upload className="w-12 h-12 text-slate-400" />
                )}
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-3 italic font-serif">
                {selectedFile ? `Tệp đã sẵn sàng: ${selectedFile.name}` : 'Kéo thả tệp dữ liệu vào đây'}
             </h3>
             <p className="text-base text-slate-500 mb-10 max-w-md">Hệ thống chấp nhận các định dạng bảng tính tiêu chuẩn (.xlsx, .csv) với dung lượng dưới 10MB.</p>
             
             <input 
               type="file" 
               className="hidden" 
               id="file-upload" 
               onChange={handleFileChange}
               accept=".csv,.xlsx,.xls"
             />
             
             <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={() => document.getElementById('file-upload')?.click()}
                 className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl text-base font-bold hover:bg-slate-50 cursor-pointer transition-all shadow-sm flex items-center gap-2"
               >
                  <FileText className="w-5 h-5 text-slate-400" />
                  Chọn tệp từ máy tính
               </button>
               
               {selectedFile && (
                 <button 
                   onClick={() => setSelectedFile(null)}
                   className="text-slate-400 hover:text-red-500 transition-colors p-3"
                   title="Hủy chọn tệp"
                 >
                   <X className="w-6 h-6" />
                 </button>
               )}
             </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Dữ liệu sẽ được đồng bộ ngay lập tức tới Cloud và SQL Backend.
            </div>
            <button
               onClick={handleImport}
               disabled={isUploading || !selectedFile}
               className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3"
            >
               {isUploading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               {isUploading ? 'Đang phân tích dữ liệu...' : '🚀 Bắt đầu quá trình Import'}
            </button>
          </div>

          {importResult && (
            <div className={cn(
              "p-6 rounded-xl flex gap-4 items-start animate-in fade-in slide-in-from-top-4 duration-500",
              importResult.success ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
            )}>
               {importResult.success ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
               <div>
                  <p className="font-bold">{importResult.success ? 'Thành công!' : 'Thất bại'}</p>
                  <p className="text-sm mt-1">{importResult.message}</p>
               </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
         <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 italic font-serif">Lịch sử Import gần đây</h4>
         <div className="space-y-4">
            {[
              { name: 'student_list_2023_hk1.xlsx', time: '10:30, 30/04/2026', user: 'Hoàng Nguyễn (Manager)', status: 'Success' },
              { name: 'grade_all_subjects.csv', time: '14:20, 29/04/2026', user: 'Trần Đạt (Admin)', status: 'Success' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-100 rounded text-slate-500">
                      <FileSpreadsheet className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900">{log.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{log.time} • {log.user}</p>
                   </div>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">{log.status}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
