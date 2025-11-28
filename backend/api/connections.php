<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
error_log("Connection API Request: " . $method);

if ($method == "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($method == 'POST') {
    // Send a connection request
    $raw_data = file_get_contents("php://input");
    error_log("POST Data: " . $raw_data);
    $data = json_decode($raw_data);

    // Frontend sends sender_id and receiver_id
    if (!empty($data->sender_id) && !empty($data->receiver_id)) {
        error_log("Processing connection request: Sender=" . $data->sender_id . ", Receiver=" . $data->receiver_id);

        // Check if connection already exists (in either direction)
        $check_query = "SELECT * FROM connections WHERE (sender_id = :senderId AND receiver_id = :receiverId) OR (sender_id = :receiverId AND receiver_id = :senderId)";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":senderId", $data->sender_id);
        $check_stmt->bindParam(":receiverId", $data->receiver_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            error_log("Connection already exists");
            http_response_code(400);
            echo json_encode(array("message" => "Connection request already exists."));
        } else {
            $query = "INSERT INTO connections SET sender_id=:senderId, receiver_id=:receiverId, status='pending'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":senderId", $data->sender_id);
            $stmt->bindParam(":receiverId", $data->receiver_id);

            if ($stmt->execute()) {
                error_log("Connection request inserted successfully");
                http_response_code(201);
                echo json_encode(array("message" => "Connection request sent."));
            } else {
                error_log("Failed to insert connection request: " . print_r($stmt->errorInfo(), true));
                http_response_code(503);
                echo json_encode(array("message" => "Unable to send request."));
            }
        }
    } else {
        error_log("Incomplete data for connection request");
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data. sender_id and receiver_id are required."));
    }
} elseif ($method == 'PUT') {
    // Accept or Reject a request
    $data = json_decode(file_get_contents("php://input"));

    // Frontend sends connection_id and status
    if (!empty($data->connection_id) && !empty($data->status)) {
        $query = "UPDATE connections SET status = :status WHERE id = :connectionId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":connectionId", $data->connection_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Connection updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update connection."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data. connection_id and status are required."));
    }
} elseif ($method == 'GET') {
    // Frontend sends user_id for pending/accepted, and sender_id/receiver_id for check
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $type = isset($_GET['type']) ? $_GET['type'] : 'all'; // 'pending', 'accepted', 'all', 'check'

    error_log("GET Request: Type=" . $type . ", UserID=" . ($userId ? $userId : 'NULL'));

    // For check status
    $senderId = isset($_GET['sender_id']) ? $_GET['sender_id'] : null;
    $receiverId = isset($_GET['receiver_id']) ? $_GET['receiver_id'] : null;

    if ($type == 'check' && $senderId && $receiverId) {
        // Check status between two users
        $query = "SELECT * FROM connections WHERE (sender_id = :senderId AND receiver_id = :receiverId) OR (sender_id = :receiverId AND receiver_id = :senderId) LIMIT 0,1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":senderId", $senderId);
        $stmt->bindParam(":receiverId", $receiverId);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($row);
        } else {
            echo json_encode(array("status" => "none"));
        }
    } elseif ($userId) {
        // Get requests for a user
        if ($type == 'pending') {
            // Incoming requests only
            error_log("Fetching pending requests for UserID: " . $userId);
            // Use LEFT JOIN to ensure request is returned even if profile is missing/mismatched
            $query = "SELECT c.*, COALESCE(p.name, 'Unknown User') as senderName, p.imageUrl as senderImage, p.id as senderProfileId 
                      FROM connections c 
                      LEFT JOIN profiles p ON c.sender_id = p.user_id 
                      WHERE c.receiver_id = :userId AND c.status = 'pending'";
        } elseif ($type == 'accepted') {
            // Friends list (both directions)
            $query = "SELECT c.*, 
                             CASE WHEN c.sender_id = :userId THEN COALESCE(p2.name, 'Unknown User') ELSE COALESCE(p1.name, 'Unknown User') END as friendName,
                             CASE WHEN c.sender_id = :userId THEN p2.imageUrl ELSE p1.imageUrl END as friendImage,
                             CASE WHEN c.sender_id = :userId THEN c.receiver_id ELSE c.sender_id END as friendId,
                             CASE WHEN c.sender_id = :userId THEN p2.id ELSE p1.id END as friendProfileId
                      FROM connections c
                      LEFT JOIN profiles p1 ON c.sender_id = p1.user_id
                      LEFT JOIN profiles p2 ON c.receiver_id = p2.user_id
                      WHERE (c.sender_id = :userId OR c.receiver_id = :userId) AND c.status = 'accepted'";
        } else {
            // All interactions
            $query = "SELECT * FROM connections WHERE sender_id = :userId OR receiver_id = :userId";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(":userId", $userId);
        $stmt->execute();

        $records = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($records, $row);
        }
        error_log("Found " . count($records) . " records");
        echo json_encode(array("records" => $records));
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "User ID required."));
    }
}
?>