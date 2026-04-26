-- ==========================================================
-- ملوك قرطاج - قاعدة البيانات الشاملة النهائية v6.0
-- Kings of Carthage - Ultimate Enterprise Database Schema
-- ==========================================================

-- 1. تهيئة قاعدة البيانات لدعم اللغة العربية بشكل كامل
ALTER DATABASE if0_41757062_tuniquiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- إيقاف التحقق من القيود مؤقتاً لتسهيل عملية التحديث
SET FOREIGN_KEY_CHECKS = 0;

-- 2. جدول المستخدمين المطور (شامل لكل المزايا)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    profile_banner VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1610450949065-1f2801439264?auto=format&fit=crop&q=80&w=800',
    
    -- الإحصائيات والتقدم
    score INT DEFAULT 0,
    level INT DEFAULT 1,
    accuracy DECIMAL(5,2) DEFAULT 0,
    total_answered INT DEFAULT 0,
    correct_answered INT DEFAULT 0,
    active_title VARCHAR(100) DEFAULT 'زائر تاريخي',
    role ENUM('admin', 'user') DEFAULT 'user',
    
    -- الاقتصاد والحياة
    coins INT DEFAULT 500,
    hearts INT DEFAULT 5,
    last_heart_regen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    powerups_json TEXT NULL, -- مخزون المساعدات بصيغة JSON
    
    -- التفاعل والمجتمع
    login_streak INT DEFAULT 0,
    last_login_date DATE NULL,
    referral_code VARCHAR(20) UNIQUE,
    referred_by INT NULL,
    
    -- الإعدادات والتفضيلات
    selected_theme ENUM('punic', 'islamic', 'modern') DEFAULT 'punic',
    sound_enabled BOOLEAN DEFAULT TRUE,
    privacy_public BOOLEAN DEFAULT TRUE,
    
    -- التوقيت
    last_username_change TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. جدول الأوسمة (Badges Catalog)
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. جدول ربط الأوسمة بالمستخدمين
CREATE TABLE IF NOT EXISTS user_badges (
    user_id INT,
    badge_id INT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. جدول المهمات اليومية
CREATE TABLE IF NOT EXISTS daily_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    reward_xp INT DEFAULT 100,
    reward_coins INT DEFAULT 50,
    target_value INT DEFAULT 1
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. جدول تتبع تقدم المهمات
CREATE TABLE IF NOT EXISTS user_quest_progress (
    user_id INT,
    quest_id INT,
    current_value INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, quest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quest_id) REFERENCES daily_quests(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. جدول الصداقات
CREATE TABLE IF NOT EXISTS friendships (
    user_id INT,
    friend_id INT,
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. جدول دعوات التحدي (باتل)
CREATE TABLE IF NOT EXISTS invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    room_id VARCHAR(50) NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 9. جدول جلسات اللعب (Multiplayer Sessions)
CREATE TABLE IF NOT EXISTS multiplayer_sessions (
    room_id VARCHAR(50) PRIMARY KEY,
    creator_id INT,
    player_count INT DEFAULT 1,
    status ENUM('waiting', 'active', 'finished') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 10. جدول اللاعبين في الغرف
CREATE TABLE IF NOT EXISTS multiplayer_players (
    room_id VARCHAR(50),
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES multiplayer_sessions(room_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 11. نتائج الباتل
CREATE TABLE IF NOT EXISTS battle_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50),
    user_id INT,
    score INT,
    correct_count INT,
    finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 12. متجر المواد (Store)
CREATE TABLE IF NOT EXISTS store_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price INT,
    item_type ENUM('powerup', 'avatar', 'theme'),
    data_value VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 13. مشتريات المستخدمين
CREATE TABLE IF NOT EXISTS user_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES store_items(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 14. مخزون وسائل المساعدة (User Inventory)
CREATE TABLE IF NOT EXISTS user_inventory (
    user_id INT,
    powerup_type ENUM('fiftyFifty', 'extraTime', 'skip'),
    quantity INT DEFAULT 0,
    PRIMARY KEY (user_id, powerup_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 15. سجل النشاطات (Activity Feed)
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 13. إحصائيات الإتقان (Era Mastery)
CREATE TABLE IF NOT EXISTS era_mastery (
    user_id INT,
    era_name VARCHAR(50), -- 'قرطاج', 'روماني', 'إسلامي', 'حديث'
    mastery_percentage INT DEFAULT 0,
    PRIMARY KEY (user_id, era_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 14. الدردشة السريعة
CREATE TABLE IF NOT EXISTS room_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50),
    user_id INT,
    message_key VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 16. نظام البلاغات والملاحظات
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('bug', 'question_error', 'suggestion'),
    content TEXT,
    status ENUM('open', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 17. الترتيب الشهري
CREATE TABLE IF NOT EXISTS monthly_scores (
    user_id INT,
    month_year VARCHAR(7), -- '2024-05'
    monthly_score INT DEFAULT 0,
    PRIMARY KEY (user_id, month_year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 18. نظام الإحالات (Referrals)
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT,
    referred_user_id INT,
    reward_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 19. تتبع الجلسات النشطة (Active Sessions)
CREATE TABLE IF NOT EXISTS active_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 20. إعدادات النظام (System Config)
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- إعادة تفعيل التحقق من القيود
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- إدخال البيانات المبدئية الأساسية
-- ==========================================================

-- الأوسمة (الـ 24 وساماً المعتمدة)
INSERT IGNORE INTO badges (name, description, icon_name, rarity) VALUES
('أول نصر', 'أجب على أول سؤال بشكل صحيح', 'Trophy', 'common'),
('سلسلة ذهبية', 'أجب على 10 أسئلة متتالية بشكل صحيح', 'Zap', 'rare'),
('سلسلة بونية', 'أجب على 20 سؤال متتالي بشكل صحيح', 'Flame', 'rare'),
('لا يقهر', 'أجب على 50 سؤال متتالي بشكل صحيح', 'Crown', 'legendary'),
('مؤرخ مجتهد', 'أجب على 100 سؤال', 'Book', 'common'),
('علامة تونس', 'أكمل جميع الأسئلة الـ 500', 'Scroll', 'epic'),
('دقة بونية', 'حقق دقة 100% في جولة كاملة', 'Target', 'rare'),
('البرق التاريخي', 'أجب على سؤال في أقل من ثانيتين', 'Timer', 'epic'),
('البرق الخاطف', 'أجب على سؤال في أقل من ثانية واحدة', 'Wind', 'legendary'),
('روح الجماعة', 'شارك في أول تحدي مع الأصدقاء', 'Users', 'common'),
('الهوية الجديدة', 'قم بتغيير اسم المستخدم الخاص بك لأول مرة', 'UserCircle', 'common'),
('الثروة التاريخية', 'اجمع 10,000 نقطة', 'Coins', 'rare'),
('خزينة الباي', 'اجمع 50,000 نقطة', 'Banknote', 'epic'),
('بطل قرطاج', 'أجب على 20 سؤالاً صحيحاً في فئة قرطاج', 'Shield', 'rare'),
('حكيم القيروان', 'أجب على 20 سؤالاً صحيحاً في الفتح الإسلامي', 'Compass', 'rare'),
('خبير روما', 'أجب على 20 سؤالاً صحيحاً في العهد الروماني', 'Dna', 'rare'),
('صوت الأحرار', 'أجب على 20 سؤالاً صحيحاً في العهد الحديث', 'Megaphone', 'rare'),
('خازن الأسرار', 'قرأت 50 مقالاً من مكتبة التاريخ', 'Library', 'rare'),
('ذاكرة الفيل', 'أكملت قراءة جميع مقالات المكتبة', 'Infinity', 'epic'),
('عداء التاريخ', 'لعبت لمدة ساعة متواصلة', 'Activity', 'legendary'),
('قمة الهرم', 'وصلت للمستوى 50', 'Mountain', 'epic'),
('العقل المدبر', 'أكملت تحدي 20 سؤالاً بدقة 100%', 'Brain', 'legendary'),
('ملك المشاركة', 'شاركت ملفك الشخصي 5 مرات', 'Share2', 'common'),
('نخبة المحاربين', 'دخلت قائمة الـ 10 الأوائل', 'Medal', 'epic');

-- أصناف المتجر
INSERT IGNORE INTO store_items (name, description, price, item_type, data_value) VALUES
('حذف خيارين', 'يقلل الاحتمالات الخاطئة', 100, 'powerup', 'fiftyFifty'),
('وقت إضافي', 'يضيف 15 ثانية للعداد', 150, 'powerup', 'extraTime'),
('تخطي السؤال', 'يتجاوز السؤال دون خسارة', 200, 'powerup', 'skip');

-- تحويل الجداول بشكل صريح للتأكد من اللغة العربية
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE badges CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE daily_quests CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE store_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE activity_log CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE era_mastery CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE room_chats CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE feedback CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE battle_results CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE friendships CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE invitations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE monthly_scores CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE multiplayer_sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE multiplayer_players CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_badges CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_quest_progress CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
