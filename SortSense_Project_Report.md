# FINAL PROJECT REPORT: SORTSENSE
## SMART WASTE MANAGEMENT SYSTEM
### PROJECT BY: [YOUR NAME HERE]
### GUIDE: [GUIDE NAME HERE]

---

**1. ABSTRACT**

Sort Sense is an intelligent, full-stack waste management ecosystem designed to solve the critical challenge of improper waste segregation at the source. By combining state-of-the-art Artificial Intelligence (AI) with localized municipal guidelines, the platform empowers citizens to classify waste accurately, locate authorized disposal centers, and participate in a gamified environmental initiative. Targeted specifically at the Kerala (India) context, the application integrates directly with the Haritha Karma Sena (HKS) framework, bridging the gap between digital intelligence and physical waste collection infrastructure.

---

**2. INTRODUCTION**

**2.1 PROJECT OVERVIEW**
In rapidly urbanizing regions like Kerala, improper waste segregation at the source remains a significant hurdle for sustainable recycling. SortSense bridges this gap by providing citizens with a digital tool that simplifies segregation, rewards responsible behavior, and connects them directly with local collection centers.

**2.2 PROBLEM STATEMENT**
Current waste management systems rely heavily on manual sorting at central facilities, which is inefficient and leads to high contamination rates in recycling streams. There is a verified lack of interactive educational tools that guide citizens on the specific disposal rules of their local municipalities.

**2.3 OBJECTIVES**
* To automate waste identification using Deep Learning (YOLOv8) models.
* To provide localized, region-specific disposal instructions for Kerala citizens.
* To gamify environmental responsibility through an "Eco-Credit" reward system.
* To optimize waste collection logistics through a dedicated Center Dashboard and automated pickup requests.

---

**3. SYSTEM REQUIREMENTS SPECIFICATION**

**3.1 HARDWARE REQUIREMENTS**
* Processor: Intel Core i5 (Minimum)
* RAM: 8 GB (Recommended)
* Storage: 500 MB Free Space (For model weights and local database)
* Input Device: Standard Camera/Webcam for image acquisition

**3.2 SOFTWARE REQUIREMENTS**
* Operating System: Windows 10/11 or Linux
* Development Environment: Node.js (v18.x), Python (v3.9+)
* Database Management: MySQL (v8.0.x)
* AI Libraries: Ultralytics (YOLOv8), OpenCV, NumPy
* Backend Framework: Express.js
* Testing Tools: Selenium WebDriver

---

**4. SYSTEM DESIGN AND ARCHITECTURE**

**4.1 SYSTEM ARCHITECTURE**
The system is built on a 3-tier architecture:
1. **Presentation Tier:** Built with HTML5, Vanilla CSS, and JavaScript, providing a high-fidelity "Glassmorphic" interface across three distinct user roles (User, Admin, Collection Center).
2. **Application Tier:** A Node.js backend managing RESTful API requests, authentication (JWT), and communication with the AI processing bridge.
3. **Data Tier:** A relational MySQL database storing localized disposal rules, user history, HKS center profiles, and pickup schedules.

**4.2 AI LOGIC FLOW**
The AI module utilizes a YOLOv8 classification engine. When a user uploads an image, the backend spawns a Python child process that analyzes the image, identifies the waste category (Plastic, Glass, Paper, etc.), and returns a JSON packet containing the category name and a confidence score.

---

**5. IMPLEMENTATION MODULES**

**5.1 USER DASHBOARD**
* **Scan History:** Persistent log of all previous waste scans.
* **Eco Score:** Dynamic progress tracking based on recycling activity.
* **Smart Pickup:** Automated request system that matches users to the nearest HKS center using Haversine distance.

**5.2 ADMIN PORTAL**
* **System Health:** Monitoring dashboard for AI and Database services.
* **Moderation Service:** Automated flagging of inactive or high-report users to maintain system integrity.
* **Data Export:** Capability to export system analytics and pickup logs into CSV format.

**5.3 CENTER DASHBOARD (HKS)**
* **Pickup Management:** Real-time view of requests with "Urgent Priority" status indicators.
* **Navigation:** Geographic sorting of requests based on the center's jurisdiction.

---

**5.2 TEST PLAN**
A test plan is a document detailing the objectives, target market, internal resources, and processes for testing a software UI or product. It acts as a comprehensive guide that outlines the strategy, scope, resources, and schedule of intended test activities. The SortSense project test plan ensures that all functional modules (AI, Pickup, Auth) meet the desired quality standards and perform reliably under various conditions.

**5.2.1 Unit Testing**
Unit testing involves testing individual components or pieces of code to ensure they work as intended. In SortSense, unit testing was performed on core backend functions, such as the Haversine distance algorithm for center matching, the password hashing logic in the auth controller, and the AI identification bridge. Each function is tested in isolation to verify its logic and output accuracy.

**5.2.2 Integration Testing**
Integration testing focuses on the interaction between different modules of the system. In this project, integration testing verified the connectivity between the Node.js API and the MySQL database, ensuring that data saved in one module (like a signup) is correctly accessible by another (like the login). It also tested the bridge between the Node.js backend and the Python-based AI service to ensure seamless data flow.

**5.2.3 Validation Testing or System Testing**
Validation/System Testing evaluates the complete software to verify it complies with the project's requirements. This phase tests the "User Journey" as a whole. For SortSense, this involved verifying that a user could successfully find a waste category via AI, schedule a pickup, and see their eco-score update correctly—all within a single session without errors.

**5.2.4 Output Testing or User Acceptance Testing**
Output testing ensures that the system provides the correct information to the user in the desired format. In User Acceptance Testing (UAT), real-world scenarios are simulated to ensure the application is user-friendly and meets end-user expectations. We verified that the dashboard statistics are accurate, notifications are delivered in real-time, and the reports generated match the actual system data.

**5.2.5 Automation Testing**
Automation testing uses specialized software tools to execute tests automatically. For SortSense, automation was crucial for rapid regression testing. Instead of manually filling out registration forms for every update, we used automated scripts to input data, click buttons, and verify responses, significantly reducing the testing time and human error.

**5.2.6 Selenium Testing**
Selenium is a powerful portable framework for testing web applications. In this project, **Python Selenium** was used to simulate user interactions in the Chrome browser. It allowed us to test form submissions, URL redirections, and UI elements in a headless environment. This ensured that the SortSense frontend is robust and interacts correctly with the backend across various scenarios.

**5.2.7 Automated Test Suite**
The following automated test scripts were developed using Python Selenium to ensure continuous quality:
*   `test_register.py`: Verifies user registration flow, client-side validation, and auto-login after success.
*   `test_quick_search.py`: Validates the AI-driven or manual waste identification search and redirection to results.
*   `test_pickup_scheduling.py`: Tests the complete multi-step pickup request flow including area-based center selection.
*   `test_logout.py`: Ensures secure session termination and verifies Auth Guards prevent unauthorized access to the dashboard.

---

**6. CONCLUSION AND FUTURE SCOPE**

**6.1 CONCLUSION**
SortSense successfully bridges the gap between technology and environmental responsibility. By providing real-time AI classification and direct HKS integration, the system offers a scalable solution for modern waste management.

**6.2 FUTURE SCOPE**
* Integration of a mobile-native application (Flutter/React Native) for easier accessibility.
* Implementation of AI-driven route optimization for HKS collection vehicles.
* Addition of real-time GPS tracking for users to monitor waste collection trucks.

---

**DOCUMENT STATUS:** Final Submission Ready
**VERSION:** 1.0.0
**DATE:** March 2026
