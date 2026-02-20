-- Add Monthly Points to Users
ALTER TABLE tbl_users ADD COLUMN monthly_points INT DEFAULT 0;

-- Create Challenges Table
CREATE TABLE IF NOT EXISTS tbl_challenges (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  target INT,
  reward_points INT,
  type VARCHAR(50), -- scan, pickup, recycle
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User Challenge Progress Table
CREATE TABLE IF NOT EXISTS tbl_user_challenges (
  user_challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  challenge_id INT,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES tbl_challenges(challenge_id) ON DELETE CASCADE
);

-- Seed Initial Challenges
INSERT INTO tbl_challenges (title, description, target, reward_points, type) 
SELECT 'Plastic Scanner', 'Scan 5 plastic items', 5, 50, 'scan'
WHERE NOT EXISTS (SELECT * FROM tbl_challenges WHERE title = 'Plastic Scanner');

INSERT INTO tbl_challenges (title, description, target, reward_points, type) 
SELECT 'First Pickup', 'Request a pickup', 1, 30, 'pickup'
WHERE NOT EXISTS (SELECT * FROM tbl_challenges WHERE title = 'First Pickup');

INSERT INTO tbl_challenges (title, description, target, reward_points, type) 
SELECT 'Recycle Hero', 'Complete 10 eco-actions', 10, 80, 'recycle'
WHERE NOT EXISTS (SELECT * FROM tbl_challenges WHERE title = 'Recycle Hero');
