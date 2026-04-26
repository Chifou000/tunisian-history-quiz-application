import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { TunisiaMap } from './components/TunisiaMap';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Game } from './pages/Game';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { AdminPanel } from './pages/AdminPanel';
import { LandingPage } from './pages/LandingPage';
import { HistoryLibrary } from './pages/HistoryLibrary';
import { SocialHub } from './pages/SocialHub';
import { Settings } from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#c5a059]">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] amiri text-2xl animate-pulse">جاري التحميل...</div>;
  }

  const themeClass = user?.theme === 'islamic' ? 'theme-islamic' : user?.theme === 'modern' ? 'theme-modern' : 'theme-punic';

  return (
    <Router>
      <div className={`min-h-screen bg-[#0a0a0a] text-white selection:bg-[#c5a059] selection:text-black transition-colors duration-1000 ${themeClass}`}>
        <TunisiaMap />
        <Navbar />
        
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/game/:mode" element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/user/:id" element={<Profile />} />
            
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />

            <Route path="/library" element={
              <ProtectedRoute>
                <HistoryLibrary />
              </ProtectedRoute>
            } />

            <Route path="/social" element={
              <ProtectedRoute>
                <SocialHub />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
