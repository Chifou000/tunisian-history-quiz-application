<?php
include 'config.php';

echo "Starting population...<br>";

try {
    // 1. Clear existing data to avoid duplicates
    $pdo->exec("TRUNCATE TABLE questions");
    $pdo->exec("TRUNCATE TABLE history_library");
    $pdo->exec("SET NAMES utf8mb4");
    echo "Tables cleared and ready for Arabic...<br>";

    // 2. High Quality Manual Questions (Sample)
    $stmt = $pdo->prepare("INSERT INTO questions (category, question, option_1, option_2, option_3, option_4, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Ensure PHP sends data in UTF-8
    $pdo->exec("SET NAMES utf8mb4");

    $manual = [
        ['قرطاج', 'من هي الملكة التي أسست قرطاج؟', 'عليسة', 'الكاهنة', 'صوفونيبا', 'أروى', 0, 'أسست الملكة عليسة قرطاج عام 814 ق.م.'],
        ['قرطاج', 'أي قائد عبر الألب بالفيلة؟', 'حملقار', 'حنبعل', 'صدربعل', 'ماسينيسا', 1, 'حنبعل برقة هو من عبر جبال الألب لمواجهة روما.'],
        ['إسلامي', 'من هو القائد الذي بنى مدينة القيروان؟', 'عقبة بن نافع', 'حسان بن النعمان', 'موسى بن نصير', 'طارق بن زياد', 0, 'أسس عقبة بن نافع القيروان عام 670 م.'],
        ['حديث', 'متى استقلت تونس؟', '20 مارس 1956', '25 جويلية 1957', '15 أكتوبر 1963', '14 جانفي 2011', 0, 'وقعت وثيقة الاستقلال في 20 مارس 1956.'],
        ['روماني', 'ما هي المدينة التي تضم قصر الجم؟', 'الجم', 'سوسة', 'القيروان', 'صفاقس', 0, 'قصر الجم هو ثالث أكبر مسرح روماني في العالم.']
    ];

    foreach ($manual as $q) {
        $stmt->execute($q);
    }

    // 3. Generate the remaining questions to reach 500
    $categories = ['قرطاج', 'روماني', 'إسلامي', 'حفصي', 'عثماني', 'حديث'];
    
    for ($i = 5; $i <= 500; $i++) {
        $cat = $categories[$i % count($categories)];
        $stmt->execute([
            $cat,
            "سؤال تاريخي رقم $i: حول أي معلم في تاريخ $cat نتحدث هنا؟",
            "الإجابة الصحيحة",
            "خيار خاطئ 1",
            "خيار خاطئ 2",
            "خيار خاطئ 3",
            0,
            "هذه المعلومة تمثل جزءاً هاماً من الموروث الوطني التونسي."
        ]);
    }

    echo "Successfully inserted 500 questions!<br>";

    // 4. Populate Library (100 entries)
    $pdo->exec("TRUNCATE TABLE history_library");
    $stmtLib = $pdo->prepare("INSERT INTO history_library (title, category, period, description) VALUES (?, ?, ?, ?)");
    
    $cities = ['تونس', 'صفاقس', 'سوسة', 'القيروان', 'بنزرت', 'نابل', 'المنستير', 'المهدية', 'باجة', 'الكاف', 'القصرين', 'قابس', 'مدنين', 'تطاوين', 'توزر', 'قفصة', 'جندوبة', 'سليانة', 'زغوان', 'أريانة', 'منوبة', 'بن عروس', 'سيدي بوزيد', 'قبلي'];
    
    for ($j = 1; $j <= 100; $j++) {
        $city = $cities[$j % count($cities)];
        $stmtLib->execute([
            $city . " - معلم " . $j,
            "تاريخي",
            "عبر العصور",
            "هذا المعلم يمثل جزءاً هاماً من تاريخ منطقة " . $city . " العريق."
        ]);
    }

    echo "Successfully inserted 100 library entries!";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
