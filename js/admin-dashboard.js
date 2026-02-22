// Use relative paths for better reliability across different hostnames/ports
const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();
    fetchCenterStatus(); // Load Status Table
    // populateRecentActivity();
    setupInteractions();
    setupCenterToggle();
    fetchAndAnimateStats();
    fetchSystemHealth(); // Load System Health
});

// Check if user is authenticated as admin
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('admin_sys_id') || localStorage.getItem('adminUser');
    if (!isAdmin) {
        window.location.href = 'login-admin.html';
    }
}


// Populate Recent Activity Table - REMOVED to avoid duplication with dedicated page
// async function populateRecentActivity() {
//     const activityTableBody = document.getElementById('activityTableBody');
//     if (!activityTableBody) return;

//     try {
//         const response = await fetch(`${API_BASE_URL}/api/admin/activities`);
//         const activities = await response.json();

//         if (activities.length === 0) {
//             activityTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">No recent activity records.</td></tr>`;
//             return;
//         }

//         activityTableBody.innerHTML = activities.map(activity => {
//             const status = activity.statusLabel || activity.status || 'Pending';
//             let statusClass = 'status-pending';
//             const lowerStatus = status.toLowerCase();

//             if (lowerStatus.includes('analyzed')) statusClass = 'status-analyzed';
//             else if (lowerStatus.includes('verified') || lowerStatus.includes('approved') || lowerStatus.includes('completed')) statusClass = 'status-approved';
//             else if (lowerStatus.includes('rejected') || lowerStatus.includes('flagged')) statusClass = 'status-rejected';

//             return `
//                 <tr style="cursor: pointer;" onclick="window.location.href='admin-recent-activity.html'">
//                     <td>
//                         <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
//                             <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random&color=fff&size=36&bold=true" 
//                                  style="border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);" 
//                                  alt="${activity.user}">
//                             <div style="display: flex; flex-direction: column;">
//                                 <span style="font-weight: 600; color: white;">${activity.user}</span>
//                             </div>
//                         </div>
//                     </td>
//                     <td style="color: var(--text-primary); font-size: 0.9rem;">${activity.action}</td>
//                     <td style="color: var(--text-secondary); font-size: 0.85rem;">${activity.time}</td>
//                     <td><span class="status-badge ${statusClass}">${status}</span></td>
//                 </tr>
//             `;
//         }).join('');
//     } catch (error) {
//         console.error("Error fetching activities:", error);
//         activityTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load activities.</td></tr>`;
//     }
// }

