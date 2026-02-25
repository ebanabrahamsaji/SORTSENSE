CREATE TABLE `tbl_center_messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sender_role` enum('ADMIN','CENTER') DEFAULT 'ADMIN',
  `sender_name` varchar(255) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `receiver_role` enum('ADMIN','CENTER') DEFAULT 'CENTER',
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `center_id` (`center_id`),
  CONSTRAINT `tbl_center_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `tbl_users` (`user_id`),
  CONSTRAINT `tbl_center_messages_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `tbl_collection_centers` (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci