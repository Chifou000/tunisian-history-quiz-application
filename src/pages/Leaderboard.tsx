import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MOCK_DATA: any[] = [];

export const Leaderboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rankingType, setRankingType] = useState<'global' | 'friends'>('global');

  const fullList = useMemo(() => {
    const list = [...MOCK_DATA];
    if (user && user.score >= 1000) {
      const exists = list.find(p => p.username === user.username);
      if (!exists) list.push({ username: user.username, score: user.score, level: user.level, avatar: user.avatar });
      else exists.score = user.score;
    }
    return list.filter(p => p.score >= 1000).sort((a, b) => b.score - a.score);
  }, [user]);

  const [timeframe, setTimeTimeframe] = useState<'all' | 'month'>('all');
  const filtered = fullList.filter(p => p.username.includes(searchTerm));

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <Crown className="text-[#c5a059] mx-auto mb-4" size={48} />
        <h1 className="text-4xl font-bold amiri text-white mb-2">لوحة الصدارة</h1>
        <p className="text-gray-400 mb-8">أفضل اللاعبين في تاريخ تونس</p>
        
        <div className="flex flex-col gap-4 items-center">
          <div className="inline-flex p-1 bg-black/40 border border-white/5 rounded-2xl">
            <button 
              onClick={() => setRankingType('global')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${rankingType === 'global' ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20' : 'text-gray-500 hover:text-white'}`}
            >
              العالمي
            </button>
            <button 
              onClick={() => setRankingType('friends')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${rankingType === 'friends' ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20' : 'text-gray-500 hover:text-white'}`}
            >
              الأصدقاء
            </button>
          </div>

          <div className="flex gap-2 mb-8">
            <button onClick={() => setTimeTimeframe('all')} className={`text-[10px] px-3 py-1 rounded-full border transition-all ${timeframe === 'all' ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10' : 'border-white/5 text-gray-500'}`}>كل الوقت</button>
            <button onClick={() => setTimeTimeframe('month')} className={`text-[10px] px-3 py-1 rounded-full border transition-all ${timeframe === 'month' ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10' : 'border-white/5 text-gray-500'}`}>هذا الشهر</button>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text"
          placeholder="ابحث عن منافس..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-3 pr-10 pl-4 focus:border-[#c5a059] outline-none transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#1a1a1a] border border-dashed border-white/10 rounded-3xl"
          >
            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد متصدرون حالياً. كن أول من يتصدر القائمة!</p>
          </motion.div>
        )}
        {filtered.map((player, index) => {
          const isTop3 = index < 3;
          const rankColors = [
            'border-yellow-500 bg-yellow-500/10 text-yellow-500',
            'border-slate-300 bg-slate-300/10 text-slate-300',
            'border-amber-700 bg-amber-700/10 text-amber-700'
          ];

          return (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${
                isTop3 ? rankColors[index] : 'bg-[#1a1a1a] border-white/5 text-gray-400'
              }`}
            >
              <div className="w-8 font-bold text-center">
                {isTop3 ? (
                  index === 0 ? <Crown size={24} className="mx-auto" /> : <Medal size={24} className="mx-auto" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-current overflow-hidden shrink-0">
                <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/user/${player.id || player.username}`} className="font-bold text-white truncate hover:text-[#c5a059] transition-colors">{player.username}</Link>
                <p className="text-xs">المستوى {player.level}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-white">{player.score.toLocaleString()}</p>
                <p className="text-[10px] uppercase">نقطة</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 bg-gradient-to-r from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#c5a059] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold">
            ?
          </div>
          <div>
            <h4 className="font-bold text-white">ترتيبك الحالي</h4>
            <p className="text-sm text-gray-400">لم يتم تحديد ترتيبك بعد. واصل اللعب!</p>
          </div>
        </div>
        <Trophy className="text-[#c5a059]" size={32} />
      </div>
    </div>
  );
};
