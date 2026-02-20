-- Create Marketplace Items Table
CREATE TABLE IF NOT EXISTS tbl_marketplace_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, deleted, sold
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);

-- Create Marketplace Interest Table
CREATE TABLE IF NOT EXISTS tbl_marketplace_interest (
  interest_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES tbl_marketplace_items(item_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);
