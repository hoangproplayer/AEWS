import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { PredictionResult } from '@/src/services/predictionService';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface AIInsightCardProps {
  prediction: PredictionResult | null;
  loading?: boolean;
}

export default function AIInsightCard({ prediction, loading }: AIInsightCardProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
          <div className="h-4 w-48 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const getRiskIcon = () => {
    switch (prediction.riskLevel) {
      case 'SAFE': return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case 'WARNING': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'DANGER': return <ShieldAlert className="w-6 h-6 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (prediction.riskLevel) {
      case 'SAFE': return "text-green-400";
      case 'WARNING': return "text-yellow-400";
      case 'DANGER': return "text-red-500";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-910 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="p-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                <Sparkles className="w-5 h-5 text-white" />
             </div>
             <div>
                <h3 className="text-white font-bold tracking-tight italic font-serif">Dự báo AI (GenAI REQ-06)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phân tích dựa trên dữ liệu đa kỳ</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
             <span className="text-[10px] font-bold text-slate-400 tracking-wider">Độ tin cậy:</span>
             <span className="text-xs font-bold text-orange-400">{(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-800/30 rounded-2xl border border-slate-800">
             {getRiskIcon()}
             <p className={cn("mt-3 text-lg font-bold tracking-tight italic font-serif", getRiskColor())}>
               {prediction.riskLevel === 'SAFE' ? 'AN TOÀN' : prediction.riskLevel === 'WARNING' ? 'CẦN LƯU Ý' : 'NGUY CƠ CAO'}
             </p>
             <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Phân loại mức độ nguy cơ</p>
          </div>

          <div className="md:col-span-8">
             <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
               <Info className="w-3 h-3" /> Phân tích quy luật học tập
             </h4>
             <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
               "{prediction.reasoning}"
             </p>

             <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
               <Lightbulb className="w-3 h-3 text-orange-400" /> Đề xuất hướng giải quyết (Can thiệp)
             </h4>
             <div className="space-y-2">
                {prediction.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-400 group cursor-default">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                    <span className="group-hover:text-slate-200 transition-colors">{action}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Info = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
