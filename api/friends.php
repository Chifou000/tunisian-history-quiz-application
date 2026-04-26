<?php
include 'config.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

if ($action == 'get_friends') {
    $userId = $_GET['user_id'];
    // Return all friends, with a calculation to see if they were active in the last 5 minutes
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.avatar_url, u.level, u.score,
        (u.last_login > NOW() - INTERVAL 5 MINUTE) as is_online
        FROM users u 
        JOIN friendships f ON (u.id = f.friend_id OR u.id = f.user_id)
        WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted' AND u.id != ?
    ");
    $stmt->execute([$userId, $userId, $userId]);
    echo json_encode($stmt->fetchAll());
}

if ($action == 'add_friend') {
    $stmt = $pdo->prepare("INSERT IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')");
    $stmt->execute([$data['user_id'], $data['friend_id']]);
    echo json_encode(["success" => true]);
}

if ($action == 'respond_request') {
    if ($data['status'] == 'accepted') {
        $stmt = $pdo->prepare("UPDATE friendships SET status = 'accepted' WHERE user_id = ? AND friend_id = ?");
        $stmt->execute([$data['friend_id'], $data['user_id']]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM friendships WHERE user_id = ? AND friend_id = ?");
        $stmt->execute([$data['friend_id'], $data['user_id']]);
    }
    echo json_encode(["success" => true]);
}

if ($action == 'get_requests') {
    $userId = $_GET['user_id'];
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.avatar_url 
        FROM users u 
        JOIN friendships f ON u.id = f.user_id 
        WHERE f.friend_id = ? AND f.status = 'pending'
    ");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($action == 'remove_friend') {
    $uid = $data['user_id'];
    $fid = $data['friend_id'];
    $stmt = $pdo->prepare("DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
    $stmt->execute([$uid, $fid, $fid, $uid]);
    echo json_encode(["success" => true]);
}
?>