// Setup Basic Interactions
function setupInteractions() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.showCustomConfirm('Logout', 'Are you sure you want to logout from Admin Panel?', function () {
                localStorage.removeItem('adminUser');
                localStorage.removeItem('admin_sys_id');
                window.location.href = 'login-admin.html';
            });
        });
    }

    // Quick Action Buttons
    const btnAddUser = document.getElementById('btnAddUser');
    const btnAddCategory = document.getElementById('btnAddCategory');
    const btnExportReports = document.getElementById('btnExportReports');
    const btnInvalidateSessions = document.getElementById('btnInvalidateSessions');

    if (btnAddUser) btnAddUser.onclick = () => showModal('addUserModal');
    if (btnAddCategory) btnAddCategory.onclick = () => showModal('addCategoryModal');
    if (btnExportReports) btnExportReports.onclick = () => showModal('exportReportsModal');

    if (btnInvalidateSessions) {
        btnInvalidateSessions.onclick = async () => {
            window.showCustomConfirm('Invalidate Sessions', 'Are you sure you want to invalidate all active sessions? This will force logout all users.', async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/admin/sessions/invalidate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    if (response.ok) {
                        showToast('All user sessions have been invalidated successfully.', 'success');
                    } else {
                        showToast(result.message || 'Failed to invalidate sessions.', 'error');
                    }
                } catch (error) {
                    console.error('Error invalidating sessions:', error);
                    showToast('System error while invalidating sessions.', 'error');
                }
            });
        };
    }

    // Export Pickups CSV Button
    const btnExportPickups = document.getElementById('btnExportPickups');
    if (btnExportPickups) {
        btnExportPickups.onclick = async () => {
            try {
                showToast('Generating CSV file...', 'info');
                window.location.href = `${API_BASE_URL}/api/admin/export/pickups`;
                setTimeout(() => {
                    showToast('CSV download started!', 'success');
                }, 500);
            } catch (error) {
                console.error('Export Error:', error);
                showToast('Failed to export pickups data.', 'error');
            }
        };
    }

    // Form Submissions
    setupFormHandlers();

    // Search Input - Smart Routing
    const searchInput = document.querySelector('.header-search input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                const query = this.value.toLowerCase().trim();

                // Map keywords to pages
                if (['users', 'user', 'admins', 'admin', 'centers', 'center', 'accounts'].some(k => query.includes(k))) {
                    showToast('Navigating to User Management...', 'info');
                    setTimeout(() => window.location.href = 'admin-users.html', 500); // Small delay for UX
                    return;
                }

                if (['requests', 'request', 'pickup', 'pickups', 'special', 'waste'].some(k => query.includes(k))) {
                    showToast('Navigating to Pickup Requests...', 'info');
                    setTimeout(() => window.location.href = 'admin-special-waste.html', 500);
                    return;
                }

                if (['reports', 'report', 'analytics', 'data', 'export', 'chart'].some(k => query.includes(k))) {
                    showToast('Navigating to Waste Data & Reports...', 'info');
                    setTimeout(() => window.location.href = 'admin-waste-data.html', 500);
                    return;
                }

                if (['logs', 'log', 'activity', 'activities', 'history', 'audit'].some(k => query.includes(k))) {
                    showToast('Navigating to Activity Logs...', 'info');
                    setTimeout(() => window.location.href = 'admin-recent-activity.html', 500);
                    return;
                }

                showToast(`No quick access module found for: "${this.value}"`, 'warning');
            }
        });
    }
}

function setupFormHandlers() {
    // Password Toggle
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('newUserPassword');
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.className = type === 'password' ? 'ri-eye-off-line password-toggle' : 'ri-eye-line password-toggle';
        });
    }

    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            const data = Object.fromEntries(formData.entries());

            // Trim inputs
            data.name = data.name.trim();
            data.email = data.email.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (response.ok) {
                    showToast('User created successfully. Welcome email sent.', 'success');
                    closeModal('addUserModal');
                    addUserForm.reset();
                    // Reset password toggle
                    if (passwordInput) passwordInput.type = 'password';
                    if (toggleBtn) toggleBtn.className = 'ri-eye-off-line password-toggle';

                    // Refresh stats and activity
                    fetchAndAnimateStats();
                } else {
                    if (response.status === 409) {
                        showToast(result.message, 'warning'); // Use warning color for duplicates
                    } else {
                        showToast(result.message || 'Error creating user', 'error');
                    }
                }
            } catch (error) {
                showToast('Network error while creating user', 'error');
            }
        };
    }

    // Add Category Form
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(addCategoryForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast('New waste category added successfully.', 'success');
                    closeModal('addCategoryModal');
                    addCategoryForm.reset();
                } else {
                    const result = await response.json();
                    showToast(result.message || 'Error adding category', 'error');
                }
            } catch (error) {
                showToast('Network error while adding category', 'error');
            }
        };
    }

    // Export Reports Form
    const exportReportsForm = document.getElementById('exportReportsForm');
    if (exportReportsForm) {
        exportReportsForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(exportReportsForm);
            const params = new URLSearchParams(Object.fromEntries(formData.entries())).toString();

            showToast('Generating report...', 'info');

            // Trigger download
            window.location.href = `${API_BASE_URL}/api/admin/reports/export?${params}`;
            closeModal('exportReportsModal');
        };
    }
}

