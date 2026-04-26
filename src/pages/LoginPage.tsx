import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Shield, User, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.length >= 3 && password.length >= 3) {
      const res = await login(username, password, !isLogin);
      if (!res.success) {
        setError(res.message || 'حدث خطأ ما');
      }
    } else {
      setError('يرجى التأكد من البيانات (3 أحرف على الأقل)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#111]/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg transition-colors duration-500 ${
              isLogin 
                ? 'bg-gradient-to-tr from-[#c5a059] to-[#8c6d31] shadow-[#c5a059]/20' 
                : 'bg-gradient-to-tr from-emerald-500 to-teal-700 shadow-emerald-500/20'
            }`}
          >
            <Shield size={40} className="text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold amiri mb-2">
            {isLogin ? <span className="text-[#c5a059]">تسجيل الدخول</span> : <span className="text-emerald-500">إنشاء حساب</span>}
          </h1>
          <p className="text-gray-400">{isLogin ? 'أهلاً بك مجدداً أيها المحارب' : 'ابدأ رحلتك التاريخية الآن'}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl text-sm text-center mb-6">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block mr-1">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-[#c5a059] transition-colors"
                placeholder="أدخل اسمك"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block mr-1">كلمة السر</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-[#c5a059] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-black ${
              isLogin 
                ? 'bg-gradient-to-r from-[#c5a059] to-[#8c6d31] hover:shadow-[#c5a059]/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/30'
            }`}
          >
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-[#c5a059] text-sm transition-colors"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
