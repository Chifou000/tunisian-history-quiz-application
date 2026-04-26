import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Users, BookOpen, Trophy, Flame, Star, ShieldCheck, Clock, SkipForward, ShoppingBag, Coins, Gift, Heart, Share, Palette, MessageSquare, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TITLES } from '../data/questions';
import { LIBRARY_DATA } from '../data/library';
import { Store } from '../components/Store';

export const Dashboard = () => {
  const { user, showToast, updateTheme } = useAuth();
  const navigate = useNavigate();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const hasClaimedToday = user.lastLoginDate === today;

  const fetchActivities = async () => {
    try {
      const res = await fetch('api/profile.php?action=get_activities');
      const data = await res.json();
      if (Array.isArray(data)) setActivities(data);
    } catch (e) {}
    setLoadingActivities(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    showToast('تم نسخ رمز الإحالة الخاص بك!', 'success');
  };

  const claimDaily = async () => {
    if (hasClaimedToday) return;
    try {
      await fetch('api/profile.php?action=claim_daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      window.location.reload(); // Refresh to update user state from server
    } catch (e) {
      showToast('خطأ في استلام المكافأة', 'error');
    }
  };

  const currentTitle = [...TITLES].reverse().find(t => user.score >= t.minScore)?.title || TITLES[0].title;

  const modes = [
    {
      id: 'normal',
      title: 'الوضع العادي',
      description: 'رحلة عبر تاريخ تونس بمختلف مراحله',
      icon: Play,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/game/normal')
    },
    {
      id: 'challenge',
      title: 'وضع التحدي',
      description: 'أجب بسرعة! وقت أقل ونقاط مضاعفة',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      action: () => navigate('/game/challenge')
    },
    {
      id: 'friend',
      title: 'لاعب ضد صديق',
      description: 'ادعُ أصدقاءك (حتى 4 لاعبين) في تحدي 20 سؤالاً',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      action: () => navigate('/social')
    },
    {
      id: 'learn',
      title: 'مكتبة التاريخ',
      description: 'اقرأ عن أهم الشخصيات والأحداث التونسية',
      icon: BookOpen,
      color: 'from-rose-500 to-pink-600',
      action: () => navigate('/library')
    }
  ];

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold amiri text-white">مرحباً، {user.username}</h1>
            <div className="flex items-center gap-1 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full border border-orange-500/30">
              <Flame size={16} fill="currentColor" />
              <span className="text-sm font-bold">{user.streak || 1} يوم متتالي</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30">
              <Coins size={16} fill="currentColor" />
              <span className="text-sm font-bold">{user.coins}</span>
            </div>
            <button 
              onClick={() => setIsStoreOpen(true)}
              className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <ShoppingBag size={16} />
              <span className="text-sm font-bold">المتجر</span>
            </button>
            <div className="flex items-center gap-1 bg-red-500/20 text-red-500 px-3 py-1 rounded-full border border-red-500/30">
              <Heart size={16} fill="currentColor" />
              <span className="text-sm font-bold">{user.hearts}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#c5a059]/20 text-[#c5a059] px-3 py-1 rounded-full text-sm font-bold border border-[#c5a059]/30">
              {currentTitle}
            </span>
            <span className="text-gray-400 text-sm">المستوى {user.level}</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex gap-8">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">النقاط</p>
            <p className="text-[#c5a059] font-bold text-xl">{user.score}</p>
          </div>
          <div className="text-center border-x border-white/5 px-8">
            <p className="text-gray-500 text-xs mb-1">الدقة</p>
            <p className="text-white font-bold text-xl">{user.accuracy}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">الأوسمة</p>
            <p className="text-white font-bold text-xl">{user.badges.length}</p>
          </div>
        </div>
      </header>

      {/* Daily Featured Fact */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 bg-gradient-to-r from-[#c5a059]/20 via-[#c5a059]/5 to-transparent border border-[#c5a059]/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#c5a059] flex items-center justify-center shrink-0 shadow-lg shadow-[#c5a059]/20">
          <Star size={40} className="text-black" fill="black" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-[#c5a059]" />
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest">معلم اليوم</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 amiri">{LIBRARY_DATA[new Date().getDate() % LIBRARY_DATA.length].title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
            {LIBRARY_DATA[new Date().getDate() % LIBRARY_DATA.length].desc}
          </p>
        </div>
        <button 
          onClick={() => navigate('/library')}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 font-bold transition-all"
        >
          اكتشف المزيد
        </button>
      </motion.div>

      <Store isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />
      
      {!hasClaimedToday && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 p-4 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Gift className="text-white animate-bounce" size={24} />
            <div>
              <p className="text-white font-bold text-sm">مكافأة الحضور اليومي بانتظارك!</p>
              <p className="text-white/70 text-[10px]">احصل على 50 عملة الآن</p>
            </div>
          </div>
          <button 
            onClick={claimDaily}
            className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all"
          >
            استلمها الآن
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {Object.entries(user.mastery).map(([era, val], i) => (
           <motion.div 
             key={era}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a059]/5 blur-2xl group-hover:bg-[#c5a059]/10 transition-colors" />
              <div className="flex justify-between items-center mb-3 relative z-10">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{era}</span>
                 <span className="text-xs font-bold text-[#c5a059]">{val}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${val}%` }}
                   className="h-full bg-gradient-to-r from-[#c5a059] to-[#8c6d31]"
                 />
              </div>
           </motion.div>
         ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 h-fit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={mode.action}
              className="relative group overflow-hidden bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 text-right transition-all hover:border-[#c5a059]/50 hover:shadow-2xl hover:shadow-[#c5a059]/5"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mode.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-lg`}>
                  <Icon size={28} className="text-white" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white mb-2">{mode.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{mode.description}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="text-[#c5a059] flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                  <span>ابدأ الآن</span>
                  <span className="text-xl">←</span>
                </div>
              </div>
            </motion.button>
          );
        })}
          </div>

          {/* Power-ups Inventory */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xl font-bold amiri text-white mb-6 flex items-center gap-2">
              <Zap className="text-[#c5a059]" size={20} />
              رصيد المساعدات
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                <Zap className="text-yellow-500 mx-auto mb-2" size={24} />
                <p className="text-xl font-bold text-white">{user.powerups.fiftyFifty}</p>
                <p className="text-[10px] text-gray-500">حذف خيارين</p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                <Clock className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-xl font-bold text-white">{user.powerups.extraTime}</p>
                <p className="text-[10px] text-gray-500">وقت إضافي</p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                <SkipForward className="text-emerald-500 mx-auto mb-2" size={24} />
                <p className="text-xl font-bold text-white">{user.powerups.skip}</p>
                <p className="text-[10px] text-gray-500">تخطي السؤال</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Referral Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-3xl p-6">
             <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                <Share size={16} className="text-indigo-400" />
                برنامج الإحالة
             </h3>
             <p className="text-[10px] text-gray-500 mb-4">شارك رمزك واحصل على 100 عملة!</p>
             <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                <code className="flex-1 font-mono text-[#c5a059] font-bold text-center text-xs">{user.referralCode}</code>
                <button onClick={handleReferral} className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-700 transition-colors"><Share size={12}/></button>
             </div>
          </div>

          {/* Theme Selector */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                <Palette size={16} className="text-pink-400" />
                تخصيص الواجهة
             </h3>
             <div className="flex flex-col gap-2">
                {['punic', 'islamic', 'modern'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => updateTheme(t as any)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${user.theme === t ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                  >
                    {t === 'punic' ? 'بوني' : t === 'islamic' ? 'إسلامي' : 'حديث'}
                  </button>
                ))}
             </div>
          </div>

          {/* Feedback */}
          <button 
            onClick={() => showToast('شكراً لملاحظاتك! سيتم مراجعتها قريباً', 'success')}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/5 p-4 rounded-3xl text-gray-400 hover:bg-white/10 transition-all font-bold text-xs"
          >
            <MessageSquare size={16} />
            أرسل ملاحظاتك
          </button>
        </div>

        {/* Activity & Quests Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 flex flex-col h-[300px]">
            <h3 className="text-sm font-bold amiri text-white mb-4 flex items-center gap-2 shrink-0">
              <Activity className="text-blue-500" size={16} />
              نشاط المجتمع
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
               {loadingActivities ? (
                 <p className="text-[10px] text-gray-600 text-center py-10 animate-pulse">جاري التحميل...</p>
               ) : activities.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Activity size={32} className="mb-2" />
                    <p className="text-[10px] text-center">لا يوجد نشاط حالي للمجتمع</p>
                 </div>
               ) : (
                 activities.map((act: any, i: number) => (
                   <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/10 flex items-center justify-center shrink-0">
                         <Users size={14} className="text-[#c5a059]" />
                      </div>
                      <div>
                         <p className="text-[10px] text-white font-bold"><span className="text-[#c5a059]">{act.username}</span> {act.description}</p>
                         <p className="text-[8px] text-gray-600 mt-0.5">{new Date(act.created_at).toLocaleTimeString('ar-TN')}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-bold amiri text-white mb-6 flex items-center gap-2 shrink-0">
              <Zap className="text-yellow-500" size={16} />
              المهمات ({user.quests.filter(q => !q.completed).length})
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {user.quests.filter(q => !q.completed).slice(0, 10).map((quest) => (
                <div key={quest.id} className="p-3 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-white">{quest.title}</span>
                    <span className="text-[8px] text-yellow-500 font-bold">+{quest.reward}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                      className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-gray-500">{quest.current}/{quest.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold amiri text-white mb-6">آخر الأوسمة المحصلة</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {user.badges.length > 0 ? (
            user.badges.map((badge, i) => (
              <div key={i} className="flex-shrink-0 bg-[#1a1a1a] border border-[#c5a059]/20 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-700 flex items-center justify-center mb-2 shadow-inner">
                  <Trophy size={20} className="text-white" />
                </div>
                <span className="text-xs font-bold text-center text-gray-300">{badge}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">ابدأ اللعب للحصول على أوسمتك الأولى!</p>
          )}
        </div>
      </section>
    </div>
  );
};
