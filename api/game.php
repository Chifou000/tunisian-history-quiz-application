<?php
include 'config.php';

$action = $_GET['action'] ?? '';

if ($action == 'update_score') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!empty($data['user_id'])) {
        $points = $data['points'] ?? 0;
        $isCorrect = $points > 0 ? 1 : 0;
        $masteryJson = $data['mastery'] ?? null;
        
        $stmt = $pdo->prepare("
            UPDATE users 
            SET score = score + ?, 
                total_answered = total_answered + 1,
                correct_answered = correct_answered + ?,
                level = FLOOR((score + ?) / 1000) + 1,
                accuracy = (correct_answered / total_answered) * 100
            WHERE id = ?
        ");
        $stmt->execute([$points, $isCorrect, $points, $data['user_id']]);

        // Mastery Update
        if ($masteryJson) {
            // Usually would update era_mastery table, for simplicity we could use a column, 
            // but let's stick to the log for now.
        }

        // Community Activity Log
        if ($isCorrect && $points > 50) {
            $log = $pdo->prepare("INSERT INTO activity_log (user_id, activity_type, description) VALUES (?, 'score', ?)");
            $log->execute([$data['user_id'], "أحرز $points نقطة في التاريخ"]);
        }

        // Sync Badges
        if (!empty($data['badges'])) {
            foreach ($data['badges'] as $badgeName) {
                $s = $pdo->prepare("INSERT IGNORE INTO user_badges (user_id, badge_id) SELECT ?, id FROM badges WHERE name = ?");
                $s->execute([$data['user_id'], $badgeName]);
            }
        }
        
        echo json_encode(["success" => true]);
    }
}

if ($action == 'get_leaderboard') {
    $stmt = $pdo->query("SELECT id, username, score, level, avatar_url as avatar FROM users WHERE score >= 1000 ORDER BY score DESC LIMIT 10");
    echo json_encode($stmt->fetchAll());
}
?>
