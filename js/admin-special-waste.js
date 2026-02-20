
let allRequests = [];
let regRequests = [];
let allCenters = [];
let currentAction = null;
let currentId = null;
let activeTab = 'special'; // 'special' or 'regular'

// Search Filter functionality
window.filterRequests = () => {
    const query = document.getElementById('searchInput').value.toLowerCase();

    if (activeTab === 'special') {
        renderTable(query);
    } else {
        renderRegularTable(query);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchRequests(); // Special
    fetchCenters();

    document.getElementById('filterStatus').addEventListener('change', renderTable);
    document.getElementById('filterCategory').addEventListener('change', renderTable);
    document.getElementById('regFilterStatus').addEventListener('change', renderRegularTable);

    document.getElementById('confirmBtn').addEventListener('click', submitUpdate);
});

// --- Tab Logic ---
window.switchTab = (tab) => {
    activeTab = tab;
    // Update Tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    // Find button by checking text content or pass element (simplified lookup)
    const btns = document.querySelectorAll('.tab-btn');
    if (tab === 'special') btns[0].classList.add('active');
    else btns[1].classList.add('active');

    // Update Views
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(`${tab}View`).classList.add('active');

    if (tab === 'regular' && regRequests.length === 0) {
        fetchRegularRequests();
    }
};

// --- Data Fetching ---
async function fetchCenters() {
    try {
        const res = await fetch('/api/centers');
        allCenters = await res.json();
    } catch (e) { console.error(e); }
}

