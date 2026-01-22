
let allLogs = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchLogs();
    document.getElementById('filterUser').addEventListener('keyup', renderTable);
    document.getElementById('filterStatus').addEventListener('change', renderTable);
});

async function fetchLogs() {
    try {
        const res = await fetch('/api/admin/activities/all');
        allLogs = await res.json();
        renderTable();
    } catch (e) {
        document.getElementById('logTableBody').innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Failed to load logs.</td></tr>';
    }
}

function renderTable() {
    const userFilter = document.getElementById('filterUser').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const tbody = document.getElementById('logTableBody');

    const filtered = allLogs.filter(l => {
        if (userFilter && !l.user.toLowerCase().includes(userFilter)) return false;
        // Simple status match or partial
        if (statusFilter !== 'All' && (l.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
        return true;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No logs found.</td></tr>';
        return;
    }

    filtered.forEach(log => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        let sColor = '#94a3b8'; // Default
        const s = (log.status || '').toLowerCase();

        if (s === 'analyzed' || s === 'verified') sColor = '#3B82F6';
        if (s === 'approved') sColor = '#10B981';
        if (s === 'pending') sColor = '#F59E0B';
        if (s === 'completed') sColor = '#8B5CF6';
        if (s === 'rejected') sColor = '#EF4444';

        row.innerHTML = `
            <td style="padding:10px;">${new Date(log.time).toLocaleString()}</td>
            <td style="padding:10px;">${log.user}</td>
            <td style="padding:10px;">${log.action}</td>
            <td style="padding:10px;"><span style="color:${sColor}; font-weight:600;">${log.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}
