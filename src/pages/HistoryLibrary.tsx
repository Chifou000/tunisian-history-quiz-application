import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { LIBRARY_DATA } from '../data/library';

export const HistoryLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof LIBRARY_DATA[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const navigate = useNavigate();

  const categories = ['الكل', ...new Set(LIBRARY_DATA.map(i => i.category))];

  const filtered = LIBRARY_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'الكل' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-[#c5a059]/30 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              <div className="h-48 bg-gradient-to-br from-[#c5a059] to-[#8c6d31] relative">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="absolute bottom-6 right-6 text-right">
                  <span className="bg-black/40 backdrop-blur-md text-[#c5a059] px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-4xl font-bold text-white amiri">{selectedItem.title}</h2>
                </div>
              </div>
              <div className="p-8 text-right">
                <div className="flex items-center justify-end gap-4 text-gray-400 mb-6 text-sm">
                  <span>{selectedItem.period}</span>
                  <Clock size={16} className="text-[#c5a059]" />
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-8">
                  {selectedItem.desc}
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 mb-1">الحالة</p>
                      <p className="font-bold text-green-500">معلم محمي</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 mb-1">التصنيف</p>
                      <p className="font-bold text-white">{selectedItem.category}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold amiri text-white">مكتبة التاريخ</h1>
          <p className="text-gray-400 text-sm">100 مرجع تاريخي بين يديك</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-xl text-gray-400">
          <ChevronLeft size={24} className="rotate-180" />
        </button>
      </div>

      <div className="relative mb-10">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text"
          placeholder="ابحث عن شخصية، حدث، أو معلم..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pr-12 pl-6 focus:border-[#c5a059] outline-none transition-all text-right"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4 justify-end">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeCategory === cat ? 'bg-[#c5a059] text-black shadow-[0_0_15px_#c5a059]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 hover:border-[#c5a059]/30 transition-all group text-right flex flex-col"
          >
            <div className="flex items-start justify-between mb-4 flex-row-reverse">
              <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                <BookOpen size={24} />
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400">{item.category}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
            <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mb-4">
              <span>{item.period}</span>
              <Clock size={14} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{item.desc}</p>
            <button 
              onClick={() => setSelectedItem(item)}
              className="w-full bg-white/5 py-3 rounded-xl text-sm font-bold hover:bg-[#c5a059] hover:text-black transition-all"
            >
              عرض التفاصيل
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
