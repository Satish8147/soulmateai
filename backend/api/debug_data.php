<?php
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

// 1. Get Satish's ID
$stmt = $db->prepare("SELECT user_id, name FROM profiles WHERE name LIKE '%Satish%' LIMIT 1");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "Satish not found\n";
    exit;
}

$userId = $user['user_id'];
echo "Satish User ID: " . $userId . "\n";

// 2. Fetch Pending Requests
echo "\n--- Pending Requests ---\n";
$query = "SELECT c.*, COALESCE(p.name, 'Unknown User') as senderName, p.imageUrl as senderImage, p.id as senderProfileId 
          FROM connections c 
          LEFT JOIN profiles p ON c.sender_id = p.user_id 
          WHERE c.receiver_id = :userId AND c.status = 'pending'";
$stmt = $db->prepare($query);
$stmt->bindParam(":userId", $userId);
$stmt->execute();
$pending = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($pending);

// 3. Fetch Accepted Connections
echo "\n--- Accepted Connections ---\n";
$query = "SELECT c.*, 
                 p1.user_id as p1_uid, p1.name as p1_name,
                 CASE WHEN c.sender_id = :userId THEN COALESCE(p2.name, 'Unknown User') ELSE COALESCE(p1.name, 'Unknown User') END as friendName,
                 CASE WHEN c.sender_id = :userId THEN p2.imageUrl ELSE p1.imageUrl END as friendImage,
                 CASE WHEN c.sender_id = :userId THEN c.receiver_id ELSE c.sender_id END as friendId,
                 CASE WHEN c.sender_id = :userId THEN p2.id ELSE p1.id END as friendProfileId
          FROM connections c
          LEFT JOIN profiles p1 ON c.sender_id = p1.user_id
          LEFT JOIN profiles p2 ON c.receiver_id = p2.user_id
          WHERE (c.sender_id = :userId OR c.receiver_id = :userId) AND c.status = 'accepted'";
$stmt = $db->prepare($query);
$stmt->bindParam(":userId", $userId);
$stmt->execute();
$accepted = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($accepted);

echo "\n--- All Profiles ---\n";
$stmt = $db->prepare("SELECT id, user_id, name FROM profiles");
$stmt->execute();
$profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($profiles);
?>