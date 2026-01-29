document.addEventListener('DOMContentLoaded', () => {
    loadActivities();
    setupFilters();
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
            <div style="color:white; font-size:1.1rem;">${item.user}</div>
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
    `;

    modal.style.display = 'flex';
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
