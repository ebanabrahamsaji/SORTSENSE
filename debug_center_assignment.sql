-- ============================================================
-- CENTER ASSIGNMENT DIAGNOSTIC QUERIES
-- Run these in your MySQL client to verify data linkage
-- Replace ? with your actual center_id (e.g., 1)
-- ============================================================

USE sortsense_db;

-- 1. Show all collection centers and their IDs
SELECT center_id, center_name, status, available_slots, latitude, longitude
FROM tbl_collection_centers
ORDER BY center_id;

-- 2. Show ALL pickup requests and their assigned center_id
SELECT request_id, user_id, center_id, waste_type, quantity, status, created_at
FROM tbl_pickup_requests
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count pickup requests per center
SELECT center_id, status, COUNT(*) AS total
FROM tbl_pickup_requests
GROUP BY center_id, status
ORDER BY center_id, status;

-- 4. Check if center_id column exists in tbl_pickup_requests
DESCRIBE tbl_pickup_requests;

-- 5. Show ALL special waste requests and their assigned center_id
SELECT request_id, user_id, center_id, category, status, assignment_status, created_at
FROM tbl_special_waste_requests
ORDER BY created_at DESC
LIMIT 20;

-- 6. Check if center_id column exists in tbl_special_waste_requests
DESCRIBE tbl_special_waste_requests;

-- 7. Count special waste per center
SELECT center_id, status, COUNT(*) AS total
FROM tbl_special_waste_requests
GROUP BY center_id, status
ORDER BY center_id, status;

-- 8. Show center notifications (what the bell shows)
SELECT id, center_id, type, title, LEFT(message,60) AS msg, is_read, created_at
FROM tbl_center_notifications
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- TEST QUERIES (replace 1 with your actual center_id)
-- ============================================================

-- A. Pickup requests this center would see in Active tab
SELECT r.request_id, r.center_id, r.waste_type, r.quantity, r.status,
       u.name AS user_name, r.created_at
FROM tbl_pickup_requests r
JOIN tbl_users u ON r.user_id = u.user_id
WHERE r.center_id = 1
  AND r.status NOT IN ('Completed', 'Rejected', 'Cancelled')
ORDER BY r.created_at DESC;

-- B. Pickup history this center would see in History tab
SELECT r.request_id, r.center_id, r.waste_type, r.quantity, r.status,
       u.name AS user_name, r.created_at
FROM tbl_pickup_requests r
JOIN tbl_users u ON r.user_id = u.user_id
WHERE r.center_id = 1
  AND r.status IN ('Completed', 'Rejected', 'Cancelled')
ORDER BY r.created_at DESC
LIMIT 50;

-- C. Special waste this center would see
SELECT r.request_id, r.center_id, r.category, r.quantity_value, r.status,
       u.name AS user_name, r.created_at
FROM tbl_special_waste_requests r
JOIN tbl_users u ON r.user_id = u.user_id
WHERE r.center_id = 1
  AND r.status IN ('Approved', 'Scheduled', 'Completed')
ORDER BY r.created_at DESC;
