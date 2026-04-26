import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'الرئيسية' },
    { path: '/leaderboard', icon: Trophy, label: 'المتصدرون' },
    { path: '/profile', icon: User, label: 'الملف' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
    ...(user.role === 'admin' ? [{ path: '/admin', icon: (Settings as any), label: 'الإدارة' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/90 backdrop-blur-md border-t border-[#c5a059]/20 z-50 px-6 py-3 flex justify-between items-center md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(user.score % 500) / 5}%` }}
          className="h-full bg-[#c5a059] shadow-[0_0_10px_#c5a059]"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 mr-6">
          <div className="w-10 h-10 rounded-full border-2 border-[#c5a059] overflow-hidden">
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#c5a059] leading-tight">{user.username}</span>
            <span className="text-[10px] text-gray-500 font-medium">{user.activeTitle}</span>
          </div>
        </div>
        <div className="flex gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${
                  isActive ? 'text-[#c5a059]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <button
        onClick={logout}
        className="flex flex-col md:flex-row items-center gap-1 text-red-500 hover:text-red-400 transition-colors"
      >
        <LogOut size={20} />
        <span className="text-[10px] md:text-sm font-medium">خروج</span>
      </button>
    </nav>
  );
};
