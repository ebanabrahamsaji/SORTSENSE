-- Database Schema for SortSense

CREATE DATABASE IF NOT EXISTS sortsense_db;
USE sortsense_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS tbl_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    language_pref ENUM('ENGLISH', 'MALAYALAM') DEFAULT 'ENGLISH',
    green_score INT DEFAULT 0,
    leaderboard_rank INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS tbl_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 3. Waste Items Table
CREATE TABLE IF NOT EXISTS tbl_waste_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category_id INT,
    disposal_guideline TEXT,
    safety_instructions TEXT,
    FOREIGN KEY (category_id) REFERENCES tbl_categories(category_id) ON DELETE SET NULL
);

-- 4. Item Images Table
CREATE TABLE IF NOT EXISTS tbl_item_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    uploaded_by INT,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES tbl_waste_items(item_id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES tbl_users(user_id) ON DELETE SET NULL
);

-- 5. Collection Centers Table
CREATE TABLE IF NOT EXISTS tbl_collection_centers (
    center_id INT AUTO_INCREMENT PRIMARY KEY,
    center_name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    notes TEXT
);

-- 6. Accepted Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS tbl_accepted_categories (
    center_id INT,
    category_id INT,
    PRIMARY KEY (center_id, category_id),
    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tbl_categories(category_id) ON DELETE CASCADE
);