// Modal Helpers
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: #1e293b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        border-left: 4px solid;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;

    let icon = 'ri-information-line';
    let borderColor = '#3b82f6';

    if (type === 'success') {
        icon = 'ri-checkbox-circle-line';
        borderColor = '#10b981';
    } else if (type === 'error') {
        icon = 'ri-error-warning-line';
        borderColor = '#ef4444';
    } else if (type === 'warning') {
        icon = 'ri-alert-line';
        borderColor = '#f59e0b';
    }

    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `
        <i class="${icon}" style="color:${borderColor}"></i>
        <div style="flex-grow:1">${message}</div>
        <i class="ri-close-line" style="cursor:pointer; opacity:0.6" onclick="this.parentElement.remove()"></i>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Add CSS for toast animations if not present
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Fetch and Animate Stats
async function fetchAndAnimateStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
        const data = await response.json();

        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        updateStat('stats-total-users', data.totalUsers);
        updateStat('stats-items-sorted', data.itemsSorted);
        updateStat('stats-flagged-items', data.flaggedItems);
        updateStat('stats-pickups-today', data.pickupsToday);

    } catch (e) {
        console.error("Failed to fetch stats", e);
    }
}

// --- New Features: System Health & Center Management ---

async function fetchSystemHealth() {
    const container = document.getElementById('systemHealthPanel');
    if (!container) return; // Might need to add this to HTML first if not present

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-health`);
        const data = await res.json();

        if (data.error) {
            container.innerHTML = `<div style="color:#ef4444; padding:10px;">System Health Check Failed</div>`;
            return;
        }

        container.innerHTML = `
            <div class="health-card" style="display:flex; gap:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; font-size:0.9rem; align-items:center;">
                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">AI Service</span>
                    <div style="font-weight:600; color:${data.aiService === 'Running' ? '#10b981' : '#ef4444'}">
                        <i class="ri-${data.aiService === 'Running' ? 'robot' : 'error-warning'}-line"></i> ${data.aiService}
                    </div>
                </div>

                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">Pickups Today</span>
                    <div style="font-weight:600; color:#e2e8f0;">${data.todaysPickups}</div>
                </div>
                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">Active Users</span>
                    <div style="font-weight:600; color:#e2e8f0;">${data.activeUsers}</div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error("Health Check Error:", e);
    }
}

async function fetchCenterStatus() {
    const tableBody = document.getElementById('centerTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:gray;"><i class="ri-loader-4-line ri-spin"></i> Loading status...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/centers`);
        const centers = await response.json();

        if (!Array.isArray(centers) || centers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color: #94a3b8;">No centers found.</td></tr>';
            return;
        }

        tableBody.innerHTML = centers.map(center => {
            let statusColor = '#10b981'; // Green (Open)
            let loadColor = '#10b981'; // Green (Free)
            let toggleIcon = 'ri-lock-unlock-line';
            let toggleTitle = 'Close Center';

            if (center.status === 'CLOSED') {
                statusColor = '#ef4444';
                toggleIcon = 'ri-lock-line';
                toggleTitle = 'Open Center';
            }

            if (center.busyLevel === 'Busy') loadColor = '#f59e0b';
            else if (center.busyLevel === 'Full') loadColor = '#ef4444';

            // Progress Bar Logic
            const usage = center.max_slots - center.available_slots;
            const percent = (usage / center.max_slots) * 100;

            return `
                <tr>
                    <td style="font-weight: 500; color: white;">${center.center_name}</td>
                    <td>
                        <button onclick="toggleCenterStatus(${center.center_id})" class="btn-text" style="color:${statusColor}; cursor:pointer; background:none; border:none; display:flex; align-items:center; gap:5px;" title="${toggleTitle}">
                            <span class="status-badge" style="background:${statusColor}20; color:${statusColor}">${center.status}</span>
                            <i class="ri-refresh-line" style="font-size:0.8rem; opacity:0.7;"></i>
                        </button>
                    </td>
                    <td style="width:200px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                            <span>${center.available_slots} / ${center.max_slots} Left</span>
                            <span>${Math.round(percent)}% Used</span>
                        </div>
                        <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                            <div style="width:${percent}%; height:100%; background:${loadColor}; transition:width 0.3s;"></div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge" style="background:${loadColor}20; color:${loadColor}">${center.busyLevel}</span>
                    </td>
                    <td>
                        <div style="display:flex; gap:5px;">
                            <button class="btn btn-sm" style="padding:4px 8px; font-size: 1.1rem; background: rgba(255,255,255,0.05); color:#cbd5e1;" title="Reset Slots" onclick="resetCenterSlots(${center.center_id})">
                                <i class="ri-restart-line"></i>
                            </button>
                            <button class="btn btn-sm" style="padding:4px 8px; font-size: 1.1rem; background: rgba(255,255,255,0.05); color:#cbd5e1; display:none;" title="View Details" onclick="viewCenterDetails(${center.center_id})">
                                <i class="ri-eye-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error("Error fetching center status:", error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Failed to load status.</td></tr>';
    }
}

window.resetCenterSlots = async (id) => {
    if (!confirm('Reset this center slots to Maximum capacity?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/centers/${id}/reset`, { method: 'POST' });
        if (res.ok) {
            showToast('Slots reset successfully', 'success');
            fetchCenterStatus();
        } else {
            showToast('Failed to reset slots', 'error');
        }
    } catch (e) { console.error(e); }
};

