<?php
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

$userId = 1; // Satish

echo "--- Debug V2 ---\n";

// Fetch Accepted Connections with explicit columns
$query = "SELECT c.*, 
                 p1.user_id as p1_uid, p1.name as p1_name, p1.id as p1_id,
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
?>