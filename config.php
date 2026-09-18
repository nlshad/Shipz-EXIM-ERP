<?php
// ============================================================
// EXPORTFLOW ERP (SHIPZ) - DATABASE CONFIGURATION
// Configure your live cPanel / Hostinger / VPS / Cloud credentials here
// ============================================================

// DEFAULT CREDENTIALS (Local XAMPP / Fallback)
$DB_HOST = 'localhost';
$DB_NAME = 'shipz_db';        // Live cPanel example: 'cpaneluser_shipz_db'
$DB_USER = 'root';            // Live cPanel example: 'cpaneluser_shipz'
$DB_PASS = '';                // Live cPanel example: 'YourStrongPassword123!'
$DB_PORT = '3306';

// 1. Check for Environment Variables (Docker / Cloud Hosting / VPS)
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
