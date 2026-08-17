-- ============================================================
-- EXPORTFLOW ERP (SHIPZ) - MYSQL DATABASE SCHEMA
-- For XAMPP / MariaDB / MySQL Server
-- ============================================================

CREATE DATABASE IF NOT EXISTS `shipz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shipz_db`;

-- 1. Quotations Table
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

-- 2. Proforma Invoices Table
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

-- 3. Customers / Buyers Master Table
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

-- 4. Consignees Master Table
CREATE TABLE IF NOT EXISTS `consignees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `country` VARCHAR(100),
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Products Master Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `hsn` VARCHAR(50),
  `unit` VARCHAR(50),
  `price` DECIMAL(12,2) DEFAULT 0.00,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bank Accounts Master Table
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `swift_code` VARCHAR(50),
  `ifsc_code` VARCHAR(50),
  `branch_name` VARCHAR(255),
  `data_json` LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Bill of Lading (BL) Drafts Table
CREATE TABLE IF NOT EXISTS `bl_drafts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bl_no` VARCHAR(100) UNIQUE,
  `pi_no` VARCHAR(100),
  `consignee` VARCHAR(255),
  `data_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Packing Lists Table
CREATE TABLE IF NOT EXISTS `packing_lists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pkl_no` VARCHAR(100) UNIQUE,
  `pi_no` VARCHAR(100),
  `consignee` VARCHAR(255),
  `data_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