window.toggleCenterStatus = async (id) => {
    // Confirm is optional, but safer
    // if(!confirm('Toggle center status?')) return; 
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/centers/${id}/toggle`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message, 'success');
            fetchCenterStatus();
        } else {
            showToast('Failed to toggle status', 'error');
        }
    } catch (e) { console.error(e); }
};

// Ensure refreshCenterStatus is available globally for the HTML onclick handler
window.refreshCenterStatus = fetchCenterStatus;

function setupCenterToggle() {
    const toggleBtn = document.getElementById('toggleCenterStatusBtn');
    const container = document.getElementById('centerStatusContainer');
    const refreshBtn = document.getElementById('refreshCenterBtn');

    if (toggleBtn && container) {
        // Initial setup for the button click
        toggleBtn.addEventListener('click', () => {
            const isHidden = container.style.display === 'none';
            if (isHidden) {
                container.style.display = 'block';
                toggleBtn.innerHTML = '<i class="ri-eye-off-line"></i> Hide Center Status';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-outline');
                if (refreshBtn) refreshBtn.style.display = 'inline-flex';
            } else {
                container.style.display = 'none';
                toggleBtn.innerHTML = '<i class="ri-eye-line"></i> View Center Status';
                toggleBtn.classList.remove('btn-outline');
                toggleBtn.classList.add('btn-primary');
                if (refreshBtn) refreshBtn.style.display = 'none';
            }
        });
    }
}

// Fetch System Health Status
async function fetchSystemHealth() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-health`);
        const data = await res.json();

        // Update Pickups Today
        const pickupsEl = document.getElementById('stats-pickups-today');
        if (pickupsEl) pickupsEl.textContent = data.pickupsToday || '0';

    } catch (error) {
        console.error('System Health Fetch Error:', error);
    }
}

// Make it globally accessible
window.fetchSystemHealth = fetchSystemHealth;

// --- Section Navigation (SPA) ---
function showSection(sectionId) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the target section
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    const sectionNavMap = {
        'dashboardSection': 'a[href="admin-dashboard.html"]',
        'analyticsSection': '#analyticsNav',
        'systemSettingsSection': '#systemSettingsNav'
    };
    const selector = sectionNavMap[sectionId];
    if (selector) {
        const navLink = document.querySelector(selector);
        if (navLink && navLink.parentElement) navLink.parentElement.classList.add('active');
    }
}

