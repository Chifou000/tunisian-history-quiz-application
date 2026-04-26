<?php
include 'config.php';

if (isset($_SESSION['user_id'])) {
    // Update last_login to show user is active
    $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")->execute([$_SESSION['user_id']]);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            "id" => $user['id'],
            "username" => $user['username'],
            "avatar" => $user['avatar_url'],
            "score" => (int)$user['score'],
            "level" => (int)$user['level'],
            "accuracy" => (float)$user['accuracy'],
            "totalAnswered" => (int)$user['total_answered'],
            "correctAnswered" => (int)$user['correct_answered'],
            "role" => $user['role'],
            "activeTitle" => $user['active_title'],
            "lastUsernameChange" => $user['last_username_change'],
            "coins" => (int)$user['coins'],
            "hearts" => (int)$user['hearts'],
            "login_streak" => (int)$user['login_streak'],
            "lastLoginDate" => $user['last_login_date'],
            "powerups_json" => $user['powerups_json'],
            "referralCode" => $user['referral_code'],
            "theme" => $user['selected_theme'],
            "banner" => $user['profile_banner'],
            "settings" => [
                "sound" => (bool)$user['sound_enabled'],
                "privacy" => (bool)$user['privacy_public']
            ],
            "role" => $user['role']
        ]);
        exit;
    }
}

echo json_encode(null);
?>
