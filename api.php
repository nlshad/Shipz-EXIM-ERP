<?php
// ============================================================
// EXPORTFLOW ERP (SHIPZ) - CENTRAL MYSQL BACKEND API
// For Local Network Sync & Data Sharing
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database Credentials
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'shipz_db';

try {
    // 1. Connect to MySQL Server (without DB)
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 2. Auto Create Database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db`");

    // 3. Auto Create Tables if not exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `quotations` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `quotation_no` VARCHAR(100) UNIQUE NOT NULL,
          `consignee` VARCHAR(255),
          `country` VARCHAR(100),
          `total_amount` DECIMAL(15,2) DEFAULT 0.00,
          `status` VARCHAR(50) DEFAULT 'Draft',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `proforma_invoices` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `pi_no` VARCHAR(100) UNIQUE NOT NULL,
          `consignee` VARCHAR(255),
          `country` VARCHAR(100),
          `total_amount` DECIMAL(15,2) DEFAULT 0.00,
          `status` VARCHAR(50) DEFAULT 'Draft',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `customers` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `code` VARCHAR(50) UNIQUE,
          `name` VARCHAR(255) NOT NULL,
          `email` VARCHAR(255),
          `phone` VARCHAR(100),
          `country` VARCHAR(100),
          `address` TEXT,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `consignees` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `name` VARCHAR(255) NOT NULL,
          `country` VARCHAR(100),
          `address` TEXT,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `products` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `name` VARCHAR(255) NOT NULL,
          `hsn` VARCHAR(50),
          `unit` VARCHAR(50),
          `price` DECIMAL(12,2) DEFAULT 0.00,
          `description` TEXT,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database Connection Failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// GET REQUESTS - READ DATA
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'ping') {
        echo json_encode(['status' => 'online', 'database' => 'shipz_db', 'server_time' => date('Y-m-d H:i:s')]);
        exit;
    }

    if ($action === 'get') {
        $key = $_GET['key'] ?? '';
        $tableMap = [
            'shipz_quotations' => 'quotations',
            'shipz_proforma_invoices' => 'proforma_invoices'
        ];

        if (isset($tableMap[$key])) {
            $table = $tableMap[$key];
            $stmt = $pdo->query("SELECT data_json FROM `$table` ORDER BY id DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $result = array_map(fn($r) => json_decode($r, true), $rows);
            echo json_encode($result);
            exit;
        }
    }

    echo json_encode(['status' => 'online', 'message' => 'ExportFlow Local MySQL API Active']);
    exit;
}

// POST REQUESTS - WRITE & SYNC DATA
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $key = $input['key'] ?? '';
    $data = $input['data'] ?? null;

    if ($key && is_array($data)) {
        if ($key === 'shipz_quotations') {
            $stmt = $pdo->prepare("INSERT INTO quotations (quotation_no, consignee, country, total_amount, status, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE consignee=VALUES(consignee), country=VALUES(country), total_amount=VALUES(total_amount), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $qNo = $item['quotationNo'] ?? uniqid('QT-');
                $consignee = $item['consignee'] ?? '';
                $country = $item['country'] ?? '';
                $total = floatval($item['totalAmount'] ?? 0);
                $status = $item['status'] ?? 'Draft';
                $stmt->execute([$qNo, $consignee, $country, $total, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_proforma_invoices') {
            $stmt = $pdo->prepare("INSERT INTO proforma_invoices (pi_no, consignee, country, total_amount, status, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE consignee=VALUES(consignee), country=VALUES(country), total_amount=VALUES(total_amount), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $piNo = $item['invNumber'] ?? uniqid('PI-');
                $consignee = $item['consignee'] ?? '';
                $country = $item['country'] ?? '';
                $total = floatval($item['totalAmount'] ?? 0);
                $status = $item['status'] ?? 'Draft';
                $stmt->execute([$piNo, $consignee, $country, $total, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'count' => count($data)]);
            exit;
        }
    }

    echo json_encode(['success' => true]);
    exit;
}
