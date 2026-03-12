-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2026 at 11:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sortsense_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `center_messages`
--

CREATE TABLE `center_messages` (
  `id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `sender_role` varchar(20) DEFAULT NULL,
  `sender_name` varchar(100) DEFAULT NULL,
  `message_text` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `sender_id` int(11) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `receiver_role` enum('ADMIN','CENTER') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_accepted_categories`
--

CREATE TABLE `tbl_accepted_categories` (
  `center_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_accepted_categories`
--

INSERT INTO `tbl_accepted_categories` (`center_id`, `category_id`) VALUES
(616, 5),
(617, 1),
(617, 2),
(617, 3),
(617, 5),
(617, 6),
(617, 50),
(618, 1),
(618, 2),
(618, 3),
(618, 4),
(618, 5),
(618, 6),
(618, 7),
(619, 4),
(620, 5),
(621, 1),
(621, 2),
(621, 3),
(621, 5),
(621, 6),
(621, 50),
(622, 7),
(623, 1),
(623, 2),
(623, 4),
(623, 5),
(623, 6),
(623, 50),
(624, 1),
(624, 4),
(624, 5),
(624, 6),
(624, 50),
(625, 1),
(625, 2),
(625, 4),
(625, 5),
(625, 6),
(625, 50),
(626, 1),
(626, 2),
(626, 3),
(626, 4),
(626, 5),
(626, 6),
(626, 7),
(627, 1),
(627, 2),
(627, 3),
(627, 5),
(627, 6),
(627, 50),
(628, 7),
(629, 1),
(629, 4),
(629, 6),
(629, 7),
(630, 7),
(631, 1),
(631, 2),
(631, 3),
(631, 5),
(631, 6),
(631, 50),
(632, 4),
(633, 1),
(634, 4),
(635, 5),
(636, 1),
(636, 2),
(636, 3),
(636, 4),
(636, 5),
(636, 6),
(636, 7),
(637, 1),
(637, 2),
(637, 3),
(637, 5),
(637, 6),
(638, 5),
(639, 5),
(640, 5),
(641, 1),
(641, 2),
(641, 3),
(641, 5),
(641, 6),
(642, 7),
(643, 5),
(644, 5),
(645, 1),
(645, 4),
(645, 5),
(645, 6),
(645, 50),
(646, 1),
(646, 4),
(646, 5),
(646, 6),
(646, 50),
(647, 1),
(647, 2),
(647, 3),
(647, 5),
(647, 6),
(647, 50),
(648, 5),
(649, 1),
(649, 4),
(649, 6),
(649, 7),
(650, 1),
(651, 1),
(651, 2),
(651, 3),
(651, 5),
(651, 6),
(651, 50),
(652, 4),
(653, 5),
(654, 1),
(654, 2),
(654, 3),
(654, 5),
(654, 6),
(654, 50),
(655, 1),
(655, 2),
(655, 4),
(655, 5),
(655, 6),
(655, 50),
(656, 1),
(656, 2),
(656, 3),
(656, 5),
(656, 6),
(656, 50),
(657, 5),
(658, 1),
(658, 2),
(658, 3),
(658, 5),
(658, 6),
(658, 50),
(659, 5),
(660, 7),
(661, 50),
(662, 50),
(663, 4),
(664, 1),
(664, 4),
(664, 5),
(664, 6),
(664, 50),
(665, 1),
(665, 4),
(665, 6),
(665, 7),
(666, 1),
(666, 2),
(666, 3),
(666, 5),
(666, 6),
(666, 50),
(667, 7),
(668, 1),
(668, 2),
(668, 3),
(668, 5),
(668, 6),
(669, 1),
(669, 4),
(669, 6),
(669, 7),
(670, 3),
(671, 1),
(672, 1),
(672, 4),
(672, 6),
(672, 7),
(673, 7),
(674, 1),
(674, 2),
(674, 3),
(674, 5),
(674, 6),
(674, 50),
(675, 1),
(675, 2),
(675, 3),
(675, 5),
(675, 6),
(676, 5),
(677, 1),
(677, 2),
(677, 3),
(677, 5),
(677, 6),
(677, 50),
(678, 1),
(678, 2),
(678, 3),
(678, 5),
(678, 6),
(678, 50),
(679, 5),
(680, 7),
(681, 4),
(682, 1),
(682, 4),
(682, 6),
(682, 7),
(683, 1),
(684, 1),
(684, 2),
(684, 3),
(684, 4),
(684, 5),
(684, 6),
(684, 7),
(685, 7),
(686, 1),
(686, 2),
(686, 3),
(686, 5),
(686, 6),
(686, 50),
(687, 1),
(687, 4),
(687, 6),
(687, 7),
(688, 1),
(689, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin_audit_logs`
--

CREATE TABLE `tbl_admin_audit_logs` (
  `log_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_admin_audit_logs`
--

INSERT INTO `tbl_admin_audit_logs` (`log_id`, `admin_id`, `action_type`, `target_type`, `target_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'DELETE_USER', 'USER', '16', 'Deleted user donshaji2028@mca.ajce.in', NULL, '2026-02-01 12:13:27'),
(2, 1, 'CREATE_USER', 'USER', '17', 'Created user donshaji2028@mca.ajce.in with role USER', NULL, '2026-02-01 12:14:01'),
(3, 1, 'DELETE_USER', 'USER', '15', 'Deleted user kevindaniel2028@mca.ajce.in', NULL, '2026-02-01 12:14:26'),
(4, 1, 'DELETE_USER', 'USER', '11', 'Deleted user mathewwilson2028@mca.ajce.in', NULL, '2026-02-01 12:15:06'),
(5, 1, 'CREATE_USER', 'USER', '18', 'Created user mathewwilson2028@mca.ajce.in with role USER', NULL, '2026-02-01 12:16:00'),
(6, 1, 'CREATE_USER', 'USER', '19', 'Created user krishnavenirnair@mca.ajce.in with role USER', NULL, '2026-02-01 14:25:00'),
(7, 1, 'DELETE_USER', 'USER', '8', 'Deleted user ebanabrahamsaji2028@mca.ajce.in', NULL, '2026-02-01 14:25:58'),
(11, 1, 'DELETE_USER', 'USER', '1', 'Deleted user ebanabraham52@gmail.com', NULL, '2026-02-02 10:15:48'),
(12, 1, 'CREATE_USER', 'USER', '22', 'Created user kevindaniel2028@mca.ajce.in with role USER', NULL, '2026-02-02 13:07:42'),
(13, 1, 'DELETE_USER', 'USER', '21', 'Deleted user ebanabraham52@gmail.com', NULL, '2026-02-04 15:04:37'),
(14, 1, 'CREATE_USER', 'USER', '27', 'Created user centerk@sortsense.com with role CENTER_ADMIN', NULL, '2026-02-17 08:55:40'),
(15, 1, 'DELETE_USER', 'USER', '4', 'Deleted user user@sortsense.com', NULL, '2026-03-06 06:37:22'),
(16, 1, 'DELETE_USER', 'USER', '30', 'Deleted user testuser_1772729397039@example.com', NULL, '2026-03-06 06:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin_notifications`
--

CREATE TABLE `tbl_admin_notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_admin_notifications`
--

INSERT INTO `tbl_admin_notifications` (`id`, `type`, `title`, `message`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 'OFFLINE_ALERT', 'Center Forced Closure', 'Center \"HKS\" was automatically closed due to 12h of inactivity. Please verify session status.', 696, 1, '2026-02-23 09:35:52'),
(2, 'WASTE', 'New Pickup Request', 'User 26 requested a pickup for Plastic (25kg).', 61, 1, '2026-02-25 10:03:59'),
(3, 'WASTE', 'New Special Waste Request', 'User 26 requested Hazardous (10 kg).', 6, 1, '2026-02-25 10:22:31'),
(4, 'MESSAGE', 'Message from Center', 'HKS Kanjirapally sent a message: \"yes...\"', 690, 1, '2026-02-26 22:05:04'),
(5, 'MESSAGE', 'Message from Center', 'HKS Kanjirapally sent a message: \"hi...\"', 690, 1, '2026-02-28 08:52:25'),
(6, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Organic(10kg).', 62, 1, '2026-03-01 15:26:30'),
(7, 'WASTE', 'New Pickup Request', 'User 4 requested a pickup for Plastic(6kg).', 63, 1, '2026-03-01 16:26:22'),
(8, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Paper (5kg).', 64, 1, '2026-03-02 15:19:23'),
(9, 'MESSAGE', 'Message from Center', 'HKS Kanjirapally sent a message: \"hi...\"', 690, 1, '2026-03-05 13:46:06'),
(10, 'WASTE', 'New Special Waste Request', 'User 25 requested E-waste (50 items).', 7, 1, '2026-03-05 13:51:29'),
(11, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Metal (19kg).', 65, 1, '2026-03-05 14:13:07'),
(12, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 67, 1, '2026-03-05 14:35:08'),
(13, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 68, 1, '2026-03-05 15:32:05'),
(14, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 69, 1, '2026-03-05 15:32:05'),
(15, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 70, 1, '2026-03-05 15:32:05'),
(16, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 71, 1, '2026-03-05 15:32:25'),
(17, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 72, 1, '2026-03-05 15:32:25'),
(18, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 73, 1, '2026-03-05 15:32:25'),
(19, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 74, 1, '2026-03-05 15:33:17'),
(20, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 75, 1, '2026-03-05 15:33:17'),
(21, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 76, 1, '2026-03-05 15:33:17'),
(22, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 77, 1, '2026-03-05 15:34:12'),
(23, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 78, 1, '2026-03-05 15:34:12'),
(24, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (10kg).', 79, 1, '2026-03-05 15:34:12'),
(25, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 80, 1, '2026-03-05 15:35:24'),
(26, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 81, 1, '2026-03-05 15:35:24'),
(27, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 82, 1, '2026-03-05 15:35:24'),
(28, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 83, 1, '2026-03-05 15:36:21'),
(29, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 84, 1, '2026-03-05 15:36:21'),
(30, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 85, 1, '2026-03-05 15:36:21'),
(31, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 86, 1, '2026-03-05 15:37:58'),
(32, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 87, 1, '2026-03-05 15:37:58'),
(33, 'WASTE', 'New Pickup Request', 'User 2 requested a pickup for Plastic (1kg).', 88, 1, '2026-03-05 15:37:58'),
(34, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Plastic (10kg).', 89, 1, '2026-03-05 16:09:16'),
(35, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Plastic (12kg).', 90, 1, '2026-03-05 19:18:31'),
(36, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Plastic (13kg).', 91, 1, '2026-03-05 20:52:49'),
(37, 'MESSAGE', 'Message from Center', 'HKS Kanjirapally sent a message: \"hi...\"', 699, 1, '2026-03-06 08:27:23'),
(38, 'WASTE', 'New Pickup Request', 'User 80 requested a pickup for Plastic (10kg).', 92, 0, '2026-03-09 22:36:23'),
(39, 'WASTE', 'New Pickup Request', 'User 83 requested a pickup for Plastic (10kg).', 93, 0, '2026-03-09 22:38:23'),
(40, 'WASTE', 'New Pickup Request', 'User 90 requested a pickup for Plastic (10kg).', 94, 0, '2026-03-09 22:49:29'),
(41, 'WASTE', 'New Pickup Request', 'User 91 requested a pickup for Plastic (10kg).', 95, 0, '2026-03-09 22:51:19'),
(42, 'WASTE', 'New Pickup Request', 'User 92 requested a pickup for Plastic (10kg).', 96, 0, '2026-03-09 22:52:17'),
(43, 'MESSAGE', 'Message from Center', 'HKS Kanjirapally sent a message: \"hi...\"', 699, 1, '2026-03-12 06:54:14'),
(44, 'WASTE', 'New Pickup Request', 'User 25 requested a pickup for Plastic (12kg).', 97, 0, '2026-03-12 09:30:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_ai_performance_logs`
--

CREATE TABLE `tbl_ai_performance_logs` (
  `log_id` int(11) NOT NULL,
  `image_id` varchar(255) DEFAULT NULL,
  `predicted_category` varchar(100) DEFAULT NULL,
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `user_feedback` varchar(50) DEFAULT NULL,
  `processing_time_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_categories`
--

CREATE TABLE `tbl_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_categories`
--

INSERT INTO `tbl_categories` (`category_id`, `category_name`, `description`) VALUES
(1, 'Plastic', 'All types of rigid and flexible plastics, bottles, and wrappers.'),
(2, 'Glass', 'Bottles, jars, and broken glass.'),
(3, 'Metal', 'Cans, foils, and metal scraps.'),
(4, 'Organic', 'Food waste, vegetable peels, and biodegradable matter.'),
(5, 'E-waste', 'Electronic gadgets, wires, batteries, and appliances.'),
(6, 'Paper', 'Newspapers, cardboard, and office paper.'),
(7, 'Hazardous', 'Medical waste, chemicals, and sanitary waste.'),
(50, 'Textile', 'Old clothes, fabric scraps, and donation items.');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_center_messages`
--

CREATE TABLE `tbl_center_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `center_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sender_role` enum('ADMIN','CENTER') DEFAULT 'ADMIN',
  `sender_name` varchar(255) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `receiver_role` enum('ADMIN','CENTER') DEFAULT 'CENTER',
  `delivery_status` enum('sent','pending','delivered','read') DEFAULT 'sent',
  `sent_time` datetime DEFAULT current_timestamp(),
  `delivered_time` datetime DEFAULT NULL,
  `read_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_center_messages`
--

INSERT INTO `tbl_center_messages` (`message_id`, `sender_id`, `center_id`, `message_text`, `is_read`, `created_at`, `sender_role`, `sender_name`, `receiver_id`, `receiver_role`, `delivery_status`, `sent_time`, `delivered_time`, `read_time`) VALUES
(2, 2, 694, 'Hello Center 694', 0, '2026-02-22 13:55:06', 'ADMIN', 'Administrator', NULL, 'CENTER', 'sent', '2026-02-24 21:19:42', NULL, NULL),
(3, 2, 696, 'open center', 1, '2026-02-23 04:53:35', 'ADMIN', 'Administrator', NULL, 'CENTER', 'sent', '2026-02-24 21:19:42', NULL, NULL),
(24, 1, 1, 'Test Message', 0, '2026-02-23 05:27:03', 'CENTER', 'Test Center', 0, 'ADMIN', 'sent', '2026-02-24 21:19:42', NULL, NULL),
(25, 696, 696, 'yes', 1, '2026-02-23 05:30:42', 'CENTER', 'hkskanjirapally', 0, 'ADMIN', 'sent', '2026-02-24 21:19:42', NULL, NULL),
(26, 2, 690, 'hi', 1, '2026-02-26 02:38:44', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-02-26 08:08:44', NULL, '2026-02-26 22:04:58'),
(27, 2, 690, 'opened center', 1, '2026-02-26 02:39:59', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-02-26 08:09:59', NULL, '2026-02-26 22:04:58'),
(28, 2, 690, 'hi', 1, '2026-02-26 03:06:20', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-02-26 08:36:20', NULL, '2026-02-26 22:04:58'),
(29, 690, 690, 'yes', 0, '2026-02-26 16:35:04', 'CENTER', 'HKS Kanjirapally', 2, 'ADMIN', 'sent', '2026-02-26 22:05:04', NULL, NULL),
(30, 2, 690, 'ok', 1, '2026-02-26 16:41:45', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-02-26 22:11:45', NULL, '2026-02-26 22:11:50'),
(31, 2, 690, 'hi', 1, '2026-02-28 03:22:01', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-02-28 08:52:01', NULL, '2026-02-28 08:52:08'),
(32, 690, 690, 'hi', 0, '2026-02-28 03:22:25', 'CENTER', 'HKS Kanjirapally', 2, 'ADMIN', 'sent', '2026-02-28 08:52:25', NULL, NULL),
(33, 2, 690, 'hi\n', 1, '2026-03-03 05:14:30', 'ADMIN', 'Administrator', 690, 'CENTER', 'read', '2026-03-03 10:44:30', NULL, '2026-03-03 10:53:17'),
(34, 690, 690, 'hi', 0, '2026-03-05 08:16:06', 'CENTER', 'HKS Kanjirapally', 2, 'ADMIN', 'sent', '2026-03-05 13:46:06', NULL, NULL),
(35, 2, 690, 'hi', 0, '2026-03-06 02:54:35', 'ADMIN', 'Administrator', 690, 'CENTER', 'pending', '2026-03-06 08:24:35', NULL, NULL),
(36, 2, 699, 'hi', 1, '2026-03-06 02:57:13', 'ADMIN', 'Administrator', 699, 'CENTER', 'read', '2026-03-06 08:27:13', NULL, '2026-03-06 08:27:19'),
(37, 699, 699, 'hi', 0, '2026-03-06 02:57:23', 'CENTER', 'HKS Kanjirapally', 2, 'ADMIN', 'sent', '2026-03-06 08:27:23', NULL, NULL),
(38, 699, 699, 'hi', 0, '2026-03-12 01:24:13', 'CENTER', 'HKS Kanjirapally', 2, 'ADMIN', 'sent', '2026-03-12 06:54:13', NULL, NULL),
(39, 2, 699, 'hi\n', 1, '2026-03-12 01:25:30', 'ADMIN', 'Administrator', 699, 'CENTER', 'read', '2026-03-12 06:55:30', NULL, '2026-03-12 07:00:40');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_center_notifications`
--

CREATE TABLE `tbl_center_notifications` (
  `id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_center_notifications`
--

INSERT INTO `tbl_center_notifications` (`id`, `center_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(2, 646, 'PICKUP', 'Special Waste Assigned', 'A Hazardous request (#6) has been Approved and assigned to you.', 0, '2026-02-25 04:53:23'),
(8, 664, 'PICKUP', 'New Pickup #62 ', '🆕 New pickup request #62 assigned. | Type: Organic  | Qty: 10 kg | Location: kanjirapally || SLOT:Evening ', 0, '2026-03-01 09:56:30'),
(9, 616, 'PICKUP', 'New Pickup #63 ', '🆕 New pickup request #63 assigned. | Type: Plastic  | Qty: 6 kg | Location: Some address, Kochi, Kerala ', 0, '2026-03-01 10:56:22'),
(10, 658, 'PICKUP', 'New Pickup assigned', 'New request #64 for Paper assigned to your center.', 0, '2026-03-02 09:49:23'),
(11, 648, 'MESSAGE', 'Message for Pickup #49', 'A user sent a message regarding their pickup request.', 0, '2026-03-02 10:19:53'),
(12, 648, 'MESSAGE', 'Message for Pickup #49', 'A user sent a message regarding their pickup request.', 0, '2026-03-02 10:20:46'),
(13, 648, 'MESSAGE', 'Message for Pickup #49', 'A user sent a message regarding their pickup request.', 0, '2026-03-02 10:39:20'),
(16, 664, 'PICKUP', 'New Pickup assigned', 'New request #65 for Metal assigned to your center.', 0, '2026-03-05 08:43:07'),
(18, 647, 'PICKUP', 'Request Completed', 'Request #59 for Metal marked as Completed.', 0, '2026-03-05 08:44:08'),
(19, 646, 'PICKUP', 'New Pickup assigned', 'New request #67 for Plastic assigned to your center.', 0, '2026-03-05 09:05:08'),
(20, 646, 'PICKUP', 'New Pickup assigned', 'New request #68 for Plastic assigned to your center.', 0, '2026-03-05 10:02:05'),
(21, 636, 'PICKUP', 'New Pickup assigned', 'New request #69 for Plastic assigned to your center.', 0, '2026-03-05 10:02:05'),
(22, 664, 'PICKUP', 'New Pickup assigned', 'New request #70 for Plastic assigned to your center.', 0, '2026-03-05 10:02:05'),
(23, 646, 'PICKUP', 'New Pickup assigned', 'New request #71 for Plastic assigned to your center.', 0, '2026-03-05 10:02:25'),
(24, 636, 'PICKUP', 'New Pickup assigned', 'New request #72 for Plastic assigned to your center.', 0, '2026-03-05 10:02:25'),
(25, 654, 'PICKUP', 'New Pickup assigned', 'New request #73 for Plastic assigned to your center.', 0, '2026-03-05 10:02:25'),
(26, 646, 'PICKUP', 'New Pickup assigned', 'New request #74 for Plastic assigned to your center.', 0, '2026-03-05 10:03:17'),
(27, 636, 'PICKUP', 'New Pickup assigned', 'New request #75 for Plastic assigned to your center.', 0, '2026-03-05 10:03:17'),
(28, 654, 'PICKUP', 'New Pickup assigned', 'New request #76 for Plastic assigned to your center.', 0, '2026-03-05 10:03:17'),
(29, 646, 'PICKUP', 'New Pickup assigned', 'New request #77 for Plastic assigned to your center.', 0, '2026-03-05 10:04:12'),
(30, 636, 'PICKUP', 'New Pickup assigned', 'New request #78 for Plastic assigned to your center.', 0, '2026-03-05 10:04:12'),
(31, 654, 'PICKUP', 'New Pickup assigned', 'New request #79 for Plastic assigned to your center.', 0, '2026-03-05 10:04:12'),
(32, 646, 'PICKUP', 'New Pickup assigned', 'New request #80 for Plastic assigned to your center.', 0, '2026-03-05 10:05:24'),
(33, 636, 'PICKUP', 'New Pickup assigned', 'New request #81 for Plastic assigned to your center.', 0, '2026-03-05 10:05:24'),
(34, 654, 'PICKUP', 'New Pickup assigned', 'New request #82 for Plastic assigned to your center.', 0, '2026-03-05 10:05:24'),
(35, 646, 'PICKUP', 'New Pickup assigned', 'New request #83 for Plastic assigned to your center.', 0, '2026-03-05 10:06:21'),
(36, 636, 'PICKUP', 'New Pickup assigned', 'New request #84 for Plastic assigned to your center.', 0, '2026-03-05 10:06:21'),
(37, 654, 'PICKUP', 'New Pickup assigned', 'New request #85 for Plastic assigned to your center.', 0, '2026-03-05 10:06:21'),
(38, 646, 'PICKUP', 'New Pickup assigned', 'New request #86 for Plastic assigned to your center.', 0, '2026-03-05 10:07:58'),
(39, 636, 'PICKUP', 'New Pickup assigned', 'New request #87 for Plastic assigned to your center.', 0, '2026-03-05 10:07:58'),
(40, 654, 'PICKUP', 'New Pickup assigned', 'New request #88 for Plastic assigned to your center.', 0, '2026-03-05 10:07:58'),
(41, 646, 'PICKUP', 'New Pickup assigned', 'New request #89 for Plastic assigned to your center.', 0, '2026-03-05 10:39:16'),
(42, 654, 'PICKUP', 'New Pickup assigned', 'New request #90 for Plastic assigned to your center.', 0, '2026-03-05 13:48:31'),
(45, 699, 'ALERT', 'New Message from Admin', 'You have a new message: \"hi...\"', 1, '2026-03-06 02:57:13'),
(46, 646, 'PICKUP', 'Special Waste Assigned', 'A E-waste request (#7) has been Approved and assigned to you.', 0, '2026-03-06 04:21:48'),
(47, 699, 'PICKUP', 'Special Waste Assigned', 'A Festival request (#4) has been Completed and assigned to you.', 1, '2026-03-06 04:25:52'),
(48, 699, 'PICKUP', 'Special Waste Assigned', 'A Bulk request (#5) has been Completed and assigned to you.', 1, '2026-03-06 04:25:54'),
(49, 699, 'PICKUP', 'Special Waste Assigned', 'A Festival request (#4) has been Completed and assigned to you.', 1, '2026-03-06 04:48:50'),
(50, 696, 'PICKUP', 'New Pickup assigned', 'New request #92 for Plastic assigned to your center.', 0, '2026-03-09 17:06:23'),
(51, 696, 'PICKUP', 'New Pickup assigned', 'New request #93 for Plastic assigned to your center.', 0, '2026-03-09 17:08:23'),
(52, 696, 'PICKUP', 'New Pickup assigned', 'New request #94 for Plastic assigned to your center.', 0, '2026-03-09 17:19:29'),
(53, 696, 'PICKUP', 'New Pickup assigned', 'New request #95 for Plastic assigned to your center.', 0, '2026-03-09 17:21:19'),
(54, 696, 'PICKUP', 'New Pickup assigned', 'New request #96 for Plastic assigned to your center.', 0, '2026-03-09 17:22:17'),
(55, 699, 'ALERT', 'New Message from Admin', 'You have a new message: \"hi\n...\"', 0, '2026-03-12 01:25:30'),
(56, 699, 'PICKUP', 'Request Completed', 'Request #91 for Plastic marked as Completed.', 0, '2026-03-12 03:59:10'),
(57, 699, 'PICKUP', 'New Pickup assigned', 'New request #97 for Plastic assigned to your center.', 0, '2026-03-12 04:00:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_challenges`
--

CREATE TABLE `tbl_challenges` (
  `challenge_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `target` int(11) DEFAULT NULL,
  `reward_points` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_challenges`
--

INSERT INTO `tbl_challenges` (`challenge_id`, `title`, `description`, `target`, `reward_points`, `type`, `active`, `created_at`) VALUES
(1, 'Plastic Scanner', 'Scan 5 plastic items', 5, 50, 'scan', 1, '2026-02-18 04:48:00'),
(2, 'First Pickup', 'Request a pickup', 1, 30, 'pickup', 1, '2026-02-18 04:48:00'),
(3, 'Recycle Hero', 'Complete 10 eco-actions', 10, 80, 'recycle', 1, '2026-02-18 04:48:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_collection_centers`
--

CREATE TABLE `tbl_collection_centers` (
  `center_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `center_name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(10) DEFAULT 'OPEN',
  `available_slots` int(11) DEFAULT 10,
  `max_slots` int(11) DEFAULT 10,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_logged_in` tinyint(1) DEFAULT 0,
  `last_active_at` timestamp NULL DEFAULT NULL,
  `current_operational_status` enum('OPEN','IDLE','CLOSED') DEFAULT 'CLOSED',
  `avg_response_time_minutes` float DEFAULT 0,
  `total_requests_handled` int(11) DEFAULT 0,
  `is_monitoring_hidden` tinyint(1) DEFAULT 0,
  `region` varchar(50) DEFAULT 'Kochi',
  `last_seen_at` datetime DEFAULT current_timestamp(),
  `last_request_at` datetime DEFAULT current_timestamp(),
  `avg_response_time` decimal(10,2) DEFAULT 0.00,
  `email` varchar(100) DEFAULT NULL,
  `center_status` enum('online','offline','idle') DEFAULT 'offline',
  `last_active_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `offline_since` datetime DEFAULT NULL,
  `center_performance_score` int(11) DEFAULT 100,
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` timestamp NULL DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_collection_centers`
--

INSERT INTO `tbl_collection_centers` (`center_id`, `username`, `password_hash`, `center_name`, `type`, `latitude`, `longitude`, `address`, `contact_person`, `phone`, `notes`, `status`, `available_slots`, `max_slots`, `is_primary`, `is_logged_in`, `last_active_at`, `current_operational_status`, `avg_response_time_minutes`, `total_requests_handled`, `is_monitoring_hidden`, `region`, `last_seen_at`, `last_request_at`, `avg_response_time`, `email`, `center_status`, `last_active_time`, `created_at`, `offline_since`, `center_performance_score`, `is_online`, `last_seen`, `location`) VALUES
(616, NULL, NULL, 'KELTRON E-waste Center', 'ewaste', 8.50850000, 76.95380000, 'Vellayambalam, TVM', 'Manager', NULL, 'State Govt e-waste collection.', 'OPEN', 9, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, '', NULL, '2026-02-24 20:25:23', '2026-02-25 12:06:53', 100, 0, '2026-02-25 05:22:34', 'trivandrum'),
(617, NULL, NULL, 'Trivandrum Scrap Market', 'scrap', 8.49800000, 76.94000000, 'Chala, TVM', 'Dealer', NULL, 'Mixed scrap buying.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(618, NULL, NULL, 'Trivandrum Smart Dump', 'general', 8.52410000, 76.93660000, 'Palayam, Trivandrum', 'Warden', NULL, 'General waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(619, NULL, NULL, 'Capital Bio-Compost', 'compost', 8.54500000, 76.92000000, 'Kesavadasapuram, TVM', 'Manager', NULL, 'Organic waste composting.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(620, NULL, NULL, 'Technopark E-Waste Hub', 'ewaste', 8.55810000, 76.88160000, 'Kazhakkoottam, TVM', 'Admin', NULL, 'IT park e-waste collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(621, NULL, NULL, 'City Scrap Traders TVM', 'scrap', 8.48750000, 76.94860000, 'Chala Market, TVM', 'Owner', NULL, 'Buys metal, paper, plastic.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(622, NULL, NULL, 'KIMS Bio-Medical Unit', 'hospital', 8.51260000, 76.90800000, 'Anayara, TVM', 'Safety Officer', NULL, 'Hazardous medical waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(623, NULL, NULL, 'Attingal Municipality MCF', 'mcf', 8.69580000, 76.81420000, 'Attingal, TVM', 'Health Inspector', NULL, 'Clean plastic collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(624, NULL, NULL, 'HKS Unit Trivandrum', 'hks', 8.52000000, 76.93000000, 'Trivandrum', 'Secretary', NULL, 'HKS Collection Point.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'trivandrum'),
(625, NULL, NULL, 'Kollam Corp MCF', 'mcf', 8.89320000, 76.61410000, 'Chinnakada, Kollam', 'Supervisor', NULL, 'Material Collection Facility.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'kollam'),
(626, NULL, NULL, 'Ashtamudi Waste Sol', 'general', 8.90000000, 76.58000000, 'Thoppilkadavu, Kollam', 'Manager', NULL, 'General waste processing.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'kollam'),
(627, NULL, NULL, 'Kollam Scrap Mart', 'scrap', 8.88000000, 76.60000000, 'Beach Road, Kollam', 'Dealer', NULL, 'Scrap buying center.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'kollam'),
(628, NULL, NULL, 'District Hospital Kollam', 'hospital', 8.88500000, 76.59000000, 'Kollam Town', 'RMO', NULL, 'Biomedical waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'kollam'),
(629, NULL, NULL, 'Pathanamthitta Clean City', 'municipality', 9.26480000, 76.78700000, 'Ring Road, Pathanamthitta', 'Coord', NULL, 'Municipal collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'pathanamthitta'),
(630, NULL, NULL, 'Tiruvalla Medical College', 'hospital', 9.38330000, 76.57410000, 'Tiruvalla', 'Admin', NULL, 'Hazardous waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'pathanamthitta'),
(631, NULL, NULL, 'Adoor Scrap Corner', 'scrap', 9.15280000, 76.73560000, 'Adoor Town', 'Owner', NULL, 'Metal and Plastic scrap.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'pathanamthitta'),
(632, NULL, NULL, 'Konni Eco-Point', 'organic', 9.23330000, 76.83330000, 'Konni', 'Forest Dept', NULL, 'Organic waste for compost.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'pathanamthitta'),
(633, NULL, NULL, 'Alappuzha Venice Clean', 'plastic', 9.49810000, 76.33880000, 'Alappuzha Beach', 'Volunteer', NULL, 'Plastic recycling.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'alappuzha'),
(634, NULL, NULL, 'Kuttanad Agri-Waste', 'organic', 9.41670000, 76.46670000, 'Kuttanad', 'Officer', NULL, 'Agricultural organic waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'alappuzha'),
(635, NULL, NULL, 'Cherthala E-Bin', 'kseb', 9.68330000, 76.33330000, 'Cherthala', 'KSEB', NULL, 'Electronics dropoff.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'alappuzha'),
(636, NULL, NULL, 'Kottayam Eco-Collection Hub', 'general', 9.59160000, 76.52220000, 'Kottayam Town', 'District Coord', NULL, 'Mixed waste.', 'OPEN', 3, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(637, NULL, NULL, 'Northamps Env Solutions', 'recycler', 9.59400000, 76.52500000, 'Muttambalam, Kottayam', 'Manager', NULL, 'Certified e-waste recycler.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(638, NULL, NULL, 'Techazar Electronics', 'electronics_shop', 9.58500000, 76.53000000, 'Kottayam Town', 'Owner', NULL, 'Electronics repair and scrap.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(639, NULL, NULL, 'Greenbhoomi Recyclers', 'ewaste', 9.60000000, 76.51000000, 'Kodimatha, Kottayam', 'Supervisor', NULL, 'Sustainable waste mgmt.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(640, NULL, NULL, 'E-Waste Kiliroor', 'ewaste', 9.62000000, 76.49000000, 'Kiliroor, Kottayam', 'Coordinator', NULL, 'Community collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(641, NULL, NULL, 'Spice Route Ventures', 'recycler', 9.57000000, 76.54000000, 'Kanjikuzhy, Kottayam', 'Director', NULL, 'E-waste processing.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(642, NULL, NULL, 'Kottayam Medical College', 'hospital', 9.61910000, 76.55400000, 'Gandhinagar, Kottayam', 'RMO', NULL, 'Medical waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(643, NULL, NULL, 'Erumely E-Waste Drop', 'ewaste', 9.47950000, 76.78650000, 'Erumely Town', 'Panchayat', NULL, 'E-waste bin.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(644, NULL, NULL, 'KSEB Section Office', 'kseb', 9.58000000, 76.52000000, 'Kottayam', 'Engineer', NULL, 'CFL/Battery drop.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(645, NULL, NULL, 'HKS Unit Kottayam', 'hks', 9.59000000, 76.52000000, 'Kottayam', 'Secretary', NULL, 'Haritha Karma Sena collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(646, NULL, NULL, 'HKS Kanjirapally (Secondary)', 'hks', 9.55860000, 76.78220000, 'Kanjirapally', 'Secretary', NULL, 'HKS Unit Kanjirapally.', 'CLOSED', 0, 10, 0, 0, '2026-02-23 06:02:38', 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, '', '2026-03-06 09:51:48', '2026-02-24 20:25:23', '2026-03-06 09:57:08', 100, 0, '2026-03-06 04:21:48', 'kanjirapally'),
(647, NULL, NULL, 'Kanjirapally Scrap Merchants', 'scrap', 9.55500000, 76.78500000, 'Kanjirapally Town', 'Owner', NULL, 'Buying e-waste and metal.', 'OPEN', 9, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, '', '2026-03-01 18:02:39', '2026-02-24 20:25:23', '2026-03-02 15:05:39', 50, 0, '2026-03-01 12:32:39', 'kanjirapally'),
(648, NULL, NULL, 'Amal Jyothi E-Waste Center', 'ewaste', 9.55450000, 76.82220000, 'Koovapally', 'Manager', NULL, 'E-waste collection for college.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 24978, 1, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 24978.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'kanjirapally'),
(649, NULL, NULL, 'Idukki Township Waste', 'municipality', 9.84940000, 76.97230000, 'Painavu, Idukki', 'Secretary', NULL, 'Township waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(650, NULL, NULL, 'Munnar Green Spot', 'plastic', 10.08890000, 77.05950000, 'Munnar', 'Tourism', NULL, 'Plastic bottle collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(651, NULL, NULL, 'Thodupuzha Scrap', 'scrap', 9.89580000, 76.71210000, 'Thodupuzha', 'Dealer', NULL, 'Recyclables.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(652, NULL, NULL, 'Kochi Corporation Bio-Plant', 'compost', 9.96920000, 76.27050000, 'Brahmapuram, Kochi', 'Officer', NULL, 'Large scale compost.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(653, NULL, NULL, 'Clean Kerala E-Waste Kochi', 'ewaste', 10.02700000, 76.30800000, 'Kalamassery, Kochi', 'Unit Head', NULL, 'Public e-waste sector.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(654, NULL, NULL, 'Kochi Scrap Dealers', 'scrap', 9.98000000, 76.28000000, 'Ernakulam North', 'Owner', NULL, 'Quick cash for e-waste.', 'OPEN', 3, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(655, NULL, NULL, 'CleanKerala MCF Edappally', 'mcf', 10.02670000, 76.30880000, 'Edappally Toll', 'Head', NULL, 'Plastic shredding.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(656, NULL, NULL, 'Rahul Scrap & Electronics', 'scrap', 10.03000000, 76.31000000, 'Edappally', 'Rahul', NULL, 'Scrap dealer.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(657, NULL, NULL, 'City Mobile & Laptop Care', 'electronics_shop', 9.97000000, 76.28000000, 'MG Road, Kochi', 'Tech', NULL, 'Dead electronics.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(658, NULL, NULL, 'Town Scrap Yard', 'scrap', 9.94000000, 76.26000000, 'Vyttila, Kochi', 'Owner', NULL, 'Buying scrap.', 'CLOSED', 0, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(659, NULL, NULL, 'Lulu Connect E-Bin', 'electronics_shop', 10.02700000, 76.30800000, 'Lulu Mall', 'Manager', NULL, 'E-waste dropoff.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(660, NULL, NULL, 'District General Hospital', 'hospital', 9.97000000, 76.28000000, 'Ernakulam', 'RMO', NULL, 'Hazardous waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(661, NULL, NULL, 'Hope Charity Foundation', 'charity', 9.96500000, 76.29000000, 'Palarivattom', 'Vol', NULL, 'Clothes donation.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(662, NULL, NULL, 'City Thrift Store', 'thrift', 10.01000000, 76.33000000, 'Kakkanad', 'Keeper', NULL, 'Thrift store.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(663, NULL, NULL, 'Aluva Market Waste', 'organic', 10.10760000, 76.35160000, 'Aluva', 'Market Sec', NULL, 'Organic waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(664, NULL, NULL, 'HKS Unit Kochi', 'hks', 9.97000000, 76.28000000, 'Kochi', 'Secretary', NULL, 'HKS Collection Point.', 'CLOSED', 0, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(665, NULL, NULL, 'Thrissur Corp Waste', 'municipality', 10.52760000, 76.21440000, 'Thrissur Round', 'Corp', NULL, 'Municipal waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(666, NULL, NULL, 'Sakthan Scrap Corner', 'scrap', 10.51800000, 76.21000000, 'Sakthan Stand', 'Owner', NULL, 'Iron and plastic.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(667, NULL, NULL, 'Amala Medical Waste', 'hospital', 10.56000000, 76.18000000, 'Amala Nagar', 'Safety', NULL, 'Biomedical.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(668, NULL, NULL, 'Chalakudy Plastic Unit', 'recycler', 10.30700000, 76.33500000, 'Chalakudy', 'Manager', NULL, 'Plastic recycling.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(669, NULL, NULL, 'Palakkad Clean Fort', 'municipality', 10.78670000, 76.65480000, 'Palakkad Fort Area', 'Auth', NULL, 'Public bins.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(670, NULL, NULL, 'Steel City Scrap', 'metal', 10.79000000, 76.66000000, 'Industrial Area', 'Manager', NULL, 'Metal scrap.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(671, NULL, NULL, 'Malampuzha Green', 'plastic', 10.83000000, 76.68000000, 'Malampuzha', 'Tourism', NULL, 'Plastic free zone.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(672, NULL, NULL, 'Malappuram Municipality', 'municipality', 11.05100000, 76.07110000, 'Malappuram Town', 'Health', NULL, 'General collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(673, NULL, NULL, 'Manjeri Medical Disposal', 'hospital', 11.12000000, 76.12000000, 'Manjeri', 'RMO', NULL, 'Hazardous.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(674, NULL, NULL, 'Tirur Scrap Yard', 'scrap', 10.91000000, 75.92000000, 'Tirur', 'Dealer', NULL, 'E-waste and metal.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(675, NULL, NULL, 'Kozhikode Recycling Unit', 'recycler', 11.25880000, 75.78040000, 'West Hill, Kozhikode', 'Manager', NULL, 'Plastic recycling.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(676, NULL, NULL, 'Kozhikode E-waste Recycler', 'ewaste', 11.27000000, 75.79000000, 'Nadakkavu, Kozhikode', 'Coordinator', NULL, 'Authorized e-waste center.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(677, NULL, NULL, 'Kozhikode Scrap Dealers', 'scrap', 11.25000000, 75.78500000, 'Big Bazaar, Calicut', 'Owner', NULL, 'We buy old computers.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(678, NULL, NULL, 'Mavoor Road Scrap', 'scrap', 11.26000000, 75.79000000, 'Mavoor Road', 'Owner', NULL, 'General scrap.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(679, NULL, NULL, 'Calicut E-Hub', 'ewaste', 11.25000000, 75.77000000, 'Beach Road', 'Vol', NULL, 'E-waste campaign.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(680, NULL, NULL, 'Baby Memorial Hazard', 'hospital', 11.27000000, 75.80000000, 'Kozhikode', 'Safety', NULL, 'Hospital waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(681, NULL, NULL, 'Kalpetta Green Shop', 'organic', 11.61030000, 76.08270000, 'Kalpetta', 'Kudumbashree', NULL, 'Organic and plastic.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(682, NULL, NULL, 'Sulthan Bathery Clean', 'municipality', 11.66670000, 76.26670000, 'Sulthan Bathery', 'Municipality', NULL, 'Town waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(683, NULL, NULL, 'Wayanad Eco-Resort', 'plastic', 11.65000000, 76.10000000, 'Vythiri', 'Manager', NULL, 'Plastic collection.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(684, NULL, NULL, 'Kannur Waste Sol', 'general', 11.87450000, 75.37040000, 'Kannur Town', 'Corp', NULL, 'Waste management.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(685, NULL, NULL, 'Pariyaram Generic', 'hospital', 12.05000000, 75.31000000, 'Pariyaram', 'RMO', NULL, 'Medical college waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(686, NULL, NULL, 'Thalassery Scrap', 'scrap', 11.75000000, 75.49000000, 'Thalassery', 'Dealer', NULL, 'Metal and E-waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(687, NULL, NULL, 'Kasaragod Town Clean', 'municipality', 12.51020000, 74.98520000, 'Kasaragod', 'Municipality', NULL, 'Town cleaning.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(688, NULL, NULL, 'Kanhangad Recycle', 'plastic', 12.31670000, 75.06670000, 'Kanhangad', 'Unit', NULL, 'Plastic shredding.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(689, NULL, NULL, 'Central University E-Bin', 'ewaste', 12.39000000, 75.09000000, 'Periye', 'Admin', NULL, 'University e-waste.', 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(691, NULL, NULL, 'MCF Erumely', 'Organic, Plastic', 9.47700000, 76.80200000, 'Temple Road, Erumely, Kerala', NULL, '9846000001', NULL, 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(692, NULL, NULL, 'Scrap Center Mundakayam', 'Metal, Glass, E-waste', 9.58300000, 76.88500000, 'NH183, Mundakayam, Kerala', NULL, '9846999999', NULL, 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(693, NULL, NULL, 'Pambady E-Waste Hub', 'E-waste, Hazardous', 9.56670000, 76.63330000, 'Pambady Junction, Kerala', NULL, '0481250000', NULL, 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(694, NULL, NULL, 'Kottayam Medical Waste Facility', 'Hazardous, Medical', 9.61500000, 76.54000000, 'Gandhinagar, Kottayam', NULL, '0481259999', NULL, 'OPEN', 10, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-23 22:30:53', '2026-02-23 22:30:53', 0.00, NULL, 'offline', NULL, '2026-02-24 20:25:23', NULL, 100, 0, NULL, 'Kochi'),
(696, NULL, '$2b$10$DPSCkzhVMX4xXlxw8QYT4urtS72qf13USIVMMZSxSuinZLl/zCetW', 'HKS (Obsolete)', NULL, 0.00000000, 0.00000000, 'Kanjirapally', NULL, NULL, NULL, 'OPEN', 5, 10, 0, 1, '2026-02-25 05:40:46', 'OPEN', 0, 0, 0, 'Kochi', '2026-02-24 11:43:01', '2026-02-23 22:30:53', 0.00, NULL, '', '2026-03-09 22:52:17', '2026-02-24 20:25:23', '2026-03-09 22:57:32', 100, 0, '2026-03-09 17:22:17', 'kanjirapally'),
(697, 'testcenter1771954639642', '$2b$10$H94t6hEvs1ZTZCLH/tGL5u37Q.5HnPZvoZRsRkBf1aegvLDS6Sqda', 'Test Center', NULL, 0.00000000, 0.00000000, 'Test Address', NULL, '1234567890', NULL, 'OPEN', 10, 10, 0, 0, '2026-02-24 17:52:44', 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-24 23:07:19', '2026-02-24 23:07:19', 0.00, 'test1771954639642@test.com', 'online', NULL, '2026-02-24 23:07:19', NULL, 100, 0, NULL, 'Kochi'),
(698, 'scrap', '$2b$10$uFMbrsqqix8MKMdYIVOIC.ufRWU9YsnVTBZPbT3R1rLgcmZv6OOMm', 'scrap mercant kanjirapally', NULL, 0.00000000, 0.00000000, 'Kanjirapally', NULL, '9087562466', NULL, 'OPEN', 10, 10, 0, 0, '2026-02-25 06:13:29', 'CLOSED', 0, 0, 0, 'Kochi', '2026-02-25 11:43:10', '2026-02-25 11:43:10', 0.00, 'scrap@center.com', 'online', NULL, '2026-02-25 11:43:10', NULL, 100, 0, NULL, 'kanjirapally'),
(699, 'hkskanjirapally', '$2b$10$wOaamP4DHr6FY7dC0cWc7.jRny.ZJj9eaPvSUTeaZfYKcv1p4exO2', 'HKS Kanjirapally', NULL, 0.00000000, 0.00000000, 'undefined undefined undefined', NULL, NULL, NULL, 'OPEN', 9, 10, 0, 0, NULL, 'CLOSED', 0, 0, 0, 'Kochi', '2026-03-06 07:53:58', '2026-03-06 07:53:58', 0.00, 'hkskanjirapally@center.com', 'online', '2026-03-12 14:08:52', '2026-03-06 07:53:58', '2026-03-12 11:36:05', 51, 1, '2026-03-12 08:38:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_item_images`
--

CREATE TABLE `tbl_item_images` (
  `image_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_marketplace_interest`
--

CREATE TABLE `tbl_marketplace_interest` (
  `interest_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_marketplace_items`
--

CREATE TABLE `tbl_marketplace_items` (
  `item_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_marketplace_items`
--

INSERT INTO `tbl_marketplace_items` (`item_id`, `user_id`, `title`, `description`, `category`, `image_url`, `status`, `created_at`) VALUES
(1, 26, 'cardboard', 'Clean dry cardboard boxes, medium quantity, suitable for recycling.', 'Paper', '/uploads/marketplace/mp_1771421636395_yem57iq54vd.jpg', 'active', '2026-02-18 13:34:57');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_marketplace_messages`
--

CREATE TABLE `tbl_marketplace_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_marketplace_messages`
--

INSERT INTO `tbl_marketplace_messages` (`message_id`, `sender_id`, `receiver_id`, `product_id`, `message_text`, `is_read`, `created_at`) VALUES
(1, 7, 26, 1, 'hi', 0, '2026-02-19 10:16:08'),
(2, 7, 26, 1, 'hello', 0, '2026-02-19 10:16:38'),
(3, 26, 7, 1, 'hi', 0, '2026-02-19 10:21:59'),
(4, 25, 26, 1, 'hi', 0, '2026-03-02 18:56:21'),
(5, 26, 25, 1, 'hello', 0, '2026-03-02 19:05:07'),
(6, 25, 26, 1, 'hi', 0, '2026-03-12 10:05:46'),
(7, 25, 26, 1, 'hello', 0, '2026-03-12 10:30:16'),
(8, 25, 26, 1, 'hi this is available?', 0, '2026-03-12 10:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_moderation_appeals`
--

CREATE TABLE `tbl_moderation_appeals` (
  `appeal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_moderation_logs`
--

CREATE TABLE `tbl_moderation_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `previous_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `risk_score` int(11) DEFAULT NULL,
  `triggered_by` enum('System','Admin') DEFAULT 'System',
  `admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notifications`
--

CREATE TABLE `tbl_notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `type` enum('INFO','SUCCESS','WARNING','ERROR') DEFAULT 'INFO',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_notifications`
--

INSERT INTO `tbl_notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(7, 9, 'Pickup Approved! ✅', 'Great news! Your request #49 has been approved.', 'SUCCESS', 0, '2026-01-30 05:48:23'),
(8, 10, 'Pickup Rejected ❌', 'Your request #50 was rejected.', 'ERROR', 0, '2026-01-30 05:59:50'),
(10, 9, 'Process Completed 🎉', 'Request #49 has been successfully processed. Thank you for recycling!', 'SUCCESS', 0, '2026-02-16 13:42:41'),
(12, 26, 'Challenge Completed! 🏆', 'You earned 30 pts for completing a challenge!', 'SUCCESS', 1, '2026-02-19 05:07:05'),
(13, 7, 'Challenge Completed! 🏆', 'You earned 30 pts for completing a challenge!', 'SUCCESS', 0, '2026-02-19 05:15:25'),
(14, 7, 'Pickup Approved! ✅', 'Great news! Your request #59 has been approved.', 'SUCCESS', 0, '2026-02-19 06:22:26'),
(15, 10, 'Pickup Rejected ❌', 'Your request #54 was rejected. Reason: location not provided', 'ERROR', 0, '2026-02-19 09:28:07'),
(16, 25, 'Challenge Completed! 🏆', 'You earned 30 pts for completing a challenge!', 'SUCCESS', 0, '2026-02-22 05:45:47'),
(17, 25, 'Special Waste Approved', 'Your request for Festival has been Approved. ', 'INFO', 0, '2026-02-22 13:43:06'),
(18, 25, 'Special Waste Approved', 'Your request for Bulk has been Approved. ', 'INFO', 0, '2026-02-23 06:02:28'),
(19, 25, 'Special Waste Approved', 'Your request for Bulk has been Approved. ', 'INFO', 0, '2026-02-23 06:02:38'),
(20, 26, 'Special Waste Approved', 'Your request for Hazardous has been Approved. ', '', 0, '2026-02-25 04:53:23'),
(21, 26, 'Pickup Approved! ✅', 'Great news! Your request #61 has been approved.', 'SUCCESS', 0, '2026-03-01 08:12:18'),
(22, 26, 'New Message from Center', 'The collection center sent you a message regarding request #61.', 'INFO', 0, '2026-03-02 09:50:12'),
(23, 25, 'Pickup Approved! ✅', 'Great news! Your request #64 has been approved.', 'SUCCESS', 1, '2026-03-02 09:50:20'),
(24, 26, 'New Marketplace Message', 'EBAN ABRAHAM SAJI sent you a message about \"cardboard\".', '', 0, '2026-03-02 13:26:21'),
(25, 25, 'New Reply Received', 'EBAN ABRAHAM SAJI replied to your message regarding \"cardboard\".', '', 1, '2026-03-02 13:35:08'),
(26, 25, 'Process Completed 🎉', 'Request #64 has been successfully processed. Thank you for recycling!', 'SUCCESS', 0, '2026-03-05 06:54:12'),
(27, 26, 'Process Completed 🎉', 'Request #61 has been successfully processed. Thank you for recycling!', 'SUCCESS', 0, '2026-03-05 08:44:04'),
(28, 7, 'Process Completed 🎉', 'Request #59 has been successfully processed. Thank you for recycling!', 'SUCCESS', 0, '2026-03-05 08:44:08'),
(29, 25, 'Pickup Approved! ✅', 'Great news! Your request #65 has been approved.', 'SUCCESS', 0, '2026-03-05 08:44:16'),
(30, 2, 'Challenge Completed! 🏆', 'You earned 30 pts for completing a challenge!', 'SUCCESS', 0, '2026-03-05 10:02:05'),
(31, 25, 'Pickup Approved! ✅', 'Great news! Your request #91 has been approved.', 'SUCCESS', 0, '2026-03-05 15:32:43'),
(32, 25, 'Special Waste Approved', 'Your request for E-waste has been Approved. ', '', 0, '2026-03-06 04:21:48'),
(33, 25, 'Special Waste Completed', 'Your request for Festival has been Completed. ', '', 0, '2026-03-06 04:25:52'),
(34, 25, 'Special Waste Completed', 'Your request for Bulk has been Completed. ', '', 0, '2026-03-06 04:25:54'),
(35, 25, 'Special Waste Completed', 'Your request for Festival has been Completed. ', '', 0, '2026-03-06 04:48:50'),
(36, 25, 'Process Completed 🎉', 'Request #91 has been successfully processed. Thank you for recycling!', 'SUCCESS', 0, '2026-03-12 03:59:10'),
(37, 25, 'Eco Points Earned! 🌿', 'You earned 50 Eco Points for Recycling Impact (13.00kg).', '', 0, '2026-03-12 03:59:10'),
(38, 25, 'Pickup Approved! ✅', 'Great news! Your request #97 has been approved.', 'SUCCESS', 0, '2026-03-12 04:02:27'),
(39, 26, 'New Reply Received', 'EBAN ABRAHAM SAJI replied to your message regarding \"cardboard\".', '', 0, '2026-03-12 04:35:46'),
(40, 26, 'New Reply Received', 'EBAN ABRAHAM SAJI replied to your message regarding \"cardboard\".', '', 0, '2026-03-12 05:00:16'),
(41, 26, 'New Marketplace Message', 'EBAN ABRAHAM SAJI sent you a message about \"cardboard\".', '', 0, '2026-03-12 05:00:55');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_pickup_items`
--

CREATE TABLE `tbl_pickup_items` (
  `item_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `waste_type` varchar(50) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_pickup_items`
--

INSERT INTO `tbl_pickup_items` (`item_id`, `request_id`, `waste_type`, `quantity`, `created_at`) VALUES
(66, 49, 'Organic', 10.00, '2026-01-30 05:24:06'),
(71, 54, 'Metal', 12.00, '2026-01-30 06:40:44'),
(76, 59, 'Metal', 25.00, '2026-02-19 05:15:25'),
(78, 61, 'Plastic', 25.00, '2026-02-25 04:33:59'),
(81, 64, 'Paper', 5.00, '2026-03-02 09:49:23'),
(107, 91, 'Plastic', 13.00, '2026-03-05 15:22:49'),
(113, 97, 'Plastic', 12.00, '2026-03-12 04:00:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_pickup_requests`
--

CREATE TABLE `tbl_pickup_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `waste_type` varchar(50) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `priority_score` int(11) DEFAULT 0,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `estimated_pickup_time` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pickup_pin` varchar(4) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `is_urgent` tinyint(1) DEFAULT 0,
  `approved_at` datetime DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `assigned_time` datetime DEFAULT NULL,
  `accepted_time` datetime DEFAULT NULL,
  `completed_time` datetime DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_pickup_requests`
--

INSERT INTO `tbl_pickup_requests` (`request_id`, `user_id`, `center_id`, `waste_type`, `quantity`, `status`, `created_at`, `updated_at`, `priority_score`, `scheduled_at`, `notes`, `rejection_reason`, `estimated_pickup_time`, `latitude`, `longitude`, `address`, `phone`, `pickup_pin`, `verified_at`, `is_urgent`, `approved_at`, `assigned_at`, `assigned_time`, `accepted_time`, `completed_time`, `location`) VALUES
(49, 9, 648, 'Organic', 10.00, 'Completed', '2026-01-30 05:24:06', '2026-02-16 13:42:41', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 10, 647, 'Metal', 12.00, 'Rejected', '2026-01-30 06:40:44', '2026-02-19 09:28:07', 0, NULL, NULL, 'location not provided', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 7, 647, 'Metal', 25.00, 'Completed', '2026-02-19 05:15:25', '2026-03-05 08:44:08', 0, NULL, NULL, NULL, NULL, 9.52779817, 76.82253622, 'kanjirapally || SLOT:Morning', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-03-05 14:14:08', NULL),
(61, 26, 699, 'Plastic', 25.00, 'Completed', '2026-02-25 04:33:59', '2026-03-06 03:22:16', 0, NULL, NULL, NULL, NULL, 9.52758040, 76.82302249, 'kanjirapally || SLOT:Morning', NULL, NULL, NULL, 0, NULL, NULL, '2026-02-25 10:03:59', '2026-03-01 13:42:18', '2026-03-05 14:14:04', NULL),
(64, 25, 699, 'Paper', 5.00, 'Completed', '2026-03-02 09:49:23', '2026-03-06 03:22:16', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'kanjirapally || SLOT:Evening', NULL, NULL, NULL, 0, NULL, NULL, '2026-03-02 15:19:23', '2026-03-02 15:20:20', '2026-03-05 12:24:12', NULL),
(91, 25, 699, 'Plastic', 13.00, 'Completed', '2026-03-05 15:22:49', '2026-03-12 03:59:10', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'santhom hostel amal jyothi college \n [kanjirapally] || SLOT:Evening', '9633421864', NULL, NULL, 0, NULL, NULL, '2026-03-05 20:52:49', '2026-03-05 21:02:43', '2026-03-12 09:29:10', 'Kanjirappally Town'),
(97, 25, 699, 'Plastic', 12.00, 'Approved', '2026-03-12 04:00:45', '2026-03-12 04:02:27', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'amal jyothi college [kanjirapally] || SLOT:Morning', '9633421864', NULL, NULL, 0, NULL, NULL, '2026-03-12 09:30:45', '2026-03-12 09:32:27', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_reports`
--

CREATE TABLE `tbl_reports` (
  `report_id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `center_id` int(11) DEFAULT NULL,
  `report_type` enum('SINGLE','SUMMARY','PERIODIC') DEFAULT 'SINGLE',
  `date_generated` datetime DEFAULT current_timestamp(),
  `report_hash` varchar(255) DEFAULT NULL,
  `impact_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`impact_json`)),
  `filters_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters_json`)),
  `generated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_reports`
--

INSERT INTO `tbl_reports` (`report_id`, `request_id`, `user_id`, `center_id`, `report_type`, `date_generated`, `report_hash`, `impact_json`, `filters_json`, `generated_by`) VALUES
(1, 59, 7, 647, 'SINGLE', '2026-02-22 11:10:43', '515203e048855c3926e41fd40dfe7fa67e172c12a6bb6700ac0920a77a003f6a', '{\"co2Saved\":\"108.00\",\"treesSaved\":\"4.909\",\"landfillDiverted\":\"23.75\"}', NULL, 2),
(2, 60, 25, 658, 'SINGLE', '2026-02-22 15:00:33', '5b7cfde9ae61f1e6e088e7b6249ed9eee56b08bea6d2d3e8c7bb20fe697d7738', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, NULL),
(3, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:04:38', 'eccfab99292e7146cd0ffcfa2acb3dc15fe9aaeb802f0f3dbdec9d3d0479f4b4', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-01\",\"toDate\":\"2026-02-28\",\"centerId\":\"\",\"userId\":\"25\",\"category\":\"\",\"status\":\"\"}', NULL),
(4, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:06:16', '667bfeadf1094ce089aa2e8ef2ebd754a4f1fcad3f0f0865a8c74dcfd01dc2e2', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(5, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:06:18', 'c5a0884f761f9fb8ee0a34c76a708196d70e9161655ba06a77eb7ac7073837ba', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(6, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:19:06', 'ac62a987866cfea2c188e2bbf65aff443e041741ed734d67131082b6d4dada71', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(7, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:19:07', '71d57f37ce13ba4fc9b4e8d6467886544e2bb52e0ac5206ace1c8ce4f659ea9a', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(8, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:19:07', 'e7363b42571efbb81519c45a512372a9425f8574c89159aee79445f3f295c061', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(9, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:20:34', '92726f91a291541062cefe57f516e2d0feb357320178c7998ba13db9b069a2fd', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(10, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:20:35', '02a8ad08ca4bc0f02ef8b67d134f7e1f76d078767ee72d2990a3d540e09b86a2', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(11, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:20:59', '57e7ac14ec412d493908ee4b6d3beb6a7cf5eb65a0e49aaa0c154cc64e30dc0f', '{\"co2Saved\":\"57.00\",\"treesSaved\":\"2.591\",\"landfillDiverted\":\"54.15\"}', '{\"fromDate\":\"\",\"toDate\":\"\"}', NULL),
(12, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:20:59', 'd0c67cac7cedd6019d54b6a7d99809adacdbe832e12c3f7e266a608f7a519f37', '{\"co2Saved\":\"57.00\",\"treesSaved\":\"2.591\",\"landfillDiverted\":\"54.15\"}', '{}', NULL),
(13, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:22:57', '15d2800a09b5c1a2f20c3c1513a9d7b600f30e85012e74a420b3c2a57c21d1b5', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(14, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:22:59', '68926ce698094dc96ef1ce8d7b48d13cc985afe13b6ae202e1a907b9694f763f', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-22\",\"toDate\":\"2026-02-22\"}', NULL),
(15, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:23:27', 'f587a26e0997647ea39de5582f903bd970345c5efcd2dbcea8dfa1dca9df7dc3', '{\"co2Saved\":\"35.00\",\"treesSaved\":\"1.591\",\"landfillDiverted\":\"33.25\"}', '{\"fromDate\":\"2026-02-19\",\"toDate\":\"2026-02-22\"}', NULL),
(16, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:23:27', '69c7d17e58779fc84b8893eed99c962854da2656d7ca506527c8bf9b2735d5e0', '{\"co2Saved\":\"35.00\",\"treesSaved\":\"1.591\",\"landfillDiverted\":\"33.25\"}', '{\"fromDate\":\"2026-02-19\",\"toDate\":\"2026-02-22\"}', NULL),
(17, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:29:17', '802d10347045f6949b787d082916db09a60fb9f61f1bebe85e9055de19c065b9', '{\"co2Saved\":\"57.00\",\"treesSaved\":\"2.591\",\"landfillDiverted\":\"54.15\"}', '{}', NULL),
(18, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:29:17', '7de762a1bef973a917848c89b22c253ad883dc05781985d55849cc50108e8cbf', '{\"co2Saved\":\"57.00\",\"treesSaved\":\"2.591\",\"landfillDiverted\":\"54.15\"}', '{\"fromDate\":\"\",\"toDate\":\"\"}', NULL),
(19, NULL, 7, NULL, 'SUMMARY', '2026-02-22 15:30:19', 'e85ca6bb03968826a3cf4209f8c2231015900f2c9dc15804c8e9968ac06900a1', '{\"co2Saved\":\"25.00\",\"treesSaved\":\"1.136\",\"landfillDiverted\":\"23.75\"}', '{\"fromDate\":\"2026-02-19\",\"toDate\":\"2026-02-19\"}', NULL),
(20, NULL, 7, NULL, 'SUMMARY', '2026-02-22 15:30:19', '9b5facfd81cc74fe25266eba14dd5ca48f00f0b7f548759f166ba2561a7a4711', '{\"co2Saved\":\"25.00\",\"treesSaved\":\"1.136\",\"landfillDiverted\":\"23.75\"}', '{\"fromDate\":\"2026-02-19\",\"toDate\":\"2026-02-19\"}', NULL),
(21, NULL, 25, NULL, 'SUMMARY', '2026-02-22 15:31:25', 'c98c7816b4d94cb2966326acd08be8dcd427601a77e309afe0790393121f2207', '{\"co2Saved\":\"10.00\",\"treesSaved\":\"0.455\",\"landfillDiverted\":\"9.50\"}', '{\"fromDate\":\"2026-02-01\",\"toDate\":\"2026-02-28\",\"centerId\":\"\",\"userId\":\"25\",\"category\":\"\",\"status\":\"\"}', NULL),
(22, 60, 25, 658, 'SINGLE', '2026-03-01 12:21:14', '45773f376b325657e6201bbb050959e83e749a42ed0f30f284fffe5946d77c20', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, NULL),
(23, 60, 25, 658, 'SINGLE', '2026-03-01 12:24:41', '29a1853a3f7e46b3a0b4ffe530e5d253f1dcc7daadbec5093d53d66b690f2ecd', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, NULL),
(24, NULL, 26, NULL, 'SUMMARY', '2026-03-01 12:26:44', 'e707b34cfef84e2ce52c95c1dff097e4bbe5598561ea88e9ebaa508a53de5c8e', '{\"co2Saved\":\"82.00\",\"treesSaved\":\"3.727\",\"landfillDiverted\":\"77.90\"}', '{\"fromDate\":\"\",\"toDate\":\"\"}', NULL),
(25, NULL, 26, NULL, 'SUMMARY', '2026-03-01 12:26:44', '038f239d444a392d1e15af5c2f54d19ab6d0ab6a74e1560d5f4a78fe4b026a2d', '{\"co2Saved\":\"82.00\",\"treesSaved\":\"3.727\",\"landfillDiverted\":\"77.90\"}', '{}', NULL),
(26, 60, 25, 658, 'SINGLE', '2026-03-01 12:29:43', 'e0d08e551cd5450ded177c54c2008c6a3f8cfe2bf077b479528f3566e01af871', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, NULL),
(27, 60, 25, 658, 'SINGLE', '2026-03-01 13:41:02', '535d9c9ded38b41ff5513a49d61cadbfd8469d99992234a03f47cb49dadf4b5a', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, NULL),
(28, 61, 26, 690, 'SINGLE', '2026-03-01 13:47:44', 'de6cb42991978ce90c4afba31a4abb42ebb4a253af0a42f5aa8fbe76a30e5b1d', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(29, 61, 26, 690, 'SINGLE', '2026-03-01 13:48:55', '70f36be68bad0be2535574e8a74009be2ae59219fd50a76919a6e0ef6a1e6553', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(30, NULL, 26, NULL, 'SUMMARY', '2026-03-01 13:53:35', 'eb3d75740878b2444577419f2b3885761612276117ca3cdc59a2cacf57ec7089', '{\"co2Saved\":\"82.00\",\"treesSaved\":\"3.727\",\"landfillDiverted\":\"77.90\"}', '{\"fromDate\":\"\",\"toDate\":\"\"}', NULL),
(31, 61, 26, 690, 'SINGLE', '2026-03-01 14:04:57', '31ec9bf45c069c4748dd1d859560ec3d5db0dacbd9aded4e3e5bd21f01b5dfa9', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(32, 61, 26, 690, 'SINGLE', '2026-03-01 14:17:49', '15360812bb28c1951cf27871ce07c624ec7a824f7f06913f3ef16d7734a9a073', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(33, 60, 25, 658, 'SINGLE', '2026-03-01 14:18:00', 'b280fabde2eeecd2e1b7a5c59359401ce36420109553a6d17da9e351048eccc7', '{\"co2Saved\":\"25.30\",\"treesSaved\":\"1.150\",\"landfillDiverted\":\"9.50\"}', NULL, 1),
(34, 61, 26, 690, 'SINGLE', '2026-03-01 14:26:59', '9a59d0b8cbd18c8d71cb060f243ae303af6d4282ca806e8324aa10313f0ad5d7', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 2),
(35, 61, 26, 690, 'SINGLE', '2026-03-01 14:38:21', '7955fac34961727d291b6632a98eb152f3bf4949dc020c5df9f7dfac03244399', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(36, 61, 26, 690, 'SINGLE', '2026-03-01 14:40:10', 'c85e8c5d1ce11b91bfd59ac29dfe2aff05cc4371479e4323b9e2b0fc57227bab', '{\"co2Saved\":\"63.25\",\"treesSaved\":\"2.875\",\"landfillDiverted\":\"23.75\"}', NULL, 1),
(37, NULL, 2, NULL, 'SUMMARY', '2026-03-06 10:26:23', '18efb13dacf15adc92ffb8dc2f6e161ffff19c2027b5bce7d1723aeaa278ac0c', '{\"co2Saved\":\"1105.00\",\"treesSaved\":\"50.227\",\"landfillDiverted\":\"1049.75\"}', '{}', 2),
(38, 91, 25, 699, 'SINGLE', '2026-03-06 10:29:55', 'af5ac21a2b04f2870ad4839f5f65ed33025deb20d6a025c5eb10bbde913171c9', '{\"co2Saved\":\"32.89\",\"treesSaved\":\"1.495\",\"landfillDiverted\":\"12.35\"}', NULL, 2),
(39, 91, 25, 699, 'SINGLE', '2026-03-06 10:30:36', '1f54c244a887e1c8495960aa3e94b8ecac588136efe2a507ad7868dbdfb0129f', '{\"co2Saved\":\"32.89\",\"treesSaved\":\"1.495\",\"landfillDiverted\":\"12.35\"}', NULL, NULL),
(40, 4, 25, 699, 'SINGLE', '2026-03-06 10:47:57', '8a155545418b1c1dff38c1c6b17616f8fbc69d5fbf654a1e6c8466aed59fd660', '{\"co2Saved\":\"45.00\",\"treesSaved\":\"2.045\",\"landfillDiverted\":\"42.75\"}', NULL, NULL),
(41, NULL, 2, NULL, 'SUMMARY', '2026-03-06 10:48:24', '29bb58eb7ebe34cf1d54d74b08e6689c9036d08aa58f70528114d298df985e55', '{\"co2Saved\":\"1105.00\",\"treesSaved\":\"50.227\",\"landfillDiverted\":\"1049.75\"}', '{}', 2),
(42, 4, 25, 699, 'SINGLE', '2026-03-06 10:51:11', 'abe9ee088043a420e202449530a2fa331e96a4a5dfa091764c2928a63f59c35d', '{\"co2Saved\":\"45.00\",\"treesSaved\":\"2.045\",\"landfillDiverted\":\"42.75\"}', NULL, NULL),
(43, 4, 25, 699, 'SINGLE', '2026-03-06 10:51:28', 'eb49768df6985022115edefc97b7d51bdedca0ba0b6575744458b77a59e378c4', '{\"co2Saved\":\"45.00\",\"treesSaved\":\"2.045\",\"landfillDiverted\":\"42.75\"}', NULL, 2),
(44, 91, 25, 699, 'SINGLE', '2026-03-11 10:44:26', 'a4dbdb1c1ad88031ed11e859bc8ea914305d8a4de291abc7682f10a7276e28db', '{\"co2Saved\":\"32.89\",\"treesSaved\":\"1.495\",\"landfillDiverted\":\"12.35\"}', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_security_logs`
--

CREATE TABLE `tbl_security_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `event` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_special_waste_requests`
--

CREATE TABLE `tbl_special_waste_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` enum('E-waste','Biomedical','Hazardous','Festival','Bulk','Medicines','Construction Debris') NOT NULL,
  `quantity_value` decimal(10,2) NOT NULL,
  `quantity_unit` varchar(20) NOT NULL DEFAULT 'kg',
  `description` text DEFAULT NULL,
  `preferred_date` date NOT NULL,
  `location` text NOT NULL,
  `status` enum('Pending','Approved','Scheduled','Completed','Rejected') DEFAULT 'Pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(255) DEFAULT NULL,
  `center_id` int(11) DEFAULT NULL,
  `is_mixed_waste` tinyint(1) DEFAULT 0,
  `ai_analysis_json` text DEFAULT NULL,
  `assignment_status` varchar(20) DEFAULT 'unassigned'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_special_waste_requests`
--

INSERT INTO `tbl_special_waste_requests` (`request_id`, `user_id`, `category`, `quantity_value`, `quantity_unit`, `description`, `preferred_date`, `location`, `status`, `admin_notes`, `created_at`, `image_url`, `center_id`, `is_mixed_waste`, `ai_analysis_json`, `assignment_status`) VALUES
(4, 25, 'Festival', 45.00, 'kg', 'Festival waste includes plastic decorations, disposable plates, food leftovers, firecracker debris, and organic offerings generated during celebrations, requiring proper segregation and eco-friendly d', '2026-02-19', 'Startup Valley TBI, Amal Jyothi College of Engineering, Kanjirapally-Erumely Road, Koovapally, Kanjirappally, Kottayam, Kerala, 686518, India', 'Completed', '', '2026-02-19 09:22:34', '/uploads/sw-1771492954172-834983198.jpg', 699, 0, NULL, 'unassigned'),
(5, 25, 'Bulk', 1000.00, 'kg', 'Bulk waste refers to large discarded items like furniture, appliances, mattresses, and construction debris requiring special collection and disposal.', '2026-02-23', 'Startup Valley TBI, Amal Jyothi College of Engineering, Kanjirapally-Erumely Road, Koovapally, Kanjirappally, Kottayam, Kerala, 686518, India', 'Approved', '', '2026-02-23 06:02:13', '/uploads/sw-1771826533503-801266158.jpg', 699, 0, NULL, 'unassigned'),
(6, 26, 'Hazardous', 10.00, 'kg', 'Hazardous waste includes toxic, flammable, corrosive, or reactive materials that pose risks to human health, environment, requiring safe handling, storage, transportation, disposal.', '2026-02-25', 'Startup Valley TBI, Amal Jyothi College of Engineering, Kanjirapally-Erumely Road, Koovapally, Kanjirappally, Kottayam, Kerala, 686518, India', 'Approved', '', '2026-02-25 04:52:31', NULL, 699, 0, NULL, 'assigned'),
(7, 25, 'E-waste', 50.00, 'items', 'discarded electrical devices like phones, computers, and appliances', '2026-03-05', 'Startup Valley TBI, Amal Jyothi College of Engineering, Kanjirapally-Erumely Road, Koovapally, Kanjirappally, Kottayam, Kerala, 686518, India', 'Approved', '', '2026-03-05 08:21:29', NULL, 699, 0, NULL, 'assigned');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_suspicious_flags`
--

CREATE TABLE `tbl_suspicious_flags` (
  `flag_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `status` enum('OPEN','REVIEWED','RESOLVED') DEFAULT 'OPEN',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_system_events`
--

CREATE TABLE `tbl_system_events` (
  `event_id` bigint(20) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `target_resource` varchar(50) DEFAULT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `severity` enum('INFO','WARNING','CRITICAL','SECURITY') DEFAULT 'INFO',
  `hash` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_system_health_logs`
--

CREATE TABLE `tbl_system_health_logs` (
  `log_id` int(11) NOT NULL,
  `cpu_usage` decimal(5,2) DEFAULT NULL,
  `memory_usage` decimal(5,2) DEFAULT NULL,
  `active_connections` int(11) DEFAULT NULL,
  `api_response_time_ms` int(11) DEFAULT NULL,
  `status` enum('HEALTHY','DEGRADED','CRITICAL') DEFAULT 'HEALTHY',
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `language_pref` enum('ENGLISH','MALAYALAM') DEFAULT 'ENGLISH',
  `green_score` int(11) DEFAULT 0,
  `leaderboard_rank` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_picture` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `role` enum('USER','CENTER','ADMIN') DEFAULT 'USER',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `eco_credits` int(11) DEFAULT 0,
  `carbon_saved_kg` float DEFAULT 0,
  `monthly_points` int(11) DEFAULT 0,
  `streak` int(11) DEFAULT 0,
  `risk_score` int(11) DEFAULT 0,
  `failed_login_attempts` int(11) DEFAULT 0,
  `last_login_attempt` timestamp NULL DEFAULT NULL,
  `user_status` enum('active','flagged','suspended') DEFAULT 'active',
  `report_count` int(11) DEFAULT 0,
  `last_violation` datetime DEFAULT NULL,
  `last_active` datetime DEFAULT NULL,
  `center_id` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `name`, `email`, `password_hash`, `language_pref`, `green_score`, `leaderboard_rank`, `created_at`, `profile_picture`, `phone`, `city`, `state`, `zip`, `country`, `role`, `status`, `eco_credits`, `carbon_saved_kg`, `monthly_points`, `streak`, `risk_score`, `failed_login_attempts`, `last_login_attempt`, `user_status`, `report_count`, `last_violation`, `last_active`, `center_id`, `location`) VALUES
(2, 'Admin', 'admin@sortsense.com', '$2b$10$O9NzD9o0Gn.9D2ozyrU25uuvh9g2T/uzXekgorqvXwIzBWteos2NS', 'ENGLISH', 30, 0, '2026-01-15 10:09:57', NULL, NULL, NULL, NULL, NULL, NULL, 'ADMIN', 'active', 0, 0, 30, 0, 0, 0, NULL, 'active', 0, NULL, '2026-03-12 06:54:59', NULL, NULL),
(6, 'Center', 'center@sortsense.com', '$2b$10$NyUQapzF3N.hU0YA6Wo4HuVuElXzvosX9LzLOnqsImeIoRefNKaEm', 'ENGLISH', 0, 0, '2026-01-15 16:18:13', NULL, NULL, NULL, NULL, NULL, NULL, 'CENTER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(7, 'melbin', 'melbinjames1212@gmail.com', '$2b$10$h8G0LcW2TQfbbHOUz08tJu.B4xCxwIaACt51fu...s0wDSVC83hty', 'ENGLISH', 30, 0, '2026-01-22 10:25:07', NULL, '6282398321', '', '', '', '', 'USER', 'active', 0, 0, 30, 0, 0, 0, NULL, 'active', 0, NULL, '2026-03-08 18:28:26', NULL, 'kanjirapally'),
(9, 'Thomson', 'thomsonshiju2028@mca.ajce.in', '$2b$10$4PGBqhyn85tXg4ctDSB4aOL3rrAtEh133x12L1v45MJId8AzML3aK', 'ENGLISH', 0, 0, '2026-01-30 05:23:12', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(10, 'Amal', 'amaldamy2028@mca.ajce.in', '$2b$10$kXmFcHaREq3U7.eRKuZXD.exipfwIsIxcm3YDxM3ojtP7Q5ZNnPAq', 'ENGLISH', 0, 0, '2026-01-30 05:27:45', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(12, 'Sharon', 'sharonshibuipandakasalayil2028@mca.ajce.in', '$2b$10$PaXuWITS9r34DKz6IV2Ez.Qo9x.xmri7oaR8//DBx9X7KPYDdPE/e', 'ENGLISH', 0, 0, '2026-01-30 05:34:04', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(13, 'Albin', 'albinsunny2028@mca.ajce.in', '$2b$10$dsdAajqzyIsYh.irLqw25e6GgM1CZ2Os8LT2rNP23fdEJUgyHQeiK', 'ENGLISH', 0, 0, '2026-02-01 11:45:52', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(17, 'Don', 'donshaji2028@mca.ajce.in', '$2b$10$DL57kVeVsJHITDVml.ZOPO6ER/tu7kyyLZq/AFB6E/H3HofijoJvC', 'ENGLISH', 0, 0, '2026-02-01 12:13:56', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(18, 'Mathew', 'mathewwilson2028@mca.ajce.in', '$2b$10$WsmHX5sk55HMpW2YmZ2H1ODlaGLzpLl62S8MHGevpKMIMEwgNHiqu', 'ENGLISH', 0, 0, '2026-02-01 12:15:56', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(22, 'Kevin', 'kevindaniel2028@mca.ajce.in', '$2b$10$wUfLTpSAjmfd8i89qcTer.RtPXr5rGcE5y11lDVLYZNbsR0Vg0pce', 'ENGLISH', 0, 0, '2026-02-02 13:07:37', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 0, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, NULL),
(25, 'EBAN ABRAHAM SAJI', 'ebanabraham28@gmail.com', '$2b$10$FCAWG./ts9dzGMjfA/eeaubaiglNPH2XKIgo19SX9dfCFuoEFfPSK', 'ENGLISH', 130, 0, '2026-02-04 15:36:10', '/uploads/avatar-1773278804985-988276502.jpg', '9633421864', 'kottayam', 'kerala', '', 'india', 'USER', 'active', 50, 0, 130, 0, 0, 0, NULL, 'active', 0, NULL, '2026-03-12 10:25:33', NULL, 'kanjirapally'),
(26, 'EBAN ABRAHAM SAJI', 'ebanabraham52@gmail.com', '$2b$10$lVR.gFAs0pZFuYOVHpxdDuRTnKxrq.7P.2FKVtI26O7KqZmfqSKJu', 'ENGLISH', 80, 0, '2026-02-04 16:04:04', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', 'active', 0, 0, 60, 0, 0, 0, NULL, 'active', 0, NULL, NULL, NULL, 'kanjirapally');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_audit_logs`
--

CREATE TABLE `tbl_user_audit_logs` (
  `log_id` int(11) NOT NULL,
  `admin_name` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `target_user` varchar(255) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_audit_logs`
--

INSERT INTO `tbl_user_audit_logs` (`log_id`, `admin_name`, `action`, `target_user`, `reason`, `timestamp`) VALUES
(1, 'Admin User', 'Changed status to suspended', 'Selenium Test User', 'Administrative action', '2026-03-06 12:08:07'),
(2, 'Admin User', 'Changed status to active', 'Selenium Test User', 'Admin request', '2026-03-06 12:08:11'),
(3, 'Admin User', 'Changed status to flagged', 'Selenium Test User', 'Flagged for review by admin', '2026-03-06 12:08:22'),
(4, 'Admin User', 'Changed status to suspended', 'Selenium Test User', 'Administrative action', '2026-03-06 12:08:30'),
(5, 'Admin User', 'Changed status to active', 'Selenium Test User', 'Admin request', '2026-03-06 12:08:33');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_center_messages`
--

CREATE TABLE `tbl_user_center_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_role` enum('user','center') NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_role` enum('user','center') NOT NULL,
  `request_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_user_center_messages`
--

INSERT INTO `tbl_user_center_messages` (`message_id`, `sender_id`, `sender_role`, `receiver_id`, `receiver_role`, `request_id`, `message`, `is_read`, `created_at`) VALUES
(1, 699, 'center', 25, 'user', 97, 'hi', 0, '2026-03-12 04:21:31'),
(2, 699, 'center', 25, 'user', 97, 'hello user', 0, '2026-03-12 04:21:43'),
(3, 699, 'center', 25, 'user', 97, 'HEllo', 0, '2026-03-12 04:22:29'),
(4, 699, 'center', 25, 'user', 97, 'hi', 0, '2026-03-12 04:31:49'),
(5, 699, 'center', 25, 'user', 97, 'hi', 0, '2026-03-12 04:32:43'),
(6, 699, 'center', 25, 'user', 97, 'hi', 0, '2026-03-12 04:50:56'),
(7, 25, 'user', 699, 'center', 97, 'hello center', 0, '2026-03-12 05:13:53'),
(8, 699, 'center', 25, 'user', 97, 'scheduled a pickup', 0, '2026-03-12 05:15:30'),
(9, 25, 'user', 699, 'center', 97, 'yes', 0, '2026-03-12 05:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_challenges`
--

CREATE TABLE `tbl_user_challenges` (
  `user_challenge_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `challenge_id` int(11) DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `completed` tinyint(1) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_challenges`
--

INSERT INTO `tbl_user_challenges` (`user_challenge_id`, `user_id`, `challenge_id`, `progress`, `completed`, `last_updated`) VALUES
(1, 26, 1, 0, 0, '2026-02-18 05:05:21'),
(2, 26, 2, 1, 1, '2026-02-19 05:07:05'),
(3, 26, 3, 0, 0, '2026-02-18 05:05:21'),
(5, 25, 1, 0, 0, '2026-02-19 03:45:58'),
(6, 25, 2, 1, 1, '2026-02-22 05:45:47'),
(7, 25, 3, 0, 0, '2026-02-19 03:45:58'),
(8, 7, 1, 0, 0, '2026-02-19 03:59:09'),
(9, 7, 2, 1, 1, '2026-02-19 05:15:25'),
(10, 7, 3, 0, 0, '2026-02-19 03:59:09'),
(11, 2, 1, 0, 0, '2026-02-22 07:49:22'),
(12, 2, 2, 1, 1, '2026-03-05 10:02:05'),
(13, 2, 3, 0, 0, '2026-02-22 07:49:22');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_history`
--

CREATE TABLE `tbl_user_history` (
  `history_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` enum('SCAN','SEARCH','PICKUP_REQUEST') NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user_history`
--

INSERT INTO `tbl_user_history` (`history_id`, `user_id`, `activity_type`, `details`, `created_at`) VALUES
(5, 2, 'SCAN', '{\"category\":\"Plastic\",\"result\":\"Test Bottle\",\"confidence\":99}', '2026-01-20 17:17:59'),
(9, 12, 'SCAN', '{\"category\":\"Ewaste\",\"confidence\":27.05}', '2026-01-30 05:34:22'),
(15, 17, '', '{\"message\":\"Account created by administrator\"}', '2026-02-01 12:14:01'),
(16, 18, '', '{\"message\":\"Account created by administrator\"}', '2026-02-01 12:16:00'),
(22, 22, '', '{\"message\":\"Account created by administrator\"}', '2026-02-02 13:07:42'),
(38, 26, 'SEARCH', '{\"query\":\"classic hotel\",\"result\":\"Uncertain\"}', '2026-02-05 15:35:29'),
(39, 26, 'SEARCH', '{\"query\":\"plastic bottle\",\"result\":\"Plastic\"}', '2026-02-05 15:35:37'),
(40, 26, 'SEARCH', '{\"query\":\"organic waste\",\"result\":\"Uncertain\"}', '2026-02-05 15:36:49'),
(41, 26, 'SCAN', '{\"category\":\"Organic\",\"result\":\"Organic\",\"confidence\":30}', '2026-02-05 15:37:13'),
(43, 26, 'SCAN', '{\"category\":\"Plastic\",\"result\":\"Plastic\",\"confidence\":35.01,\"points\":10}', '2026-02-17 05:41:57'),
(44, 26, 'SCAN', '{\"category\":\"Paper\",\"result\":\"Paper\",\"confidence\":79.71,\"points\":10}', '2026-02-17 05:44:00'),
(46, 26, 'SCAN', '{\"category\":\"Plastic\",\"result\":\"Plastic\",\"confidence\":35.01,\"points\":10}', '2026-02-18 05:54:03'),
(47, 26, 'SCAN', '{\"category\":\"Paper\",\"result\":\"Paper\",\"confidence\":79.71,\"points\":10}', '2026-02-18 06:01:02'),
(49, 26, 'SEARCH', '{\"query\":\"Glass Bottle\",\"result\":\"Plastic\"}', '2026-02-18 06:10:03'),
(50, 25, 'SCAN', '{\"category\":\"Paper\",\"confidence\":79.71,\"points\":10}', '2026-02-20 02:37:11'),
(51, 25, 'SCAN', '{\"category\":\"Textile\",\"confidence\":21.32,\"points\":10}', '2026-02-22 09:33:12'),
(52, 25, 'SCAN', '{\"category\":\"Plastic\",\"confidence\":35.01,\"points\":10}', '2026-02-22 09:33:24'),
(53, 25, 'SCAN', '{\"category\":\"Paper\",\"confidence\":79.71,\"points\":10}', '2026-02-22 09:33:42'),
(54, 25, 'SCAN', '{\"category\":\"Paper\",\"confidence\":79.71,\"points\":10}', '2026-02-25 06:18:10'),
(55, 25, 'SEARCH', '{\"query\":\"Plastic Bag\",\"result\":\"Plastic\"}', '2026-02-25 06:18:34'),
(56, 25, 'SEARCH', '{\"query\":\"last twist\",\"result\":\"Uncertain\"}', '2026-03-03 04:29:21'),
(57, 25, 'SEARCH', '{\"query\":\"hazardous waste\",\"result\":\"Hazardous\"}', '2026-03-03 04:29:48'),
(58, 25, 'SEARCH', '{\"query\":\"Boom Boom Boom\",\"result\":\"Uncertain\"}', '2026-03-03 04:30:02'),
(59, 25, 'SEARCH', '{\"query\":\"Plastic Bag\",\"result\":\"Plastic\"}', '2026-03-03 04:43:45');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_reports`
--

CREATE TABLE `tbl_user_reports` (
  `report_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `target_id` int(11) NOT NULL,
  `category` enum('Spam','Fraud','Abuse','Other') DEFAULT 'Other',
  `description` text DEFAULT NULL,
  `status` enum('Pending','Resolved','Dismissed') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_waste_items`
--

CREATE TABLE `tbl_waste_items` (
  `item_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `disposal_guideline` text DEFAULT NULL,
  `safety_instructions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_waste_items`
--

INSERT INTO `tbl_waste_items` (`item_id`, `item_name`, `category_id`, `disposal_guideline`, `safety_instructions`) VALUES
(1, 'Plastic Bottle', 1, 'Wash, dry, and squash the bottle. Store in a dry bag and hand over to Haritha Karma Sena.', 'Do not burn. Toxic fumes are released.'),
(2, 'Glass Jar', 2, 'Rinse thoroughly. Remove lids. Keep intact if possible.', 'Handle broken glass with care. Wrap in newspaper before disposal.'),
(3, 'Organic Waste', 4, 'use for home composting (bio-bin/bucket compost).', 'Do not mix with plastics.'),
(4, 'E-Waste Items', 5, 'Store separately in dry condition. Hand over to special e-waste collection drives.', 'Do not break or dismantle batteries as they may leak toxic chemicals.');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_waste_records`
--

CREATE TABLE `tbl_waste_records` (
  `record_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `waste_type` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `scan_method` enum('SCAN','MANUAL','PICKUP','ADMIN') DEFAULT NULL,
  `pickup_id` int(11) DEFAULT NULL,
  `status` enum('Scanned','Pending','Verified','Approved','Scheduled','Picked','Processed','Recycled') DEFAULT 'Pending',
  `verified_by` int(11) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_waste_records`
--

INSERT INTO `tbl_waste_records` (`record_id`, `user_id`, `waste_type`, `category`, `weight`, `quantity`, `location`, `scan_method`, `pickup_id`, `status`, `verified_by`, `comments`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Metal', 'Pick-up', 20.00, 1, '9.527671832646645, 76.82265279548602', 'PICKUP', 48, '', NULL, '', '2026-01-30 05:08:50', '2026-01-30 06:00:20'),
(2, 9, 'Organic', 'Pick-up', 10.00, 1, '9.527687784049164, 76.8226505634475', 'PICKUP', 49, 'Picked', NULL, '', '2026-01-30 05:24:06', '2026-02-16 13:42:41'),
(3, 10, 'Paper', 'Pick-up', 20.00, 1, '9.527684595991795, 76.8226677022685', 'PICKUP', 50, '', NULL, '', '2026-01-30 05:32:49', '2026-01-30 05:59:50'),
(4, 12, 'Ewaste', 'Ewaste', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-01-30 05:34:22', '2026-01-30 05:34:22'),
(5, NULL, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-01-30 05:42:31', '2026-01-30 05:42:31'),
(6, 7, 'Paper', 'Pick-up', 5.00, 1, '9.527693928391344, 76.82261315071639', 'PICKUP', 51, 'Pending', NULL, '', '2026-01-30 06:04:05', '2026-01-30 06:04:05'),
(7, 7, 'Organic', 'Pick-up', 10.00, 1, '9.527783705955278, 76.8225674579625', 'PICKUP', 52, 'Pending', NULL, '', '2026-01-30 06:22:13', '2026-01-30 06:22:13'),
(8, 7, 'Glass', 'Pick-up', 5.00, 1, '9.52779817018255, 76.82253621997754', 'PICKUP', 53, 'Pending', NULL, '', '2026-01-30 06:37:18', '2026-01-30 06:37:18'),
(9, 10, 'Metal', 'Pick-up', 12.00, 1, '9.527755703675766, 76.82259167788231', 'PICKUP', 54, '', NULL, '', '2026-01-30 06:40:44', '2026-02-19 09:28:07'),
(10, NULL, 'Plastic', 'Pick-up', 5.00, 1, 'null, null', 'PICKUP', 55, 'Pending', NULL, '', '2026-01-30 07:00:41', '2026-01-30 07:00:41'),
(11, NULL, 'Hazardous', 'Hazardous', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-01 14:53:47', '2026-02-01 14:53:47'),
(12, NULL, 'Paper', 'Pick-up', 5.00, 1, 'null, null', 'PICKUP', 56, 'Pending', NULL, '', '2026-02-02 01:51:29', '2026-02-02 01:51:29'),
(13, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-02 10:01:49', '2026-02-02 10:01:49'),
(14, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-02 10:08:05', '2026-02-02 10:08:05'),
(15, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-02 13:09:53', '2026-02-02 13:09:53'),
(16, NULL, 'Organic', 'Organic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-02 13:11:33', '2026-02-02 13:11:33'),
(17, NULL, 'Unknown', 'Unknown', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-03 03:31:56', '2026-02-03 03:31:56'),
(18, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-03 03:32:22', '2026-02-03 03:32:22'),
(19, NULL, 'Unknown', 'Unknown', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 05:46:19', '2026-02-04 05:46:19'),
(20, NULL, 'Unknown', 'Unknown', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:10:18', '2026-02-04 06:10:18'),
(21, NULL, 'Unknown', 'Unknown', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:12:31', '2026-02-04 06:12:31'),
(22, NULL, 'Mixed', 'Mixed', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:29:47', '2026-02-04 06:29:47'),
(23, NULL, 'E-Waste', 'E-Waste', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:53:36', '2026-02-04 06:53:36'),
(24, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:59:18', '2026-02-04 06:59:18'),
(25, NULL, 'Hazardous', 'Hazardous', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:59:30', '2026-02-04 06:59:30'),
(26, NULL, 'E-Waste', 'E-Waste', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 06:59:45', '2026-02-04 06:59:45'),
(27, NULL, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 15:02:51', '2026-02-04 15:02:51'),
(28, NULL, 'Hazardous', 'Hazardous', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-04 15:03:12', '2026-02-04 15:03:12'),
(29, 26, 'Organic', 'Organic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-05 15:37:14', '2026-02-05 15:37:14'),
(30, 26, 'Plastic', 'Pick-up', 5.00, 1, 'null, null', 'PICKUP', 57, 'Pending', NULL, '', '2026-02-09 05:12:24', '2026-02-09 05:12:24'),
(31, 26, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-17 05:41:57', '2026-02-17 05:41:57'),
(32, 26, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-17 05:44:00', '2026-02-17 05:44:00'),
(33, 26, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-18 05:54:03', '2026-02-18 05:54:03'),
(34, 26, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-18 06:01:02', '2026-02-18 06:01:02'),
(35, 26, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-18 06:08:41', '2026-02-18 06:08:41'),
(36, 26, 'Paper', 'Pick-up', 5.00, 1, '9.527580395699614, 76.82302249293967', 'PICKUP', 58, 'Pending', NULL, '', '2026-02-19 05:07:05', '2026-02-19 05:07:05'),
(37, 7, 'Metal', 'Pick-up', 25.00, 1, '9.52779817018255, 76.82253621997754', 'PICKUP', 59, 'Picked', NULL, '', '2026-02-19 05:15:25', '2026-03-05 08:44:08'),
(38, 25, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-20 02:37:11', '2026-02-20 02:37:11'),
(39, 25, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 60, 'Pending', NULL, '', '2026-02-22 05:45:47', '2026-02-22 05:45:47'),
(40, 25, 'Textile', 'Textile', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-22 09:33:12', '2026-02-22 09:33:12'),
(41, 25, 'Plastic', 'Plastic', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-22 09:33:24', '2026-02-22 09:33:24'),
(42, 25, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-22 09:33:42', '2026-02-22 09:33:42'),
(43, 26, 'Plastic', 'Pick-up', 25.00, 1, '9.527580395699614, 76.82302249293967', 'PICKUP', 61, 'Picked', NULL, '', '2026-02-25 04:33:59', '2026-03-05 08:44:04'),
(44, 25, 'Paper', 'Paper', 0.00, 1, 'Scan Location', 'SCAN', NULL, 'Scanned', NULL, '', '2026-02-25 06:18:10', '2026-02-25 06:18:10'),
(47, 25, 'Paper', 'Pick-up', 5.00, 1, 'null, null', 'PICKUP', 64, 'Picked', NULL, '', '2026-03-02 09:49:23', '2026-03-05 06:54:12'),
(48, 25, 'Metal', 'Pick-up', 19.00, 1, 'null, null', 'PICKUP', 65, 'Verified', NULL, '', '2026-03-05 08:43:07', '2026-03-05 08:44:16'),
(49, 2, 'Plastic', 'Pick-up', 10.00, 1, '0, 0', 'PICKUP', 67, 'Pending', NULL, '', '2026-03-05 09:05:08', '2026-03-05 09:05:08'),
(50, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 68, 'Pending', NULL, '', '2026-03-05 10:02:05', '2026-03-05 10:02:05'),
(51, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 69, 'Pending', NULL, '', '2026-03-05 10:02:05', '2026-03-05 10:02:05'),
(52, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 70, 'Pending', NULL, '', '2026-03-05 10:02:05', '2026-03-05 10:02:05'),
(53, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 71, 'Pending', NULL, '', '2026-03-05 10:02:25', '2026-03-05 10:02:25'),
(54, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 72, 'Pending', NULL, '', '2026-03-05 10:02:25', '2026-03-05 10:02:25'),
(55, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 73, 'Pending', NULL, '', '2026-03-05 10:02:25', '2026-03-05 10:02:25'),
(56, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 74, 'Pending', NULL, '', '2026-03-05 10:03:17', '2026-03-05 10:03:17'),
(57, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 75, 'Pending', NULL, '', '2026-03-05 10:03:17', '2026-03-05 10:03:17'),
(58, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 76, 'Pending', NULL, '', '2026-03-05 10:03:17', '2026-03-05 10:03:17'),
(59, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 77, 'Pending', NULL, '', '2026-03-05 10:04:12', '2026-03-05 10:04:12'),
(60, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 78, 'Pending', NULL, '', '2026-03-05 10:04:12', '2026-03-05 10:04:12'),
(61, 2, 'Plastic', 'Pick-up', 10.00, 1, '9.9312, 76.2673', 'PICKUP', 79, 'Pending', NULL, '', '2026-03-05 10:04:12', '2026-03-05 10:04:12'),
(62, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 80, 'Pending', NULL, '', '2026-03-05 10:05:24', '2026-03-05 10:05:24'),
(63, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 81, 'Pending', NULL, '', '2026-03-05 10:05:24', '2026-03-05 10:05:24'),
(64, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 82, 'Pending', NULL, '', '2026-03-05 10:05:24', '2026-03-05 10:05:24'),
(65, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 83, 'Pending', NULL, '', '2026-03-05 10:06:21', '2026-03-05 10:06:21'),
(66, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 84, 'Pending', NULL, '', '2026-03-05 10:06:21', '2026-03-05 10:06:21'),
(67, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 85, 'Pending', NULL, '', '2026-03-05 10:06:21', '2026-03-05 10:06:21'),
(68, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 86, 'Pending', NULL, '', '2026-03-05 10:07:58', '2026-03-05 10:07:58'),
(69, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 87, 'Pending', NULL, '', '2026-03-05 10:07:58', '2026-03-05 10:07:58'),
(70, 2, 'Plastic', 'Pick-up', 1.00, 1, '9.9, 76.2', 'PICKUP', 88, 'Pending', NULL, '', '2026-03-05 10:07:58', '2026-03-05 10:07:58'),
(71, 25, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 89, 'Pending', NULL, '', '2026-03-05 10:39:16', '2026-03-05 10:39:16'),
(72, 25, 'Plastic', 'Pick-up', 12.00, 1, 'null, null', 'PICKUP', 90, 'Pending', NULL, '', '2026-03-05 13:48:31', '2026-03-05 13:48:31'),
(73, 25, 'Plastic', 'Pick-up', 13.00, 1, 'null, null', 'PICKUP', 91, 'Picked', NULL, '', '2026-03-05 15:22:49', '2026-03-12 03:59:10'),
(74, NULL, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 92, 'Pending', NULL, '', '2026-03-09 17:06:23', '2026-03-09 17:06:23'),
(75, NULL, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 93, 'Pending', NULL, '', '2026-03-09 17:08:23', '2026-03-09 17:08:23'),
(76, NULL, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 94, 'Pending', NULL, '', '2026-03-09 17:19:29', '2026-03-09 17:19:29'),
(77, NULL, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 95, 'Pending', NULL, '', '2026-03-09 17:21:19', '2026-03-09 17:21:19'),
(78, NULL, 'Plastic', 'Pick-up', 10.00, 1, 'null, null', 'PICKUP', 96, 'Pending', NULL, '', '2026-03-09 17:22:17', '2026-03-09 17:22:17'),
(79, 25, 'Plastic', 'Pick-up', 12.00, 1, 'null, null', 'PICKUP', 97, 'Verified', NULL, '', '2026-03-12 04:00:45', '2026-03-12 04:02:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `center_messages`
--
ALTER TABLE `center_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_accepted_categories`
--
ALTER TABLE `tbl_accepted_categories`
  ADD PRIMARY KEY (`center_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `tbl_admin_audit_logs`
--
ALTER TABLE `tbl_admin_audit_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_admin_notifications`
--
ALTER TABLE `tbl_admin_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_ai_performance_logs`
--
ALTER TABLE `tbl_ai_performance_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `tbl_center_messages`
--
ALTER TABLE `tbl_center_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `tbl_center_notifications`
--
ALTER TABLE `tbl_center_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `tbl_challenges`
--
ALTER TABLE `tbl_challenges`
  ADD PRIMARY KEY (`challenge_id`);

--
-- Indexes for table `tbl_collection_centers`
--
ALTER TABLE `tbl_collection_centers`
  ADD PRIMARY KEY (`center_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_center_status` (`current_operational_status`),
  ADD KEY `idx_center_active` (`last_active_at`);

--
-- Indexes for table `tbl_item_images`
--
ALTER TABLE `tbl_item_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `tbl_marketplace_interest`
--
ALTER TABLE `tbl_marketplace_interest`
  ADD PRIMARY KEY (`interest_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_marketplace_items`
--
ALTER TABLE `tbl_marketplace_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_marketplace_messages`
--
ALTER TABLE `tbl_marketplace_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `tbl_moderation_appeals`
--
ALTER TABLE `tbl_moderation_appeals`
  ADD PRIMARY KEY (`appeal_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_moderation_logs`
--
ALTER TABLE `tbl_moderation_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_pickup_items`
--
ALTER TABLE `tbl_pickup_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `tbl_pickup_requests`
--
ALTER TABLE `tbl_pickup_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD UNIQUE KEY `report_hash` (`report_hash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_security_logs`
--
ALTER TABLE `tbl_security_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_special_waste_requests`
--
ALTER TABLE `tbl_special_waste_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `tbl_suspicious_flags`
--
ALTER TABLE `tbl_suspicious_flags`
  ADD PRIMARY KEY (`flag_id`);

--
-- Indexes for table `tbl_system_events`
--
ALTER TABLE `tbl_system_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_actor_id` (`actor_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `tbl_system_health_logs`
--
ALTER TABLE `tbl_system_health_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tbl_user_audit_logs`
--
ALTER TABLE `tbl_user_audit_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `tbl_user_center_messages`
--
ALTER TABLE `tbl_user_center_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `tbl_user_challenges`
--
ALTER TABLE `tbl_user_challenges`
  ADD PRIMARY KEY (`user_challenge_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `challenge_id` (`challenge_id`);

--
-- Indexes for table `tbl_user_history`
--
ALTER TABLE `tbl_user_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_user_reports`
--
ALTER TABLE `tbl_user_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `target_id` (`target_id`);

--
-- Indexes for table `tbl_waste_items`
--
ALTER TABLE `tbl_waste_items`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `idx_category_item` (`category_id`,`item_name`);

--
-- Indexes for table `tbl_waste_records`
--
ALTER TABLE `tbl_waste_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `center_messages`
--
ALTER TABLE `center_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_admin_audit_logs`
--
ALTER TABLE `tbl_admin_audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tbl_admin_notifications`
--
ALTER TABLE `tbl_admin_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `tbl_ai_performance_logs`
--
ALTER TABLE `tbl_ai_performance_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_categories`
--
ALTER TABLE `tbl_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=149;

--
-- AUTO_INCREMENT for table `tbl_center_messages`
--
ALTER TABLE `tbl_center_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `tbl_center_notifications`
--
ALTER TABLE `tbl_center_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `tbl_challenges`
--
ALTER TABLE `tbl_challenges`
  MODIFY `challenge_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_collection_centers`
--
ALTER TABLE `tbl_collection_centers`
  MODIFY `center_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=700;

--
-- AUTO_INCREMENT for table `tbl_item_images`
--
ALTER TABLE `tbl_item_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_marketplace_interest`
--
ALTER TABLE `tbl_marketplace_interest`
  MODIFY `interest_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_marketplace_items`
--
ALTER TABLE `tbl_marketplace_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_marketplace_messages`
--
ALTER TABLE `tbl_marketplace_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_moderation_appeals`
--
ALTER TABLE `tbl_moderation_appeals`
  MODIFY `appeal_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_moderation_logs`
--
ALTER TABLE `tbl_moderation_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `tbl_pickup_items`
--
ALTER TABLE `tbl_pickup_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `tbl_pickup_requests`
--
ALTER TABLE `tbl_pickup_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `tbl_security_logs`
--
ALTER TABLE `tbl_security_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_special_waste_requests`
--
ALTER TABLE `tbl_special_waste_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_suspicious_flags`
--
ALTER TABLE `tbl_suspicious_flags`
  MODIFY `flag_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_system_events`
--
ALTER TABLE `tbl_system_events`
  MODIFY `event_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_system_health_logs`
--
ALTER TABLE `tbl_system_health_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `tbl_user_audit_logs`
--
ALTER TABLE `tbl_user_audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_user_center_messages`
--
ALTER TABLE `tbl_user_center_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tbl_user_challenges`
--
ALTER TABLE `tbl_user_challenges`
  MODIFY `user_challenge_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_user_history`
--
ALTER TABLE `tbl_user_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `tbl_user_reports`
--
ALTER TABLE `tbl_user_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_waste_items`
--
ALTER TABLE `tbl_waste_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `tbl_waste_records`
--
ALTER TABLE `tbl_waste_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_accepted_categories`
--
ALTER TABLE `tbl_accepted_categories`
  ADD CONSTRAINT `tbl_accepted_categories_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `tbl_collection_centers` (`center_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_accepted_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `tbl_categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_center_notifications`
--
ALTER TABLE `tbl_center_notifications`
  ADD CONSTRAINT `tbl_center_notifications_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `tbl_collection_centers` (`center_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_item_images`
--
ALTER TABLE `tbl_item_images`
  ADD CONSTRAINT `tbl_item_images_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `tbl_waste_items` (`item_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tbl_item_images_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_marketplace_interest`
--
ALTER TABLE `tbl_marketplace_interest`
  ADD CONSTRAINT `tbl_marketplace_interest_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `tbl_marketplace_items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_marketplace_interest_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_marketplace_items`
--
ALTER TABLE `tbl_marketplace_items`
  ADD CONSTRAINT `tbl_marketplace_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_marketplace_messages`
--
ALTER TABLE `tbl_marketplace_messages`
  ADD CONSTRAINT `tbl_marketplace_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_marketplace_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_marketplace_messages_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `tbl_marketplace_items` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_moderation_appeals`
--
ALTER TABLE `tbl_moderation_appeals`
  ADD CONSTRAINT `tbl_moderation_appeals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_moderation_logs`
--
ALTER TABLE `tbl_moderation_logs`
  ADD CONSTRAINT `tbl_moderation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD CONSTRAINT `tbl_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_pickup_items`
--
ALTER TABLE `tbl_pickup_items`
  ADD CONSTRAINT `tbl_pickup_items_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `tbl_pickup_requests` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_pickup_requests`
--
ALTER TABLE `tbl_pickup_requests`
  ADD CONSTRAINT `tbl_pickup_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_pickup_requests_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `tbl_collection_centers` (`center_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_reports`
--
ALTER TABLE `tbl_reports`
  ADD CONSTRAINT `tbl_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`);

--
-- Constraints for table `tbl_special_waste_requests`
--
ALTER TABLE `tbl_special_waste_requests`
  ADD CONSTRAINT `tbl_special_waste_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_special_waste_requests_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `tbl_collection_centers` (`center_id`);

--
-- Constraints for table `tbl_user_center_messages`
--
ALTER TABLE `tbl_user_center_messages`
  ADD CONSTRAINT `tbl_user_center_messages_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `tbl_pickup_requests` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_user_challenges`
--
ALTER TABLE `tbl_user_challenges`
  ADD CONSTRAINT `tbl_user_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_user_challenges_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `tbl_challenges` (`challenge_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_user_history`
--
ALTER TABLE `tbl_user_history`
  ADD CONSTRAINT `tbl_user_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_user_reports`
--
ALTER TABLE `tbl_user_reports`
  ADD CONSTRAINT `tbl_user_reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_user_reports_ibfk_2` FOREIGN KEY (`target_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_waste_items`
--
ALTER TABLE `tbl_waste_items`
  ADD CONSTRAINT `tbl_waste_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `tbl_categories` (`category_id`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_waste_records`
--
ALTER TABLE `tbl_waste_records`
  ADD CONSTRAINT `tbl_waste_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
