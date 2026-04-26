import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Volume2, Eye, Palette, ChevronLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, updateSettings, updateTheme, showToast } = useAuth();
  const navigate = useNavigate();
  const [localSettings, setLocalSettings] = useState(user?.settings || { sound: true, privacy: true });
  
  if (!user) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-xl text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold amiri text-white text-right w-full">الإعدادات</h1>
      </div>

      <div className="space-y-6">
        {/* Sound */}
        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <Volume2 size={24} />
              </div>
              <div>
                 <p className="text-white font-bold">المؤثرات الصوتية</p>
                 <p className="text-xs text-gray-500">تشغيل الأصوات أثناء اللعب</p>
              </div>
           </div>
           <button 
             onClick={() => setLocalSettings({...localSettings, sound: !localSettings.sound})}
             className={`w-14 h-8 rounded-full transition-all relative ${localSettings.sound ? 'bg-[#c5a059]' : 'bg-gray-700'}`}
           >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.sound ? 'right-7' : 'right-1'}`} />
           </button>
        </div>

        {/* Privacy */}
        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <Eye size={24} />
              </div>
              <div>
                 <p className="text-white font-bold">خصوصية الملف</p>
                 <p className="text-xs text-gray-500">جعل إحصائياتك مرئية للجميع</p>
              </div>
           </div>
           <button 
             onClick={() => setLocalSettings({...localSettings, privacy: !localSettings.privacy})}
             className={`w-14 h-8 rounded-full transition-all relative ${localSettings.privacy ? 'bg-[#c5a059]' : 'bg-gray-700'}`}
           >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.privacy ? 'right-7' : 'right-1'}`} />
           </button>
        </div>

        {/* Theme (Quick access) */}
        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                 <Palette size={24} />
              </div>
              <div>
                 <p className="text-white font-bold">النمط البصري</p>
                 <p className="text-xs text-gray-500">تغيير ألوان التطبيق</p>
              </div>
           </div>
           <div className="flex gap-2">
                {['punic', 'islamic', 'modern'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => updateTheme(t as any)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${user.theme === t ? 'bg-pink-600/20 border-pink-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                  >
                    {t === 'punic' ? 'بوني' : t === 'islamic' ? 'إسلامي' : 'حديث'}
                  </button>
                ))}
           </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#c5a059] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20"
        >
          <Save size={20} />
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
};