// Add navigation handler to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Analytics Nav Handler
    const analyticsNav = document.getElementById('analyticsNav');
    if (analyticsNav) {
        analyticsNav.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to dedicated analytics page
            window.location.href = 'admin-analytics.html';
        });
    }

    // Dashboard (Overview) Nav Handler
    const dashboardNav = document.querySelector('a[href="admin-dashboard.html"]');
    if (dashboardNav) {
        // If we are already on admin-dashboard.html, interception prevents reload
        dashboardNav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            dashboardNav.parentElement.classList.add('active');
            showSection('dashboardSection');
        });
    }

    // System Settings Nav Handler
    const systemSettingsNav = document.getElementById('systemSettingsNav');
    if (systemSettingsNav) {
        systemSettingsNav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            systemSettingsNav.parentElement.classList.add('active');
            showSection('systemSettingsSection');

            // Load system info when section opens
            loadSystemInfo();

            // Load saved settings
            loadSettings();
        });
    }
});

// --- Admin Notifications System ---
let adminNotificationInterval;

function initAdminNotifications() {
    fetchNotifications();
    // Poll every 30 seconds
    if (adminNotificationInterval) clearInterval(adminNotificationInterval);
    adminNotificationInterval = setInterval(fetchNotifications, 30000);

    // Setup Dropdown Toggle
    const bellBtn = document.querySelector('.header-profile .notification-badge');
    if (bellBtn) {
        // Create dropdown container if not exists
        let dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notificationDropdown';
            dropdown.className = 'notification-dropdown';
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <span>Notifications</span>
                    <button class="mark-read-btn" onclick="markAsRead('all')">Mark all as read</button>
                </div>
                <div class="dropdown-content" id="notificationList">
                    <div style="padding:20px; text-align:center; color:var(--text-secondary);">Loading...</div>
                </div>
            `;
            bellBtn.parentElement.appendChild(dropdown);
        }

        bellBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationDropdown();
        };

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!bellBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
}

async function fetchNotifications() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/notifications`);
        const data = await res.json();
        if (data.success) {
            updateNotificationBadge(data.unreadCount);
            renderNotificationList(data.notifications);
        }
    } catch (e) {
        console.error("Fetch Notifications Error:", e);
    }
}

function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge .dot');
    if (badge) {
        if (count > 0) {
            badge.style.display = 'flex';
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.fontSize = '10px';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.color = 'white';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderNotificationList(notifications) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
        list.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text-secondary);">
            <i class="ri-notification-off-line" style="font-size:2rem; opacity:0.5; margin-bottom:10px; display:block;"></i>
            No notifications
        </div>`;
        return;
    }

    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id}, '${n.type}')">
            <div class="notif-icon ${n.type}">
                <i class="${getNotificationIcon(n.type)}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${timeAgo(new Date(n.created_at))}</div>
            </div>
            ${!n.is_read ? `<div class="notif-dot"></div>` : ''}
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'USER': return 'ri-user-add-line';
        case 'WASTE': return 'ri-recycle-line';
        case 'MESSAGE': return 'ri-message-2-line';
        case 'ALERT': return 'ri-alert-line';
        default: return 'ri-notification-3-line';
    }
}

window.markAsRead = async (id) => {
    try {
        await fetch(`${API_BASE_URL}/api/admin/notifications/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchNotifications(); // Refresh
    } catch (e) { console.error(e); }
};

window.handleNotificationClick = async (id, type) => {
    await markAsRead(id);
    // Redirect based on type
    if (type === 'USER') window.location.href = 'admin-users.html';
    else if (type === 'WASTE') window.location.href = 'admin-waste-data.html';
    else if (type === 'MESSAGE') window.location.href = 'admin-dashboard.html'; // Or messages page
    else if (type === 'ALERT') window.location.href = 'admin-recent-activity.html';
};

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('active');
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

