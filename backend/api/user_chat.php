<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($method == 'GET') {
    // Get messages between two users
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
    $friendId = isset($_GET['friendId']) ? $_GET['friendId'] : null;

    if ($userId && $friendId) {
        $query = "SELECT * FROM user_messages 
                  WHERE (sender_id = :userId AND receiver_id = :friendId) 
                     OR (sender_id = :friendId AND receiver_id = :userId) 
                  ORDER BY created_at ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":userId", $userId);
        $stmt->bindParam(":friendId", $friendId);
        $stmt->execute();

        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($messages);
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing userId or friendId"));
    }
} elseif ($method == 'POST') {
    // Send a message
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->sender_id) && !empty($data->receiver_id) && !empty($data->message)) {
        $query = "INSERT INTO user_messages SET sender_id=:senderId, receiver_id=:receiverId, message=:message";
        $stmt = $db->prepare($query);

        $message = htmlspecialchars(strip_tags($data->message));

        $stmt->bindParam(":senderId", $data->sender_id);
        $stmt->bindParam(":receiverId", $data->receiver_id);
        $stmt->bindParam(":message", $message);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Message sent."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to send message."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}
?>