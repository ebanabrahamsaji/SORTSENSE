// ── State ─────────────────────────────────────────────
let allUsers = [];   // registered users from /api/admin/users
let allCenters = [];   // registered centers from /api/centers
let currentTypeFilter = 'users';  // 'users' | 'centers' | 'all'
let currentStatusFilter = 'none';   // 'none' | 'active' | 'flagged' | 'suspended' | 'high-risk'

// ── Boot ──────────────────────────────────────────────
async function fetchStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        const totalUsersEl = document.getElementById('statTotalUsers');
        const centersEl = document.getElementById('statCentersRegistered');
        if (totalUsersEl) totalUsersEl.textContent = data.totalUsers ?? '—';
        if (centersEl) centersEl.textContent = data.centersRegistered ?? '—';
    } catch (e) { console.error('Stats fetch error:', e); }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    fetchData();

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (adminUser.name) document.getElementById('adminNameDisplay').textContent = adminUser.name;

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

// ── Data Fetching ─────────────────────────────────────
async function fetchData() {
    try {
        const [usersRes, centersRes] = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/centers')
        ]);
        allUsers = await usersRes.json();
        allCenters = await centersRes.json();
        render();
    } catch (e) {
        console.error(e);
        document.getElementById('usersTableBody').innerHTML =
            '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load data.</td></tr>';
    }
}

// Keep legacy alias so other internal calls still work
async function fetchUsers() { return fetchData(); }

// ── Filter Setters ────────────────────────────────────
window.setTypeFilter = (type) => {
    currentTypeFilter = type;

    // Update active state on type buttons
    ['users', 'centers', 'all'].forEach(t => {
        const btn = document.getElementById(`typeBtn-${t}`);
        if (btn) btn.classList.toggle('active', t === type);
    });

    // Update table title
    const titles = { users: 'Registered Users', centers: 'Registered Centers', all: 'All Registered Accounts' };
    const titleEl = document.getElementById('tableTitle');
    if (titleEl) titleEl.textContent = titles[type] || 'Registered Accounts';

    render();
};

window.setStatusFilter = (status) => {
    // Toggle: clicking the same status filter again clears it
    currentStatusFilter = (currentStatusFilter === status) ? 'none' : status;

    // Update active state on status buttons
    ['active', 'flagged', 'suspended', 'high-risk'].forEach(s => {
        const btn = document.getElementById(`statusBtn-${s}`);
        if (btn) btn.classList.toggle('active', s === currentStatusFilter);
    });

    render();
};

