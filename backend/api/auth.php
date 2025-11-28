<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
file_put_contents("debug.txt", "Method: " . $method . "\n", FILE_APPEND);
file_put_contents("debug.txt", "Input: " . file_get_contents("php://input") . "\n", FILE_APPEND);

if ($method == "OPTIONS") {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action == 'signup') {
        if (
            !empty($data->email) &&
            !empty($data->password)
        ) {
            // Check if email already exists
            $check_query = "SELECT id FROM users WHERE email = :email";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(":email", $data->email);
            $check_stmt->execute();

            if ($check_stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Email already exists."));
            } else {
                $query = "INSERT INTO users SET email=:email, password=:password";
                $stmt = $db->prepare($query);

                $email = htmlspecialchars(strip_tags($data->email));
                $password = password_hash($data->password, PASSWORD_BCRYPT);

                $stmt->bindParam(":email", $email);
                $stmt->bindParam(":password", $password);

                if ($stmt->execute()) {
                    $user_id = $db->lastInsertId();
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "User registered successfully.",
                        "user" => array(
                            "id" => $user_id,
                            "email" => $email
                        )
                    ));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to register user."));
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    } elseif ($action == 'login') {
        if (
            !empty($data->email) &&
            !empty($data->password)
        ) {
            $query = "SELECT id, email, password FROM users WHERE email = :email";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $data->email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $id = $row['id'];
                $email = $row['email'];
                $password_hash = $row['password'];

                if (password_verify($data->password, $password_hash)) {
                    http_response_code(200);
                    echo json_encode(array(
                        "message" => "Login successful.",
                        "user" => array(
                            "id" => $id,
                            "email" => $email
                        )
                    ));
                } else {
                    http_response_code(401);
                    echo json_encode(array("message" => "Invalid password."));
                }
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "User not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Action required."));
}
?>