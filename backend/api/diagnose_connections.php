<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$response = [];

// 1. Get all Users
$query = "SELECT id, email FROM users";
$stmt = $db->prepare($query);
$stmt->execute();
$response['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Get all Profiles
$query = "SELECT id, user_id, name, email FROM profiles";
$stmt = $db->prepare($query);
$stmt->execute();
$response['profiles'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Get all Connections
$query = "SELECT * FROM connections";
$stmt = $db->prepare($query);
$stmt->execute();
$response['connections'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($response, JSON_PRETTY_PRINT);
?>