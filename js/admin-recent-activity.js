document.addEventListener('DOMContentLoaded', () => {
    loadActivities();
    setupFilters();

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (window.AdminAuth) {
                AdminAuth.logout('manual');
            } else {
                localStorage.clear();
                window.location.href = 'login.html?role=admin';
            }
        };
    }
});

let allActivities = [];

async function loadActivities() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/admin/activities/all');
        if (!response.ok) throw new Error('Failed to fetch activities');

        allActivities = await response.json();
        renderActivities(allActivities);
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:3rem; color:#ef4444;">Error loading activity log: ${error.message}</td></tr>`;
    }
}

function renderActivities(data) {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:3rem;">No activities found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = data.map(item => {
        const date = new Date(item.time);
        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const statusClass = item.status ? `status-${item.status.toLowerCase()}` : 'status-analyzed';

        return `
            <tr class="activity-row" onclick="showActivityDetails('${encodeURIComponent(JSON.stringify(item))}')">
                <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${timeStr}</td>
                <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-weight:600; color:white;">${item.user || 'Unknown User'}</div>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${item.action}</td>
                <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span class="status-badge ${statusClass}">${item.status || 'Analyzed'}</span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color:var(--text-secondary); font-size:0.85rem;">
                    ${item.action.length > 30 ? item.action.substring(0, 30) + '...' : item.action}
                </td>
            </tr>
        `;
    }).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('activitySearch');
    const roleFilter = document.getElementById('roleFilter');

    const handleFilter = () => {
        const query = searchInput.value.toLowerCase();
        const role = roleFilter.value;

        const filtered = allActivities.filter(item => {
            const matchesSearch = (item.user && item.user.toLowerCase().includes(query)) ||
                (item.action && item.action.toLowerCase().includes(query));
            const matchesRole = role === 'all' || item.role === role;
            return matchesSearch && matchesRole;
        });
        renderActivities(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', handleFilter);
    if (roleFilter) roleFilter.addEventListener('change', handleFilter);
}

window.showActivityDetails = function (itemData) {
    const item = JSON.parse(decodeURIComponent(itemData));
    const modal = document.getElementById('activityModal');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.8rem; color:var(--text-secondary);">User</label>
            <div style="color:white; font-size:1.1rem;">${item.user || 'Unknown'}</div>
        </div>
        <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.8rem; color:var(--text-secondary);">Role</label>
            <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px; font-size:0.85rem;">${item.role || 'N/A'}</span>
        </div>
        <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.8rem; color:var(--text-secondary);">Action Taken</label>
            <div style="color:white;">${item.action}</div>
        </div>
        <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.8rem; color:var(--text-secondary);">Timestamp</label>
            <div style="color:white;">${new Date(item.time).toLocaleString()}</div>
        </div>
        <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.8rem; color:var(--text-secondary);">Current Status</label>
            <span class="status-badge status-${(item.status || 'Analyzed').toLowerCase()}">${item.status || 'Analyzed'}</span>
        </div>
        
        <div style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; text-align: right;">
             <button onclick="deleteLog('${item.type}', '${item.id}')" 
                class="delete-btn"
                style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.5); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s;">
                 <i class="ri-delete-bin-line"></i> Delete Log Entry
             </button>
        </div>
    `;

    modal.style.display = 'flex';
};

window.deleteLog = async function (type, id) {
    console.log("Attempting to delete log:", type, id); // Debugging
    if (!type || !id || type === 'undefined' || id === 'undefined') {
        window.showWarning("Cannot delete this system generated log.");
        return;
    }

    window.showCustomConfirm("Delete Activity", "Are you sure you want to permanently delete this activity log?", async () => {
        try {
            // Change button state
            const btn = document.querySelector('.delete-btn');
            if (btn) {
                btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Deleting...';
                btn.disabled = true;
            }

            const res = await fetch(`/api/admin/activities/${type}/${id}`, { method: 'DELETE' });

            let data = {};
            try { data = await res.json(); } catch (e) { }

            if (res.ok && data.success) {
                closeModal();
                // Optimistically remove from list without full reload
                allActivities = allActivities.filter(a => !(a.id == id && a.type == type));
                renderActivities(allActivities);
                window.showSuccess(data.message || "Log entry deleted.");
            } else {
                window.showError(data.message || "Failed to delete log.");
                if (btn) {
                    btn.innerHTML = '<i class="ri-delete-bin-line"></i> Delete Log Entry';
                    btn.disabled = false;
                }
            }
        } catch (error) {
            console.error("Delete Error:", error);
            window.showError("Error communicating with server.");
        }
    });
};

window.closeModal = function () {
    const modal = document.getElementById('activityModal');
    if (modal) modal.style.display = 'none';
};

// Close modal on outside click
window.onclick = function (event) {
    const modal = document.getElementById('activityModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
