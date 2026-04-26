import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  target: number;
  current: number;
  completed: boolean;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  completedQuestions: number[];
  badges: string[];
  lastLogin: string;
  lastLoginDate?: string;
  lastUsernameChange?: string;
  accuracy: number;
  totalAnswered: number;
  correctAnswered: number;
  quests: Quest[];
  role: 'admin' | 'user';
  activeTitle: string;
  streak: number;
  coins: number;
  hearts: number;
  referralCode: string;
  theme: 'punic' | 'islamic' | 'modern';
  mastery: { [key: string]: number };
  banner: string;
  settings: {
    sound: boolean;
    privacy: boolean;
  };
  powerups: {
    fiftyFifty: number;
    extraTime: number;
    skip: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, isSignup?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateStats: (correct: boolean, questionId: number, points: number, era?: string) => void;
  updateAvatar: (newAvatar: string) => Promise<void>;
  updateBanner: (newBanner: string) => Promise<void>;
  updateUsername: (newName: string) => Promise<{ success: boolean; message: string }>;
  updateTitle: (newTitle: string) => Promise<void>;
  updateTheme: (newTheme: 'punic' | 'islamic' | 'modern') => void;
  updateSettings: (settings: { sound: boolean, privacy: boolean }) => void;
  usePowerup: (type: 'fiftyFifty' | 'extraTime' | 'skip') => boolean;
  buyPowerup: (type: 'fiftyFifty' | 'extraTime' | 'skip', price: number) => boolean;
  addCoins: (amount: number) => void;
  loseHeart: () => void;
  playSound: (type: 'correct' | 'wrong' | 'click') => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string, type: string } | null>(null);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    if (!user?.settings.sound) return;
    const sounds: any = {
      correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const generateQuests = () => {
    const types = ['الإجابات الصحيحة', 'النقاط المحصلة', 'عدد الألعاب', 'الأوسمة'];
    return Array.from({ length: 500 }, (_, i) => ({
      id: (i + 1).toString(),
      title: `${types[i % 4]} - المستوى ${Math.floor(i / 4) + 1}`,
      description: `المطلوب: تحقيق تقدم في ${types[i % 4]}`,
      target: (Math.floor(i / 4) + 1) * (i % 4 === 1 ? 500 : 10),
      current: 0,
      reward: (Math.floor(i / 4) + 1) * 50,
      completed: false
    }));
  };

  const ensureUserData = (data: any) => ({
    ...data,
    quests: (data.quests && data.quests.length > 0) ? data.quests : generateQuests(),
    badges: data.badges || [],
    completedQuestions: data.completedQuestions || [],
    activeTitle: data.activeTitle || data.active_title || 'زائر تاريخي',
    streak: data.streak || data.login_streak || 1,
    coins: data.coins || 500,
    hearts: data.hearts !== undefined ? data.hearts : 5,
    theme: data.theme || data.selected_theme || 'punic',
    mastery: data.mastery || { 'قرطاج': 0, 'روماني': 0, 'إسلامي': 0, 'حديث': 0 },
    banner: data.banner || data.profile_banner || 'https://images.unsplash.com/photo-1610450949065-1f2801439264?auto=format&fit=crop&q=80&w=800',
    settings: data.settings || { sound: data.sound_enabled ?? true, privacy: data.privacy_public ?? true },
    referralCode: data.referralCode || data.referral_code || Math.random().toString(36).substring(2, 8).toUpperCase(),
    powerups: data.powerups || (data.powerups_json ? JSON.parse(data.powerups_json) : { fiftyFifty: 3, extraTime: 3, skip: 3 })
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('api/get_session.php');
        const data = await response.json();
        if (data) setUser(ensureUserData(data));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (username: string, password: string, isSignup = false) => {
    try {
      const response = await fetch(`api/login.php?action=${isSignup ? 'signup' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const userData = await response.json();
      if (userData.error) return { success: false, message: userData.error };
      setUser(ensureUserData(userData));
      return { success: true };
    } catch (e) { return { success: false, message: "تعذر الاتصال" }; }
  };

  const logout = async () => { await fetch('api/logout.php'); setUser(null); };

  const updateAvatar = async (newAvatar: string) => {
    if (!user) return;
    setUser({ ...user, avatar: newAvatar });
    fetch('api/profile.php?action=update_avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, avatar: newAvatar }) });
  };

  const updateBanner = async (newBanner: string) => {
    if (!user) return;
    setUser({ ...user, banner: newBanner });
    fetch('api/profile.php?action=update_banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, banner: newBanner }) });
  };

  const updateUsername = async (newName: string) => {
    if (!user) return { success: false, message: "سجل أولاً" };
    try {
      const res = await fetch('api/profile.php?action=update_username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, username: newName }) });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.error };
      setUser({ ...user, username: newName, lastUsernameChange: new Date().toISOString() });
      return { success: true, message: "تم التغيير" };
    } catch (e) { return { success: false, message: "خطأ فني" }; }
  };

  const updateTitle = async (newTitle: string) => {
    if (!user) return;
    setUser({ ...user, activeTitle: newTitle });
    fetch('api/profile.php?action=update_title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, title: newTitle }) });
  };

  const updateTheme = (newTheme: any) => { 
    if (user) {
      setUser({ ...user, theme: newTheme });
      fetch('api/profile.php?action=update_theme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, theme: newTheme }) });
    }
  };
  
  const updateSettings = (s: any) => { 
    if (user) {
      setUser({ ...user, settings: s });
      fetch('api/profile.php?action=update_settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, settings: JSON.stringify(s) }) });
    }
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    const nc = user.coins + amount;
    setUser({ ...user, coins: nc });
    fetch('api/profile.php?action=update_coins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, coins: nc }) });
  };

  const buyPowerup = (type: 'fiftyFifty' | 'extraTime' | 'skip', price: number) => {
    if (!user || user.coins < price) { showToast('عملات غير كافية', 'error'); return false; }
    const nc = user.coins - price;
    const np = { ...user.powerups, [type]: user.powerups[type] + 1 };
    setUser({ ...user, coins: nc, powerups: np });
    showToast('تم الشراء', 'success');
    fetch('api/profile.php?action=buy_powerup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, coins: nc, powerups: JSON.stringify(np) }) });
    return true;
  };

  const usePowerup = (type: 'fiftyFifty' | 'extraTime' | 'skip') => {
    if (!user || user.powerups[type] <= 0) return false;
    const np = { ...user.powerups, [type]: user.powerups[type] - 1 };
    setUser({ ...user, powerups: np });
    fetch('api/profile.php?action=update_powerups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, powerups: JSON.stringify(np) }) });
    return true;
  };

  const loseHeart = () => {
    if (!user || user.hearts <= 0) return;
    const nh = user.hearts - 1;
    setUser({ ...user, hearts: nh });
    fetch('api/profile.php?action=update_hearts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, hearts: nh }) });
    if (nh === 0) showToast('انتهت المحاولات', 'error');
  };

  const updateStats = (correct: boolean, _questionId: number, points: number, era?: string) => {
    if (!user) return;
    playSound(correct ? 'correct' : 'wrong');
    const newTotal = user.totalAnswered + 1;
    const newCorrect = user.correctAnswered + (correct ? 1 : 0);
    const newScore = user.score + (correct ? points : 0);
    const newLevel = Math.floor(newScore / 1000) + 1;
    
    let nc = user.coins;
    if (newLevel > user.level) { nc += 500; showToast(`المستوى ${newLevel}! +500 عملة`, 'success'); }

    // Mastery update
    const mastery = { ...user.mastery };
    if (era && correct) mastery[era] = Math.min(100, (mastery[era] || 0) + 1);

    const newBadges = [...user.badges];
    const grant = (name: string) => { if (!newBadges.includes(name)) { newBadges.push(name); setNewBadge(name); } };
    if (newCorrect === 1) grant('أول نصر');
    if (newTotal >= 100) grant('مؤرخ مجتهد');

    const newQuests = user.quests.map((q, i) => {
      if (q.completed) return q;
      let curr = q.current;
      if (i % 4 === 0 && correct) curr += 1;
      if (i % 4 === 1 && correct) curr += points;
      if (i % 4 === 2) curr += 1;
      const comp = curr >= q.target;
      if (comp) { nc += q.reward; showToast(`مهمة تمت: ${q.title}!`, 'success'); }
      return { ...q, current: curr, completed: comp };
    });

    setUser({ ...user, score: newScore, level: newLevel, coins: nc, mastery, totalAnswered: newTotal, correctAnswered: newCorrect, accuracy: Math.round((newCorrect / (newTotal || 1)) * 100), badges: newBadges, quests: newQuests });
    fetch('api/game.php?action=update_score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, points: correct ? points : 0, badges: newBadges, mastery: JSON.stringify(mastery) }) });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateStats, updateAvatar, updateBanner, updateUsername, updateTitle, updateTheme, updateSettings, usePowerup, buyPowerup, addCoins, loseHeart, playSound, showToast }}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 backdrop-blur-xl border ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400' : 'bg-red-500/90 border-red-400'} text-white`}>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {toast.text}
          </motion.div>
        )}
        {newBadge && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="bg-[#1a1a1a] border border-[#c5a059] rounded-3xl p-10 text-center max-w-sm w-full">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#c5a059] to-[#8c6d31] rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_#c5a059]">
                   <i data-lucide="award" className="w-12 h-12 text-black"></i>
                </div>
                <h2 className="text-2xl font-bold text-[#c5a059] mb-2 amiri">وسام جديد!</h2>
                <p className="text-white text-xl font-bold mb-4">{newBadge}</p>
                <button onClick={() => setNewBadge(null)} className="w-full bg-[#c5a059] text-black font-bold py-3 rounded-xl">رائع!</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth error');
  return context;
};
