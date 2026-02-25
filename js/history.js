
let allHistoryData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html?role=user';
        return;
    }

    // Load Profile Info
    const nameData = localStorage.getItem('app_user_name');
    if (nameData && document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').src = localStorage.getItem('userPicture') || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameData)}&background=10b981&color=fff`;
    }

    // Initialize Filters
    setupFilters();

    // Fetch History Data
    try {
        const res = await fetch(`/api/user/scan-history?userId=${userId}`);
        const data = await res.json();

        // Update Stats
        if (data.stats) {
            const stats = data.stats;
            document.getElementById('totalScans').textContent = stats.total_scans || 0;
            document.getElementById('ecoCredits').textContent = stats.total_eco_credits || 0;
            document.getElementById('carbonSaved').textContent = stats.total_carbon_saved || "0 kg";
        }

        // Store and Render History
        if (data.history && Array.isArray(data.history)) {
            allHistoryData = data.history;
            renderHistory(allHistoryData);
        } else {
            document.getElementById('historyTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No scan history found. Start scanning!</td></tr>';
        }

    } catch (error) {
        console.error("History Page Error:", error);
        document.getElementById('historyTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load history.</td></tr>';
    }
});

function setupFilters() {
    const filterDate = document.getElementById('filterDate');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const resetBtn = document.getElementById('resetFilters');

    function applyFilters() {
        const dateVal = filterDate.value;
        const typeVal = filterType.value.toLowerCase();
        const statusVal = filterStatus.value.toLowerCase(); // 'recycle', 'compost', etc.

        const filtered = allHistoryData.filter(item => {
            // Date Filter
            if (dateVal) {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                if (itemDate !== dateVal) return false;
            }

            // Type Filter (Partial match logic as per existing badge logic)
            if (typeVal) {
                if (!item.waste_category.toLowerCase().includes(typeVal)) return false;
            }

            // Status Filter (Based on Disposal Method text)
            if (statusVal) {
                const method = (item.disposal_method || '').toLowerCase();

                if (statusVal === 'recycle') {
                    if (!method.includes('recycle') && !method.includes('recycling')) return false;
                } else if (statusVal === 'compost') {
                    if (!method.includes('compost')) return false;
                } else if (statusVal === 'disposal') {
                    if (!method.includes('landfill') && !method.includes('trash') && !method.includes('disposal')) return false;
                } else if (statusVal === 'hazardous') {
                    if (!method.includes('hazardous') && !method.includes('special')) return false;
                } else {
                    // Generic fallback
                    if (!method.includes(statusVal)) return false;
                }
            }

            return true;
        });

        renderHistory(filtered);
    }

    if (filterDate) filterDate.addEventListener('change', applyFilters);
    if (filterType) filterType.addEventListener('change', applyFilters);
    if (filterStatus) filterStatus.addEventListener('change', applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filterDate.value = '';
            filterType.value = '';
            filterStatus.value = '';
            renderHistory(allHistoryData);
        });
    }
}

function renderHistory(historyItems) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    if (!historyItems || historyItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">No results found matching your filters.</td></tr>';
        return;
    }

    historyItems.forEach(item => {
        const tr = document.createElement('tr');

        // Format Category Badge
        const catLower = (item.waste_category || '').toLowerCase();
        let badgeClass = 'badge';
        if (catLower.includes('plastic')) badgeClass += ' plastic';
        else if (catLower.includes('organic')) badgeClass += ' organic';
        else if (catLower.includes('ewaste') || catLower.includes('e-waste')) badgeClass += ' ewaste';
        else if (catLower.includes('hazardous')) badgeClass += ' hazardous';
        else if (catLower.includes('glass')) badgeClass += ' glass'; // Added glass
        else if (catLower.includes('metal')) badgeClass += ' metal'; // Added metal
        else badgeClass += ' paper'; // default fallback style often

        // Format Date
        const dateObj = new Date(item.timestamp);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format Type Icon & Text
        let typeHtml = item.waste_category;
        if (item.type === 'BOT_CHAT') {
            typeHtml = `<i class="ri-chat-smile-2-line" style="color:#3b82f6;"></i> Bot Query`;
        }

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td style="font-weight: 500;">${typeHtml}</td>
            <td><span class="${badgeClass}">${item.type === 'BOT_CHAT' ? 'Chat' : item.waste_category}</span></td>
            <td><span class="badge-confidence">${item.type === 'BOT_CHAT' ? '--' : item.confidence}</span></td>
            <td>${item.disposal_method}</td>
        `;
        tbody.appendChild(tr);
    });
}
