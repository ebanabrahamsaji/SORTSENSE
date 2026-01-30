// Use relative paths for better reliability across different hostnames/ports
const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();
    // populateRecentActivity();
    setupInteractions();
    fetchAndAnimateStats();
});

// Check if user is authenticated as admin
function checkAdminAuth() {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
        // window.location.href = 'login-admin.html';
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
            if (confirm('Are you sure you want to logout from Admin Panel?')) {
                localStorage.removeItem('adminUser');
                window.location.href = 'login-user.html'; // Redirect to Unified Login
            }
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
            if (confirm('Are you sure you want to invalidate all active sessions? This will force logout all users.')) {
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
    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (response.ok) {
                    showToast('User created successfully and confirmation email sent.', 'success');
                    closeModal('addUserModal');
                    addUserForm.reset();
                    // Refresh stats and activity
                    fetchAndAnimateStats();
                    // populateRecentActivity();
                } else {
                    showToast(result.message || 'Error creating user', 'error');
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
        updateStat('stats-system-uptime', data.systemUptime);

    } catch (e) {
        console.error("Failed to fetch stats", e);
    }
}
