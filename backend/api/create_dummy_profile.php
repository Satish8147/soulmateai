<?php
include_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

$userId = 2; // Rani
$name = "Rani";
$email = "rani@example.com";

// Check if profile exists
$check = $db->prepare("SELECT id FROM profiles WHERE user_id = ?");
$check->execute([$userId]);

if ($check->rowCount() > 0) {
    echo "Profile for User $userId already exists.\n";
} else {
    $query = "INSERT INTO profiles SET
                user_id=:user_id, email=:email, name=:name, 
                age=25, gender='Female', religion='Hindu', 
                profession='Software Engineer', location='Bangalore',
                bio='Hello, I am Rani.', verified=1,
                imageUrl='https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $userId);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":name", $name);

    if ($stmt->execute()) {
        echo "Profile for Rani (User $userId) created successfully.\n";
    } else {
        echo "Failed to create profile: " . print_r($stmt->errorInfo(), true) . "\n";
    }
}
?>