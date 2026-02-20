// Use relative paths for better reliability across different hostnames/ports
const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function () {
    console.log("Waste Management Center Initializing...");
    loadWasteData();
    loadWasteRecords();
    setupEventListeners();
});

let allWasteData = [];
let allWasteRecords = [];

function switchTab(tab) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const libBtn = tabBtns[0];
    const recBtn = tabBtns[1];
    const libSec = document.getElementById('librarySection');
    const recSec = document.getElementById('recordsSection');

    if (!libBtn || !recBtn || !libSec || !recSec) return;

    if (tab === 'library') {
        libSec.style.display = 'block';
        recSec.style.display = 'none';
        libBtn.classList.add('active');
        libBtn.style.color = 'white';
        libBtn.style.borderBottom = '2px solid var(--primary-color)';
        recBtn.classList.remove('active');
        recBtn.style.color = 'var(--text-secondary)';
        recBtn.style.borderBottom = 'none';
        console.log("Switched to Waste Library");
    } else {
        libSec.style.display = 'none';
        recSec.style.display = 'block';
        recBtn.classList.add('active');
        recBtn.style.color = 'white';
        recBtn.style.borderBottom = '2px solid var(--primary-color)';
        libBtn.classList.remove('active');
        libBtn.style.color = 'var(--text-secondary)';
        libBtn.style.borderBottom = 'none';
        console.log("Switched to Waste Records");
        loadWasteRecords(); // Refresh on switch
    }
}

async function loadWasteRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Loading records...</td></tr>';

    const searchEl = document.getElementById('recordSearch');
    const statusEl = document.getElementById('filterStatus');
    const methodEl = document.getElementById('filterMethod');

    const search = searchEl ? searchEl.value : '';
    const status = statusEl ? statusEl.value : '';
    const method = methodEl ? methodEl.value : '';

    const url = `/api/admin/waste-records?search=${encodeURIComponent(search)}&status=${status}`;
    console.log(`Fetching Waste Records: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Handle HTML error pages (like 404/500) gracefully
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            } else {
                throw new Error(`Server Error (${response.status}). The requested route might be missing.`);
            }
        }

        const data = await response.json();
        console.log("Records received:", data.length);

        if (!Array.isArray(data)) {
            throw new Error("Invalid data format received from server");
        }

        allWasteRecords = data;
        let filtered = allWasteRecords;
        if (method) filtered = filtered.filter(r => r.scan_method === method);

        renderWasteRecords(filtered);
    } catch (error) {
        console.error('Error loading waste records:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#ef4444;">
            <i class="ri-error-warning-line"></i> Failed to load records: ${error.message}
        </td></tr>`;
    }
}

function renderWasteRecords(records) {
    const tableBody = document.getElementById('recordsTableBody');
    if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No records found matching filters.</td></tr>';
        return;
    }

    tableBody.innerHTML = records.map(r => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 1.25rem;">
                <div style="font-size: 0.85rem;">${new Date(r.created_at).toLocaleDateString()}</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${new Date(r.created_at).toLocaleTimeString()}</div>
            </td>
            <td style="padding: 1.25rem;">
                <div style="font-weight: 600;">${escapeHtml(r.user_name || 'Guest')}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(r.user_email || 'No email')}</div>
            </td>
            <td style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="ri-${getIcon(r.scan_method)}" title="${r.scan_method}"></i>
                    <span>${escapeHtml(r.waste_type)}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${escapeHtml(r.category || 'Uncategorized')}</div>
            </td>
            <td style="padding: 1.25rem;">
                <div style="font-size: 0.85rem;">${r.weight || 0} kg</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">${r.quantity || 1} units</div>
            </td>
            <td style="padding: 1.25rem;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; background: ${getStatusColor(r.status)}22; color: ${getStatusColor(r.status)}; border: 1px solid ${getStatusColor(r.status)}44;">
                    ${r.status}
                </span>
            </td>
            <td style="padding: 1.25rem;">
                <div style="display: flex; gap: 5px;">
                    ${r.status === 'Pending' || r.status === 'Scanned' ? `
                        <button class="icon-btn" onclick="verifyRecord(${r.record_id}, 'Verified')" title="Verify"><i class="ri-check-line" style="color:#10b981"></i></button>
                        <button class="icon-btn delete" onclick="verifyRecord(${r.record_id}, 'Rejected')" title="Reject"><i class="ri-close-line" style="color:#ef4444"></i></button>
                    ` : ''}
                    <button class="icon-btn" onclick="editRecord(${r.record_id})" title="Edit Details"><i class="ri-edit-line"></i></button>
                    <button class="icon-btn delete" onclick="deleteWasteRecord(${r.record_id})" title="Delete Record"><i class="ri-delete-bin-line" style="color:#ef4444"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getIcon(method) {
    switch (method) {
        case 'SCAN': return 'camera-line';
        case 'PICKUP': return 'truck-line';
        default: return 'edit-box-line';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'Scanned': return '#3b82f6';
        case 'Pending': return '#f59e0b';
        case 'Verified': return '#10b981';
        case 'Approved': return '#8b5cf6';
        case 'Recycled': return '#10b981';
        case 'Rejected': return '#ef4444';
        default: return '#94a3b8';
    }
}