async function fetchRequests() {
    const tbody = document.getElementById('adminSwTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>';
    try {
        const res = await fetch('/api/special-waste/all');
        allRequests = await res.json();
        renderTable();
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load.</td></tr>';
    }
}

async function fetchRegularRequests() {
    const tbody = document.getElementById('adminRegTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Loading...</td></tr>';
    try {
        const res = await fetch('/api/pickup/admin/all');
        regRequests = await res.json();
        renderRegularTable();
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load.</td></tr>';
    }
}

// --- Rendering ---
function renderTable(query = '') {
    const tbody = document.getElementById('adminSwTableBody');
    const statusFilter = document.getElementById('filterStatus').value;
    const catFilter = document.getElementById('filterCategory').value;

    const filtered = allRequests.filter(req => {
        if (statusFilter !== 'All' && req.status !== statusFilter) return false;
        if (catFilter !== 'All' && req.category !== catFilter) return false;

        if (query) {
            const term = query.toLowerCase();
            const text = `${req.user_name} ${req.email} ${req.category} ${req.request_id}`.toLowerCase();
            if (!text.includes(term)) return false;
        }

        return true;
    });

    tbody.innerHTML = '';
    // ... (rest of renderTable logic remains same, just replacing up to filtered check)
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No requests found.</td></tr>';
        return;
    }

    filtered.forEach(req => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        // Find Center Name if assigned
        let assignedName = '<span style="color:#64748b; font-style:italic;">Unassigned</span>';
        if (req.center_id && allCenters.length) {
            const c = allCenters.find(x => x.center_id == req.center_id);
            if (c) assignedName = c.center_name;
        }

        let actionsHtml = '';
        if (req.status === 'Pending') {
            actionsHtml += `<button class="table-action-btn" style="background:#6366f1;" onclick="openEditRequestModal(${req.request_id})">View/Edit</button>`;
            actionsHtml += `<button class="table-action-btn btn-approve" onclick="openModal(${req.request_id}, 'Approved')">Approve</button>`;
            actionsHtml += `<button class="table-action-btn btn-reject" onclick="openModal(${req.request_id}, 'Rejected')">Reject</button>`;
        } else if (req.status === 'Approved') {
            actionsHtml += `<button class="table-action-btn" style="background:#64748b;" onclick="openEditRequestModal(${req.request_id})">View</button>`;
            actionsHtml += `<button class="table-action-btn btn-schedule" onclick="openModal(${req.request_id}, 'Scheduled')">Schedule</button>`;

        } else if (req.status === 'Scheduled') {
            actionsHtml += `<button class="table-action-btn btn-complete" onclick="openModal(${req.request_id}, 'Completed')">Complete</button>`;
        } else if (req.status === 'Rejected') {
            actionsHtml = `<button class="table-action-btn" style="background:#EF4444;" onclick="deleteRequest(${req.request_id}, 'special')">Delete</button>`;
        } else {
            actionsHtml = `<button class="table-action-btn" style="background:#64748b;" onclick="openEditRequestModal(${req.request_id})">View</button>` + actionsHtml; // Prepend View for others too
            if (actionsHtml === `<button class="table-action-btn" style="background:#64748b;" onclick="openEditRequestModal(${req.request_id})">View</button>`) {
                actionsHtml += '<span style="color:#64748b; font-size:0.8rem; margin-left:5px;">No other actions</span>';
            }
        }

        // Status Color
        let sColor = req.status === 'Pending' ? '#94a3b8' : req.status === 'Approved' ? '#10B981' : req.status === 'Rejected' ? '#EF4444' : '#3B82F6';
        if (req.status === 'Completed') sColor = '#8B5CF6';

        let detailsHtml = `${req.quantity_value} ${req.quantity_unit}<br><span style="font-size:0.8rem; color:#94a3b8;">${req.location}</span>`;
        if (req.image_url) detailsHtml += `<br><a href="${req.image_url}" target="_blank" style="color:#3B82F6; font-size:0.8rem;">View Image</a>`;

        row.innerHTML = `
            <td style="padding:10px;">${new Date(req.created_at).toLocaleDateString()}</td>
            <td style="padding:10px;">${req.user_name}<br><span style="font-size:0.8rem; color:#94a3b8;">${req.email}</span></td>
            <td style="padding:10px;">${req.category}</td>
            <td style="padding:10px;">${detailsHtml}</td>
            <td style="padding:10px; font-size:0.9rem;">${assignedName}</td>
            <td style="padding:10px;"><span style="color:${sColor}; font-weight:600;">${req.status}</span></td>
            <td style="padding:10px;">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderRegularTable(query = '') {
    const tbody = document.getElementById('adminRegTableBody');
    const statusFilter = document.getElementById('regFilterStatus').value;

    const filtered = regRequests.filter(req => {
        if (statusFilter !== 'All' && req.status !== statusFilter) return false;

        if (query) {
            const term = query.toLowerCase();
            const text = `${req.user_name} ${req.waste_type} ${req.center_name || ''}`.toLowerCase();
            if (!text.includes(term)) return false;
        }

        return true;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No requests found.</td></tr>';
        return;
    }

    filtered.forEach(req => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #334155';

        let sColor = req.status === 'Pending' ? '#94a3b8' : req.status === 'Approved' ? '#10B981' : '#EF4444';
        if (req.status === 'Completed') sColor = '#8B5CF6';

        let actionsHtml = '';
        if (req.status === 'Pending') {
            actionsHtml += `<button class="table-action-btn btn-approve" onclick="openModal(${req.request_id}, 'Approved')">Approve</button>`;
            actionsHtml += `<button class="table-action-btn btn-reject" onclick="openModal(${req.request_id}, 'Rejected')">Reject</button>`;
        } else if (req.status === 'Approved') {
            // Admin doesn't usually Schedule regular pickup? Center does it.
            // But admin can override? Prompt says "Admin: Review, approve/reject".
            // Center: "Update pickup status: Scheduled -> Completed".
            // So Admin job ends at Approved.
            actionsHtml = '<span style="color:#10B981; font-size:0.8rem;">Sent to Center</span>';
        } else if (req.status === 'Rejected') {
            actionsHtml = `<button class="table-action-btn" style="background:#EF4444;" onclick="deleteRequest(${req.request_id}, 'regular')">Delete</button>`;
        } else {
            actionsHtml = '<span style="font-size:0.8rem; color:#64748b;">No actions</span>';
        }

        let displayWasteType = req.waste_type;
        // Attempt to extract Time Slot from address if available
        if (req.address && req.address.includes('SLOT:')) {
            const slot = req.address.split('SLOT:')[1].trim();
            displayWasteType += `<br><span style="font-size:0.8rem; color:#f59e0b; display:inline-flex; align-items:center; gap:4px;"><i class="ri-time-line"></i> ${slot}</span>`;
        }

        row.innerHTML = `
            <td style="padding:10px;">${new Date(req.created_at).toLocaleDateString()}</td>
            <td style="padding:10px;">${req.user_name}</td>
            <td style="padding:10px;">${displayWasteType}</td>
            <td style="padding:10px;">${req.quantity}kg</td>
            <td style="padding:10px;">${req.center_name || 'Auto-Assigned'}</td>
            <td style="padding:10px;"><span style="color:${sColor}; font-weight:600;">${req.status}</span></td>
            <td style="padding:10px;">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- Delete Request ---
window.deleteRequest = async (id, type) => {
    window.showCustomConfirm("Delete Request", "Are you sure you want to delete this rejected request? This cannot be undone.", async () => {
        try {
            const url = type === 'special' ? `/api/special-waste/${id}` : `/api/pickup/${id}`;
            const res = await fetch(url, { method: 'DELETE' });

            if (res.ok) {
                window.showSuccess("Deleted successfully.");
                if (type === 'special') fetchRequests();
                else fetchRegularRequests();
            } else {
                window.showError("Failed to delete.");
            }
        } catch (e) {
            console.error(e);
            window.showError("Error deleting request.");
        }
    });
};

// --- Modal Logic ---
window.openModal = async (id, action) => {
    currentId = id;
    currentAction = action;
    document.getElementById('modalActionText').innerText = `Mark as ${action}?`;
    document.getElementById('modalNotes').value = '';

    // Only show Center Select for Special Waste Approval
    const wrapper = document.getElementById('centerSelectWrapper');
    const select = document.getElementById('modalCenterSelect');

    if (activeTab === 'special' && action === 'Approved') {
        select.innerHTML = '<option value="">Loading suggestions...</option>';
        wrapper.style.display = 'block';

        // Find the current request
        const req = allRequests.find(r => r.request_id === id);

        let sortedCenters = [];
        try {
            // Build Query Params for Smart Suggestion
            let params = new URLSearchParams();
            if (req) {
                if (req.category) params.append('category', req.category);

                // Try to parse coordinates from location string "lat, lng"
                if (req.location) {
                    const coords = req.location.split(',').map(s => s.trim());
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        params.append('lat', coords[0]);
                        params.append('lng', coords[1]);
                    }
                }
            }

            // Fetch compatible and sorted centers
            const res = await fetch(`/api/centers?${params.toString()}`);
            if (res.ok) {
                sortedCenters = await res.json();
            } else {
                sortedCenters = allCenters; // Fallback
            }
        } catch (e) {
            console.error("Smart Sort Error:", e);
            sortedCenters = allCenters;
        }

        // Check if we have results, if not fall back to all
        if (sortedCenters.length === 0) sortedCenters = allCenters;

        // Populate Dropdown
        select.innerHTML = '';

        if (sortedCenters.length > 0) {
            sortedCenters.forEach((c, index) => {
                const opt = document.createElement('option');
                opt.value = c.center_id;
                // Add distance info if available
                const distInfo = c.distance ? ` (${c.distance} km)` : '';
                opt.textContent = `${c.center_name}${distInfo}`;
                select.appendChild(opt);

                // Pre-select the first (best) option
                if (index === 0) opt.selected = true;
            });
        } else {
            select.innerHTML = '<option value="">No compatible centers found</option>';
            // Append all centers as fallback options
            allCenters.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.center_id;
                opt.textContent = c.center_name;
                select.appendChild(opt);
            });
        }

    } else {
        wrapper.style.display = 'none';
        select.value = '';
    }

    document.getElementById('notesModal').style.display = 'flex';
};

