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
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;

    if ($id) {
        $query = "SELECT * FROM profiles WHERE id = :id LIMIT 0,1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            extract($row);

            $profile_item = array(
                "id" => $id,
                "userId" => $user_id,
                "email" => $email,
                "name" => $name,
                "age" => $age,
                "dob" => $dob,
                "birthTime" => $birthTime,
                "gender" => $gender,
                "religion" => $religion,
                "caste" => $caste,
                "subCaste" => $subCaste,
                "motherTongue" => $motherTongue,
                "profession" => $profession,
                "location" => $location,
                "education" => $education,
                "height" => $height,
                "income" => $income,
                "maritalStatus" => $maritalStatus,
                "bio" => $bio,
                "hobbies" => json_decode($hobbies),
                "imageUrl" => $imageUrl,
                "gallery" => json_decode($gallery),
                "traits" => isset($traits) ? $traits : null,
                "partnerPref" => isset($partnerPref) ? $partnerPref : null,
                "fatherOccupation" => isset($fatherOccupation) ? $fatherOccupation : null,
                "motherOccupation" => isset($motherOccupation) ? $motherOccupation : null,
                "siblings" => isset($siblings) ? $siblings : null,
                "familyLocation" => isset($familyLocation) ? $familyLocation : null,
                "familyStatus" => isset($familyStatus) ? $familyStatus : null,
                "verified" => (bool) $verified
            );

            http_response_code(200);
            echo json_encode($profile_item);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Profile not found."));
        }
    } elseif ($userId) {
        $query = "SELECT * FROM profiles WHERE user_id = :user_id LIMIT 0,1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            extract($row);

            $profile_item = array(
                "id" => $id,
                "userId" => $user_id,
                "email" => $email,
                "name" => $name,
                "age" => $age,
                "dob" => $dob,
                "birthTime" => $birthTime,
                "gender" => $gender,
                "religion" => $religion,
                "caste" => $caste,
                "subCaste" => $subCaste,
                "motherTongue" => $motherTongue,
                "profession" => $profession,
                "location" => $location,
                "education" => $education,
                "height" => $height,
                "income" => $income,
                "maritalStatus" => $maritalStatus,
                "bio" => $bio,
                "hobbies" => json_decode($hobbies),
                "imageUrl" => $imageUrl,
                "gallery" => json_decode($gallery),
                "traits" => isset($traits) ? $traits : null,
                "partnerPref" => isset($partnerPref) ? $partnerPref : null,
                "fatherOccupation" => isset($fatherOccupation) ? $fatherOccupation : null,
                "motherOccupation" => isset($motherOccupation) ? $motherOccupation : null,
                "siblings" => isset($siblings) ? $siblings : null,
                "familyLocation" => isset($familyLocation) ? $familyLocation : null,
                "familyStatus" => isset($familyStatus) ? $familyStatus : null,
                "verified" => (bool) $verified
            );

            http_response_code(200);
            echo json_encode($profile_item);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Profile not found."));
        }
    } else {
        $gender = isset($_GET['gender']) ? $_GET['gender'] : null;
        $excludeUserId = isset($_GET['excludeUserId']) ? $_GET['excludeUserId'] : null;

        // Debug logging for GET request
        error_log("GET Profiles Request: Gender=" . ($gender ? $gender : 'NULL') . ", ExcludeUserID=" . ($excludeUserId ? $excludeUserId : 'NULL'));

        $query = "SELECT * FROM profiles WHERE 1=1";

        if ($gender) {
            $query .= " AND gender = :gender";
        }
        if ($excludeUserId) {
            $query .= " AND user_id != :excludeUserId";
        }

        $stmt = $db->prepare($query);

        if ($gender) {
            $stmt->bindParam(":gender", $gender);
        }
        if ($excludeUserId) {
            $stmt->bindParam(":excludeUserId", $excludeUserId);
        }

        $stmt->execute();

        $num = $stmt->rowCount();

        if ($num > 0) {
            $profiles_arr = array();
            $profiles_arr["records"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);

                $profile_item = array(
                    "id" => $id,
                    "userId" => $user_id,
                    "email" => $email,
                    "name" => $name,
                    "age" => $age,
                    "dob" => $dob,
                    "birthTime" => $birthTime,
                    "gender" => $gender,
                    "religion" => $religion,
                    "caste" => $caste,
                    "subCaste" => $subCaste,
                    "motherTongue" => $motherTongue,
                    "profession" => $profession,
                    "location" => $location,
                    "education" => $education,
                    "height" => $height,
                    "income" => $income,
                    "maritalStatus" => $maritalStatus,
                    "bio" => $bio,
                    "hobbies" => json_decode($hobbies),
                    "imageUrl" => $imageUrl,
                    "gallery" => json_decode($gallery),
                    "traits" => isset($traits) ? $traits : null,
                    "partnerPref" => isset($partnerPref) ? $partnerPref : null,
                    "fatherOccupation" => isset($fatherOccupation) ? $fatherOccupation : null,
                    "motherOccupation" => isset($motherOccupation) ? $motherOccupation : null,
                    "siblings" => isset($siblings) ? $siblings : null,
                    "familyLocation" => isset($familyLocation) ? $familyLocation : null,
                    "familyStatus" => isset($familyStatus) ? $familyStatus : null,
                    "verified" => (bool) $verified
                );

                array_push($profiles_arr["records"], $profile_item);
            }

            http_response_code(200);
            echo json_encode($profiles_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "No profiles found."));
        }
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->name) &&
        !empty($data->gender)
    ) {
        $user_id = isset($data->userId) ? strip_tags($data->userId) : null;
        $email = isset($data->email) ? strip_tags($data->email) : null;

        // Check if profile exists for this user OR email
        $check_query = "SELECT id FROM profiles WHERE user_id = :user_id OR email = :email LIMIT 0,1";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":user_id", $user_id);
        $check_stmt->bindParam(":email", $email);
        $check_stmt->execute();

        // Debug logging
        error_log("Received Profile Save Request: Name=" . $data->name . ", Email=" . $email . ", UserID=" . $user_id);
        error_log("Image URL Length: " . (isset($data->imageUrl) ? strlen($data->imageUrl) : '0'));

        if ($check_stmt->rowCount() > 0) {
            // Update existing profile
            // Fetch the ID to update specifically that row
            $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
            $existing_id = $row['id'];
            error_log("Found existing profile ID: " . $existing_id . ". Updating...");

            $query = "UPDATE profiles SET
                        user_id=:user_id, email=:email,
                        name=:name, age=:age, dob=:dob, birthTime=:birthTime, 
                        gender=:gender, religion=:religion, caste=:caste, subCaste=:subCaste,
                        motherTongue=:motherTongue, profession=:profession, location=:location,
                        education=:education, height=:height, income=:income, maritalStatus=:maritalStatus,
                        bio=:bio, hobbies=:hobbies, imageUrl=:imageUrl, gallery=:gallery,
                        traits=:traits, partnerPref=:partnerPref,
                        fatherOccupation=:fatherOccupation, motherOccupation=:motherOccupation,
                        siblings=:siblings, familyLocation=:familyLocation, familyStatus=:familyStatus,
                        verified=:verified
                      WHERE id=:id";
            $action_type = "updated";
        } else {
            // Insert new profile
            error_log("No existing profile found. Creating new...");
            $query = "INSERT INTO profiles SET
                        user_id=:user_id, email=:email,
                        name=:name, age=:age, dob=:dob, birthTime=:birthTime, 
                        gender=:gender, religion=:religion, caste=:caste, subCaste=:subCaste,
                        motherTongue=:motherTongue, profession=:profession, location=:location,
                        education=:education, height=:height, income=:income, maritalStatus=:maritalStatus,
                        bio=:bio, hobbies=:hobbies, imageUrl=:imageUrl, gallery=:gallery,
                        traits=:traits, partnerPref=:partnerPref,
                        fatherOccupation=:fatherOccupation, motherOccupation=:motherOccupation,
                        siblings=:siblings, familyLocation=:familyLocation, familyStatus=:familyStatus,
                        verified=:verified";
            $action_type = "created";
        }

        $stmt = $db->prepare($query);

        $name = strip_tags($data->name);
        $age = isset($data->age) ? strip_tags($data->age) : 0;
        $dob = isset($data->dob) ? strip_tags($data->dob) : null;
        $birthTime = isset($data->birthTime) ? strip_tags($data->birthTime) : null;
        $gender = strip_tags($data->gender);
        $religion = isset($data->religion) ? strip_tags($data->religion) : null;
        $caste = isset($data->caste) ? strip_tags($data->caste) : null;
        $subCaste = isset($data->subCaste) ? strip_tags($data->subCaste) : null;
        $motherTongue = isset($data->motherTongue) ? strip_tags($data->motherTongue) : null;
        $profession = isset($data->profession) ? strip_tags($data->profession) : null;
        $location = isset($data->location) ? strip_tags($data->location) : null;
        $education = isset($data->education) ? strip_tags($data->education) : null;
        $height = isset($data->height) ? strip_tags($data->height) : null;
        $income = isset($data->income) ? strip_tags($data->income) : null;
        $maritalStatus = isset($data->maritalStatus) ? strip_tags($data->maritalStatus) : null;
        $bio = isset($data->bio) ? strip_tags($data->bio) : null;
        $hobbies = isset($data->hobbies) ? json_encode($data->hobbies) : null;
        $imageUrl = isset($data->imageUrl) ? strip_tags($data->imageUrl) : null;
        $gallery = isset($data->gallery) ? json_encode($data->gallery) : null;
        $traits = isset($data->traits) ? strip_tags($data->traits) : null;
        $partnerPref = isset($data->partnerPref) ? strip_tags($data->partnerPref) : null;
        $fatherOccupation = isset($data->fatherOccupation) ? strip_tags($data->fatherOccupation) : null;
        $motherOccupation = isset($data->motherOccupation) ? strip_tags($data->motherOccupation) : null;
        $siblings = isset($data->siblings) ? strip_tags($data->siblings) : null;
        $familyLocation = isset($data->familyLocation) ? strip_tags($data->familyLocation) : null;
        $familyStatus = isset($data->familyStatus) ? strip_tags($data->familyStatus) : null;
        $verified = isset($data->verified) && $data->verified ? 1 : 0;

        if (isset($existing_id)) {
            $stmt->bindParam(":id", $existing_id);
        }

        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":age", $age);
        $stmt->bindParam(":dob", $dob);
        $stmt->bindParam(":birthTime", $birthTime);
        $stmt->bindParam(":gender", $gender);
        $stmt->bindParam(":religion", $religion);
        $stmt->bindParam(":caste", $caste);
        $stmt->bindParam(":subCaste", $subCaste);
        $stmt->bindParam(":motherTongue", $motherTongue);
        $stmt->bindParam(":profession", $profession);
        $stmt->bindParam(":location", $location);
        $stmt->bindParam(":education", $education);
        $stmt->bindParam(":height", $height);
        $stmt->bindParam(":income", $income);
        $stmt->bindParam(":maritalStatus", $maritalStatus);
        $stmt->bindParam(":bio", $bio);
        $stmt->bindParam(":hobbies", $hobbies);
        $stmt->bindParam(":imageUrl", $imageUrl);
        $stmt->bindParam(":gallery", $gallery);
        $stmt->bindParam(":traits", $traits);
        $stmt->bindParam(":partnerPref", $partnerPref);
        $stmt->bindParam(":fatherOccupation", $fatherOccupation);
        $stmt->bindParam(":motherOccupation", $motherOccupation);
        $stmt->bindParam(":siblings", $siblings);
        $stmt->bindParam(":familyLocation", $familyLocation);
        $stmt->bindParam(":familyStatus", $familyStatus);
        $stmt->bindParam(":verified", $verified);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Profile " . $action_type . " successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to save profile."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create profile. Data is incomplete."));
    }
}
?>