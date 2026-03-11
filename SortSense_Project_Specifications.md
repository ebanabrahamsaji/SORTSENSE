# CHAPTER 2: PROJECT SPECIFICATIONS

## 2.1 PROJECT OVERVIEW

The SortSense Smart Waste Sorting and Recycling Management system is an intelligent digital platform designed to automate and optimize the waste lifecycle within a municipal framework. The primary purpose of the system is to provide a seamless interface between households (users), localized recycling centers (Haritha Karma Sena), and system administrators to facilitate efficient waste segregation and collection.

In the contemporary context of urban waste management, smart sorting is paramount to reducing contamination in recycling streams and minimizing landfill dependency. By leveraging Computer Vision for real-time waste classification, SortSense removes the ambiguity associated with manual segregation. For users, the platform offers a streamlined method to schedule pickups and earn rewards, while for recycling centers, it provides a structured logistical dashboard to manage assigned requests and optimize resource allocation based on geographic proximity.

---

## 2.2 FUNCTIONAL REQUIREMENTS

The functional requirements define the core capabilities and services the system must provide to its users:

1. **User Registration and Authentication:** The system shall provide secure registration and login facilities for Users, Centers, and Administrators. Integration with Google OAuth 2.0 shall be supported for enhanced user convenience and security.
2. **Recycling Center Lifecycle Management:** New recycling centers must be able to register on the platform. The system shall include an approval workflow where administrators verify and approve center credentials before they appear in the active directory.
3. **Waste Pickup Scheduling:** Users shall be able to schedule waste pickups by specifying the waste category (identified via AI scan or manual entry), quantity, preferred date, and priority (Standard/Urgent).
4. **Geographic-Based Center Assignment:** The system shall automatically assign pickup requests to the nearest authorized recycling center based on the user's GPS coordinates using the Haversine distance algorithm.
5. **Integrated Messaging System:** A real-time communication channel shall be established between the user and the assigned center to coordinate pickup logistics and resolve location-specific queries.
6. **Administrator Control Panel:** Administrators shall have high-level access to monitor system health, manage waste category data, moderate user accounts, and view comprehensive activity logs.
7. **Gamified Reward System:** Upon successful completion of a recycling pickup, the system shall award "Eco Credits" to the user based on the volume and type of waste processed, contributing to their global rank.
8. **Center Status Monitoring:** Centers shall have the capability to toggle their operational status (Active/Inactive), allowing the system to redirect requests during periods of overcapacity or maintenance.

---

## 2.3 NON-FUNCTIONAL REQUIREMENTS

The non-functional requirements specify the quality attributes and constraints of the system:

1. **Performance:** The system shall process AI waste classification requests in under 2 seconds. API response times for dashboard data retrieval shall not exceed 1.5 seconds under normal load.
2. **Security:** All sensitive data, including user passwords and session tokens, must be encrypted using Bcrypt hashing and JSON Web Tokens (JWT). Role-Based Access Control (RBAC) must be strictly enforced.
3. **Reliability:** The platform shall maintain a 99.5% uptime. The database shall implement automated backup procedures to prevent data loss.
4. **Scalability:** The backend architecture shall be modular to allow for future integration of additional municipalities and a higher volume of concurrent pickup requests.
5. **Usability:** The interface must be responsive and accessible across multiple device types (Desktop, Tablet, Mobile) with a minimalist, "Glassmorphic" design philosophy.
6. **Data Privacy:** Personal information and geolocation data must be stored securely and only be accessible to authorized personnel involved in the pickup process.

---

## 2.4 SYSTEM MODULES

The system is partitioned into several interconnected modules:

* **User Module:** Handles user registration, profile management, AI-based waste identification, and pickup request submission.
* **Recycling Center Module:** Provides centers with a dashboard to view assigned pickups, update request statuses, and communicate with users.
* **Admin Module:** Centralizes system management, including user moderation, center approval, analytics visualization, and system health monitoring.
* **Messaging Module:** A dedicated subsystem for managing real-time chat history and notification delivery between users and centers.
* **Pickup Scheduling Module:** Manages the logical lifecycle of a pickup request from "Requested" to "Scheduled," "In-Progress," and "Completed."
* **Reward Management Module:** Calculates and updates user "Eco Credits" and manages the global leaderboard logic.

---

## 2.5 SYSTEM ARCHITECTURE

SortSense utilizes a classic **Three-Tier Web Architecture**:

1. **Presentation Layer (Frontend):** Developed using HTML5, Vanilla CSS, and JavaScript. This layer is responsible for rendering the User, Admin, and Center interfaces and interacting with browser APIs (Camera, Geolocation).
2. **Application Layer (Backend):** A Node.js and Express.js server that processes business logic, manages authentication, and serves as a gateway to the AI processing bridge.
3. **Data Layer (Persistence):** A MySQL relational database used to store persistent records, including user profiles, pickup logs, geo-coordinates of centers, and waste category metadata.

The AI component is integrated via a **Python Bridge**, where the Node.js server spawns a child process to execute the YOLOv8 classification model, ensuring high-performance image analysis without blocking the main event loop.

---

## 2.6 HARDWARE REQUIREMENTS

* **Client Device:** A device with a web browser and a digital camera (Smartphone, Laptop, or Tablet).
* **Processor:** Dual-core 2.4 GHz or higher.
* **Memory:** Minimum 4 GB RAM for client-side execution; 8 GB RAM for server-side hosting.
* **Storage:** 1 GB of available disk space for local installation and AI model weights.
* **Network:** Standard broadband or 4G/5G mobile data connection.

---

## 2.7 SOFTWARE REQUIREMENTS

* **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 20.04 recommended for server).
* **Web Browser:** Google Chrome v90+, Mozilla Firefox v88+, or Microsoft Edge.
* **Runtime Environment:** Node.js v18.x or higher.
* **Package Manager:** NPM (Node Package Manager).
* **Object Detection Engine:** Python 3.9+ with Ultralytics YOLO library.
* **Database Management System:** MySQL v8.0 or MariaDB.

---

## 2.8 TECHNOLOGY STACK

* **Backend Development:** Node.js, Express.js.
* **Frontend Development:** HTML5, CSS3, JavaScript (ES6+).
* **Artificial Intelligence:** Python, YOLOv8 (Computer Vision), OpenCV.
* **Database:** MySQL.
* **Authentication:** Google OAuth 2.0, JWT (JSON Web Tokens).
* **Environment Management:** Dotenv (.env).
* **Development Tools:** VS Code, Git, Postman (API Testing), Selenium (QA Testing).

---

## 2.9 SYSTEM CONSTRAINTS

* **Connectivity Dependency:** The system requires a stable internet connection for AI processing and Google Maps integration.
* **Lighting and Image Quality:** The accuracy of waste classification is dependent on ambient lighting and the resolution of the user's camera.
* **Geographic Range:** Pickup requests are limited to the service radiuses defined by the registered recycling centers.

---

## 2.10 ASSUMPTIONS

* **User Literacy:** It is assumed that users have basic proficiency with web applications and digital cameras.
* **Hardware Availability:** All participating recycling centers are assumed to have a computing device to update request statuses.
* **Geolocation Accuracy:** The system assumes that the browser's geolocation API provides reasonably accurate coordinates for center assignment.