// ── Render ─────────────────────────────────────────────
function render(query = '') {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    const term = query.toLowerCase();

    // ── 1. Build combined dataset based on type filter ──
    let rows = [];

    if (currentTypeFilter === 'users' || currentTypeFilter === 'all') {
        allUsers
            .filter(u => !['ADMIN', 'CENTER'].includes((u.role || '').toUpperCase())) // registered users only
            .forEach(u => rows.push({ ...u, _type: 'USER' }));
    }

    if (currentTypeFilter === 'centers' || currentTypeFilter === 'all') {
        allCenters.forEach(c => rows.push({
            // Normalise center fields to match user field names used in rendering
            user_id: `c_${c.center_id}`,
            center_id: c.center_id,
            name: c.center_name,
            email: c.email || c.username || '—',
            role: c.type || 'CENTER',
            user_status: (c.center_status === 'online' || c.status === 'OPEN') ? 'active' : 'active',
            risk_score: 0,
            report_count: 0,
            last_active: c.last_seen || c.last_active_time || null,
            created_at: c.created_at,
            _type: 'CENTER'
        }));
    }

    // ── 2. Sort Show All by latest registration date ───
    if (currentTypeFilter === 'all') {
        rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    // ── 3. Apply search ───────────────────────────────
    if (query) {
        rows = rows.filter(r =>
            (r.name || '').toLowerCase().includes(term) ||
            (r.email || '').toLowerCase().includes(term)
        );
    }

    // ── 4. Apply status filter ─────────────────────────
    if (currentStatusFilter !== 'none') {
        rows = rows.filter(r => {
            const status = (r.user_status || 'active').toLowerCase();
            if (currentStatusFilter === 'active') return status === 'active';
            if (currentStatusFilter === 'flagged') return status === 'flagged';
            if (currentStatusFilter === 'suspended') return status === 'suspended';
            if (currentStatusFilter === 'high-risk') return status === 'high_risk' || (r.risk_score || 0) > 50;
            return true;
        });
    }

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No records found.</td></tr>';
        return;
    }

    // ── 5. Render each row ─────────────────────────────
    rows.forEach(r => {
        const isCenter = r._type === 'CENTER';
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        const userStatus = (r.user_status || 'active').toLowerCase();
        const riskScore = r.risk_score || 0;

        // Type badge (only in Show All)
        const typeBadge = (currentTypeFilter === 'all')
            ? `<span style="font-size:0.65rem; font-weight:700; letter-spacing:0.05em;
                padding:2px 7px; border-radius:8px; margin-left:6px; vertical-align:middle;
                background:${isCenter ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)'};
                color:${isCenter ? '#10b981' : '#818cf8'};">${r._type}</span>`
            : '';

        // Status badge
        let statusBadge = '';
        if (userStatus === 'active') statusBadge = '<span style="color:#10B981;font-weight:600;background:rgba(16,185,129,0.1);padding:4px 8px;border-radius:12px;">Active</span>';
        else if (userStatus === 'flagged') statusBadge = '<span style="color:#F59E0B;font-weight:600;background:rgba(245,158,11,0.1);padding:4px 8px;border-radius:12px;">Flagged</span>';
        else if (userStatus === 'high_risk') statusBadge = '<span style="color:#F97316;font-weight:600;background:rgba(249,115,22,0.1);padding:4px 8px;border-radius:12px;">High Risk</span>';
        else if (userStatus === 'suspended') statusBadge = '<span style="color:#EF4444;font-weight:600;background:rgba(239,68,68,0.1);padding:4px 8px;border-radius:12px;">Suspended</span>';

        // Risk bar color — 4-band
        let riskColor = '#10B981';
        if (riskScore >= 81) riskColor = '#EF4444';
        else if (riskScore >= 51) riskColor = '#F97316';
        else if (riskScore >= 21) riskColor = '#F59E0B';

        // Action buttons — only for user rows
        let actionButtons = '';
        if (!isCenter) {
            if (userStatus === 'suspended') {
                actionButtons += `<button class="table-action-btn btn-activate" onclick="toggleStatus(${r.user_id}, 'active')">Activate</button>`;
            } else {
                actionButtons += `<button class="table-action-btn btn-deactivate" onclick="confirmSuspension(${r.user_id})">Suspend</button>`;
            }
            if (userStatus !== 'flagged') {
                actionButtons += `<button class="table-action-btn" onclick="markAsFlagged(${r.user_id})" style="background:#F59E0B;">Flag</button>`;
            }
            if (riskScore > 0) {
                actionButtons += `<button class="table-action-btn" onclick="resetRisk(${r.user_id})" style="background:#6366f1;"><i class="ri-refresh-line"></i> Reset Risk</button>`;
            }
        } else {
            actionButtons = '<span style="color:#64748b; font-size:0.8rem;">Center Account</span>';
        }

        const lastActive = r.last_active ? new Date(r.last_active).toLocaleString() : 'Never';

        row.innerHTML = `
            <td style="padding:15px;">
                <div style="font-weight:600;">${r.name}${typeBadge}</div>
                <div style="font-size:0.75rem; color:#94a3b8;">${r.role}</div>
            </td>
            <td style="padding:15px;">${r.email}</td>
            <td style="padding:15px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600;">${riskScore}</span>
                    <div class="risk-progress-container">
                        <div class="risk-progress-bar" style="width:${riskScore}%; background:${riskColor};"></div>
                    </div>
                </div>
            </td>
            <td style="padding:15px; text-align:center;">${r.report_count || 0}</td>
            <td style="padding:15px;">${statusBadge}</td>
            <td style="padding:15px; font-size:0.85rem; color:#cbd5e1;">${lastActive}</td>
            <td style="padding:15px;">
                <div style="display:flex; gap:5px; flex-wrap:wrap;">${actionButtons}</div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ── Search ────────────────────────────────────────────
window.filterUsers = () => {
    const query = document.getElementById('userSearchInput').value;
    render(query);
};

// ── Actions ───────────────────────────────────────────
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
        if (res.ok) { window.showSuccess(`User status updated to ${status}`); fetchData(); }
        else window.showError("Failed to update status");
    } catch (e) { window.showError("Connection Error"); }
};

window.markAsFlagged = (id) => toggleStatus(id, 'flagged', 'Flagged for review by admin');

window.confirmDelete = (id, name) => {
    window.showCustomConfirm("Delete User", `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`, async () => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) { window.showSuccess(`User "${name}" deleted successfully.`); fetchData(); }
            else { const d = await res.json(); window.showError(d.message || 'Failed to delete user.'); }
        } catch (e) { window.showError('Connection error while deleting user.'); }
    });
};

window.resetRisk = async (id) => {
    try {
        const adminName = document.getElementById('adminNameDisplay').textContent;
        const res = await fetch('/api/admin/user-risk-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, adminName })
        });
        if (res.ok) { window.showSuccess("Risk score reset and user activated."); fetchData(); }
        else window.showError("Failed to reset risk score");
    } catch (e) { window.showError("Connection Error"); }
};
