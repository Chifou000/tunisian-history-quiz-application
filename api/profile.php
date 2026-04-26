<?php
include 'config.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($action == 'update_avatar') {
    $stmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
    $stmt->execute([$data['avatar'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_title') {
    $stmt = $pdo->prepare("UPDATE users SET active_title = ? WHERE id = ?");
    $stmt->execute([$data['title'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_username') {
    // Check for 12h cooldown
    $stmt = $pdo->prepare("SELECT last_username_change FROM users WHERE id = ?");
    $stmt->execute([$data['user_id']]);
    $user = $stmt->fetch();
    
    if ($user && $user['last_username_change']) {
        $lastChange = strtotime($user['last_username_change']);
        if (time() - $lastChange < 43200) { // 12 hours in seconds
            echo json_encode(["success" => false, "error" => "Cooldown active"]);
            exit;
        }
    }

    $stmt = $pdo->prepare("UPDATE users SET username = ?, last_username_change = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$data['username'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'search') {
    $term = $_GET['term'] ?? '';
    $stmt = $pdo->prepare("SELECT id, username, avatar_url, level FROM users WHERE username LIKE ? LIMIT 10");
    $stmt->execute(["%$term%"]);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action == 'get_public') {
    $identifier = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("SELECT id, username, avatar_url, score, level, accuracy, total_answered FROM users WHERE id = ? OR username = ?");
    $stmt->execute([$identifier, $identifier]);
    $row = $stmt->fetch();
    
    if ($row) {
        $user = [
            "id" => $row['id'],
            "username" => $row['username'],
            "avatar" => $row['avatar_url'],
            "score" => (int)$row['score'],
            "level" => (int)$row['level'],
            "accuracy" => (float)$row['accuracy'],
            "total_answered" => (int)$row['total_answered']
        ];
        
        $stmtBadge = $pdo->prepare("SELECT b.name FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ?");
        $stmtBadge->execute([$row['id']]);
        $user['badges'] = $stmtBadge->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($user);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
    exit;
}

if ($action == 'update_coins') {
    $stmt = $pdo->prepare("UPDATE users SET coins = ? WHERE id = ?");
    $stmt->execute([$data['coins'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'buy_powerup') {
    $stmt = $pdo->prepare("UPDATE users SET coins = ?, powerups_json = ? WHERE id = ?");
    $stmt->execute([$data['coins'], $data['powerups'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_powerups') {
    $stmt = $pdo->prepare("UPDATE users SET powerups_json = ? WHERE id = ?");
    $stmt->execute([$data['powerups'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_banner') {
    $stmt = $pdo->prepare("UPDATE users SET profile_banner = ? WHERE id = ?");
    $stmt->execute([$data['banner'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_theme') {
    $stmt = $pdo->prepare("UPDATE users SET selected_theme = ? WHERE id = ?");
    $stmt->execute([$data['theme'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_settings') {
    $s = json_decode($data['settings'], true);
    $stmt = $pdo->prepare("UPDATE users SET sound_enabled = ?, privacy_public = ? WHERE id = ?");
    $stmt->execute([$s['sound'] ? 1:0, $s['privacy'] ? 1:0, $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'update_hearts') {
    $stmt = $pdo->prepare("UPDATE users SET hearts = ? WHERE id = ?");
    $stmt->execute([$data['hearts'], $data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'claim_daily') {
    $stmt = $pdo->prepare("UPDATE users SET coins = coins + 50, last_login_date = CURRENT_DATE, login_streak = CASE WHEN last_login_date = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) THEN login_streak + 1 ELSE 1 END WHERE id = ?");
    $stmt->execute([$data['user_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'get_activities') {
    $stmt = $pdo->query("SELECT a.*, u.username FROM activity_log a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 20");
    echo json_encode($stmt->fetchAll());
    exit;
}
?>
