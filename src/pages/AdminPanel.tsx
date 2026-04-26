import { useState } from 'react';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import { QUESTIONS, CATEGORIES } from '../data/questions';

export const AdminPanel = () => {
  const [questions, setQuestions] = useState(QUESTIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: CATEGORIES[0],
    level: 1
  });

  const handleDelete = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAdd = () => {
    const id = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions([{ ...newQuestion, id }, ...questions]);
    setIsAdding(false);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: CATEGORIES[0],
      level: 1
    });
  };

  return (
    <div className="pb-24 pt-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold amiri text-white">إدارة المحتوى</h1>
          <p className="text-gray-400">إضافة وتعديل الأسئلة التاريخية</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#c5a059] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#b08d4a] transition-colors"
        >
          <Plus size={20} />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1a1a1a] border border-[#c5a059] rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">سؤال جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">نص السؤال</label>
              <textarea
                value={newQuestion.question}
                onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-[#c5a059] outline-none"
                rows={2}
              />
            </div>
            {newQuestion.options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-400 mb-2">الخيار {i + 1}</label>
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...newQuestion.options];
                    newOpts[i] = e.target.value;
                    setNewQuestion({...newQuestion, options: newOpts});
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#c5a059] outline-none"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-2">الخيار الصحيح (0-3)</label>
              <input
                type="number"
                min="0"
                max="3"
                value={newQuestion.correctAnswer}
                onChange={e => setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#c5a059] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">التصنيف</label>
              <select
                value={newQuestion.category}
                onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 focus:border-[#c5a059] outline-none"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">التفسير التاريخي</label>
              <textarea
                value={newQuestion.explanation}
                onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-[#c5a059] outline-none"
                rows={2}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAdd}
              className="bg-[#c5a059] text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2"
            >
              <Save size={20} />
              <span>حفظ السؤال</span>
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-white/5 text-white px-8 py-3 rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl flex items-center justify-between group">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded uppercase text-[#c5a059]">
                  {q.category}
                </span>
                <span className="text-[10px] text-gray-500">مستوى {q.level}</span>
              </div>
              <h3 className="font-bold text-white mb-1">{q.question}</h3>
              <p className="text-xs text-gray-500 truncate">{q.options.join(' | ')}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                className="p-2 text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
