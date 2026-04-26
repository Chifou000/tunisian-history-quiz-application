import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { QUESTIONS } from '../data/questions';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, XCircle, Info, ChevronLeft, Trophy, Medal, Zap, Clock, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Game = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('room');
  const { user, updateStats, usePowerup, loseHeart, showToast, playSound } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mode === 'challenge' ? 10 : 20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameQuestions, setGameQuestions] = useState(QUESTIONS);
  const [battleLeaderboard, setBattleLeaderboard] = useState<any[]>([]);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  useEffect(() => {
    if (user && user.hearts <= 0) {
      showToast('لا تملك قلوباً كافية للعب. انتظر حتى يتم التجديد!', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const count = (mode === 'challenge' || roomId) ? 20 : 10;
    setGameQuestions([...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count));
  }, [mode, roomId]);

  const [isGameOver, setIsGameOver] = useState(false);

  const saveBattleResult = async () => {
    if (!user || !roomId) return;
    try {
      await fetch('api/multiplayer.php?action=save_battle_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, user_id: user.id, score, correct_count: correctCount })
      });
      loadBattleLeaderboard();
    } catch (e) {}
  };

  const loadBattleLeaderboard = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`api/multiplayer.php?action=get_battle_leaderboard&room_id=${roomId}`);
      const data = await res.json();
      setBattleLeaderboard(data);
    } catch (e) {}
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setHiddenOptions([]);
      setTimeLeft((mode === 'challenge' || roomId) ? 10 : 20);
    } else {
      setIsGameOver(true);
      if (roomId) saveBattleResult();
    }
  }, [currentQuestionIndex, gameQuestions.length, mode, roomId, score, correctCount]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      setIsGameOver(true);
    }
  }, [timeLeft, isAnswered]);

  useEffect(() => {
    let interval: any;
    if (isGameOver && roomId) {
      loadBattleLeaderboard();
      interval = setInterval(loadBattleLeaderboard, 5000);
    }
    return () => clearInterval(interval);
  }, [isGameOver, roomId]);

  const handleFiftyFifty = () => {
    if (usePowerup('fiftyFifty')) {
      playSound('click');
      const correct = gameQuestions[currentQuestionIndex].correctAnswer;
      const wrongIndices = gameQuestions[currentQuestionIndex].options
        .map((_, i) => i)
        .filter(i => i !== correct);
      const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setHiddenOptions(toHide);
    }
  };

  const handleExtraTime = () => {
    if (usePowerup('extraTime')) {
      playSound('click');
      setTimeLeft(prev => prev + 15);
    }
  };

  const handleSkip = () => {
    if (usePowerup('skip')) {
      playSound('click');
      handleNext();
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    const correct = optionIndex === gameQuestions[currentQuestionIndex].correctAnswer;
    const points = correct ? (timeLeft * 10) + (mode === 'challenge' ? 50 : 20) : 0;
    if (correct) {
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#c5a059', '#ffffff'] });
    } else {
      loseHeart();
    }
    updateStats(correct, gameQuestions[currentQuestionIndex].id, points, currentQuestion.category);
  };

  const currentQuestion = gameQuestions[currentQuestionIndex];

  if (isGameOver) {
    const isTimeout = timeLeft === 0 && !isAnswered;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`bg-[#1a1a1a] border rounded-3xl p-10 text-center max-w-lg w-full shadow-2xl ${isTimeout ? 'border-red-500/50' : 'border-[#c5a059]/30'}`}>
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${isTimeout ? 'bg-red-500' : 'bg-gradient-to-tr from-[#c5a059] to-[#8c6d31]'}`}>
            {isTimeout ? <XCircle size={48} className="text-white" /> : (roomId ? <Medal size={48} className="text-black" /> : <Trophy size={48} className="text-black" />)}
          </div>
          <h2 className="text-3xl font-bold amiri text-white mb-2">{isTimeout ? 'انتهى الوقت!' : (roomId ? 'نتائج التحدي!' : 'انتهت اللعبة!')}</h2>
          {isTimeout && <p className="text-red-400 font-bold mb-8">لقد خسرت لأنك لم تجب في الوقت المحدد!</p>}
          {!isTimeout && roomId ? (
            <div className="space-y-4 mb-8 text-right">
              {battleLeaderboard.map((player, i) => (
                <div key={player.id} className={`flex items-center gap-3 p-3 rounded-xl border ${player.user_id === user?.id ? 'border-[#c5a059] bg-[#c5a059]/10' : 'border-white/5 bg-black/20'}`}>
                  <span className="font-bold text-[#c5a059]">{i + 1}</span>
                  <img src={player.avatar_url} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                     <p className="font-bold text-white text-sm">{player.username}</p>
                     <p className="text-[10px] text-gray-500">{player.correct_count} إجابات صحيحة</p>
                  </div>
                  <p className="font-bold gold-text">{player.score}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1">النقاط</p>
                <p className="text-2xl font-bold text-[#c5a059]">{score}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1">الوضع</p>
                <p className="text-xl font-bold text-white">{mode === 'challenge' ? 'تحدي' : 'عادي'}</p>
              </div>
            </div>
          )}
          <button onClick={() => navigate('/')} className="w-full bg-[#c5a059] text-black font-bold py-4 rounded-xl">العودة للرئيسية</button>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
        <div className="flex-1 px-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2"><span>سؤال {currentQuestionIndex + 1} من {gameQuestions.length}</span><span>النقاط: {score}</span></div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-[#c5a059] to-[#8c6d31]" initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / gameQuestions.length) * 100}%` }} /></div>
        </div>
        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xl ${timeLeft <= 5 ? 'border-red-500 text-red-500 animate-pulse' : 'border-[#c5a059] text-[#c5a059]'}`}>{timeLeft}</div>
      </div>

      {!isGameOver && !isAnswered && (
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={handleFiftyFifty} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center"><Zap size={20} className="text-yellow-500" /></div><span className="text-[10px] text-gray-500">50/50 ({user?.powerups.fiftyFifty})</span></button>
          <button onClick={handleExtraTime} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center"><Clock size={20} className="text-blue-500" /></div><span className="text-[10px] text-gray-500">وقت ({user?.powerups.extraTime})</span></button>
          <button onClick={handleSkip} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center"><SkipForward size={20} className="text-emerald-500" /></div><span className="text-[10px] text-gray-500">تخطي ({user?.powerups.skip})</span></button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider mb-4 block">{currentQuestion.category}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-snug">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctAnswer;
                const isSelected = index === selectedOption;
                const isHidden = hiddenOptions.includes(index);
                if (isHidden && !isAnswered) return <div key={index} className="invisible" />;
                let buttonClass = "w-full text-right p-5 rounded-2xl border-2 transition-all flex items-center justify-between ";
                if (!isAnswered) buttonClass += "bg-black/20 border-white/5 hover:border-[#c5a059]/50 hover:bg-[#c5a059]/5";
                else if (isCorrect) buttonClass += "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                else if (isSelected) buttonClass += "bg-red-500/20 border-red-500 text-red-400";
                else buttonClass += "bg-black/20 border-white/5 opacity-50";
                return <button key={index} disabled={isAnswered} onClick={() => handleAnswer(index)} className={buttonClass}><span className="text-lg font-medium">{option}</span>{isAnswered && isCorrect && <CheckCircle2 size={24} />}{isAnswered && isSelected && !isCorrect && <XCircle size={24} />}</button>;
              })}
            </div>
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-6 bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-2xl">
                <div className="flex gap-4"><Info className="text-[#c5a059] shrink-0" size={24} /><div><h4 className="font-bold text-[#c5a059] mb-1">هل تعلم؟</h4><p className="text-gray-300 text-sm leading-relaxed">{currentQuestion.explanation}</p></div></div>
                <button onClick={handleNext} className="mt-6 w-full bg-[#c5a059] text-black font-bold py-3 rounded-xl hover:bg-[#b08d4a]">السؤال التالي</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
