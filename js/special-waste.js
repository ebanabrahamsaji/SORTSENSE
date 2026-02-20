
document.addEventListener('DOMContentLoaded', () => {
    let userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');

    if (!userId) {
        window.location.href = '../index.html';
        return;
    }

    loadUserInfo(userId);
    fetchHistory(userId);

    // Use My Location Logic
    const locBtn = document.getElementById('useMyLocationBtn');
    if (locBtn) {
        locBtn.addEventListener('click', () => {
            const originalText = locBtn.innerHTML;
            locBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Locating...';
            locBtn.style.pointerEvents = 'none';

            if (!navigator.geolocation) {
                showToast('Not Supported', "Geolocation is not supported by your browser.", 'error');
                locBtn.innerHTML = originalText;
                locBtn.style.pointerEvents = 'auto';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Using Nominatim (OpenStreetMap) with timeout and error checking
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                            headers: { 'User-Agent': 'SortSense-Student-Project/1.0' },
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);

                        if (!res.ok) throw new Error(`API Error: ${res.status}`);

                        const data = await res.json();

                        if (data && data.display_name) {
                            document.getElementById('swLocation').value = data.display_name;
                            showToast('Location Found', "Address updated successfully.", 'success');
                            validateForm(); // Re-validate if location found
                        } else {
                            showToast('Address Not Found', "Could not retrieve exact address. Please enter manually.", 'warning');
                            document.getElementById('swLocation').focus();
                        }
                    } catch (error) {
                        console.error("Geocoding Error:", error);
                        if (error.name === 'AbortError') {
                            showToast('Timeout', "Location request timed out. Please enter manually.", 'error');
                        } else {
                            showToast('Location Error', "Failed to fetch address details. Please enter manually.", 'error');
                        }
                    } finally {
                        locBtn.innerHTML = originalText;
                        locBtn.style.pointerEvents = 'auto';
                    }
                },
                (error) => {
                    console.error("Geo Error:", error);
                    let msg = "Unable to retrieve location.";
                    if (error.code === 1) msg = "Location permission denied.";
                    else if (error.code === 2) msg = "Location unavailable.";
                    else if (error.code === 3) msg = "Location request timed out.";

                    showToast('Location Failed', msg + " Please enter manually.", 'error');
                    locBtn.innerHTML = originalText;
                    locBtn.style.pointerEvents = 'auto';
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    // Form Elements
    const form = document.getElementById('specialWasteForm');
    const msg = document.getElementById('swMsg');
    const categorySelect = document.getElementById('swCategory');
    const unitLabel = document.getElementById('swUnitLabel');
    const safetyHint = document.getElementById('swSafetyHint');
    const imageWrapper = document.getElementById('swImageWrapper');
    const procTime = document.getElementById('swProcTime');

    // UI Logic Map (Synced with Backend WASTE_RULES)
    const UI_RULES = {
        'E-waste': { hint: "Remove batteries if possible", unit: "items", icon: "ri-battery-2-charge-line", min: 1, max: 1000 },
        'Biomedical': { hint: "Seal waste in marked containers (Yellow/Red bags)", unit: "kg", icon: "ri-hospital-line", min: 0.1, max: 50 },
        'Hazardous': { hint: "Store in leak-proof containers away from heat", unit: "kg", icon: "ri-skull-line", min: 0.1, max: 50 },
        'Medicines': { hint: "Do not open blister packs or crush pills", unit: "kg", icon: "ri-capsule-line", min: 0.01, max: 20 },
        'Festival': { hint: "Segregate biodegradable from non-biodegradable", unit: "kg", icon: "ri-flag-2-line", min: 5, max: 2000, allowImage: true },
        'Bulk': { hint: "Ensure waste is accessible for truck pickup", unit: "kg", icon: "ri-truck-line", min: 10, max: 5000, allowImage: true },
        'Construction Debris': { hint: "Keep free from loose dust/liquids", unit: "tons", icon: "ri-building-2-line", min: 0.5, max: 500, allowImage: true }
    };

    // Category Change Handler
    categorySelect.addEventListener('change', (e) => {
        const cat = e.target.value;
        const rules = UI_RULES[cat];

        if (rules) {
            // Safety Hint
            safetyHint.innerHTML = `<i class="ri-information-fill"></i> ${rules.hint} (Min: ${rules.min} ${rules.unit})`;
            safetyHint.style.display = 'block';
            if (['Biomedical', 'Hazardous', 'Medicines'].includes(cat)) {
                safetyHint.className = 'hint-text hint-warning';
            } else {
                safetyHint.className = 'hint-text hint-info';
            }

            // Unit
            unitLabel.innerText = rules.unit;
            document.getElementById('swQuantity').min = rules.min;
            document.getElementById('swQuantity').max = rules.max;
            document.getElementById('swQuantity').placeholder = `Min ${rules.min}, Max ${rules.max}`;

            // Processing Time
            procTime.style.display = 'block';

            // Image Upload
            if (rules.allowImage) {
                imageWrapper.style.display = 'block';
            } else {
                imageWrapper.style.display = 'none';
                document.getElementById('swImageInput').value = ''; // Clear file
            }
        }
    });

    // Set Date Min to Today (Local Time logic)
    const dateInput = document.getElementById('swDate');
    const localToday = new Date();
    localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
    const todayStr = localToday.toISOString().split('T')[0];
    dateInput.min = todayStr;

    // Inputs for Validation
    const inputs = {
        category: categorySelect,
        quantity: document.getElementById('swQuantity'),
        date: dateInput,
        location: document.getElementById('swLocation'),
        description: document.getElementById('swDescription')
    };

    const submitBtn = form.querySelector('button');

    // Validation Function
    const validateForm = () => {
        // Category
        if (!inputs.category.value) return "Please select a waste category.";

        const rules = UI_RULES[inputs.category.value];

        // Quantity
        const qty = parseFloat(inputs.quantity.value);
        if (isNaN(qty)) return "Please enter a valid quantity.";
        if (rules && (qty < rules.min || qty > rules.max)) {
            return `Quantity for ${inputs.category.value} must be between ${rules.min} and ${rules.max} ${rules.unit}.`;
        }

        // Date
        if (!inputs.date.value) return "Please select a preferred date.";
        if (inputs.date.value < todayStr) return "Date cannot be in the past.";

        // Location
        if (!inputs.location.value.trim()) return "Please enter a location.";

        // Description Rules
        const desc = inputs.description.value.trim();
        if (desc.length < 20) return "Description must be at least 20 characters.";

        // Success
        return null;
    };

    // Form Submit
    form.onsubmit = async (e) => {
        e.preventDefault();

        // Log values for debugging
        console.log("Submitting Form...", {
            category: inputs.category.value,
            quantity: inputs.quantity.value,
            date: inputs.date.value,
            location: inputs.location.value,
            description: inputs.description.value
        });

        const errorMsg = validateForm();
        if (errorMsg) {
            showToast('Validation Error', errorMsg, 'warning');
            return;
        }

        msg.innerText = '';
        msg.style.color = 'inherit';

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Submitting...';

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('category', inputs.category.value);
            formData.append('quantity', inputs.quantity.value);
            formData.append('preferredDate', inputs.date.value);
            formData.append('location', inputs.location.value);
            formData.append('description', inputs.description.value.trim());

            const imageInput = document.getElementById('swImageInput');
            if (imageInput && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            const res = await fetch('/api/special-waste/create', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Request Submitted', data.message || 'Your pickup request has been received.', 'success');
                form.reset();
                // Reset UI elements
                if (safetyHint) safetyHint.style.display = 'none';
                if (imageWrapper) imageWrapper.style.display = 'none';
                if (procTime) procTime.style.display = 'none';
                if (unitLabel) unitLabel.innerText = 'kg';

                fetchHistory(userId);
            } else {
                console.error("Server Validation Error:", data);
                showToast('Submission Failed', data.message || 'Could not submit request.', 'error');
            }

        } catch (error) {
            console.error(error);
            msg.style.color = '#EF4444';
            msg.innerText = 'Network error. Please try again.';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-file-add-line"></i> Submit Request';
            }
        }
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });
});

