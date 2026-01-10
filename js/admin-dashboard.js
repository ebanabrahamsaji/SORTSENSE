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
        const response = await fetch(`${API_BASE_URL}/api/activities`);
        const activities = await response.json();

        activityTableBody.innerHTML = activities.map(activity => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=random&color=fff&size=32" style="border-radius: 50%;" alt="${activity.user}">
                        <span>${activity.user}</span>
                    </div>
                </td>
                <td>
                    ${activity.action.includes('Scanned') ?
                `<img src="https://images.unsplash.com/photo-1595278069441-2cf29f8005e4?auto=format&fit=crop&q=80&w=64&h=64" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);" alt="Waste">` :
                '<span style="color: var(--text-secondary);">-</span>'}
                </td>
                <td>${activity.action}</td>
                <td style="color: var(--text-secondary);">${activity.time}</td>
                <td><span class="status-badge status-${activity.status === 'verified' || activity.status === 'completed' ? 'active' : 'pending'}">${activity.statusLabel}</span></td>
            </tr>
        `).join('');
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
                window.location.href = 'login-admin.html'; // Redirect to Admin Login
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
