<?php
// ============================================================
// EXPORTFLOW ERP (SHIPZ) - DATABASE CONFIGURATION
// Smart Environment Detector (Hostinger Live vs Local XAMPP)
// ============================================================

// Detect if running on localhost or live hosting
$isLocalhost = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' ||
    strpos(($_SERVER['HTTP_HOST'] ?? ''), '127.0.0.1') !== false ||
    strpos(__DIR__, 'xamppfiles') !== false
);

if ($isLocalhost) {
    // Local XAMPP Environment
    $DB_HOST = 'localhost';
    $DB_NAME = 'shipz_db';
    $DB_USER = 'root';
    $DB_PASS = '';
    $DB_PORT = '3306';
} else {
    // Live Hostinger Production Server
    $DB_HOST = 'localhost';
    $DB_NAME = 'u291531043_shipz';
    $DB_USER = 'u291531043_shipz';
    $DB_PASS = '7p&dS#Xv?';
    $DB_PORT = '3306';
}

// 1. Check for Environment Variables (Override if set)
if (getenv('DB_HOST')) $DB_HOST = getenv('DB_HOST');
if (getenv('DB_NAME')) $DB_NAME = getenv('DB_NAME');
if (getenv('DB_USER')) $DB_USER = getenv('DB_USER');
if (getenv('DB_PASS') !== false) $DB_PASS = getenv('DB_PASS');
if (getenv('DB_PORT')) $DB_PORT = getenv('DB_PORT');

// 2. Check for local server config file (created via Web UI or manual edit)
$configFile = __DIR__ . '/db_config.json';
if (file_exists($configFile)) {
    $custom = json_decode(file_get_contents($configFile), true);
    if (is_array($custom)) {
        if (!empty($custom['db_host'])) $DB_HOST = trim($custom['db_host']);
        if (!empty($custom['db_name'])) $DB_NAME = trim($custom['db_name']);
        if (!empty($custom['db_user'])) $DB_USER = trim($custom['db_user']);
        if (isset($custom['db_pass']))  $DB_PASS = $custom['db_pass'];
        if (!empty($custom['db_port'])) $DB_PORT = trim($custom['db_port']);
    }
}