window.verifyRecord = async function (id, status) {
    const comments = window.prompt(`Enter comments for ${status}:`, '');
    // Hijacked prompt returns null
    if (comments === null) {
        // Since we hijacked prompt to just show a toast, we might want to proceed with empty comments 
        // OR we just stop here. The user's requested hijack returns null.
        // For now, let's just proceed with empty if it's hijacked.
    }
    const finalComments = comments || "Automated Review";

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/waste-records/${id}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, comments: finalComments, adminId: 1 })
        });

        if (response.ok) {
            window.showSuccess(`Record ${status}`);
            loadWasteRecords();
        } else {
            window.showError('Failed to update record');
        }
    } catch (e) {
        window.showError('Network error');
    }
};

window.editRecord = function (id) {
    const record = allWasteRecords.find(r => r.record_id === id);
    if (!record) return;

    // HIJACKED PROMPT: will return null and show toast
    const newWeight = window.prompt("Enter Weight (kg):", record.weight);
    const newStatus = window.prompt("Enter Status:", record.status);

    // For now we just use the original values if prompt returns null (as it is hijacked)
    const weightVal = parseFloat(newWeight) || record.weight || 0;
    const statusVal = newStatus || record.status;

    fetch(`${API_BASE_URL}/api/admin/waste-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            weight: weightVal,
            status: statusVal,
            quantity: record.quantity,
            category: record.category
        })
    }).then(res => {
        if (res.ok) {
            window.showSuccess('Record updated');
            loadWasteRecords();
        }
    });
};

window.deleteWasteRecord = async function (id) {
    window.showCustomConfirm('Delete Record', 'Are you sure you want to permanently delete this waste record?', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/waste-records/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.showSuccess('Record deleted permanently');
                loadWasteRecords();
            } else {
                window.showError('Failed to delete record');
            }
        } catch (e) {
            window.showError('Network error');
        }
    });
};

async function loadWasteData() {
    const container = document.getElementById('wasteDataContainer');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/waste-stats`);
        allWasteData = await response.json();
        renderWasteData(allWasteData);
    } catch (error) {
        console.error('Error loading waste data:', error);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Failed to load data.</div>';
    }
}

