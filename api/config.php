<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
session_start(); // Enable PHP Sessions

$DB_HOST = 'sql100.infinityfree.com';
$DB_NAME = 'if0_41757062_tuniquiz_db';
$DB_USER = 'if0_41757062';
$DB_PASS = 'achref12300nour';

try {
    // Force charset in DSN and execute SET NAMES
    $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
?>
