
ALTER TABLE tbl_users ADD COLUMN status ENUM('active', 'inactive', 'banned') DEFAULT 'active';
