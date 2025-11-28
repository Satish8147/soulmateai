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
    $query = "SELECT * FROM messages ORDER BY timestamp ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $num = $stmt->rowCount();

    if ($num > 0) {
        $messages_arr = array();
        $messages_arr["records"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            $message_item = array(
                "id" => $id,
                "sender" => $sender,
                "text" => $text,
                "timestamp" => $timestamp,
                "relatedProfileIds" => json_decode($relatedProfileIds)
            );

            array_push($messages_arr["records"], $message_item);
        }

        http_response_code(200);
        echo json_encode($messages_arr);
    } else {
        http_response_code(200); // Return empty array instead of 404 for empty chat
        echo json_encode(array("records" => []));
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->sender) &&
        !empty($data->text)
    ) {
        $query = "INSERT INTO messages SET
                    sender=:sender, text=:text, relatedProfileIds=:relatedProfileIds";

        $stmt = $db->prepare($query);

        $sender = htmlspecialchars(strip_tags($data->sender));
        $text = htmlspecialchars(strip_tags($data->text));
        $relatedProfileIds = isset($data->relatedProfileIds) ? json_encode($data->relatedProfileIds) : null;

        $stmt->bindParam(":sender", $sender);
        $stmt->bindParam(":text", $text);
        $stmt->bindParam(":relatedProfileIds", $relatedProfileIds);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Message sent."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to send message."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to send message. Data is incomplete."));
    }
}
?>