async function fetchHistory(userId) {
    const tbody = document.getElementById('swHistoryBody');
    try {
        const res = await fetch(`/api/special-waste/my-requests?userId=${userId}`);
        const data = await res.json();

        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No requests found.</td></tr>';
            return;
        }

        const CAT_ICONS = {
            'E-waste': "ri-battery-2-charge-line",
            'Biomedical': "ri-hospital-line",
            'Hazardous': "ri-skull-line",
            'Medicines': "ri-capsule-line",
            'Festival': "ri-flag-2-line",
            'Bulk': "ri-truck-line",
            'Construction Debris': "ri-building-2-line"
        };

        data.forEach(req => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #334155';

            // Status Color/Badge
            let badgeClass = 'status-badge-pending';
            let statusColor = '#94a3b8';
            if (req.status === 'Approved') statusColor = '#10B981';
            if (req.status === 'Rejected') statusColor = '#EF4444';
            if (req.status === 'Scheduled') statusColor = '#3B82F6';
            if (req.status === 'Completed') statusColor = '#8B5CF6';

            // Icon
            const icon = CAT_ICONS[req.category] || "ri-recycle-line";

            row.innerHTML = `
                <td style="padding: 10px; text-align:center;"><i class="${icon}" style="font-size:1.2rem; color:#94a3b8;"></i></td>
                <td style="padding: 10px;">${new Date(req.created_at).toLocaleDateString()}</td>
                <td style="padding: 10px;">${req.category}</td>
                <td style="padding: 10px;">
                    <span style="border: 1px solid ${statusColor}; color: ${statusColor}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                        ${req.status}
                    </span>
                </td>
                <td style="padding: 10px;">
                    <button onclick='viewDetails(${JSON.stringify(req).replace(/'/g, "&#39;")})' style="background:none; border:none; color:#3B82F6; cursor:pointer; font-size:0.9rem;">
                        <i class="ri-eye-line"></i> Detail
                    </button>
                    <!-- Delete disabled logic not handled in API yet but UI asked to disable edits. We just don't show edit buttons. -->
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Fetch History Error:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load history.</td></tr>';
    }
}

// Global modal functions
let currentViewReq = null; // Store current request for cancel/save context

window.viewDetails = (req) => {
    currentViewReq = req;
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('detailsContent');
    const footer = document.getElementById('modalFooter');

    let html = `
        <p><strong>Category:</strong> ${req.category}</p>
        <p><strong>Quantity:</strong> ${req.quantity_value} ${req.quantity_unit}</p>
        <p><strong>Status:</strong> ${req.status}</p>
        <p><strong>Date:</strong> ${new Date(req.preferred_date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${req.location}</p>
        <p><strong>Description:</strong> ${req.description || 'N/A'}</p>
    `;

    if (req.admin_notes) {
        html += `<div style="background:#334155; padding:10px; border-radius:6px; margin-top:10px;">
            <strong style="color:#cbd5e1;">Admin Note:</strong>
            <p style="margin:5px 0 0 0; font-style:italic;">${req.admin_notes}</p>
        </div>`;
    }

    if (req.image_url) {
        html += `<div style="margin-top:10px;">
            <strong>Uploaded Image:</strong><br>
            <img src="${req.image_url}" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:5px; border:1px solid #475569;">
        </div>`;
    }

    content.innerHTML = html;

    // Footer Buttons
    let btns = `<button onclick="closeDetailsModal()" style="padding:8px 16px; background:#475569; color:white; border:none; border-radius:6px; cursor:pointer;">Close</button>`;

    if (req.status === 'Pending') {
        btns = `
            <button onclick="enableEditModeUser()" style="padding:8px 16px; background:#F59E0B; color:white; border:none; border-radius:6px; cursor:pointer; margin-right:10px;">Edit</button>
            ${btns}
        `;
    }
    footer.innerHTML = btns;

    modal.style.display = 'flex';
};

window.closeDetailsModal = () => {
    document.getElementById('detailsModal').style.display = 'none';
};

window.enableEditModeUser = () => {
    const req = currentViewReq;
    const content = document.getElementById('detailsContent');
    const footer = document.getElementById('modalFooter');

    const dt = new Date(req.preferred_date);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    content.innerHTML = `
        <div style="display:grid; gap:10px;">
            <div>
                <label style="display:block; font-size:0.9rem; color:#94a3b8;">Category</label>
                <select id="editCategory" style="width:100%; padding:8px; background:#334155; color:white; border:1px solid #475569; border-radius:6px;">
                     <option value="E-waste">E-waste</option>
                     <option value="Biomedical">Biomedical</option>
                     <option value="Hazardous">Hazardous</option>
                     <option value="Festival">Festival</option>
                     <option value="Medicines">Medicines</option>
                     <option value="Construction Debris">Construction Debris</option>
                     <option value="Bulk">Bulk</option>
                </select>
            </div>
            <div>
                <label style="display:block; font-size:0.9rem; color:#94a3b8;">Quantity (<span id="editUnitLabel">${req.quantity_unit}</span>)</label>
                <input id="editQuantity" type="number" step="0.1" value="${req.quantity_value}" style="width:100%; padding:8px; background:#334155; color:white; border:1px solid #475569; border-radius:6px;">
            </div>
            <div>
                <label style="display:block; font-size:0.9rem; color:#94a3b8;">Preferred Date</label>
                <input id="editDate" type="date" value="${dateStr}" style="width:100%; padding:8px; background:#334155; color:white; border:1px solid #475569; border-radius:6px;">
            </div>
            <div>
                <label style="display:block; font-size:0.9rem; color:#94a3b8;">Location</label>
                <input id="editLocation" type="text" value="${req.location}" style="width:100%; padding:8px; background:#334155; color:white; border:1px solid #475569; border-radius:6px;">
            </div>
            <div>
                <label style="display:block; font-size:0.9rem; color:#94a3b8;">Description</label>
                <textarea id="editDescription" rows="3" style="width:100%; padding:8px; background:#334155; color:white; border:1px solid #475569; border-radius:6px;">${req.description || ''}</textarea>
            </div>
        </div>
    `;

    // Set Category
    document.getElementById('editCategory').value = req.category;

    // Unit map (simplified)
    const U_MAP = {
        'E-waste': 'items',
        'Biomedical': 'kg',
        'Hazardous': 'kg',
        'Festival': 'kg',
        'Bulk': 'kg',
        'Medicines': 'kg',
        'Construction Debris': 'tons'
    };

    document.getElementById('editCategory').onchange = (e) => {
        document.getElementById('editUnitLabel').innerText = U_MAP[e.target.value] || 'kg';
    };

    footer.innerHTML = `
        <button onclick="window.viewDetails(currentViewReq)" style="padding:8px 16px; background:transparent; color:#cbd5e1; border:1px solid #475569; border-radius:6px; cursor:pointer; margin-right:10px;">Cancel</button>
        <button id="saveEditBtn" onclick="saveEditUser()" style="padding:8px 16px; background:#3B82F6; color:white; border:none; border-radius:6px; cursor:pointer;">Save Changes</button>
    `;
};

window.saveEditUser = async () => {
    const category = document.getElementById('editCategory').value;
    const quantity = document.getElementById('editQuantity').value;
    const date = document.getElementById('editDate').value;
    const location = document.getElementById('editLocation').value;
    const description = document.getElementById('editDescription').value;

    if (!category || !quantity || !date || !location) {
        showToast('Validation', 'Please fill all fields', 'warning');
        return;
    }

    const btn = document.getElementById('saveEditBtn');
    btn.disabled = true;
    btn.innerText = 'Saving...';

    try {
        const res = await fetch('/api/special-waste/update-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: currentViewReq.request_id,
                category, quantity, preferredDate: date, location, description
            })
        });

        const d = await res.json();
        if (res.ok) {
            showToast('Success', 'Request updated successfully', 'success');

            // Refresh Data
            const userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
            if (userId) fetchHistory(userId);

            closeDetailsModal();
        } else {
            showToast('Error', d.message || 'Update failed', 'error');
            btn.disabled = false;
            btn.innerText = 'Save Changes';
        }
    } catch (e) {
        console.error(e);
        showToast('Error', 'Connection error', 'error');
        btn.disabled = false;
        btn.innerText = 'Save Changes';
    }
};

async function loadUserInfo(userId) {
    try {
        const res = await fetch(`/api/user/profile?userId=${userId}`);
        const data = await res.json();
        if (data.user) {
            const avatar = document.getElementById('userAvatar');
            if (avatar) {
                avatar.src = data.user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=10b981&color=fff`;
            }
        }
    } catch (e) { console.error(e); }
}

// Global Toast Function
function showToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icons based on RemixIcon
    const iconMap = {
        success: 'ri-checkbox-circle-fill',
        error: 'ri-error-warning-fill',
        warning: 'ri-alert-fill',
        info: 'ri-information-fill'
    };

    toast.innerHTML = `
        <div class="toast-icon"><i class="${iconMap[type]}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
    }, 5000); // 5s visibility
}
