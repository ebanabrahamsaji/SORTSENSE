
document.addEventListener('DOMContentLoaded', () => {
    // ── Auth Check ────────────────────────────────────────
    // Support both old key ('adminUser') and new key ('admin_sys_id')
    const isAdmin = localStorage.getItem('admin_sys_id') || localStorage.getItem('adminUser');
    if (!isAdmin) {
        window.location.href = 'login.html?role=admin';
        return;
    }

    // ── Logout ────────────────────────────────────────────
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.showCustomConfirm("Logout", "Logout from Admin Panel?", () => {
                localStorage.removeItem('adminUser');
                localStorage.removeItem('admin_sys_id');
                localStorage.removeItem('admin_sys_email');
                localStorage.removeItem('admin_sys_role');
                window.location.href = 'login.html?role=admin';
            });
        });
    }

    // ── Initialize Charts ────────────────────────────────
    initCharts();
});

async function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    await loadWasteComposition();
    await loadUserActivity();
    await loadCenterCapacity();
    await loadPickupTrend();
    await loadTopCategories();
}

// ── 1. Waste Composition Doughnut ────────────────────────
async function loadWasteComposition() {
    const canvas = document.getElementById('wasteCompositionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let labels = ['Plastic', 'Organic', 'Paper', 'Glass', 'E-Waste', 'Hazardous', 'Metal'];
    let dataValues = [35, 25, 15, 10, 5, 5, 5];

    try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
            const d = await res.json();
            if (d.wasteBreakdown) {
                labels = Object.keys(d.wasteBreakdown);
                dataValues = Object.values(d.wasteBreakdown);
            }
        }
    } catch (_) { /* use mock data */ }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(139, 92, 246, 0.85)',
                    'rgba(239, 68, 68, 0.85)',
                    'rgba(100, 116, 139, 0.85)'
                ],
                borderWidth: 2,
                borderColor: 'rgba(15,23,42,0.8)',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { usePointStyle: true, padding: 16, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
                    }
                }
            },
            cutout: '68%'
        }
    });
}

// ── 2. User Activity Line Chart ───────────────────────────
async function loadUserActivity() {
    const canvas = document.getElementById('userActivityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [];
    const scans = [];
    const pickups = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        scans.push(Math.floor(Math.random() * 60) + 15);
        pickups.push(Math.floor(Math.random() * 30) + 5);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Daily Scans',
                    data: scans,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    tension: 0.45,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981',
                    pointHoverRadius: 6
                },
                {
                    label: 'Pickups',
                    data: pickups,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    tension: 0.45,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1',
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 16 } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { stepSize: 10 }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// ── 3. Center Capacity Stacked Bar ────────────────────────
async function loadCenterCapacity() {
    const canvas = document.getElementById('centerCapacityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let labels = ['Center A', 'Center B', 'Center C', 'Center D'];
    let usedData = [40, 60, 25, 80];
    let freeData = [60, 40, 75, 20];

    try {
        const res = await fetch('/api/centers');
        if (res.ok) {
            const centers = await res.json();
            if (Array.isArray(centers) && centers.length > 0) {
                labels = centers.map(c => c.center_name || c.name);
                usedData = centers.map(c => (c.max_slots || 100) - (c.available_slots || 0));
                freeData = centers.map(c => c.available_slots || 0);
            }
        }
    } catch (_) { /* use mock */ }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Used Slots', data: usedData, backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 4 },
                { label: 'Available Slots', data: freeData, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } }
            }
        }
    });
}

// ── 4. Monthly Pickup Trend Bar Chart ─────────────────────
async function loadPickupTrend() {
    const canvas = document.getElementById('monthlyPickupChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const completed = [45, 62, 58, 78, 90, 55, 72];
    const pending = [12, 8, 15, 10, 6, 20, 14];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Completed', data: completed, backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6 },
                { label: 'Pending', data: pending, backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } }
            }
        }
    });
}

// ── 5. Top Waste Categories Horizontal Bar ────────────────
async function loadTopCategories() {
    const canvas = document.getElementById('topCategoriesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Plastic', 'Organic', 'Paper', 'Metal', 'Glass', 'E-Waste'],
            datasets: [{
                label: 'Submissions',
                data: [320, 210, 175, 140, 95, 60],
                backgroundColor: [
                    'rgba(59,130,246,0.8)',
                    'rgba(16,185,129,0.8)',
                    'rgba(245,158,11,0.8)',
                    'rgba(100,116,139,0.8)',
                    'rgba(14,165,233,0.8)',
                    'rgba(139,92,246,0.8)'
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                y: { grid: { display: false } }
            }
        }
    });
}