// Add CSS for notifications dynamically
const notifStyle = document.createElement('style');
notifStyle.textContent = `
    .notification-dropdown {
        position: absolute;
        top: 60px;
        right: 80px;
        width: 320px;
        background: #1e293b;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        display: none;
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease-out;
    }
    .notification-dropdown.active { display: block; }
    .dropdown-header {
        padding: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255,255,255,0.02);
    }
    .dropdown-header span { font-weight: 600; color: white; }
    .mark-read-btn {
        background: none; border: none; color: var(--primary-color);
        font-size: 0.8rem; cursor: pointer;
    }
    .dropdown-content { max-height: 400px; overflow-y: auto; }
    .notification-item {
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .notification-item:hover { background: rgba(255,255,255,0.05); }
    .notification-item.unread { background: rgba(59, 130, 246, 0.1); }
    .notif-icon {
        width: 36px; height: 36px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .notif-icon.USER { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .notif-icon.WASTE { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .notif-icon.ALERT { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .notif-icon.MESSAGE { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    
    .notif-content { flex-grow: 1; }
    .notif-title { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
    .notif-message { font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; line-height: 1.3; }
    .notif-time { font-size: 0.75rem; color: #64748b; }
    .notif-dot {
        width: 8px; height: 8px; background: #3b82f6;
        border-radius: 50%; margin-top: 6px;
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(notifStyle);

// Init on load
document.addEventListener('DOMContentLoaded', initAdminNotifications);

// --- Consolidated Analytics Logic ---
async function initDashboardCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    await loadWasteComposition();
    await loadUserActivity();
    await loadCenterCapacity();
}

async function loadWasteComposition() {
    const canvas = document.getElementById('wasteCompositionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const data = {
        labels: ['Plastic', 'Organic', 'Paper', 'Glass', 'E-Waste', 'Hazardous', 'Metal'],
        datasets: [{
            data: [35, 25, 15, 10, 5, 5, 5],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
                'rgba(14, 165, 233, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(100, 116, 139, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

async function loadUserActivity() {
    const canvas = document.getElementById('userActivityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [];
    const dataPoints = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        dataPoints.push(Math.floor(Math.random() * 50) + 10);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Scans',
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

async function loadCenterCapacity() {
    const canvas = document.getElementById('centerCapacityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    try {
        const res = await fetch(`${API_BASE_URL}/api/centers`);
        const centers = await res.json();

        let labels = [];
        let usedData = [];
        let freeData = [];

        if (Array.isArray(centers)) {
            labels = centers.map(c => c.center_name);
            usedData = centers.map(c => c.max_slots - c.available_slots);
            freeData = centers.map(c => c.available_slots);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Used Slots', data: usedData, backgroundColor: '#ef4444', borderRadius: 4 },
                    { label: 'Available Slots', data: freeData, backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                },
                plugins: { tooltip: { mode: 'index', intersect: false } }
            }
        });
    } catch (e) { console.error("Failed to load center stats", e); }
}

// --- Pickup Trend Mini Chart ---
document.addEventListener('DOMContentLoaded', () => {
    loadPickupTrend();
});

async function loadPickupTrend() {
    const canvas = document.getElementById('pickupTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    try {
        const res = await fetch('/api/pickup/trend');
        const data = await res.json();

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Today', 'Yesterday', 'This Week'],
                datasets: [{
                    label: 'Pickups',
                    data: [data.today, data.yesterday, data.week],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)', // Indigo
                        'rgba(168, 85, 247, 0.8)', // Purple
                        'rgba(236, 72, 153, 0.8)'  // Pink
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Failed to load pickup trend", e);
    }
}

// --- System Settings Functions ---

// Load System Information
async function loadSystemInfo() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-info`);

        if (!res.ok) throw new Error('API error');

        const data = await res.json();

        document.getElementById('aiStatusSetting').textContent = data.ai || '--';
        document.getElementById('dbModeSetting').textContent = data.db || '--';
        document.getElementById('uptimeSetting').textContent = data.uptime || '--';
        document.getElementById('memorySetting').textContent = data.memory || '--';
        document.getElementById('nodeVersion').textContent = data.node || '--';
    } catch (error) {
        console.error('Error loading system info:', error);
        document.getElementById('aiStatusSetting').textContent = 'Error';
        document.getElementById('dbModeSetting').textContent = 'Error';
        document.getElementById('uptimeSetting').textContent = 'Error';
        document.getElementById('memorySetting').textContent = 'Error';
        document.getElementById('nodeVersion').textContent = 'Error';
    }
}

