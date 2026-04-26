import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { TITLES, BADGES_DATA } from '../data/questions';
import { QRCodeSVG } from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, Award, Target, History, Trophy, Edit2, Check, X,
  Zap, Flame, Crown, Book, Scroll, Timer, Wind, Users, 
  UserCircle, Coins, Banknote, Shield, Compass, Dna, 
  Megaphone, Library, Infinity, Activity, Mountain, Brain, Medal, UserPlus, Palette
} from 'lucide-react';

const Icons: any = {
  Trophy, Zap, Flame, Crown, Book, Scroll, Target, Timer, 
  Wind, Users, UserCircle, Coins, Banknote, Shield, Compass, 
  Dna, Megaphone, Library, Infinity, Activity, Mountain, Brain, Medal, Award
};

export const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUsername, updateAvatar, updateTitle, showToast } = useAuth();
  const [publicUser, setPublicUser] = useState<any>(null);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTitlePicker, setShowTitlePicker] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const isMyProfile = !id || (currentUser && (id === currentUser.id.toString() || id === currentUser.username));
  const user = isMyProfile ? currentUser : publicUser;

  useEffect(() => {
    if (id && (!currentUser || (id !== currentUser.id.toString() && id !== currentUser.username))) {
      loadPublicProfile(id);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (user) setNewName(user.username);
  }, [user]);

  const loadPublicProfile = async (uid: string) => {
    setLoadingPublic(true);
    try {
      const res = await fetch(`api/profile.php?action=get_public&id=${uid}`);
      const data = await res.json();
      if (!data.error) setPublicUser(data);
    } catch (e) { console.error(e); }
    setLoadingPublic(false);
  };

  const [inviteSent, setInviteSent] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const sendInvite = async () => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      const res = await fetch('api/multiplayer.php?action=send_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: currentUser.id, receiver_id: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setInviteSent(true);
        showToast('تم إرسال دعوة المعركة بنجاح', 'success');
      } else if (data.error === 'cooldown') {
        showToast(`يرجى الانتظار ${data.remaining} دقائق قبل إعادة الإرسال`, 'error');
      } else { showToast('فشل إرسال الدعوة', 'error'); }
    } catch (e) { showToast('تعذر الاتصال بالخادم', 'error'); }
  };

  const sendFriendRequest = async () => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      await fetch('api/friends.php?action=add_friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, friend_id: user.id })
      });
      setFriendRequestSent(true);
      showToast('تم إرسال طلب الصداقة', 'success');
    } catch (e) { showToast('فشل في إرسال طلب الصداقة', 'error'); }
  };

  if (loadingPublic) return <div className="min-h-screen flex items-center justify-center text-[#c5a059]">جاري تحميل الملف...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">لم يتم العثور على المستخدم</div>;

  const currentTitle = [...TITLES].reverse().find(t => user.score >= t.minScore)?.title || TITLES[0].title;
  const profileUrl = `${window.location.origin}/#/user/${user.username}`;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'ملف ملوك قرطاج',
        text: `شاهد مستواي في لعبة تاريخ تونس! أنا في المستوى ${user.level} ولقبي هو ${currentTitle}`,
        url: profileUrl,
      });
    } catch (e) {
      navigator.clipboard.writeText(profileUrl);
      setMsg({ text: 'تم نسخ الرابط للحافظة', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const saveName = async () => {
    const res = await updateUsername(newName);
    if (res.success) {
      setIsEditingName(false);
      setMsg({ text: res.message, type: 'success' });
    } else {
      setMsg({ text: res.message, type: 'error' });
    }
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const AVATARS = Array.from({ length: 8 }, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=carthage${i}`);

  const stats = [
    { label: 'النقاط الإجمالية', value: user.score, icon: Trophy, color: 'text-yellow-500' },
    { label: 'دقة الإجابات', value: `${user.accuracy}%`, icon: Target, color: 'text-emerald-500' },
    { label: 'سلسلة الدخول', value: `${user.streak || 1} يوم`, icon: Flame, color: 'text-orange-500' },
    { label: 'الأوسمة', value: user.badges.length, icon: Award, color: 'text-purple-500' },
  ];

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-5xl mx-auto">
      {msg.text && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl z-[100] font-bold shadow-2xl ${msg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#c5a059]/20 rounded-3xl p-8 text-center sticky top-24"
          >
            <div className="relative w-full h-40 -mt-8 -mx-8 mb-16 rounded-t-[2.5rem] overflow-hidden group">
               <img src={user.banner || 'https://images.unsplash.com/photo-1610450949065-1f2801439264?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" />
               {isMyProfile && (
                 <button className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Palette size={16} />
                 </button>
               )}
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div 
                    className={`relative w-32 h-32 group ${isMyProfile ? 'cursor-pointer' : ''}`} 
                    onClick={() => isMyProfile && setShowAvatarPicker(true)}
                  >
                    <div className="absolute inset-0 bg-[#c5a059] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img 
                      src={user.avatar && user.avatar.length > 5 ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt={user.username} 
                      className="relative w-full h-full rounded-full border-4 border-[#1a1a1a] bg-[#1a1a1a] object-cover shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                      }}
                    />
                    {isMyProfile && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={24} className="text-[#c5a059]" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#c5a059] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[#1a1a1a]">
                      {user.level}
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              {isEditingName && isMyProfile ? (
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
                  <input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-center w-32"
                  />
                  <button onClick={saveName} className="text-emerald-500"><Check size={18}/></button>
                  <button onClick={() => setIsEditingName(false)} className="text-red-500"><X size={18}/></button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                  {isMyProfile && (
                    <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
            
            <div 
              className={`inline-block px-4 py-1 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059] font-bold text-sm mb-6 ${isMyProfile ? 'cursor-pointer hover:bg-[#c5a059]/20' : ''}`}
              onClick={() => isMyProfile && setShowTitlePicker(true)}
            >
              {isMyProfile ? user.activeTitle : currentTitle}
              {isMyProfile && <Edit2 size={12} className="inline-block mr-2 opacity-50" />}
            </div>
            
            <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
              {isMyProfile ? (
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-[#c5a059] text-black font-bold py-3 rounded-xl hover:bg-[#b08d4a] transition-colors w-full"
                >
                  <Share2 size={18} />
                  <span>مشاركة الملف</span>
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={sendInvite}
                    disabled={inviteSent}
                    className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all w-full ${
                      inviteSent ? 'bg-gray-800 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/20'
                    }`}
                  >
                    <Trophy size={18} />
                    <span>{inviteSent ? 'تحدي قيد الانتظار' : 'دعوة باتل'}</span>
                  </button>

                  <button 
                    onClick={sendFriendRequest}
                    disabled={friendRequestSent}
                    className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all w-full ${
                      friendRequestSent ? 'bg-gray-800 text-gray-500' : 'bg-[#c5a059] text-black hover:bg-[#b08d4a] active:scale-95'
                    }`}
                  >
                    {friendRequestSent ? <Check size={18} /> : <UserPlus size={18} />}
                    <span>{friendRequestSent ? 'تم إرسال الطلب' : 'إضافة صديق'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-white rounded-2xl inline-block relative group">
              <QRCodeSVG value={profileUrl} size={120} fgColor="#000" bgColor="#fff" />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Trophy size={40} className="text-[#c5a059]/20" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-sans">هويتك التاريخية الرقمية</p>
          </motion.div>
        </div>

        <AnimatePresence>
          {showAvatarPicker && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-[#1a1a1a] border border-[#c5a059]/30 rounded-3xl p-8 max-w-md w-full"
               >
                  <h3 className="text-xl font-bold text-white mb-6 text-center amiri">اختر شخصيتك</h3>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {AVATARS.map((av, i) => (
                      <button 
                        key={i} 
                        onClick={() => { updateAvatar(av); setShowAvatarPicker(false); }}
                        className={`rounded-full border-2 p-1 transition-all ${user.avatar === av ? 'border-[#c5a059] bg-[#c5a059]/10' : 'border-transparent hover:border-white/20'}`}
                      >
                        <img src={av} className="w-full h-full rounded-full" />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowAvatarPicker(false)} className="w-full bg-white/5 py-3 rounded-xl text-white font-bold">إغلاق</button>
               </motion.div>
            </div>
          )}

          {showTitlePicker && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-[#1a1a1a] border border-[#c5a059]/30 rounded-3xl p-8 max-w-md w-full"
               >
                  <h3 className="text-xl font-bold text-white mb-6 text-center amiri">اختر لقبك المفضل</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {TITLES.map((t, i) => {
                      const isUnlocked = user.score >= t.minScore;
                      return (
                        <button 
                          key={i} 
                          disabled={!isUnlocked}
                          onClick={() => { if(isUnlocked) { updateTitle(t.title); setShowTitlePicker(false); } }}
                          className={`w-full p-4 rounded-xl text-right transition-all flex items-center justify-between ${
                            user.activeTitle === t.title ? 'bg-[#c5a059] text-black font-bold' : 
                            isUnlocked ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white/5 text-gray-600 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span>{t.title}</span>
                          {!isUnlocked && <span className="text-[10px]">{t.minScore} نقطة</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setShowTitlePicker(false)} className="mt-6 w-full bg-white/5 py-3 rounded-xl text-white font-bold">إغلاق</button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>


        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-center"
                >
                  <Icon size={24} className={`${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-[#c5a059]" />
              الأوسمة والإنجازات ({user.badges.length}/{BADGES_DATA.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {BADGES_DATA.map((badge) => {
                const isEarned = user.badges.includes(badge.name);
                const IconComponent = (Icons as any)[badge.icon] || Icons.Trophy;
                return (
                  <div key={badge.id} className={`group relative bg-black/40 border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${isEarned ? 'border-[#c5a059]/30 shadow-lg shadow-[#c5a059]/5' : 'border-white/5 opacity-40 grayscale'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEarned ? 'bg-gradient-to-tr from-[#c5a059]/20 to-[#8c6d31]/20' : 'bg-white/5'}`}>
                      <IconComponent className={isEarned ? 'text-[#c5a059]' : 'text-gray-600'} size={32} />
                    </div>
                    <span className="text-xs font-bold text-center text-white line-clamp-1">{badge.name}</span>
                    <span className="text-[8px] text-gray-500 text-center leading-tight h-6 overflow-hidden">{badge.desc}</span>
                    {!isEarned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-white font-bold">مغلق</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History className="text-[#c5a059]" />
              التقدم في المستويات (المستوى الحالي: {user.level})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((lvl) => {
                const isUnlocked = user.level >= lvl;
                const pointsNeeded = (lvl - 1) * 1000;
                return (
                  <div key={lvl} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isUnlocked ? 'bg-[#c5a059]/5 border border-[#c5a059]/10' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${isUnlocked ? 'bg-[#c5a059] text-black' : 'bg-white/5 text-gray-500'}`}>
                      {lvl}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-white">المرحلة {lvl}</span>
                        <span className="text-[10px] text-gray-500">{pointsNeeded} نقطة</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isUnlocked ? '100%' : '0%' }}
                          className="h-full bg-[#c5a059]" 
                        />
                      </div>
                    </div>
                    {isUnlocked && <Check size={14} className="text-[#c5a059]" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
