<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$conn = $database->getConnection();

$columns = [
    "ADD COLUMN fatherOccupation VARCHAR(255)",
    "ADD COLUMN motherOccupation VARCHAR(255)",
    "ADD COLUMN siblings INT",
    "ADD COLUMN familyLocation VARCHAR(255)",
    "ADD COLUMN familyStatus VARCHAR(100)"
];

$successCount = 0;
$errors = [];

foreach ($columns as $col) {
    try {
        $sql = "ALTER TABLE profiles " . $col;
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $successCount++;
    } catch (PDOException $e) {
        // Ignore "Duplicate column name" error (Code 42S21)
        if ($e->getCode() != '42S21') {
            $errors[] = $e->getMessage();
        }
    }
}

echo json_encode([
    "message" => "Migration completed",
    "success_count" => $successCount,
    "errors" => $errors
]);
?>