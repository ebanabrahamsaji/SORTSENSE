const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();
    populateRecentActivity();
    setupInteractions();
    fetchAndAnimateStats();
});

// Check if user is authenticated as admin
function checkAdminAuth() {
    // For prototype, we'll assume if they reached this page, they are authorized.
    // In a real app, check token/session here.
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
        // Redirect to login if not logged in (commented out for easy testing)
        // window.location.href = 'login-admin.html';
    }
}

// Populate Recent Activity Table
async function populateRecentActivity() {
    const activityTableBody = document.getElementById('activityTableBody');
    if (!activityTableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/activities`);
        const activities = await response.json();

        activityTableBody.innerHTML = activities.map(activity => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px; padding-right: 1.5rem;">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random&color=fff&size=32" style="border-radius: 50%;" alt="${activity.user}">
                        <span>${activity.user}</span>
                    </div>
                </td>
                <td>${activity.action}</td>
                <td style="color: var(--text-secondary);">${activity.time}</td>
                <td><span class="status-badge status-${(activity.status || '').toLowerCase()} status-${(activity.statusLabel || '').toLowerCase()}">${activity.statusLabel}</span></td>
            </tr>
        `).join('');

        // Helper to fix classes if data is inconsistent
        document.querySelectorAll('.status-badge').forEach(badge => {
            const txt = badge.innerText.toLowerCase();
            badge.className = 'status-badge'; // Reset

            if (txt.includes('pending') || txt.includes('review')) badge.classList.add('status-pending');
            else if (txt.includes('analyzed')) badge.classList.add('status-analyzed');
            else if (txt.includes('approved') || txt.includes('verified')) badge.classList.add('status-approved');
            else if (txt.includes('completed')) badge.classList.add('status-completed');
            else if (txt.includes('rejected')) badge.classList.add('status-rejected');
            else badge.classList.add('status-pending'); // Fallback
        });
    } catch (error) {
        console.error("Error fetching activities:", error);
        activityTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Failed to load activities.</td></tr>`;
    }
}

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

    // Quick Actions
    const actionButtons = document.querySelectorAll('.btn-outline, .btn-primary');
    actionButtons.forEach(btn => {
        if (!btn.id && !btn.type) { // Exclude specific buttons if any
            btn.addEventListener('click', function () {
                const actionText = this.innerText.trim();
                alert(`Action triggered: ${actionText}\n(This feature is coming soon)`);
            });
        }
    });

    // Search Input
    const searchInput = document.querySelector('.header-search input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                alert(`Searching for: ${this.value}`);
            }
        });
    }
}

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
