USE sortsense_db;

-- 1. Modify Status ENUM to support new states
-- We use a safe procedure to check/modify modification since direct ALTER on ENUM can be strict
ALTER TABLE tbl_pickup_requests 
MODIFY COLUMN status ENUM(
    'Pending', 
    'Aggregation_Pending',
    'Ready_For_Dispatch', 
    'Scheduled', 
    'In_Transit', 
    'Completed', 
    'Auto_Rescheduled',
    'Cancelled'
) DEFAULT 'Aggregation_Pending';

-- 2. Add Priority Score and Scheduling columns
ALTER TABLE tbl_pickup_requests
ADD COLUMN priority_score INT DEFAULT 0,
ADD COLUMN scheduled_at TIMESTAMP NULL,
ADD COLUMN notes TEXT;

-- 3. Update existing 'Pending' to 'Aggregation_Pending' for consistency with new logic
UPDATE tbl_pickup_requests SET status = 'Aggregation_Pending' WHERE status = 'Pending';
