<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? 'login';

if (empty($data['username']) || empty($data['password'])) {
    echo json_encode(["error" => "يرجى إدخال اسم المستخدم وكلمة السر"]);
    exit;
}

$username = $data['username'];
$password = $data['password'];

if ($action == 'signup') {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "اسم المستخدم موجود مسبقاً"]);
        exit;
    }

    // Create new user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" . $username;
    
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, avatar_url) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hash, $avatar]);
    
    $userId = $pdo->lastInsertId();
    $user = [
        "id" => $userId,
        "username" => $username,
        "avatar" => $avatar,
        "score" => 0,
        "level" => 1,
        "accuracy" => 0,
        "totalAnswered" => 0,
        "correctAnswered" => 0,
        "role" => "user",
        "activeTitle" => "زائر تاريخي"
    ];
    $_SESSION['user_id'] = $userId;
    echo json_encode($user);

} else {
    // Login logic
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
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
            "activeTitle" => $user['active_title']
        ]);
    } else {
        echo json_encode(["error" => "اسم المستخدم أو كلمة السر غير صحيحة"]);
    }
}
?>