// Make loadSystemInfo globally accessible
window.loadSystemInfo = loadSystemInfo;

// Load Settings from localStorage
// Load Settings from localStorage
function loadSettings() {
    // Logic moved to inline handlers in admin-dashboard.html to support the new modular System Settings section.
    // This function is kept for potential future global initializations.
    console.log("System settings initialized.");
}

// Clear All Cache
function clearAllCache() {
    if (confirm('Are you sure you want to clear all system cache? This will remove temporary data.')) {
        try {
            // Clear specific cache items (not all localStorage)
            // Preserve all system settings keys
            const keysToKeep = [
                'adminUser',
                'maintenanceMode',
                'globalAutoRefresh',
                'notificationsEnabled',
                'debugMode',
                'aiEnabled',
                'aiConfidence',
                'autoApprove',
                'strictSpecialWaste',
                'messagingEnabled',
                'adminLogging'
            ];
            const allKeys = Object.keys(localStorage);

            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            showToast('System cache cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing cache:', error);
            showToast('Failed to clear cache', 'error');
        }
    }
}

// Make clearAllCache globally accessible
window.clearAllCache = clearAllCache;

// Reset All Settings
function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        try {
            // Reset to defaults
            // Reset to defaults
            const defaults = {
                'maintenanceMode': 'false',
                'globalAutoRefresh': 'false',
                'notificationsEnabled': 'true',
                'debugMode': 'false',
                'aiEnabled': 'true',
                'aiConfidence': '85',
                'autoApprove': 'false',
                'strictSpecialWaste': 'true',
                'messagingEnabled': 'true',
                'adminLogging': 'true'
            };

            for (const [key, value] of Object.entries(defaults)) {
                localStorage.setItem(key, value);

                // Update UI if element exists
                // We rely on page reload or specific UI update logic, 
                // but for immediate feedback on toggles:
                const map = {
                    'maintenanceMode': 'maintenanceToggle',
                    'globalAutoRefresh': 'globalRefreshToggle',
                    'notificationsEnabled': 'notificationToggle',
                    'debugMode': 'debugModeToggle',
                    'aiEnabled': 'aiToggle',
                    'autoApprove': 'autoApproveToggle',
                    'strictSpecialWaste': 'strictApprovalToggle',
                    'messagingEnabled': 'messagingToggle',
                    'adminLogging': 'loggingToggle'
                };

                if (map[key]) {
                    const el = document.getElementById(map[key]);
                    if (el) el.checked = (value === 'true');
                }
            }

            // Also reset sliders/text
            if (document.getElementById('confidenceSlider')) {
                document.getElementById('confidenceSlider').value = 85;
                document.getElementById('confidenceValue').innerText = '85%';
            }

            // Reload settings
            loadSettings();

            showToast('Settings reset to defaults', 'success');
        } catch (error) {
            console.error('Error resetting settings:', error);
            showToast('Failed to reset settings', 'error');
        }
    }
}

// --- Reports Module Implementation ---

function hideAllSections() {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
}

window.showSection = function (id) {
    hideAllSections();
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
};

// Wiring up Navigation
const reportsNav = document.getElementById('reportsNav');
if (reportsNav) {
    reportsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('reportsSection');
        reportsNav.parentElement.classList.add('active');
        fetchReportRecords();
    };
}

const analyticsNav = document.getElementById('analyticsNav');
if (analyticsNav) {
    analyticsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('analyticsSection');
        analyticsNav.parentElement.classList.add('active');
    };
}