window.closeModal = () => {
    document.getElementById('notesModal').style.display = 'none';
};

async function submitUpdate() {
    const notes = document.getElementById('modalNotes').value;
    const centerId = document.getElementById('modalCenterSelect').value;
    const btn = document.getElementById('confirmBtn');

    if (activeTab === 'special' && currentAction === 'Approved' && !centerId) {
        window.showWarning("Please select a Center.");
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Updating...';

    try {
        let url = activeTab === 'special' ? '/api/special-waste/update-status' : `/api/pickup/${currentId}/status`;
        // Payload differs slightly
        let body = {};
        let method = 'POST'; // Special uses POST

        if (activeTab === 'special') {
            body = { requestId: currentId, status: currentAction, adminNotes: notes, centerId: centerId };
        } else {
            // Regular uses PUT
            method = 'PUT';
            body = { status: currentAction, rejectionReason: notes }; // Regular API expects rejectionReason
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            closeModal();
            window.showSuccess(`Request ${currentAction}`);
            if (activeTab === 'special') fetchRequests();
            else fetchRegularRequests();
        } else {
            const d = await res.json();
            window.showError(d.message || 'Failed to update');
        }
    } catch (error) {
        console.error(error);
        window.showError('Connection error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Confirm';
    }
}

// --- Details Modal Logic ---
const UNIT_MAP = {
    'E-waste': 'items',
    'Biomedical': 'kg',
    'Hazardous': 'kg',
    'Festival': 'kg',
    'Bulk': 'kg',
    'Medicines': 'kg',
    'Construction Debris': 'tons'
};

let detailsRequestId = null;
let originalDetails = {};

window.openEditRequestModal = (id) => {
    const req = allRequests.find(r => r.request_id === id);
    if (!req) return;

    detailsRequestId = id;
    originalDetails = { ...req };

    // Update modal title
    document.getElementById('editRequestTitle').innerText = req.status === 'Pending' ? 'Edit Request Details' : 'Request Details';

    // Populate
    document.getElementById('detCategory').value = req.category;
    document.getElementById('detQuantity').value = req.quantity_value;
    document.getElementById('detUnit').innerText = req.quantity_unit || UNIT_MAP[req.category] || 'kg';

    if (req.preferred_date) {
        const d = new Date(req.preferred_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        document.getElementById('detDate').value = `${yyyy}-${mm}-${dd}`;
    } else {
        document.getElementById('detDate').value = '';
    }

    document.getElementById('detLocation').value = req.location;
    document.getElementById('detDescription').value = req.description;

    const badge = document.getElementById('detailsStatusBadge');
    badge.innerText = req.status;
    if (req.status === 'Pending') { badge.style.background = '#F59E0B'; badge.style.color = 'black'; }
    else if (req.status === 'Approved') { badge.style.background = '#10B981'; badge.style.color = 'white'; }
    else if (req.status === 'Rejected') { badge.style.background = '#EF4444'; badge.style.color = 'white'; }
    else { badge.style.background = '#3B82F6'; badge.style.color = 'white'; }

    // State: View Mode
    disableInputs(true);
    document.getElementById('viewModeBtns').style.display = 'block';
    document.getElementById('editModeBtns').style.display = 'none';

    // Show/Hide Pending Actions
    const statusNormalized = (req.status || '').trim();
    if (statusNormalized === 'Pending') {
        document.getElementById('pendingActions').style.display = 'inline-block';

        // Setup Actions
        document.getElementById('detApproveBtn').onclick = () => {
            closeEditRequestModal();
            openModal(id, 'Approved');
        };
        document.getElementById('detRejectBtn').onclick = () => {
            closeEditRequestModal();
            openModal(id, 'Rejected');
        };
    } else {
        document.getElementById('pendingActions').style.display = 'none';
    }

    // Category Change Listener
    document.getElementById('detCategory').onchange = function () {
        const cat = this.value;
        document.getElementById('detUnit').innerText = UNIT_MAP[cat] || 'kg';
    };

    document.getElementById('editRequestModal').style.display = 'flex';
};

window.closeEditRequestModal = () => {
    document.getElementById('editRequestModal').style.display = 'none';
};

window.enableEditMode = () => {
    disableInputs(false);
    document.getElementById('viewModeBtns').style.display = 'none';
    document.getElementById('editModeBtns').style.display = 'block';

    // Disable Approve/Reject in table is not needed as modal is open.
    // "Ensure the Approve button is disabled while editing until changes are saved or canceled."
    // Since we are in a modal, the external Approve button is inaccessible (blocked by overlay).
    // The internal Approve button is hidden in edit mode.
    // So this requirement is met.
};

window.cancelEdit = () => {
    // Restore
    const req = originalDetails;
    document.getElementById('detCategory').value = req.category;
    document.getElementById('detQuantity').value = req.quantity_value;
    document.getElementById('detUnit').innerText = req.quantity_unit;

    if (req.preferred_date) {
        const d = new Date(req.preferred_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        document.getElementById('detDate').value = `${yyyy}-${mm}-${dd}`;
    }

    document.getElementById('detLocation').value = req.location;
    document.getElementById('detDescription').value = req.description;

    disableInputs(true);
    document.getElementById('viewModeBtns').style.display = 'block';
    document.getElementById('editModeBtns').style.display = 'none';
};

function disableInputs(disabled) {
    document.getElementById('detCategory').disabled = disabled;
    document.getElementById('detQuantity').disabled = disabled;
    document.getElementById('detDate').disabled = disabled;
    document.getElementById('detLocation').disabled = disabled;
    document.getElementById('detDescription').disabled = disabled;
}

window.saveChanges = async () => {
    const category = document.getElementById('detCategory').value;
    const quantity = document.getElementById('detQuantity').value;
    const date = document.getElementById('detDate').value;
    const location = document.getElementById('detLocation').value;
    const description = document.getElementById('detDescription').value;

    if (!category || !quantity || !date || !location) {
        window.showWarning("Please fill all required fields.");
        return;
    }

    if (quantity <= 0) {
        window.showWarning("Quantity must be a positive number.");
        return;
    }

    const btn = document.getElementById('saveChangesBtn');
    btn.disabled = true;
    btn.innerText = 'Saving...';

    try {
        const res = await fetch('/api/special-waste/update-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: detailsRequestId,
                category, quantity, preferredDate: date, location, description
            })
        });

        const d = await res.json();
        if (res.ok) {
            window.showSuccess("Updated successfully");
            closeEditRequestModal();
            fetchRequests();
        } else {
            window.showError(d.message || "Failed to update");
        }
    } catch (e) {
        console.error(e);
        window.showError("Connection error");
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save Changes';
    }
};
