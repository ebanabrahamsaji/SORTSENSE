let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.showCustomConfirm('Logout', 'Are you sure you want to logout from Admin Panel?', () => {
                localStorage.removeItem('adminUser');
                window.location.href = 'login-user.html';
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
                <button class="table-action-btn btn-delete" onclick="deleteUser(${u.user_id})" style="background:#EF4444; margin-left:5px;">Delete</button>
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

window.toggleStatus = async (id, status) => {
    window.showCustomConfirm("Change Status", `Are you sure you want to change user status to ${status}?`, async () => {
        try {
            const res = await fetch('/api/admin/user-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, status: status })
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
    });
};

window.deleteUser = async (id) => {
    window.showCustomConfirm("Permanent Delete", "Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.", async () => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                window.showSuccess("User permanently deleted.");
                fetchUsers();
            } else {
                const result = await res.json().catch(() => ({ message: "Failed to parse response" }));
                window.showError(result.message || "Failed to delete user");
            }
        } catch (e) {
            console.error("Delete user error:", e);
            window.showError("Connection Error deleting user: " + e.message);
        }
    });
};
