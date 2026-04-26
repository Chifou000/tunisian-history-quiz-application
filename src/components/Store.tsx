import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Clock, SkipForward, Coins, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Store = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, buyPowerup } = useAuth();

  const items = [
    { id: 'fiftyFifty', name: 'حذف خيارين', icon: Zap, color: 'text-yellow-500', price: 100, desc: 'يساعدك على تقليل احتمالات الخطأ' },
    { id: 'extraTime', name: 'وقت إضافي', icon: Clock, color: 'text-blue-500', price: 150, desc: 'يضيف 15 ثانية لعداد الوقت' },
    { id: 'skip', name: 'تخطي السؤال', icon: SkipForward, color: 'text-emerald-500', price: 200, desc: 'تجاوز سؤالاً صعباً دون خسارة' },
  ];

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] border border-[#c5a059]/30 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold amiri text-white flex items-center gap-2">
                  <ShoppingBag className="text-[#c5a059]" />
                  متجر قرطاج
                </h2>
                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 mt-2">
                  <Coins size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{user.coins} عملة</span>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center flex flex-col items-center group hover:border-[#c5a059]/30 transition-all">
                    <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 mb-6 leading-tight">{item.desc}</p>
                    <button 
                      onClick={() => buyPowerup(item.id as any, item.price)}
                      className="w-full bg-[#c5a059] text-black font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b08d4a] transition-all"
                    >
                      <Coins size={14} fill="currentColor" />
                      <span>{item.price}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/10 rounded-3xl">
              <h4 className="font-bold text-white mb-2">كيف تحصل على العملات؟</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                اجمع العملات من خلال إنهاء جولات اللعب بنجاح، إتمام المهمات اليومية، وتحقيق أرقام قياسية جديدة. يمكنك استخدام العملات لشراء وسائل المساعدة لمساعدتك في التحديات الصعبة.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
