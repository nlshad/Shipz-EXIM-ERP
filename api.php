<?php
// ============================================================
// EXPORTFLOW ERP (SHIPZ) - CENTRAL REAL-TIME MYSQL BACKEND API
// Live Multi-User Network Synchronization Engine
// Compatible with cPanel, Hostinger, VPS, Cloud & Local XAMPP
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 1. Load Database Configuration
require_once __DIR__ . '/config.php';

// Action dispatcher & Input parser
$rawInput = null;
$input = [];
if ($requestMethod === 'POST' || $requestMethod === 'PUT') {
    $rawInput = file_get_contents('php://input');
    if ($rawInput) {
        $input = json_decode($rawInput, true) ?: [];
    }
}
$action = $_GET['action'] ?? ($input['action'] ?? '');

// 2. Handle DB Configuration Save & Test Endpoint
if ($requestMethod === 'POST' && $action === 'save_db_config') {
    $testHost = trim($input['db_host'] ?? 'localhost');
    $testName = trim($input['db_name'] ?? '');
    $testUser = trim($input['db_user'] ?? '');
    $testPass = $input['db_pass'] ?? '';
    $testPort = trim($input['db_port'] ?? '3306');

    try {
        $testDsn = "mysql:host={$testHost};port={$testPort};dbname={$testName};charset=utf8mb4";
        $testPdo = new PDO($testDsn, $testUser, $testPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);

        // Auto Create Tables
        createErpTables($testPdo);

        // Save to db_config.json
        $saveData = [
            'db_host' => $testHost,
            'db_name' => $testName,
            'db_user' => $testUser,
            'db_pass' => $testPass,
            'db_port' => $testPort,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        file_put_contents(__DIR__ . '/db_config.json', json_encode($saveData, JSON_PRETTY_PRINT));

        echo json_encode([
            'success' => true,
            'message' => "Successfully connected to {$testName} on {$testHost} and verified ERP tables!"
        ]);
        exit;
    } catch (\PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
        exit;
    }
}

// 3. Connect to Database using Configured Credentials
$pdo = null;
$dbConnectionError = null;

try {
    $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);
    createErpTables($pdo);
} catch (\PDOException $e) {
    // If database does not exist and we are root on localhost (local dev), try creating it
    if ($e->getCode() == 1049 && ($DB_USER === 'root' || $DB_HOST === 'localhost' || $DB_HOST === '127.0.0.1')) {
        try {
            $rootPdo = new PDO("mysql:host={$DB_HOST};port={$DB_PORT};charset=utf8mb4", $DB_USER, $DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `{$DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            createErpTables($pdo);
        } catch (\Exception $e2) {
            $dbConnectionError = $e2->getMessage();
        }
    } else {
        $dbConnectionError = $e->getMessage();
    }
}

// Helper: Ensure all necessary ERP tables exist
function createErpTables($db) {
    $db->exec("
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

        CREATE TABLE IF NOT EXISTS `commercial_invoices` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `ci_no` VARCHAR(100) UNIQUE NOT NULL,
          `consignee` VARCHAR(255),
          `country` VARCHAR(100),
          `total_amount` DECIMAL(15,2) DEFAULT 0.00,
          `status` VARCHAR(50) DEFAULT 'Finalized',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `packing_lists` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `pkl_no` VARCHAR(100) UNIQUE NOT NULL,
          `buyer_name` VARCHAR(255),
          `container_no` VARCHAR(255),
          `status` VARCHAR(50) DEFAULT 'Draft',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `bl_records` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `rec_id` VARCHAR(100) UNIQUE NOT NULL,
          `pi_no` VARCHAR(100),
          `shipping_line` VARCHAR(255),
          `container_no` VARCHAR(100),
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `system_users` (
          `id` VARCHAR(100) PRIMARY KEY,
          `email` VARCHAR(255) UNIQUE NOT NULL,
          `first_name` VARCHAR(100),
          `last_name` VARCHAR(100),
          `role_name` VARCHAR(100),
          `status` VARCHAR(50) DEFAULT 'Active',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `recent_activities` (
          `id` VARCHAR(100) PRIMARY KEY,
          `type` VARCHAR(50),
          `title` VARCHAR(255),
          `badge` VARCHAR(100),
          `timestamp_iso` VARCHAR(100),
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `erp_sync_store` (
          `key_name` VARCHAR(150) PRIMARY KEY,
          `data_json` LONGTEXT NOT NULL,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `pre_shipment_certificates` (
          `id` VARCHAR(100) PRIMARY KEY,
          `cert_no` VARCHAR(100),
          `cert_type` VARCHAR(100),
          `invoice_no` VARCHAR(100),
          `issuing_authority` VARCHAR(255),
          `issue_date` VARCHAR(50),
          `expiry_date` VARCHAR(50),
          `file_name` VARCHAR(255),
          `file_size` VARCHAR(50),
          `status` VARCHAR(50) DEFAULT 'Valid',
          `data_json` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `deleted_records` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `record_id` VARCHAR(150) NOT NULL,
          `alt_id` VARCHAR(150) DEFAULT '',
          `deleted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY `uniq_record` (`record_id`, `alt_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
}

// 4. If Database Connection Failed, Return Diagnostic Response
if (!$pdo) {
    echo json_encode([
        'status' => 'db_error',
        'is_connected' => false,
        'message' => 'Live Database Connection Failed: ' . $dbConnectionError,
        'config' => [
            'host' => $DB_HOST,
            'database' => $DB_NAME,
            'user' => $DB_USER,
            'port' => $DB_PORT
        ],
        'help' => 'Please set your live database credentials in config.php or click Database Settings in the ERP header.'
    ]);
    exit;
}

// 5. GET REQUESTS - READ DATA
if ($requestMethod === 'GET') {
    if ($action === 'ping' || $action === 'db_status') {
        echo json_encode([
            'status' => 'online',
            'is_connected' => true,
            'database' => $DB_NAME,
            'host' => $DB_HOST,
            'server_time' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    // High-efficiency all-in-one live synchronization endpoint
    if ($action === 'get_all_live') {
        $data = [
            'status'             => 'online',
            'is_connected'       => true,
            'quotations'         => [],
            'proformaInvoices'   => [],
            'commercialInvoices' => [],
            'packingLists'       => [],
            'blRecords'          => [],
            'systemUsers'        => [],
            'recentActivities'   => [],
            'serverTime'         => date('Y-m-d H:i:s')
        ];

        // 1. Quotations
        $stmt = $pdo->query("SELECT data_json FROM quotations ORDER BY id DESC LIMIT 500");
        $data['quotations'] = array_map(fn($r) => json_decode($r, true), $stmt->fetchAll(PDO::FETCH_COLUMN));

        // 2. Proforma Invoices
        $stmt = $pdo->query("SELECT data_json FROM proforma_invoices ORDER BY id DESC LIMIT 500");
        $data['proformaInvoices'] = array_map(fn($r) => json_decode($r, true), $stmt->fetchAll(PDO::FETCH_COLUMN));

        // 3. Commercial Invoices
        $stmt = $pdo->query("SELECT data_json FROM commercial_invoices ORDER BY id DESC LIMIT 500");
        $rowsCi = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($rowsCi)) {
            $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_commercial_invoices'");
            $stmtFallback->execute();
            $fb = $stmtFallback->fetchColumn();
            if ($fb) $data['commercialInvoices'] = json_decode($fb, true) ?: [];
        } else {
            $data['commercialInvoices'] = array_map(fn($r) => json_decode($r, true), $rowsCi);
        }

        // 4. Packing Lists
        $stmt = $pdo->query("SELECT data_json FROM packing_lists ORDER BY id DESC LIMIT 500");
        $rowsPkl = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($rowsPkl)) {
            $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_packing_lists'");
            $stmtFallback->execute();
            $fb = $stmtFallback->fetchColumn();
            if ($fb) $data['packingLists'] = json_decode($fb, true) ?: [];
        } else {
            $data['packingLists'] = array_map(fn($r) => json_decode($r, true), $rowsPkl);
        }

        // 5. BL Records
        $stmt = $pdo->query("SELECT data_json FROM bl_records ORDER BY id DESC LIMIT 500");
        $rowsBl = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($rowsBl)) {
            $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_bl_records'");
            $stmtFallback->execute();
            $fb = $stmtFallback->fetchColumn();
            if ($fb) $data['blRecords'] = json_decode($fb, true) ?: [];
        } else {
            $data['blRecords'] = array_map(fn($r) => json_decode($r, true), $rowsBl);
        }

        // 6. System Users
        $stmt = $pdo->query("SELECT data_json FROM system_users ORDER BY updated_at DESC LIMIT 500");
        $rowsUsers = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($rowsUsers)) {
            $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_system_users_v2'");
            $stmtFallback->execute();
            $fb = $stmtFallback->fetchColumn();
            if ($fb) $data['systemUsers'] = json_decode($fb, true) ?: [];
        } else {
            $data['systemUsers'] = array_map(fn($r) => json_decode($r, true), $rowsUsers);
        }

        // 7. Recent Activities
        $stmt = $pdo->query("SELECT data_json FROM recent_activities ORDER BY id DESC LIMIT 100");
        $rowsAct = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($rowsAct)) {
            $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_recent_activities'");
            $stmtFallback->execute();
            $fb = $stmtFallback->fetchColumn();
            if ($fb) $data['recentActivities'] = json_decode($fb, true) ?: [];
        } else {
            $data['recentActivities'] = array_map(fn($r) => json_decode($r, true), $rowsAct);
        }

        // 8. Pre-Shipment Certificates
        try {
            $stmt = $pdo->query("SELECT data_json FROM pre_shipment_certificates ORDER BY id DESC LIMIT 500");
            $rowsCerts = $stmt ? $stmt->fetchAll(PDO::FETCH_COLUMN) : [];
            if (empty($rowsCerts)) {
                $stmtFallback = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_pre_shipment_certificates'");
                $stmtFallback->execute();
                $fb = $stmtFallback->fetchColumn();
                $data['preShipmentCertificates'] = $fb ? (json_decode($fb, true) ?: []) : [];
            } else {
                $data['preShipmentCertificates'] = array_map(fn($r) => json_decode($r, true), $rowsCerts);
            }
        } catch (\Exception $e) {
            $data['preShipmentCertificates'] = [];
        }

        // 9. Sync Tombstones (Deleted Documents across all PCs - using unique record IDs only)
        $tombstoneList = [];
        try {
            $stmtDelRecs = $pdo->query("SELECT record_id FROM deleted_records");
            while ($row = $stmtDelRecs->fetch(PDO::FETCH_ASSOC)) {
                $rid = strval($row['record_id'] ?? '');
                if ($rid && strpos($rid, '-') !== false && strpos($rid, '/') === false) {
                    $tombstoneList[] = $rid;
                }
            }
        } catch (\Exception $e) {}

        try {
            $stmtDel = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_deleted_doc_ids'");
            $stmtDel->execute();
            $fbDel = $stmtDel->fetchColumn();
            if ($fbDel) {
                $arr = json_decode($fbDel, true);
                if (is_array($arr)) {
                    foreach ($arr as $item) {
                        $sItem = strval($item ?? '');
                        if ($sItem && strpos($sItem, '-') !== false && strpos($sItem, '/') === false) {
                            $tombstoneList[] = $sItem;
                        }
                    }
                }
            }
        } catch (\Exception $e) {}

        $data['deletedDocIds'] = array_values(array_unique($tombstoneList));

        echo json_encode($data);
        exit;
    }

    // Individual Key GET
    if ($action === 'get') {
        $key = $_GET['key'] ?? '';
        $tableMap = [
            'shipz_quotations'          => 'quotations',
            'shipz_proforma_invoices'   => 'proforma_invoices',
            'shipz_commercial_invoices' => 'commercial_invoices',
            'shipz_packing_lists'       => 'packing_lists',
            'shipz_bl_records'          => 'bl_records',
            'shipz_system_users_v2'     => 'system_users',
            'shipz_recent_activities'   => 'recent_activities'
        ];

        if (isset($tableMap[$key])) {
            $table = $tableMap[$key];
            $stmt = $pdo->query("SELECT data_json FROM `$table` ORDER BY id DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
            if (!empty($rows)) {
                $result = array_map(fn($r) => json_decode($r, true), $rows);
                echo json_encode($result);
                exit;
            }
        }

        // Fallback to erp_sync_store
        $stmtStore = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = ?");
        $stmtStore->execute([$key]);
        $val = $stmtStore->fetchColumn();
        if ($val) {
            echo $val;
            exit;
        }

        echo json_encode([]);
        exit;
    }

    // Full System Backup Generator Endpoint
    if ($action === 'generate_full_backup') {
        $backup = buildFullBackupData($pdo, $DB_HOST, $DB_NAME);
        $jsonStr = json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        $backupsDir = __DIR__ . '/backups';
        if (!is_dir($backupsDir)) {
            @mkdir($backupsDir, 0755, true);
        }
        $filename = 'shipz_backup_' . date('Y-m-d_H-i-s') . '.json';
        @file_put_contents($backupsDir . '/' . $filename, $jsonStr);

        if (isset($_GET['download']) && $_GET['download'] === '1') {
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . strlen($jsonStr));
            echo $jsonStr;
            exit;
        }

        echo json_encode([
            'success'       => true,
            'snapshot_file' => $filename,
            'backup'        => $backup
        ]);
        exit;
    }

    // List Historical Server Backups
    if ($action === 'list_server_backups') {
        $backupsDir = __DIR__ . '/backups';
        $list = [];
        if (is_dir($backupsDir)) {
            $files = scandir($backupsDir);
            foreach ($files as $f) {
                if ($f === '.' || $f === '..' || !str_ends_with($f, '.json')) continue;
                $path = $backupsDir . '/' . $f;
                $size = filesize($path);
                $mtime = filemtime($path);
                
                $meta = null;
                $fp = @fopen($path, 'r');
                if ($fp) {
                    $preview = fread($fp, 8192);
                    fclose($fp);
                    $meta = json_decode($preview, true);
                }
                $counts = $meta['counts'] ?? [];

                $list[] = [
                    'filename'         => $f,
                    'file_size'        => $size > 1048576 ? round($size / 1048576, 2) . ' MB' : round($size / 1024, 1) . ' KB',
                    'modified_time'    => date('Y-m-d H:i:s', $mtime),
                    'backup_timestamp' => $meta['backup_timestamp'] ?? date('c', $mtime),
                    'counts'           => $counts
                ];
            }
            usort($list, fn($a, $b) => strcmp($b['modified_time'], $a['modified_time']));
        }
        echo json_encode(['success' => true, 'snapshots' => $list]);
        exit;
    }

    // Download a Specific Server Backup File
    if ($action === 'download_server_backup') {
        $file = basename($_GET['file'] ?? '');
        $path = __DIR__ . '/backups/' . $file;
        if (!$file || !file_exists($path)) {
            http_response_code(404);
            echo json_encode(['error' => 'Backup file not found']);
            exit;
        }
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $file . '"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    echo json_encode(['status' => 'online', 'message' => 'ExportFlow Local MySQL API Active']);
    exit;
}

// Helper to construct full ERP backup dictionary
function buildFullBackupData($pdo, $DB_HOST, $DB_NAME) {
    $backup = [
        'schema_version'   => '1.0',
        'app_name'         => 'Shipz EXIM ERP',
        'backup_timestamp' => date('c'),
        'server'           => [
            'host'     => $DB_HOST,
            'database' => $DB_NAME,
            'php'      => PHP_VERSION
        ],
        'counts'           => [],
        'data'             => [
            'quotations'                => [],
            'proforma_invoices'         => [],
            'commercial_invoices'       => [],
            'packing_lists'             => [],
            'bl_records'                => [],
            'pre_shipment_certificates' => [],
            'system_users'              => [],
            'recent_activities'         => [],
            'sync_store'                => []
        ]
    ];

    $tables = [
        'quotations'                => "SELECT data_json FROM quotations ORDER BY id ASC",
        'proforma_invoices'         => "SELECT data_json FROM proforma_invoices ORDER BY id ASC",
        'commercial_invoices'       => "SELECT data_json FROM commercial_invoices ORDER BY id ASC",
        'packing_lists'             => "SELECT data_json FROM packing_lists ORDER BY id ASC",
        'bl_records'                => "SELECT data_json FROM bl_records ORDER BY id ASC",
        'pre_shipment_certificates' => "SELECT data_json FROM pre_shipment_certificates ORDER BY id ASC",
        'system_users'              => "SELECT data_json FROM system_users ORDER BY id ASC",
        'recent_activities'         => "SELECT data_json FROM recent_activities ORDER BY id ASC"
    ];

    foreach ($tables as $key => $sql) {
        try {
            $stmt = $pdo->query($sql);
            if ($stmt) {
                $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
                $backup['data'][$key] = array_map(fn($r) => json_decode($r, true), $rows);
            }
        } catch (\Exception $e) {
            $backup['data'][$key] = [];
        }
        $backup['counts'][$key] = count($backup['data'][$key]);
    }

    try {
        $stmtSync = $pdo->query("SELECT key_name, data_json FROM erp_sync_store");
        if ($stmtSync) {
            while ($row = $stmtSync->fetch(PDO::FETCH_ASSOC)) {
                $k = $row['key_name'];
                $val = json_decode($row['data_json'], true);
                $backup['data']['sync_store'][$k] = ($val !== null) ? $val : $row['data_json'];
            }
        }
    } catch (\Exception $e) {
        $backup['data']['sync_store'] = [];
    }
    $backup['counts']['sync_store_keys'] = count($backup['data']['sync_store']);

    return $backup;
}

// Helper to add tombstone for deleted documents across all clients
function addTombstone($pdo, $id, $altId) {
    if (!$id) return;
    $sId = strval($id);
    if (strpos($sId, '-') === false || strpos($sId, '/') !== false) return;

    try {
        $stmt = $pdo->prepare("INSERT INTO deleted_records (record_id, alt_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE deleted_at = CURRENT_TIMESTAMP");
        $stmt->execute([$sId, strval($altId ?: '')]);
    } catch (\Exception $e) {}
    try {
        $stmt = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = 'shipz_deleted_doc_ids'");
        $stmt->execute();
        $json = $stmt->fetchColumn();
        $list = $json ? (json_decode($json, true) ?: []) : [];
        if (!in_array($sId, $list)) {
            $list[] = $sId;
            $stmtUp = $pdo->prepare("INSERT INTO erp_sync_store (key_name, data_json) VALUES ('shipz_deleted_doc_ids', ?) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = CURRENT_TIMESTAMP");
            $stmtUp->execute([json_encode(array_values($list))]);
        }
    } catch (\Exception $e) {}
}

// Helper to remove deleted items from erp_sync_store JSON
function cleanSyncStoreArray($pdo, $key, $id, $altId, $altKeyName) {
    try {
        $stmt = $pdo->prepare("SELECT data_json FROM erp_sync_store WHERE key_name = ?");
        $stmt->execute([$key]);
        $json = $stmt->fetchColumn();
        if ($json) {
            $arr = json_decode($json, true);
            if (is_array($arr)) {
                $filtered = array_values(array_filter($arr, function($item) use ($id, $altId, $altKeyName) {
                    if (!is_array($item)) return false;
                    $iId = strval($item['id'] ?? '');
                    $iAlt = strval($item[$altKeyName] ?? '');
                    if ($id && $iId === strval($id)) return false;
                    if ($altId && $iAlt === strval($altId)) return false;
                    if ($altId && $iId === strval($altId)) return false;
                    return true;
                }));
                $stmtUp = $pdo->prepare("UPDATE erp_sync_store SET data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?");
                $stmtUp->execute([json_encode($filtered), $key]);
            }
        }
    } catch (\Exception $e) {}
}

// 6. POST REQUESTS - WRITE & LIVE SYNC DATA ACROSS USERS & PCs
if ($requestMethod === 'POST') {
    if (empty($input)) {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
    }

    // Granular Full / Selective Restore Endpoint
    if ($action === 'restore_backup') {
        $backupData = $input['backup_data'] ?? null;
        $serverFile = basename($input['server_file'] ?? '');
        if (!$backupData && $serverFile) {
            $path = __DIR__ . '/backups/' . $serverFile;
            if (file_exists($path)) {
                $backupData = json_decode(file_get_contents($path), true);
            }
        }

        if (!$backupData || !is_array($backupData) || empty($backupData['data'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid or empty backup data.']);
            exit;
        }

        $selectedModules = $input['selected_modules'] ?? [];
        if (empty($selectedModules)) {
            $selectedModules = ['quotations', 'proforma_invoices', 'commercial_invoices', 'packing_lists', 'bl_records', 'pre_shipment_certificates', 'masters_and_settings', 'system_users', 'recent_activities'];
        }

        $mode = ($input['mode'] ?? 'merge') === 'replace' ? 'replace' : 'merge';
        $data = $backupData['data'];
        $restoredCounts = [];

        $pdo->beginTransaction();
        try {
            $untombstoneStmt = $pdo->prepare("DELETE FROM deleted_records WHERE record_id = ? OR alt_id = ?");

            // 1. Quotations
            if (in_array('quotations', $selectedModules) && isset($data['quotations']) && is_array($data['quotations'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM quotations");
                }
                $stmt = $pdo->prepare("INSERT INTO quotations (id, quotation_no, date, client_name, data_json) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE quotation_no=VALUES(quotation_no), date=VALUES(date), client_name=VALUES(client_name), data_json=VALUES(data_json)");
                foreach ($data['quotations'] as $item) {
                    $qId = $item['id'] ?? ('qt-' . uniqid());
                    $qNo = $item['quotationNo'] ?? $item['quotation_no'] ?? '';
                    $qDate = $item['date'] ?? date('Y-m-d');
                    $client = $item['clientName'] ?? $item['client_name'] ?? ($item['customer'] ?? '');
                    $stmt->execute([$qId, $qNo, $qDate, $client, json_encode($item)]);
                    $untombstoneStmt->execute([$qId, $qNo]);
                }
                $restoredCounts['quotations'] = count($data['quotations']);
            }

            // 2. Proforma Invoices
            if (in_array('proforma_invoices', $selectedModules) && isset($data['proforma_invoices']) && is_array($data['proforma_invoices'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM proforma_invoices");
                }
                $stmt = $pdo->prepare("INSERT INTO proforma_invoices (id, pi_no, date, consignee, total_fx, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE pi_no=VALUES(pi_no), date=VALUES(date), consignee=VALUES(consignee), total_fx=VALUES(total_fx), data_json=VALUES(data_json)");
                foreach ($data['proforma_invoices'] as $item) {
                    $pId = $item['id'] ?? ('pi-' . uniqid());
                    $pNo = $item['invNumber'] ?? $item['pi_no'] ?? '';
                    $pDate = $item['date'] ?? date('Y-m-d');
                    $consignee = $item['consignee'] ?? '';
                    $fx = floatval($item['amountFx'] ?? ($item['totalFx'] ?? 0));
                    $stmt->execute([$pId, $pNo, $pDate, $consignee, $fx, json_encode($item)]);
                    $untombstoneStmt->execute([$pId, $pNo]);
                }
                $restoredCounts['proforma_invoices'] = count($data['proforma_invoices']);
            }

            // 3. Commercial Invoices
            if (in_array('commercial_invoices', $selectedModules) && isset($data['commercial_invoices']) && is_array($data['commercial_invoices'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM commercial_invoices");
                }
                $stmt = $pdo->prepare("INSERT INTO commercial_invoices (id, ci_no, date, consignee, total_fx, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ci_no=VALUES(ci_no), date=VALUES(date), consignee=VALUES(consignee), total_fx=VALUES(total_fx), data_json=VALUES(data_json)");
                foreach ($data['commercial_invoices'] as $item) {
                    $cId = $item['id'] ?? ('ci-' . uniqid());
                    $cNo = $item['invNumber'] ?? $item['ci_no'] ?? '';
                    $cDate = $item['date'] ?? date('Y-m-d');
                    $consignee = $item['consignee'] ?? ($item['buyerName'] ?? '');
                    $fx = floatval($item['amountFx'] ?? ($item['totalFx'] ?? 0));
                    $stmt->execute([$cId, $cNo, $cDate, $consignee, $fx, json_encode($item)]);
                    $untombstoneStmt->execute([$cId, $cNo]);
                }
                $restoredCounts['commercial_invoices'] = count($data['commercial_invoices']);
            }

            // 4. Packing Lists
            if (in_array('packing_lists', $selectedModules) && isset($data['packing_lists']) && is_array($data['packing_lists'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM packing_lists");
                }
                $stmt = $pdo->prepare("INSERT INTO packing_lists (id, pkl_no, date, consignee, total_packages, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE pkl_no=VALUES(pkl_no), date=VALUES(date), consignee=VALUES(consignee), total_packages=VALUES(total_packages), data_json=VALUES(data_json)");
                foreach ($data['packing_lists'] as $item) {
                    $pkId = $item['id'] ?? ('pkl-' . uniqid());
                    $pkNo = $item['pklNo'] ?? $item['pkl_no'] ?? '';
                    $pkDate = $item['date'] ?? date('Y-m-d');
                    $consignee = $item['consignee'] ?? '';
                    $pkgs = intval($item['totalPackages'] ?? ($item['totalPkgs'] ?? 0));
                    $stmt->execute([$pkId, $pkNo, $pkDate, $consignee, $pkgs, json_encode($item)]);
                    $untombstoneStmt->execute([$pkId, $pkNo]);
                }
                $restoredCounts['packing_lists'] = count($data['packing_lists']);
            }

            // 5. BL Records
            if (in_array('bl_records', $selectedModules) && isset($data['bl_records']) && is_array($data['bl_records'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM bl_records");
                }
                $stmt = $pdo->prepare("INSERT INTO bl_records (id, rec_id, pi_no, booking_no, bl_type, shipping_line, data_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE rec_id=VALUES(rec_id), pi_no=VALUES(pi_no), booking_no=VALUES(booking_no), bl_type=VALUES(bl_type), shipping_line=VALUES(shipping_line), data_json=VALUES(data_json)");
                foreach ($data['bl_records'] as $item) {
                    $bId = $item['id'] ?? ('bl-' . uniqid());
                    $recId = $item['recId'] ?? $item['rec_id'] ?? $bId;
                    $piNo = $item['piNo'] ?? $item['pi_no'] ?? '';
                    $bkNo = $item['bookingNo'] ?? $item['booking_no'] ?? '';
                    $blType = $item['blType'] ?? 'Sea';
                    $line = $item['shippingLine'] ?? '';
                    $stmt->execute([$bId, $recId, $piNo, $bkNo, $blType, $line, json_encode($item)]);
                    $untombstoneStmt->execute([$bId, $piNo]);
                }
                $restoredCounts['bl_records'] = count($data['bl_records']);
            }

            // 6. Pre-Shipment Certificates
            if (in_array('pre_shipment_certificates', $selectedModules) && isset($data['pre_shipment_certificates']) && is_array($data['pre_shipment_certificates'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM pre_shipment_certificates");
                }
                $stmt = $pdo->prepare("INSERT INTO pre_shipment_certificates (id, cert_no, cert_type, invoice_no, issuing_authority, issue_date, expiry_date, file_name, file_size, status, data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cert_no=VALUES(cert_no), cert_type=VALUES(cert_type), invoice_no=VALUES(invoice_no), issuing_authority=VALUES(issuing_authority), issue_date=VALUES(issue_date), expiry_date=VALUES(expiry_date), file_name=VALUES(file_name), file_size=VALUES(file_size), status=VALUES(status), data_json=VALUES(data_json)");
                foreach ($data['pre_shipment_certificates'] as $item) {
                    $cId = $item['id'] ?? ('cert-' . uniqid());
                    $cNo = $item['certName'] ?? ($item['certNo'] ?? ($item['cert_no'] ?? ''));
                    $cType = $item['certType'] ?? 'General';
                    $invNo = $item['invoiceNo'] ?? '';
                    $auth = $item['issuingAuthority'] ?? '';
                    $issDate = $item['issueDate'] ?? date('Y-m-d');
                    $expDate = $item['expiryDate'] ?? ($item['expiry_date'] ?? '');
                    $fName = $item['fileName'] ?? '';
                    $fSize = $item['fileSize'] ?? '';
                    $stat = $item['status'] ?? 'Valid';
                    $stmt->execute([$cId, $cNo, $cType, $invNo, $auth, $issDate, $expDate, $fName, $fSize, $stat, json_encode($item)]);
                    $untombstoneStmt->execute([$cId, $cNo]);
                }
                $restoredCounts['pre_shipment_certificates'] = count($data['pre_shipment_certificates']);
            }

            // 7. Masters & Settings (sync_store)
            if ((in_array('masters_and_settings', $selectedModules) || in_array('sync_store', $selectedModules)) && isset($data['sync_store']) && is_array($data['sync_store'])) {
                $stmtStore = $pdo->prepare("INSERT INTO erp_sync_store (key_name, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json=VALUES(data_json), updated_at=CURRENT_TIMESTAMP");
                $synCount = 0;
                foreach ($data['sync_store'] as $k => $v) {
                    if ($k === 'shipz_deleted_doc_ids' || $k === 'shipz_tombstones') continue;
                    $stmtStore->execute([$k, is_string($v) ? $v : json_encode($v)]);
                    $synCount++;
                }
                $restoredCounts['masters_and_settings'] = $synCount;
            }

            // 8. System Users
            if (in_array('system_users', $selectedModules) && isset($data['system_users']) && is_array($data['system_users'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM system_users");
                }
                $stmt = $pdo->prepare("INSERT INTO system_users (id, email, first_name, last_name, role_name, status, data_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email), first_name=VALUES(first_name), last_name=VALUES(last_name), role_name=VALUES(role_name), status=VALUES(status), data_json=VALUES(data_json)");
                foreach ($data['system_users'] as $item) {
                    $uId = $item['id'] ?? ('usr-' . uniqid());
                    $email = $item['email'] ?? ($uId . '@exportflow.internal');
                    $fn = $item['first_name'] ?? '';
                    $ln = $item['last_name'] ?? '';
                    $role = $item['role_name'] ?? 'Staff';
                    $status = $item['status'] ?? 'Active';
                    $stmt->execute([$uId, $email, $fn, $ln, $role, $status, json_encode($item)]);
                }
                $restoredCounts['system_users'] = count($data['system_users']);
            }

            // 9. Recent Activities
            if (in_array('recent_activities', $selectedModules) && isset($data['recent_activities']) && is_array($data['recent_activities'])) {
                if ($mode === 'replace') {
                    $pdo->exec("DELETE FROM recent_activities");
                }
                $stmt = $pdo->prepare("INSERT INTO recent_activities (id, type, title, badge, timestamp_iso, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), title=VALUES(title), badge=VALUES(badge), timestamp_iso=VALUES(timestamp_iso), data_json=VALUES(data_json)");
                foreach ($data['recent_activities'] as $item) {
                    $actId = $item['id'] ?? ('act-' . uniqid());
                    $type = $item['type'] ?? 'doc';
                    $title = $item['title'] ?? 'Document Action';
                    $badge = $item['badge'] ?? '';
                    $iso = $item['timestamp'] ?? date('c');
                    $stmt->execute([$actId, $type, $title, $badge, $iso, json_encode($item)]);
                }
                $restoredCounts['recent_activities'] = count($data['recent_activities']);
            }

            $pdo->commit();
            echo json_encode([
                'success'         => true,
                'mode'            => $mode,
                'restored_counts' => $restoredCounts,
                'message'         => 'Selected modules restored successfully.'
            ]);
            exit;
        } catch (\Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }

    // Delete a Server Snapshot
    if ($action === 'delete_server_backup') {
        $file = basename($input['filename'] ?? '');
        $path = __DIR__ . '/backups/' . $file;
        if ($file && file_exists($path)) {
            @unlink($path);
            echo json_encode(['success' => true, 'deleted' => $file]);
            exit;
        }
        echo json_encode(['success' => false, 'error' => 'File not found']);
        exit;
    }

    // Direct Record Deletion Action (Permanent Deletion from MySQL & Tombstone Broadcast)
    if ($action === 'delete_record') {
        $table = trim($input['table'] ?? '');
        $docId = trim($input['id'] ?? '');
        $altId = trim($input['alt_id'] ?? '');
        $deletedCount = 0;

        try {
            if ($table === 'quotations' || $table === 'shipz_quotations') {
                $stmt = $pdo->prepare("DELETE FROM quotations WHERE quotation_no = ? OR id = ? OR quotation_no = ?");
                $stmt->execute([$altId, $docId, $docId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_quotations', $docId, $altId, 'quotationNo');
            } else if ($table === 'proforma_invoices' || $table === 'shipz_proforma_invoices') {
                $stmt = $pdo->prepare("DELETE FROM proforma_invoices WHERE pi_no = ? OR id = ? OR pi_no = ?");
                $stmt->execute([$altId, $docId, $docId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_proforma_invoices', $docId, $altId, 'invNumber');
            } else if ($table === 'commercial_invoices' || $table === 'shipz_commercial_invoices') {
                $stmt = $pdo->prepare("DELETE FROM commercial_invoices WHERE ci_no = ? OR id = ? OR ci_no = ?");
                $stmt->execute([$altId, $docId, $docId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_commercial_invoices', $docId, $altId, 'invNumber');
            } else if ($table === 'packing_lists' || $table === 'shipz_packing_lists') {
                $stmt = $pdo->prepare("DELETE FROM packing_lists WHERE pkl_no = ? OR id = ? OR pkl_no = ?");
                $stmt->execute([$altId, $docId, $docId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_packing_lists', $docId, $altId, 'pklNo');
            } else if ($table === 'bl_records' || $table === 'shipz_bl_records') {
                $stmt = $pdo->prepare("DELETE FROM bl_records WHERE rec_id = ? OR id = ? OR rec_id = ?");
                $stmt->execute([$docId, $docId, $altId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_bl_records', $docId, $altId, 'piNo');
            } else if ($table === 'system_users' || $table === 'shipz_system_users_v2') {
                $stmt = $pdo->prepare("DELETE FROM system_users WHERE id = ? OR email = ?");
                $stmt->execute([$docId, $altId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_system_users_v2', $docId, $altId, 'email');
            } else if ($table === 'pre_shipment_certificates' || $table === 'shipz_pre_shipment_certificates') {
                $stmt = $pdo->prepare("DELETE FROM pre_shipment_certificates WHERE id = ? OR cert_no = ?");
                $stmt->execute([$docId, $altId]);
                $deletedCount += $stmt->rowCount();
                cleanSyncStoreArray($pdo, 'shipz_pre_shipment_certificates', $docId, $altId, 'certNo');
            }
            
            // Broadcast tombstone so other PCs automatically remove it on their next poll
            addTombstone($pdo, $docId, $altId);

            echo json_encode(['success' => true, 'table' => $table, 'deleted' => $deletedCount]);
            exit;
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }

    $key = $input['key'] ?? '';
    $data = $input['data'] ?? null;

    if ($key && $data !== null) {
        // 1. Always back up to erp_sync_store for universal network sharing
        $stmtStore = $pdo->prepare("INSERT INTO erp_sync_store (key_name, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = CURRENT_TIMESTAMP");
        $stmtStore->execute([$key, json_encode($data)]);

        // 2. Specialized relational table upserts
        if ($key === 'shipz_quotations' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO quotations (quotation_no, consignee, country, total_amount, status, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE consignee=VALUES(consignee), country=VALUES(country), total_amount=VALUES(total_amount), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $qNo = $item['quotationNo'] ?? ('QT-' . ($item['id'] ?? uniqid()));
                $consignee = $item['consignee'] ?? '';
                $country = $item['country'] ?? '';
                $total = floatval($item['totalAmount'] ?? $item['amount'] ?? 0);
                $status = $item['status'] ?? 'Draft';
                $stmt->execute([$qNo, $consignee, $country, $total, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_proforma_invoices' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO proforma_invoices (pi_no, consignee, country, total_amount, status, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE consignee=VALUES(consignee), country=VALUES(country), total_amount=VALUES(total_amount), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $piNo = $item['invNumber'] ?? $item['piNo'] ?? ('PI-' . ($item['id'] ?? uniqid()));
                $consignee = $item['consignee'] ?? '';
                $country = $item['country'] ?? '';
                $total = floatval($item['totalAmount'] ?? $item['amount'] ?? 0);
                $status = $item['status'] ?? 'Draft';
                $stmt->execute([$piNo, $consignee, $country, $total, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_commercial_invoices' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO commercial_invoices (ci_no, consignee, country, total_amount, status, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE consignee=VALUES(consignee), country=VALUES(country), total_amount=VALUES(total_amount), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $ciNo = $item['invNumber'] ?? ('CI-' . ($item['id'] ?? uniqid()));
                $consignee = $item['consignee'] ?? '';
                $country = $item['country'] ?? '';
                $total = floatval($item['totalAmount'] ?? $item['amount'] ?? 0);
                $status = $item['status'] ?? 'Finalized';
                $stmt->execute([$ciNo, $consignee, $country, $total, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_packing_lists' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO packing_lists (pkl_no, buyer_name, container_no, status, data_json) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE buyer_name=VALUES(buyer_name), container_no=VALUES(container_no), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $pklNo = $item['pklNo'] ?? ('PKL-' . ($item['id'] ?? uniqid()));
                $buyer = $item['buyerName'] ?? $item['consignee'] ?? '';
                $container = $item['containerNo'] ?? '';
                $status = $item['status'] ?? 'Draft';
                $stmt->execute([$pklNo, $buyer, $container, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_bl_records' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO bl_records (rec_id, pi_no, shipping_line, container_no, data_json) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE pi_no=VALUES(pi_no), shipping_line=VALUES(shipping_line), container_no=VALUES(container_no), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $rId = $item['id'] ?? ('BL-' . uniqid());
                $piNo = $item['piNo'] ?? '';
                $shipLine = $item['shippingLine'] ?? '';
                $container = $item['containerNo'] ?? '';
                $stmt->execute([$rId, $piNo, $shipLine, $container, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_system_users_v2' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO system_users (id, email, first_name, last_name, role_name, status, data_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email), first_name=VALUES(first_name), last_name=VALUES(last_name), role_name=VALUES(role_name), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $uId = $item['id'] ?? ('usr-' . uniqid());
                $email = $item['email'] ?? ($uId . '@exportflow.internal');
                $fn = $item['first_name'] ?? '';
                $ln = $item['last_name'] ?? '';
                $role = $item['role_name'] ?? 'Staff';
                $status = $item['status'] ?? 'Active';
                $stmt->execute([$uId, $email, $fn, $ln, $role, $status, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_recent_activities' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO recent_activities (id, type, title, badge, timestamp_iso, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), title=VALUES(title), badge=VALUES(badge), timestamp_iso=VALUES(timestamp_iso), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $actId = $item['id'] ?? ('act-' . uniqid());
                $type = $item['type'] ?? 'doc';
                $title = $item['title'] ?? 'Document Action';
                $badge = $item['badge'] ?? '';
                $iso = $item['timestamp'] ?? date('c');
                $stmt->execute([$actId, $type, $title, $badge, $iso, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        if ($key === 'shipz_pre_shipment_certificates' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO pre_shipment_certificates (id, cert_no, cert_type, invoice_no, issuing_authority, issue_date, expiry_date, file_name, file_size, status, data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cert_no=VALUES(cert_no), cert_type=VALUES(cert_type), invoice_no=VALUES(invoice_no), issuing_authority=VALUES(issuing_authority), issue_date=VALUES(issue_date), expiry_date=VALUES(expiry_date), file_name=VALUES(file_name), file_size=VALUES(file_size), status=VALUES(status), data_json=VALUES(data_json)");
            foreach ($data as $item) {
                $cId = $item['id'] ?? ('cert-' . uniqid());
                $cNo = $item['certNo'] ?? $item['cert_no'] ?? '';
                $cType = $item['certType'] ?? $item['cert_type'] ?? 'General';
                $invNo = $item['invoiceNo'] ?? $item['invoice_no'] ?? '';
                $auth = $item['issuingAuthority'] ?? $item['issuing_authority'] ?? '';
                $issDate = $item['issueDate'] ?? $item['issue_date'] ?? '';
                $expDate = $item['expiryDate'] ?? $item['expiry_date'] ?? '';
                $fName = $item['fileName'] ?? $item['file_name'] ?? '';
                $fSize = $item['fileSize'] ?? $item['file_size'] ?? '';
                $stat = $item['status'] ?? 'Valid';
                $stmt->execute([$cId, $cNo, $cType, $invNo, $auth, $issDate, $expDate, $fName, $fSize, $stat, json_encode($item)]);
            }
            echo json_encode(['success' => true, 'key' => $key, 'count' => count($data)]);
            exit;
        }

        // Single activity append helper
        if ($key === 'shipz_single_activity' && is_array($data)) {
            $stmt = $pdo->prepare("INSERT INTO recent_activities (id, type, title, badge, timestamp_iso, data_json) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), title=VALUES(title), badge=VALUES(badge), timestamp_iso=VALUES(timestamp_iso), data_json=VALUES(data_json)");
            $actId = $data['id'] ?? ('act-' . uniqid());
            $type = $data['type'] ?? 'doc';
            $title = $data['title'] ?? 'Document Action';
            $badge = $data['badge'] ?? '';
            $iso = $data['timestamp'] ?? date('c');
            $stmt->execute([$actId, $type, $title, $badge, $iso, json_encode($data)]);
            echo json_encode(['success' => true, 'activity_id' => $actId]);
            exit;
        }

        echo json_encode(['success' => true, 'key' => $key]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Missing key or data']);
    exit;
}
