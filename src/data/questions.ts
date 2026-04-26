import { Question } from './questions_types';
import { BATCH_1 } from './q_batch1';
import { BATCH_2 } from './q_batch2';
import { BATCH_3 } from './q_batch3';
import { BATCH_4 } from './q_batch4';
import { BATCH_5 } from './q_batch5';

export const QUESTIONS: Question[] = [
  ...BATCH_1,
  ...BATCH_2,
  ...BATCH_3,
  ...BATCH_4,
  ...BATCH_5
];

export const CATEGORIES = ["قرطاج", "روماني", "إسلامي", "حفصي", "عثماني", "حديث", "ثقافة", "ثورة"];

export const TITLES = [
  { minScore: 0, title: "زائر تاريخي" },
  { minScore: 100, title: "طالب علم" },
  { minScore: 300, title: "مستكشف ناشئ" },
  { minScore: 600, title: "رفيق حنبعل" },
  { minScore: 1000, title: "حارس المنارة" },
  { minScore: 2000, title: "مكتشف بونيقي" },
  { minScore: 3500, title: "باحث في الآثار" },
  { minScore: 5000, title: "فارس قرطاج" },
  { minScore: 7000, title: "حكيم القيروان" },
  { minScore: 9000, title: "مؤرخ الضفتين" },
  { minScore: 12000, title: "حارس القلعة" },
  { minScore: 15000, title: "أمير المهدية" },
  { minScore: 20000, title: "سلطان مدينة تونس" },
  { minScore: 25000, title: "أمير البحر" },
  { minScore: 30000, title: "حامي الذاكرة الوطنية" },
  { minScore: 35000, title: "سلطان باردو" },
  { minScore: 40000, title: "فارس قرطاج الذهبي" },
  { minScore: 45000, title: "خازن أسرار بيرصا" },
  { minScore: 50000, title: "مؤرخ الجمهورية" },
  { minScore: 60000, title: "عميد المؤرخين" },
  { minScore: 70000, title: "حكيم الزيتونة" },
  { minScore: 80000, title: "نجم الخضراء" },
  { minScore: 90000, title: "صقر الاستقلال" },
  { minScore: 100000, title: "سيف تونس الذهبي" },
  { minScore: 125000, title: "أسطورة قرطاج الخالدة" },
  { minScore: 150000, title: "إمبراطور التاريخ" },
  { minScore: 200000, title: "عميد الحضارات" },
  { minScore: 300000, title: "حارس الزمن الجميل" },
  { minScore: 400000, title: "مؤرخ الأجيال" },
  { minScore: 500000, title: "ملك قرطاج الأسطوري" }
];

export const BADGES_DATA = [
  { id: 'first_win', name: 'أول نصر', desc: 'أجب على أول سؤال بشكل صحيح', icon: 'Trophy' },
  { id: 'streak_10', name: 'سلسلة ذهبية', desc: 'أجب على 10 أسئلة متتالية بشكل صحيح', icon: 'Zap' },
  { id: 'streak_20', name: 'سلسلة بونية', desc: 'أجب على 20 سؤال متتالي بشكل صحيح', icon: 'Flame' },
  { id: 'streak_50', name: 'لا يقهر', desc: 'أجب على 50 سؤال متتالي بشكل صحيح', icon: 'Crown' },
  { id: 'questions_100', name: 'مؤرخ مجتهد', desc: 'أجب على 100 سؤال', icon: 'Book' },
  { id: 'questions_500', name: 'علامة تونس', desc: 'أكمل جميع الأسئلة الـ 500', icon: 'Scroll' },
  { id: 'perfect_round', name: 'دقة بونية', desc: 'حقق دقة 100% في جولة كاملة', icon: 'Target' },
  { id: 'speed_demon', name: 'البرق التاريخي', desc: 'أجب على سؤال في أقل من ثانيتين', icon: 'Timer' },
  { id: 'ultra_speed', name: 'البرق الخاطف', desc: 'أجب على سؤال في أقل من ثانية واحدة', icon: 'Wind' },
  { id: 'social_warrior', name: 'روح الجماعة', desc: 'شارك في أول تحدي مع الأصدقاء', icon: 'Users' },
  { id: 'identity_shift', name: 'الهوية الجديدة', desc: 'قم بتغيير اسم المستخدم الخاص بك لأول مرة', icon: 'UserCircle' },
  { id: 'wealthy_10k', name: 'الثروة التاريخية', desc: 'اجمع 10,000 نقطة', icon: 'Coins' },
  { id: 'wealthy_50k', name: 'خزينة الباي', desc: 'اجمع 50,000 نقطة', icon: 'Banknote' },
  { id: 'carthage_hero', name: 'بطل قرطاج', desc: 'أجب على 20 سؤالاً صحيحاً في فئة قرطاج', icon: 'Shield' },
  { id: 'islamic_sage', name: 'حكيم القيروان', desc: 'أجب على 20 سؤالاً صحيحاً في الفتح الإسلامي', icon: 'Compass' },
  { id: 'roman_expert', name: 'خبير روما', desc: 'أجب على 20 سؤالاً صحيحاً في العهد الروماني', icon: 'Dna' },
  { id: 'modern_patriot', name: 'صوت الأحرار', desc: 'أجب على 20 سؤالاً صحيحاً في العهد الحديث', icon: 'Megaphone' },
  { id: 'memory_50', name: 'خازن الأسرار', desc: 'قرأت 50 مقالاً من مكتبة التاريخ', icon: 'Library' },
  { id: 'memory_100', name: 'ذاكرة الفيل', desc: 'أكملت قراءة جميع مقالات المكتبة', icon: 'Infinity' },
  { id: 'marathon_1h', name: 'عداء التاريخ', desc: 'لعبت لمدة ساعة متواصلة', icon: 'Activity' },
  { id: 'level_50', name: 'قمة الهرم', desc: 'وصلت للمستوى 50', icon: 'Mountain' },
  { id: 'master_mind', name: 'العقل المدبر', desc: 'أكملت تحدي 20 سؤالاً بدقة 100%', icon: 'Brain' },
  { id: 'sharer', name: 'ملك المشاركة', desc: 'شاركت ملفك الشخصي 5 مرات', icon: 'Share2' },
  { id: 'top_10', name: 'نخبة المحاربين', desc: 'دخلت قائمة الـ 10 الأوائل', icon: 'Medal' }
];

export const QUIZ_LEVELS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  minPoints: i * 1000,
  title: `المرحلة ${i + 1}`,
  difficulty: i < 10 ? 'سهل' : i < 25 ? 'متوسط' : i < 40 ? 'صعب' : 'أسطوري'
}));
