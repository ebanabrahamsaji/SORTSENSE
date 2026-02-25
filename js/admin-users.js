let allUsers = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (adminUser.name) {
        document.getElementById('adminNameDisplay').textContent = adminUser.name;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.showCustomConfirm('Logout', 'Are you sure you want to logout from Admin Panel?', () => {
                localStorage.removeItem('adminUser');
                localStorage.removeItem('admin_sys_id');
                window.location.href = 'login.html?role=admin';
            });
        });
    }
});

async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users');
        allUsers = await res.json();
        renderUsers();
    } catch (e) {
        console.error(e);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load users.</td></tr>';
    }
}

window.setStatusFilter = (filter) => {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter.replace('-', ' '))) {
            btn.classList.add('active');
        } else if (filter === 'all' && btn.textContent === 'Show All') {
            btn.classList.add('active');
        }
    });
    renderUsers();
};

function renderUsers(query = '') {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    const term = query.toLowerCase();

    const filtered = allUsers.filter(u => {
        // Search Filter
        const matchesSearch = !query ||
            (u.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // Status Filter
        const status = (u.user_status || 'active').toLowerCase();
        if (currentFilter === 'active') return status === 'active';
        if (currentFilter === 'flagged') return status === 'flagged';
        if (currentFilter === 'suspended') return status === 'suspended';
        if (currentFilter === 'high-risk') return (u.risk_score || 0) > 50;

        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No users found.</td></tr>';
        return;
    }

    filtered.forEach(u => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        const userStatus = (u.user_status || 'active').toLowerCase();
        const riskScore = u.risk_score || 0;

        let statusBadge = '';
        if (userStatus === 'active') statusBadge = '<span style="color:#10B981; font-weight:600; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:12px;">Active</span>';
        else if (userStatus === 'flagged') statusBadge = '<span style="color:#F59E0B; font-weight:600; background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:12px;">Flagged</span>';
        else if (userStatus === 'suspended') statusBadge = '<span style="color:#EF4444; font-weight:600; background:rgba(239,68,68,0.1); padding:4px 8px; border-radius:12px;">Suspended</span>';

        // Risk Progress Color
        let riskColor = '#10B981';
        if (riskScore >= 70) riskColor = '#EF4444';
        else if (riskScore >= 40) riskColor = '#F59E0B';

        // Action Buttons
        let actionButtons = '';
        if (userStatus === 'suspended') {
            actionButtons += `<button class="table-action-btn btn-activate" onclick="toggleStatus(${u.user_id}, 'active')">Activate</button>`;
        } else {
            actionButtons += `<button class="table-action-btn btn-deactivate" onclick="confirmSuspension(${u.user_id})">Suspend</button>`;
        }

        if (userStatus !== 'flagged') {
            actionButtons += `<button class="table-action-btn" onclick="markAsFlagged(${u.user_id})" style="background:#F59E0B;">Flag</button>`;
        }

        if (riskScore > 0) {
            actionButtons += `<button class="table-action-btn" onclick="resetRisk(${u.user_id})" style="background:#6366f1;"><i class="ri-refresh-line"></i> Reset Risk</button>`;
        }

        const lastActive = u.last_active ? new Date(u.last_active).toLocaleString() : 'Never';

        row.innerHTML = `
            <td style="padding:15px;">
                <div style="font-weight:600;">${u.name}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${u.role}</div>
            </td>
            <td style="padding:15px;">${u.email}</td>
            <td style="padding:15px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600;">${riskScore}</span>
                    <div class="risk-progress-container">
                        <div class="risk-progress-bar" style="width:${riskScore}%; background:${riskColor};"></div>
                    </div>
                </div>
            </td>
            <td style="padding:15px; text-align:center;">${u.report_count || 0}</td>
            <td style="padding:15px;">${statusBadge}</td>
            <td style="padding:15px; font-size:0.85rem; color:#cbd5e1;">${lastActive}</td>
            <td style="padding:15px;">
                <div style="display:flex; gap:5px;">${actionButtons}</div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.filterUsers = () => {
    const query = document.getElementById('userSearchInput').value;
    renderUsers(query);
};

window.confirmSuspension = (id) => {
    window.showCustomConfirm("Suspend User", "Are you sure you want to suspend this user? They will be blocked from logging in.", () => {
        toggleStatus(id, 'suspended', 'Administrative action');
    });
};

window.toggleStatus = async (id, status, reason = 'Admin request') => {
    try {
        const adminName = document.getElementById('adminNameDisplay').textContent;
        const res = await fetch('/api/admin/user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, status, reason, adminName })
        });
        if (res.ok) {
            window.showSuccess(`User status updated to ${status}`);
            fetchUsers();
        } else {
            window.showError("Failed to update status");
        }
    } catch (e) {
        window.showError("Connection Error");
    }
};

window.markAsFlagged = (id) => {
    toggleStatus(id, 'flagged', 'Flagged for review by admin');
};

window.resetRisk = async (id) => {
    try {
        const adminName = document.getElementById('adminNameDisplay').textContent;
        const res = await fetch('/api/admin/user-risk-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, adminName })
        });
        if (res.ok) {
            window.showSuccess("Risk score reset and user activated.");
            fetchUsers();
        } else {
            window.showError("Failed to reset risk score");
        }
    } catch (e) {
        window.showError("Connection Error");
    }
};