const systemSettingsNav = document.getElementById('systemSettingsNav');
if (systemSettingsNav) {
    systemSettingsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('systemSettingsSection');
        systemSettingsNav.parentElement.classList.add('active');
    };
}

// Handle Report Type Toggle
const reportTypeSelect = document.getElementById('reportType');
if (reportTypeSelect) {
    reportTypeSelect.onchange = (e) => {
        const userGroup = document.getElementById('userFilterGroup');
        if (userGroup) userGroup.style.display = e.target.value === 'summary' ? 'none' : 'block';
    };
}

// Fetch Records for Report Table
async function fetchReportRecords() {
    const tbody = document.getElementById('reportRecordsTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">
        <i class="ri-loader-4-line" style="animation:spin 1s linear infinite; display:inline-block;"></i>
        Loading records…
    </td></tr>`;

    try {
        const res = await fetch('/api/pickup/all');

        // Check HTTP status before trying to parse
        if (!res.ok) {
            let detail = `HTTP ${res.status}`;
            try {
                const errBody = await res.json();
                detail = errBody.detail || errBody.message || detail;
            } catch (_) { /* body not JSON */ }
            throw new Error(detail);
        }

        const records = await res.json();

        if (!Array.isArray(records) || records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">
                <i class="ri-inbox-line" style="font-size:1.5rem;"></i><br>No records found.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = records.slice(0, 50).map(r => `
            <tr>
                <td>#${r.request_id}</td>
                <td>${r.user_name || '—'}</td>
                <td>${r.waste_type || '—'}</td>
                <td>${r.quantity != null ? r.quantity + ' kg' : '—'}</td>
                <td><span class="status-badge status-${(r.status || '').toLowerCase()}">${r.status || '—'}</span></td>
                <td>
                    <button onclick="downloadAdminReport(${r.request_id})" class="btn btn-sm btn-outline" style="padding:4px 8px; font-size:0.75rem;">
                        <i class="ri-file-pdf-line"></i> PDF
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('[Reports] fetchReportRecords error:', e.message);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">
            <span style="color:#ef4444;"><i class="ri-error-warning-line"></i> Error loading records: <code style="font-size:0.8rem;">${e.message}</code></span><br>
            <button onclick="fetchReportRecords()" class="btn btn-sm btn-outline" style="margin-top:0.75rem; padding:4px 12px;">
                <i class="ri-refresh-line"></i> Retry
            </button>
        </td></tr>`;
    }
}


// Download Report (Admin Actions)
window.downloadAdminReport = async function (requestId) {
    try {
        showToast('Processing report...', 'info');
        const response = await fetch(`/api/reports/request/${requestId}`, {
            headers: { 'admin-id': localStorage.getItem('admin_sys_id') }
        });

        if (!response.ok) throw new Error('Generation failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SortSense_Official_Report_${requestId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        showToast('PDF downloaded successfully.', 'success');
    } catch (error) {
        showToast('Failed to generate PDF.', 'error');
    }
};

// Bulk/Summary Report Generation
if (document.getElementById('btnGenerateReport')) {
    document.getElementById('btnGenerateReport').onclick = async () => {
        const type = document.getElementById('reportType').value;
        const from = document.getElementById('reportFromDate').value;
        const to = document.getElementById('reportToDate').value;
        const userId = document.getElementById('reportUserId').value;

        if (type === 'summary') {
            let url = `/api/reports/summary?fromDate=${from}&toDate=${to}`;
            if (userId) url += `&userId=${userId}`;

            showToast('Generating Summary PDF...', 'info');
            window.location.href = url; // Browser handles PDF stream
        } else {
            showToast('Please select a specific record from the table below for individual reports.', 'warning');
        }
    };
}

window.resetReportFilters = () => {
    document.getElementById('reportFromDate').value = '';
    document.getElementById('reportToDate').value = '';
    document.getElementById('reportUserId').value = '';
    document.getElementById('reportType').value = 'summary';
    document.getElementById('userFilterGroup').style.display = 'none';
};
