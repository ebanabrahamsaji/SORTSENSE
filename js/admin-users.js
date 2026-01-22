
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Logout?')) {
                localStorage.removeItem('adminUser');
                window.location.href = 'login-user.html';
            }
        });
    }
});

async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users');
        const users = await res.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(u => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #334155';

            const isActive = (u.status || 'active') === 'active';
            const btnClass = isActive ? 'btn-deactivate' : 'btn-activate';
            const btnText = isActive ? 'Deactivate' : 'Activate';
            const statusColor = isActive ? '#10B981' : '#EF4444';

            row.innerHTML = `
                <td style="padding:10px;">${u.name}</td>
                <td style="padding:10px;">${u.email}</td>
                <td style="padding:10px;">${u.role}</td>
                <td style="padding:10px;">${new Date(u.created_at).toLocaleDateString()}</td>
                <td style="padding:10px;"><span style="color:${statusColor}; font-weight:600;">${u.status || 'active'}</span></td>
                <td style="padding:10px;">
                    <button class="table-action-btn ${btnClass}" onclick="toggleStatus(${u.user_id}, '${isActive ? 'inactive' : 'active'}')">${btnText}</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        console.error(e);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Failed to load users.</td></tr>';
    }
}

window.toggleStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to mark this user as ${status}?`)) return;
    try {
        const res = await fetch('/api/admin/user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, status: status })
        });
        if (res.ok) fetchUsers();
        else alert("Failed to update status");
    } catch (e) { alert("Connection Error"); }
};