function renderWasteData(data) {
    const container = document.getElementById('wasteDataContainer');
    if (data.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No waste data found.</div>';
        return;
    }

    container.innerHTML = data.map(cat => `
        <div class="admin-category-card" data-id="${cat.category_id}">
            <div class="category-header">
                <span class="category-title">${escapeHtml(cat.category_name)}</span>
                <div class="action-btns">
                    <button class="icon-btn" onclick="editCategory(${cat.category_id})" title="Edit Category"><i class="ri-edit-line"></i></button>
                    <button class="icon-btn delete" onclick="deleteCategory(${cat.category_id})" title="Delete Category"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
            <p class="category-description">${escapeHtml(cat.description)}</p>
            
            <div class="item-list">
                ${cat.items.map(item => `
                    <div class="item-entry" data-id="${item.item_id}">
                        <span>${escapeHtml(item.item_name)}</span>
                        <div class="action-btns">
                            <button class="icon-btn" onclick="editItem(${item.item_id}, ${cat.category_id})" title="Edit Item"><i class="ri-edit-2-line"></i></button>
                            <button class="icon-btn delete" onclick="deleteItem(${item.item_id})" title="Delete Item"><i class="ri-close-line"></i></button>
                        </div>
                    </div>
                `).join('')}
                ${cat.items.length === 0 ? '<p style="font-size: 0.8rem; text-align: center; color: var(--text-secondary);">No items in this category</p>' : ''}
            </div>
            
            <button class="add-item-btn" onclick="addNewItem(${cat.category_id})">
                <i class="ri-add-line"></i> Add Item
            </button>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('wasteSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allWasteData.filter(cat =>
                cat.category_name.toLowerCase().includes(query) ||
                cat.description.toLowerCase().includes(query) ||
                cat.items.some(item => item.item_name.toLowerCase().includes(query))
            );
            renderWasteData(filtered);
        });
    }

    // Category Form Submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('categoryId').value;
            const name = document.getElementById('categoryName').value;
            const desc = document.getElementById('categoryDescription').value;

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_BASE_URL}/api/admin/categories/${id}` : `${API_BASE_URL}/api/admin/categories`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description: desc })
                });

                if (response.ok) {
                    window.showSuccess(id ? 'Category updated' : 'Category added');
                    closeModal('categoryModal');
                    loadWasteData();
                } else {
                    const res = await response.json();
                    window.showError(res.message || 'Error saving category');
                }
            } catch (error) {
                window.showError('Network error');
            }
        };
    }

    // Item Form Submission
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = itemForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Saving...';
            }

            const id = document.getElementById('itemId').value;
            const catId = document.getElementById('itemCategoryId').value;
            const data = {
                category_id: catId,
                item_name: document.getElementById('itemName').value,
                disposal_guideline: document.getElementById('itemDisposal').value,
                safety_instructions: document.getElementById('itemSafety').value
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_BASE_URL}/api/admin/waste-items/${id}` : `${API_BASE_URL}/api/admin/waste-items`;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast(id ? 'Item updated' : 'Item added', 'success');
                    closeModal('itemModal');
                    loadWasteData();
                } else {
                    const res = await response.json();
                    showToast(res.message || 'Error saving item', 'error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showToast('Network error', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Save Item';
                }
            }
        };
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            window.showCustomConfirm('Logout', 'Logout from Admin Panel?', () => {
                localStorage.removeItem('adminUser');
                window.location.href = 'login-user.html';
            });
        };
    }
}

// Modal Handlers
window.showModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        if (id === 'categoryModal') {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalTitle').innerText = 'Add Category';
        }
    }
};

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};

window.editCategory = function (id) {
    const cat = allWasteData.find(c => c.category_id === id);
    if (cat) {
        document.getElementById('categoryId').value = cat.category_id;
        document.getElementById('categoryName').value = cat.category_name;
        document.getElementById('categoryDescription').value = cat.description;
        document.getElementById('categoryModalTitle').innerText = 'Edit Category';
        showModal('categoryModal');
    }
};

window.deleteCategory = async function (id) {
    window.showCustomConfirm('Delete Category', 'Are you sure you want to delete this category? All items inside must be removed first.', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, { method: 'DELETE' });
            if (response.ok) {
                window.showSuccess('Category deleted');
                loadWasteData();
            } else {
                const res = await response.json();
                window.showError(res.message || 'Error deleting category');
            }
        } catch (e) {
            window.showError('Network error');
        }
    });
};

window.addNewItem = function (catId) {
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemCategoryId').value = catId;
    document.getElementById('itemModalTitle').innerText = 'Add New Item';
    showModal('itemModal');
};

window.editItem = function (itemId, catId) {
    const cat = allWasteData.find(c => c.category_id === catId);
    const item = cat ? cat.items.find(i => i.item_id === itemId) : null;
    if (item) {
        document.getElementById('itemId').value = item.item_id;
        document.getElementById('itemCategoryId').value = catId;
        document.getElementById('itemName').value = item.item_name;
        document.getElementById('itemDisposal').value = item.disposal_guideline;
        document.getElementById('itemSafety').value = item.safety_instructions;
        document.getElementById('itemModalTitle').innerText = 'Edit Item';
        showModal('itemModal');
    }
};

window.deleteItem = async function (id) {
    window.showCustomConfirm('Delete Item', 'Delete this item?', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/waste-items/${id}`, { method: 'DELETE' });
            if (response.ok) {
                window.showSuccess('Item deleted');
                loadWasteData();
            } else {
                window.showError('Error deleting item');
            }
        } catch (e) {
            window.showError('Network error');
        }
    });
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
