let allUsers = [];

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
        allUsers = await res.json();
        renderUsers();
    } catch (e) {
        console.error(e);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Failed to load users.</td></tr>';
    }
}

function renderUsers(query = '') {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    const filtered = allUsers.filter(u => {
        if (!query) return true;
        const term = query.toLowerCase();
        return (u.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (u.role || '').toLowerCase().includes(term);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No users found.</td></tr>';
        return;
    }

    filtered.forEach(u => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        const isActive = (u.status || 'active').toLowerCase() === 'active';
        let actionButtons = '';

        if (isActive) {
            actionButtons = `<button class="table-action-btn btn-deactivate" onclick="toggleStatus(${u.user_id}, 'inactive')">Deactivate</button>`;
        } else {
            actionButtons = `
                <button class="table-action-btn btn-activate" onclick="toggleStatus(${u.user_id}, 'active')">Activate</button>
                <button class="table-action-btn btn-delete" onclick="deleteUser(${u.user_id})">Delete</button>
            `;
        }

        const statusColor = isActive ? '#10B981' : '#EF4444';

        row.innerHTML = `
            <td style="padding:10px;">${u.name}</td>
            <td style="padding:10px;">${u.email}</td>
            <td style="padding:10px;">${u.role}</td>
            <td style="padding:10px;">${new Date(u.created_at).toLocaleDateString()}</td>
            <td style="padding:10px;"><span style="color:${statusColor}; font-weight:600;">${u.status || 'active'}</span></td>
            <td style="padding:10px;">
                ${actionButtons}
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.filterUsers = () => {
    const query = document.getElementById('userSearchInput').value;
    renderUsers(query);
};

window.toggleStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to change user status to ${status}?`)) return;
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

window.deleteUser = async (id) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
    try {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            // alert('User deleted successfully');
            fetchUsers();
        } else {
            const result = await res.json().catch(() => ({ message: "Failed to parse response" }));
            alert(result.message || "Failed to delete user");
        }
    } catch (e) {
        console.error("Delete user error:", e);
        alert("Connection Error deleting user: " + e.message);
    }
};
