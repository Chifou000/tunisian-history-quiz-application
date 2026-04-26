<?php
include 'config.php';
header("Cache-Control: no-cache, must-revalidate");

$action = $_GET['action'] ?? '';

if ($action == 'create_room') {
    $data = json_decode(file_get_contents("php://input"), true);
    $roomId = "TN-" . rand(1000, 9999);
    
    // Create session
    $stmt = $pdo->prepare("INSERT INTO multiplayer_sessions (room_id, creator_id, status, player_count) VALUES (?, ?, 'waiting', 1)");
    $stmt->execute([$roomId, $data['user_id']]);
    
    // Add creator as first player
    $stmt = $pdo->prepare("INSERT INTO multiplayer_players (room_id, user_id) VALUES (?, ?)");
    $stmt->execute([$roomId, $data['user_id']]);
    
    echo json_encode(["room_id" => $roomId]);
}

if ($action == 'join_room') {
    $data = json_decode(file_get_contents("php://input"), true);
    $roomId = $data['room_id'];
    $userId = $data['user_id'];

    // Check if room exists and is waiting
    $stmt = $pdo->prepare("SELECT player_count, status FROM multiplayer_sessions WHERE room_id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();

    if (!$room) {
        echo json_encode(["success" => false, "error" => "الغرفة غير موجودة"]);
        exit;
    }

    if ($room['status'] !== 'waiting') {
        echo json_encode(["success" => false, "error" => "اللعبة بدأت بالفعل"]);
        exit;
    }

    if ($room['player_count'] >= 4) {
        echo json_encode(["success" => false, "error" => "الغرفة ممتلئة"]);
        exit;
    }

    // Join room
    $stmt = $pdo->prepare("INSERT IGNORE INTO multiplayer_players (room_id, user_id) VALUES (?, ?)");
    $stmt->execute([$roomId, $userId]);
    
    // Update count
    $stmt = $pdo->prepare("UPDATE multiplayer_sessions SET player_count = (SELECT COUNT(*) FROM multiplayer_players WHERE room_id = ?) WHERE room_id = ?");
    $stmt->execute([$roomId, $roomId]);

    echo json_encode(["success" => true]);
}

if ($action == 'get_room_players') {
    $roomId = $_GET['room_id'];
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.avatar_url, u.level 
        FROM users u 
        JOIN multiplayer_players mp ON u.id = mp.user_id 
        WHERE mp.room_id = ?
        ORDER BY mp.joined_at ASC
    ");
    $stmt->execute([$roomId]);
    echo json_encode($stmt->fetchAll());
}

if ($action == 'check_room') {
    $roomId = $_GET['room_id'];
    $stmt = $pdo->prepare("SELECT player_count, status FROM multiplayer_sessions WHERE room_id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    echo json_encode($room ? $room : ["error" => "Not found"]);
}

if ($action == 'start_game') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("UPDATE multiplayer_sessions SET status = 'active' WHERE room_id = ?");
    $stmt->execute([$data['room_id']]);
    echo json_encode(["success" => true]);
}

// BATTLE INVITATIONS (OLD LOGIC)
if ($action == 'send_invite') {
    $data = json_decode(file_get_contents("php://input"), true);
    $senderId = $data['sender_id'];
    $receiverId = $data['receiver_id'];
    $roomId = $data['room_id'] ?? null; // Optional: can be a direct battle or a room invite

    $stmt = $pdo->prepare("SELECT id, created_at FROM invitations WHERE sender_id = ? AND receiver_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$senderId, $receiverId]);
    $existing = $stmt->fetch();

    if ($existing) {
        $createdTime = strtotime($existing['created_at']);
        if (time() - $createdTime < 600) {
            echo json_encode(["success" => false, "error" => "cooldown", "remaining" => ceil((600 - (time() - $createdTime)) / 60)]);
            exit;
        }
        $pdo->prepare("UPDATE invitations SET status = 'expired' WHERE id = ?")->execute([$existing['id']]);
    }

    $stmt = $pdo->prepare("INSERT INTO invitations (sender_id, receiver_id, status, room_id) VALUES (?, ?, 'pending', ?)");
    $stmt->execute([$senderId, $receiverId, $roomId]);
    echo json_encode(["success" => true]);
}

if ($action == 'get_invites') {
    $userId = $_GET['user_id'];
    $stmt = $pdo->prepare("SELECT i.*, u.username as sender_name, u.avatar_url as sender_avatar FROM invitations i JOIN users u ON i.sender_id = u.id WHERE i.receiver_id = ? AND i.status = 'pending'");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
}

if ($action == 'respond_invite') {
    $data = json_decode(file_get_contents("php://input"), true);
    if ($data['status'] == 'accepted') {
        $stmt = $pdo->prepare("SELECT room_id FROM invitations WHERE id = ?");
        $stmt->execute([$data['invite_id']]);
        $inv = $stmt->fetch();
        
        $roomId = $inv['room_id'];
        if (!$roomId) {
            $roomId = "BATTLE-" . rand(1000, 9999);
        }
        
        $stmt = $pdo->prepare("UPDATE invitations SET status = 'accepted', room_id = ? WHERE id = ?");
        $stmt->execute([$roomId, $data['invite_id']]);
        echo json_encode(["success" => true, "room_id" => $roomId]);
    } else {
        $pdo->prepare("UPDATE invitations SET status = 'declined' WHERE id = ?")->execute([$data['invite_id']]);
        echo json_encode(["success" => true]);
    }
}

if ($action == 'check_status') {
    $senderId = $_GET['sender_id'];
    $receiverId = $_GET['receiver_id'];
    $stmt = $pdo->prepare("SELECT status, room_id FROM invitations WHERE sender_id = ? AND receiver_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$senderId, $receiverId]);
    echo json_encode($stmt->fetch());
}

if ($action == 'save_battle_result') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO battle_results (room_id, user_id, score, correct_count) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['room_id'], $data['user_id'], $data['score'], $data['correct_count']]);
    echo json_encode(["success" => true]);
}

if ($action == 'get_battle_leaderboard') {
    $roomId = $_GET['room_id'];
    $stmt = $pdo->prepare("SELECT b.*, u.username, u.avatar_url FROM battle_results b JOIN users u ON b.user_id = u.id WHERE b.room_id = ? ORDER BY b.score DESC");
    $stmt->execute([$roomId]);
    echo json_encode($stmt->fetchAll());
}
?>
