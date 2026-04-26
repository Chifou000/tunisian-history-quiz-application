import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Play, Info, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <div className="mb-8 relative inline-block">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-[#c5a059] to-[#8c6d31] rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-[#c5a059]/20"
          >
            <Shield size={80} className="text-black md:hidden" />
            <Shield size={120} className="text-black hidden md:block" />
          </motion.div>
          <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
            جديد
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold amiri text-white mb-6 leading-tight">
          ملوك <span className="text-[#c5a059]">قرطاج</span>
          <br />
          <span className="text-3xl md:text-5xl opacity-90">لعبة تاريخ تونس الكبرى</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          سافر عبر الزمن واكتشف أسرار الحضارات التي مرت على أرض تونس الخضراء. من أسوار قرطاج العظيمة إلى شموخ القيروان وثورة الأحرار.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="group relative flex items-center gap-3 bg-[#c5a059] text-black font-extrabold px-10 py-5 rounded-2xl text-xl shadow-2xl hover:bg-[#b08d4a] transition-all active:scale-95"
          >
            <Play fill="black" size={24} />
            <span>{user ? 'مواصلة اللعب' : 'ابدأ المغامرة'}</span>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 bg-white/5 text-white font-bold px-8 py-5 rounded-2xl text-lg hover:bg-white/10 border border-white/10 transition-all"
          >
            <Trophy size={20} className="text-[#c5a059]" />
            <span>لوحة الصدارة</span>
          </button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-12">
          <div className="flex flex-col items-center">
            <div className="text-[#c5a059] font-bold text-2xl mb-1">+100</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">سؤال تاريخي</div>
          </div>
          <div className="flex flex-col items-center border-x border-white/5 px-8">
            <div className="text-[#c5a059] font-bold text-2xl mb-1">10</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">مستويات</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[#c5a059] font-bold text-2xl mb-1">∞</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">متعة وتعلم</div>
          </div>
        </div>
      </motion.div>

      <footer className="mt-auto pt-12 text-gray-600 text-sm flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Info size={14} />
          إصدار 1.0.0
        </span>
        <span>•</span>
        <span>صنع بكل فخر في تونس</span>
      </footer>
    </div>
  );
};
