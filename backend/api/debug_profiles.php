<?php
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

echo "--- Profiles Dump ---\n";
$stmt = $db->prepare("SELECT id, user_id, name, email FROM profiles");
$stmt->execute();
$profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($profiles);
?>