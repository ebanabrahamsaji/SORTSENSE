// Use relative paths for better reliability across different hostnames/ports
const API_BASE_URL = '';

/**
 * getAdminToken — Safely retrieves the admin JWT from localStorage.
 * Validates the value looks like a real JWT (3 dot-separated Base64 parts).
 * Returns the token string, or null if nothing valid is found.
 */
function getAdminToken() {
    const isJwt = (val) => {
        if (!val || typeof val !== 'string') return false;
        const parts = val.split('.');
        return parts.length === 3 && parts[0].length > 0 && parts[1].length > 0;
    };

    // Priority: AdminAuth service → primary key → legacy key
    const candidates = [
        window.AdminAuth && window.AdminAuth.getSession ? (() => { const s = window.AdminAuth.getSession(); return s && s.token; })() : null,
        localStorage.getItem('admin_sys_token'),
        localStorage.getItem('adminToken'),
    ];

    for (const val of candidates) {
        if (isJwt(val)) return val;
    }

    console.warn('[getAdminToken] No valid JWT found in localStorage. Admin may not be logged in.');
    return null;
}

// --- STABLE MODE: GLOBAL GUARDS (Item 9 & Patch) ---
const STABLE = {
    isActive: () => document.hasFocus(),
    loading: new Set(),

    // Stop Double Rendering (Item 1)
    safeUpdate: (id, html) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (STABLE.loading.has(id)) {
            el.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#94a3b8;"><i class="ri-loader-4-line ri-spin"></i> Loading...</div>`;
            STABLE.loading.delete(id);
        }
        if (el.innerHTML !== html) el.innerHTML = html;
    },

    // Fix NULL/Undefined Rendering (Item 4)
    s: (val, fallback = "—") => (val !== null && val !== undefined && val !== "" && val !== "null") ? val : fallback
};

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();

    // Initial Load - Ensure data arrives before first render (Item 1)
    STABLE.loading.add('centerTableBody');
    STABLE.loading.add('systemHealthPanel');

    fetchCenterStatus();
    setupInteractions();
    setupCenterToggle();
    fetchAndAnimateStats();
    fetchSystemHealth();
    initAdminNotifications();

    // Check for message parameter in URL on load
    const urlParams = new URLSearchParams(window.location.search);
    const messageCenterId = urlParams.get('message');
    if (messageCenterId) {
        setTimeout(() => openMessageModal(messageCenterId), 300);
    }

    // Auto-refresh center status every 30 seconds (Requirement 8)
    setInterval(() => {
        if (STABLE.isActive()) {
            fetchCenterStatus();
            fetchAndAnimateStats();
            fetchSystemHealth();
        }
    }, 30000);
});

async function fetchAndAnimateStats() {
    if (!STABLE.isActive()) return; // Item 2 & Patch

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
        const data = await response.json();

        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                const cleanVal = STABLE.s(value, "0");
                if (el.innerText !== cleanVal.toString()) {
                    el.innerText = cleanVal;
                }
            }
        };

        updateStat('stats-total-users', data.totalUsers);
        updateStat('stats-items-sorted', data.itemsSorted);
        updateStat('stats-flagged-items', data.flaggedItems);
        updateStat('stats-pickups-today', data.pickupsToday);

    } catch (e) {
        console.error("Failed to fetch stats", e);
    }
}

async function fetchSystemHealth() {
    if (!STABLE.isActive()) return;

    const containerId = 'systemHealthPanel';
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-health`);
        const data = await res.json();

        if (data.error) {
            STABLE.safeUpdate(containerId, `<div style="color:#ef4444; padding:10px;">System Health Check Failed</div>`);
            return;
        }

        const html = `
            <div class="health-card" style="display:flex; gap:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; font-size:0.9rem; align-items:center;">
                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">AI Service</span>
                    <div style="font-weight:600; color:${data.aiService === 'Running' ? '#10b981' : '#ef4444'}">
                        <i class="ri-${data.aiService === 'Running' ? 'robot' : 'error-warning'}-line"></i> ${STABLE.s(data.aiService, "Unknown")}
                    </div>
                </div>

                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">Pickups Today</span>
                    <div style="font-weight:600; color:#e2e8f0;">${STABLE.s(data.todaysPickups, "0")}</div>
                </div>
                <div style="flex:1;">
                    <span style="color:#94a3b8; font-size:0.8rem;">Active Users</span>
                    <div style="font-weight:600; color:#e2e8f0;">${STABLE.s(data.activeUsers, "0")}</div>
                </div>
            </div>
        `;
        STABLE.safeUpdate(containerId, html);
    } catch (e) {
        console.error("Health Check Error:", e);
    }
}

// Check if user is authenticated as admin
function checkAdminAuth() {
    const isAdmin = localStorage.getItem('admin_sys_id') || localStorage.getItem('adminUser');
    if (!isAdmin) {
        window.location.href = 'login.html?role=admin';
    }
}

// Setup Basic Interactions
function setupInteractions() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (window.showCustomConfirm) {
                window.showCustomConfirm(
                    'Logout',
                    'Are you sure you want to logout from the Admin Panel?',
                    () => {
                        if (window.AdminAuth) {
                            window.AdminAuth.logout('manual');
                        } else if (window.logoutSafely) {
                            window.logoutSafely('manual', 'ADMIN');
                        } else {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.replace('/');
                        }
                    }
                );
            } else {
                // Fallback if modal not available
                if (window.AdminAuth) {
                    window.AdminAuth.logout('manual');
                } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.replace('/');
                }
            }
        };
    }

    const btnAddUser = document.getElementById('btnAddUser');
    const btnAddCategory = document.getElementById('btnAddCategory');
    const btnExportReports = document.getElementById('btnExportReports');

    if (btnAddUser) btnAddUser.onclick = () => showModal('addUserModal');
    if (btnAddCategory) btnAddCategory.onclick = () => showModal('addCategoryModal');
    if (btnExportReports) btnExportReports.onclick = () => showModal('exportReportsModal');

    // Messaging Form
    const sendMessageForm = document.getElementById('sendMessageForm');
    if (sendMessageForm) {
        sendMessageForm.onsubmit = async (e) => {
            e.preventDefault();
            const centerId = document.getElementById('msgCenterId').value;
            const messageText = document.getElementById('msgContent').value;
            const sendBtn = document.getElementById('msgSendBtn');

            if (!messageText.trim()) return;

            sendBtn.disabled = true;
            const originalHtml = sendBtn.innerHTML;
            sendBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';

            try {
                const token = getAdminToken();
                if (!token) throw new Error("Authentication session expired. Please reload.");

                const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ center_id: centerId, messageText })
                });

                if (response.status === 401) throw new Error("Session expired. Please log in again.");

                const result = await response.json();
                if (result.success) {
                    document.getElementById('msgContent').value = '';
                    showToast('Message sent successfully', 'success');

                    // Reload chat immediately so admin sees their sent message without closing
                    try {
                        const currentToken = getAdminToken();
                        const hRes = await fetch(`${API_BASE_URL}/api/messages/admin/${centerId}`, {
                            headers: { 'Authorization': `Bearer ${currentToken}` }
                        });
                        const hData = await hRes.json();
                        if (hData.success) renderChatHistory(hData.data || []);
                    } catch (_) { /* non-critical — toast already shown */ }
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error("Send Error:", error);
                showToast(error.message || 'Network issue', 'error');
            } finally {
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalHtml;
            }
        };
    }
}

// --- Admin Messaging System ---
async function openMessageModal(centerId) {
    const modal = document.getElementById('messageCenterModal');
    const title = document.getElementById('msgModalTitle');
    const statusText = document.getElementById('msgCenterStatus');
    const msgIdInput = document.getElementById('msgCenterId');
    const history = document.getElementById('chatHistory');

    if (!modal) return;

    // Reset and show
    msgIdInput.value = centerId;
    document.getElementById('msgContent').value = '';
    title.textContent = 'Loading secure chat...';
    statusText.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Initializing...';
    history.innerHTML = '<div style="text-align: center; color: #64748b; padding-top: 80px;"><i class="ri-loader-4-line ri-spin"></i><br>Connecting...</div>';

    showModal('messageCenterModal');

    try {
        const token = getAdminToken();

        if (!token) {
            history.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Session lost. Please reload the dashboard.</div>';
            statusText.textContent = "Error";
            return;
        }

        // Helper to load content with timeout
        const refreshChat = async (isSilent = false) => {
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 8000);

            try {
                // Update local session expiry to prevent watchdog logout while active
                if (localStorage.getItem('admin_sys_expiry')) {
                    const NEW_EXPIRY = Date.now() + (8 * 60 * 60 * 1000); // 8h
                    localStorage.setItem('admin_sys_expiry', NEW_EXPIRY.toString());
                }

                const currentToken = getAdminToken();
                if (!currentToken) { throw new Error('UNAUTHORIZED'); }
                const hRes = await fetch(`${API_BASE_URL}/api/messages/admin/${centerId}`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` },
                    signal: controller.signal
                });
                clearTimeout(tId);

                if (hRes.status === 401) throw new Error("UNAUTHORIZED");

                const hData = await hRes.json();
                if (hData.success) {
                    renderChatHistory(hData.data || []);
                }
            } catch (e) {
                clearTimeout(tId);
                if (e.message === "UNAUTHORIZED") {
                    history.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Session expired. Log in again.</div>';
                    if (window.chatInterval) { clearInterval(window.chatInterval); window.chatInterval = null; }
                } else if (!isSilent) {
                    history.innerHTML = '<div style="text-align: center; color: #ef4444; padding-top:80px;">Failed to load chat thread.</div>';
                }
            }
        };

        // Fetch Center Details
        fetch(`${API_BASE_URL}/api/centers`)
            .then(res => res.json())
            .then(centers => {
                const center = Array.isArray(centers) ? centers.find(c => c.center_id == centerId) : null;
                if (center) {
                    title.textContent = `Message ${center.center_name}`;
                    const liveStatus = center.live_status || 'CLOSED';
                    let sText = (liveStatus === 'OPEN') ? 'Open (Online)' : (liveStatus === 'IDLE' ? 'Idle' : 'Closed (Offline)');
                    let sColor = (liveStatus === 'OPEN') ? '#10b981' : (liveStatus === 'IDLE' ? '#f59e0b' : '#ef4444');
                    statusText.innerHTML = `<span style="color:${sColor}; font-weight:600;"><i class="ri-checkbox-circle-fill"></i> ${sText}</span>`;
                } else {
                    title.textContent = "Message Center";
                    statusText.textContent = "ID: " + centerId;
                }
            }).catch(() => {
                title.textContent = "Message Center";
                statusText.textContent = "Center details unavailable";
            });

        // Initial Load
        await refreshChat(false);

        // --- BACKGROUND POLLING ---
        if (window.chatInterval) clearInterval(window.chatInterval);
        window.chatInterval = setInterval(() => {
            // Only poll if modal is visible
            const m = document.getElementById('messageCenterModal');
            if (m && m.style.display === 'flex') {
                refreshChat(true);
            } else {
                clearInterval(window.chatInterval);
            }
        }, 5000);

    } catch (e) {
        console.error("Messaging Modal Error:", e);
        history.innerHTML = '<div style="padding: 2rem; text-align: center; color: #ef4444;">Failed to initialize secure chat.</div>';
    }
}

function renderChatHistory(messages) {
    const history = document.getElementById('chatHistory');
    if (!history) return;

    if (!messages || messages.length === 0) {
        history.innerHTML = '<div style="text-align: center; color: #64748b; padding-top: 80px;">No messages yet.</div>';
        return;
    }

    const html = messages.map(m => {
        const isSelf = m.senderRole === 'ADMIN';
        const align = isSelf ? 'flex-end' : 'flex-start';
        const bg = isSelf ? '#6366f1' : 'rgba(255,255,255,0.08)';
        const border = isSelf ? 'none' : '1px solid rgba(255,255,255,0.1)';
        return `
            <div style="align-self: ${align}; max-width: 80%; display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
                <div style="background: ${bg}; border: ${border}; color: white; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${m.messageText}
                </div>
                <div style="font-size: 0.7rem; color: #94a3b8; align-self: ${align}; margin: 0 4px;">
                    ${STABLE.s(m.senderName, "System")} • ${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;
    }).join('');

    if (history.innerHTML !== html) {
        history.innerHTML = html;
        history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' });
    }
}

async function fetchCenterStatus() {
    if (!STABLE.isActive()) return; // Item 2 & Patch

    const tableId = 'centerTableBody';
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/centers?_t=${Date.now()}`, {
            cache: 'no-store'
        });
        const centers = await response.json();

        if (!Array.isArray(centers) || centers.length === 0) {
            STABLE.safeUpdate(tableId, '<tr><td colspan="5" style="text-align:center; padding:2rem; color: #94a3b8;">No centers found.</td></tr>');
            return;
        }

        const html = centers.map(center => {
            const liveStatus = center.live_status || 'CLOSED';
            let sText = liveStatus;
            let sColor = '#ef4444';
            let sIcon = '🔴';

            if (liveStatus === 'OPEN') { sColor = '#10b981'; sIcon = '🟢'; }
            else if (liveStatus === 'IDLE') { sColor = '#f59e0b'; sIcon = '🟡'; }

            const usage = center.max_slots - center.available_slots;
            const percent = (usage / center.max_slots) * 100;
            const perfScore = center.performance_score || 100;

            return `
                <tr>
                    <td>
                        <div style="font-weight: 600; color: white;">${STABLE.s(center.center_name, "Center")}</div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">Score: ${perfScore}%</div>
                    </td>
                    <td><span class="status-badge" style="background:${sColor}20; color:${sColor}; white-space: nowrap;">${sIcon} ${sText}</span></td>
                    <td style="width:180px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                            <span>${center.available_slots} / ${center.max_slots} Left</span>
                            <span>${Math.round(percent)}%</span>
                        </div>
                        <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                            <div style="width:${percent}%; height:100%; background:#10b981;"></div>
                        </div>
                    </td>
                    <td><span class="status-badge" style="background:#10b98120; color:#10b981">${STABLE.s(center.busyLevel, "Normal")}</span></td>
                    <td>
                        <button class="btn btn-sm" onclick="openMessageModal(${center.center_id})"><i class="ri-message-3-line"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        STABLE.safeUpdate(tableId, html);

    } catch (error) {
        console.error("Error fetching center status:", error);
    }
}


window.resetCenterSlots = async (id) => {
    if (!confirm('Reset this center slots to Maximum capacity?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/centers/${id}/reset`, { method: 'POST' });
        if (res.ok) {
            showToast('Slots reset successfully', 'success');
            fetchCenterStatus();
        } else {
            showToast('Failed to reset slots', 'error');
        }
    } catch (e) { console.error(e); }
};

window.toggleCenterStatus = async (id) => {
    // Confirm is optional, but safer
    // if(!confirm('Toggle center status?')) return; 
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/centers/${id}/toggle`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message, 'success');
            fetchCenterStatus();
        } else {
            showToast('Failed to toggle status', 'error');
        }
    } catch (e) { console.error(e); }
};

// Ensure refreshCenterStatus is available globally for the HTML onclick handler
window.refreshCenterStatus = fetchCenterStatus;

function setupCenterToggle() {
    const toggleBtn = document.getElementById('toggleCenterStatusBtn');
    const container = document.getElementById('centerStatusContainer');
    const refreshBtn = document.getElementById('refreshCenterBtn');

    if (toggleBtn && container) {
        // Initial setup for the button click
        toggleBtn.addEventListener('click', () => {
            const isHidden = container.style.display === 'none';
            if (isHidden) {
                container.style.display = 'block';
                toggleBtn.innerHTML = '<i class="ri-eye-off-line"></i> Hide Center Status';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-outline');
                if (refreshBtn) refreshBtn.style.display = 'inline-flex';
            } else {
                container.style.display = 'none';
                toggleBtn.innerHTML = '<i class="ri-eye-line"></i> View Center Status';
                toggleBtn.classList.remove('btn-outline');
                toggleBtn.classList.add('btn-primary');
                if (refreshBtn) refreshBtn.style.display = 'none';
            }
        });
    }
}

// Fetch System Health Status
async function fetchSystemHealth() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-health`);
        const data = await res.json();

        // Update Pickups Today
        const pickupsEl = document.getElementById('stats-pickups-today');
        if (pickupsEl) pickupsEl.textContent = data.pickupsToday || '0';

    } catch (error) {
        console.error('System Health Fetch Error:', error);
    }
}

// Make it globally accessible
window.fetchSystemHealth = fetchSystemHealth;

// --- Section Navigation (SPA) ---
function showSection(sectionId) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the target section
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    const sectionNavMap = {
        'dashboardSection': 'a[href="admin-dashboard.html"]',
        'analyticsSection': '#analyticsNav',
        'systemSettingsSection': '#systemSettingsNav'
    };
    const selector = sectionNavMap[sectionId];
    if (selector) {
        const navLink = document.querySelector(selector);
        if (navLink && navLink.parentElement) navLink.parentElement.classList.add('active');
    }
}

// Modal Helpers
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll

        // Cleanup messaging specific interval if it was this modal
        if (id === 'messageCenterModal' && window.chatInterval) {
            clearInterval(window.chatInterval);
            window.chatInterval = null;
        }
    }
}

// Make available globally
window.showModal = showModal;
window.closeModal = closeModal;

// Global modal click listener (Fix for "Cannot Close" & "Popup Freeze")
window.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// Add navigation handler to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Analytics Nav Handler
    const analyticsNav = document.getElementById('analyticsNav');
    if (analyticsNav) {
        analyticsNav.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to dedicated analytics page
            window.location.href = 'admin-analytics.html';
        });
    }

    // Dashboard (Overview) Nav Handler
    const dashboardNav = document.querySelector('a[href="admin-dashboard.html"]');
    if (dashboardNav) {
        // If we are already on admin-dashboard.html, interception prevents reload
        dashboardNav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            dashboardNav.parentElement.classList.add('active');
            showSection('dashboardSection');
        });
    }

    // System Settings Nav Handler
    const systemSettingsNav = document.getElementById('systemSettingsNav');
    if (systemSettingsNav) {
        systemSettingsNav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            systemSettingsNav.parentElement.classList.add('active');
            showSection('systemSettingsSection');

            // Load system info when section opens
            loadSystemInfo();

            // Load saved settings
            loadSettings();
        });
    }
});

// --- Admin Notifications System ---
let adminNotificationInterval;

function initAdminNotifications() {
    fetchNotifications();
    // Poll every 30 seconds
    if (adminNotificationInterval) clearInterval(adminNotificationInterval);
    adminNotificationInterval = setInterval(fetchNotifications, 30000);

    // Setup Dropdown Toggle
    const bellBtn = document.querySelector('.header-profile .notification-badge');
    if (bellBtn) {
        // Create dropdown container if not exists
        let dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notificationDropdown';
            dropdown.className = 'notification-dropdown';
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <span>Notifications</span>
                    <div style="display:flex; gap:10px;">
                        <button class="mark-read-btn" onclick="markAsRead('all')" style="color:#60a5fa;">Mark all read</button>
                        <button class="mark-read-btn" onclick="clearAllNotifications()" style="color:#ef4444;">Clear all</button>
                    </div>
                </div>
                <div class="dropdown-content" id="notificationList">
                    <div style="padding:20px; text-align:center; color:var(--text-secondary);">Loading...</div>
                </div>
                <div class="dropdown-footer" style="padding:10px; text-align:center; border-top:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02);">
                    <a href="admin-recent-activity.html" style="color:#94a3b8; font-size:0.8rem; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:5px;">
                        View All Activity <i class="ri-arrow-right-s-line"></i>
                    </a>
                </div>
            `;
            bellBtn.parentElement.appendChild(dropdown);
        }

        bellBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationDropdown();
        };

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!bellBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
}

window.clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
        await fetch(`${API_BASE_URL}/api/admin/notifications/clear`, { method: 'DELETE' });
        showToast('Notifications cleared', 'success');
        fetchNotifications();
    } catch (e) { console.error(e); }
};

async function fetchNotifications() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/notifications`);
        const data = await res.json();
        if (data.success) {
            updateNotificationBadge(data.unreadCount);
            renderNotificationList(data.notifications);
        }
    } catch (e) {
        console.error("Fetch Notifications Error:", e);
    }
}

function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge .dot');
    if (badge) {
        if (count > 0) {
            badge.style.display = 'flex';
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.fontSize = '10px';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.color = 'white';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderNotificationList(notifications) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
        list.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text-secondary);">
            <i class="ri-notification-off-line" style="font-size:2rem; opacity:0.5; margin-bottom:10px; display:block;"></i>
            No notifications
        </div>`;
        return;
    }

    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id}, '${n.type}')">
            <div class="notif-icon ${n.type}">
                <i class="${getNotificationIcon(n.type)}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${timeAgo(new Date(n.created_at))}</div>
            </div>
            ${!n.is_read ? `<div class="notif-dot"></div>` : ''}
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'USER': return 'ri-user-add-line';
        case 'WASTE': return 'ri-recycle-line';
        case 'MESSAGE': return 'ri-message-2-line';
        case 'ALERT': return 'ri-alert-line';
        default: return 'ri-notification-3-line';
    }
}

window.markAsRead = async (id) => {
    try {
        await fetch(`${API_BASE_URL}/api/admin/notifications/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchNotifications(); // Refresh
    } catch (e) { console.error(e); }
};

window.handleNotificationClick = async (id, type) => {
    await markAsRead(id);
    // Redirect based on type
    if (type === 'USER') window.location.href = 'admin-users.html';
    else if (type === 'WASTE') window.location.href = 'admin-waste-data.html';
    else if (type === 'MESSAGE') window.location.href = 'admin-dashboard.html'; // Or messages page
    else if (type === 'ALERT') window.location.href = 'admin-recent-activity.html';
};

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('active');
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

// Add CSS for notifications dynamically
const notifStyle = document.createElement('style');
notifStyle.textContent = `
    .notification-dropdown {
        position: absolute;
        top: 60px;
        right: 80px;
        width: 320px;
        background: #1e293b;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        display: none;
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease-out;
    }
    .notification-dropdown.active { display: block; }
    .dropdown-header {
        padding: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255,255,255,0.02);
    }
    .dropdown-header span { font-weight: 600; color: white; }
    .mark-read-btn {
        background: none; border: none; color: var(--primary-color);
        font-size: 0.8rem; cursor: pointer;
    }
    .dropdown-content { max-height: 400px; overflow-y: auto; }
    .notification-item {
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .notification-item:hover { background: rgba(255,255,255,0.05); }
    .notification-item.unread { background: rgba(59, 130, 246, 0.1); }
    .notif-icon {
        width: 36px; height: 36px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .notif-icon.USER { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .notif-icon.WASTE { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .notif-icon.ALERT { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .notif-icon.MESSAGE { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    
    .notif-content { flex-grow: 1; }
    .notif-title { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
    .notif-message { font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; line-height: 1.3; }
    .notif-time { font-size: 0.75rem; color: #64748b; }
    .notif-dot {
        width: 8px; height: 8px; background: #3b82f6;
        border-radius: 50%; margin-top: 6px;
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(notifStyle);

// Init on load
document.addEventListener('DOMContentLoaded', initAdminNotifications);

// --- Consolidated Analytics Logic ---
async function initDashboardCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    await loadWasteComposition();
    await loadUserActivity();
    await loadCenterCapacity();
}

async function loadWasteComposition() {
    const canvas = document.getElementById('wasteCompositionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const data = {
        labels: ['Plastic', 'Organic', 'Paper', 'Glass', 'E-Waste', 'Hazardous', 'Metal'],
        datasets: [{
            data: [35, 25, 15, 10, 5, 5, 5],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
                'rgba(14, 165, 233, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(100, 116, 139, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

async function loadUserActivity() {
    const canvas = document.getElementById('userActivityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [];
    const dataPoints = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        dataPoints.push(Math.floor(Math.random() * 50) + 10);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Scans',
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

async function loadCenterCapacity() {
    const canvas = document.getElementById('centerCapacityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    try {
        const res = await fetch(`${API_BASE_URL}/api/centers`);
        const centers = await res.json();

        let labels = [];
        let usedData = [];
        let freeData = [];

        if (Array.isArray(centers)) {
            labels = centers.map(c => c.center_name);
            usedData = centers.map(c => c.max_slots - c.available_slots);
            freeData = centers.map(c => c.available_slots);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Used Slots', data: usedData, backgroundColor: '#ef4444', borderRadius: 4 },
                    { label: 'Available Slots', data: freeData, backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                },
                plugins: { tooltip: { mode: 'index', intersect: false } }
            }
        });
    } catch (e) { console.error("Failed to load center stats", e); }
}

// --- Pickup Trend Mini Chart ---
document.addEventListener('DOMContentLoaded', () => {
    loadPickupTrend();
});

async function loadPickupTrend() {
    const canvas = document.getElementById('pickupTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    try {
        const res = await fetch('/api/pickup/trend');
        const data = await res.json();

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Today', 'Yesterday', 'This Week'],
                datasets: [{
                    label: 'Pickups',
                    data: [data.today, data.yesterday, data.week],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)', // Indigo
                        'rgba(168, 85, 247, 0.8)', // Purple
                        'rgba(236, 72, 153, 0.8)'  // Pink
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Failed to load pickup trend", e);
    }
}

// --- System Settings Functions ---

// Load System Information
async function loadSystemInfo() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/system-info`);

        if (!res.ok) throw new Error('API error');

        const data = await res.json();

        document.getElementById('aiStatusSetting').textContent = data.ai || '--';
        document.getElementById('dbModeSetting').textContent = data.db || '--';
        document.getElementById('uptimeSetting').textContent = data.uptime || '--';
        document.getElementById('memorySetting').textContent = data.memory || '--';
        document.getElementById('nodeVersion').textContent = data.node || '--';
    } catch (error) {
        console.error('Error loading system info:', error);
        document.getElementById('aiStatusSetting').textContent = 'Error';
        document.getElementById('dbModeSetting').textContent = 'Error';
        document.getElementById('uptimeSetting').textContent = 'Error';
        document.getElementById('memorySetting').textContent = 'Error';
        document.getElementById('nodeVersion').textContent = 'Error';
    }
}

// Make loadSystemInfo globally accessible
window.loadSystemInfo = loadSystemInfo;

// Load Settings from localStorage
// Load Settings from localStorage
function loadSettings() {
    // Logic moved to inline handlers in admin-dashboard.html to support the new modular System Settings section.
    // This function is kept for potential future global initializations.
    console.log("System settings initialized.");
}

// Clear All Cache
function clearAllCache() {
    if (confirm('Are you sure you want to clear all system cache? This will remove temporary data.')) {
        try {
            // Clear specific cache items (not all localStorage)
            // Preserve all system settings keys
            const keysToKeep = [
                'adminUser',
                'maintenanceMode',
                'globalAutoRefresh',
                'notificationsEnabled',
                'debugMode',
                'aiEnabled',
                'aiConfidence',
                'autoApprove',
                'strictSpecialWaste',
                'messagingEnabled',
                'adminLogging'
            ];
            const allKeys = Object.keys(localStorage);

            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            showToast('System cache cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing cache:', error);
            showToast('Failed to clear cache', 'error');
        }
    }
}

// Make clearAllCache globally accessible
window.clearAllCache = clearAllCache;

// Reset All Settings
function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        try {
            // Reset to defaults
            // Reset to defaults
            const defaults = {
                'maintenanceMode': 'false',
                'globalAutoRefresh': 'false',
                'notificationsEnabled': 'true',
                'debugMode': 'false',
                'aiEnabled': 'true',
                'aiConfidence': '85',
                'autoApprove': 'false',
                'strictSpecialWaste': 'true',
                'messagingEnabled': 'true',
                'adminLogging': 'true'
            };

            for (const [key, value] of Object.entries(defaults)) {
                localStorage.setItem(key, value);

                // Update UI if element exists
                // We rely on page reload or specific UI update logic, 
                // but for immediate feedback on toggles:
                const map = {
                    'maintenanceMode': 'maintenanceToggle',
                    'globalAutoRefresh': 'globalRefreshToggle',
                    'notificationsEnabled': 'notificationToggle',
                    'debugMode': 'debugModeToggle',
                    'aiEnabled': 'aiToggle',
                    'autoApprove': 'autoApproveToggle',
                    'strictSpecialWaste': 'strictApprovalToggle',
                    'messagingEnabled': 'messagingToggle',
                    'adminLogging': 'loggingToggle'
                };

                if (map[key]) {
                    const el = document.getElementById(map[key]);
                    if (el) el.checked = (value === 'true');
                }
            }

            // Also reset sliders/text
            if (document.getElementById('confidenceSlider')) {
                document.getElementById('confidenceSlider').value = 85;
                document.getElementById('confidenceValue').innerText = '85%';
            }

            // Reload settings
            loadSettings();

            showToast('Settings reset to defaults', 'success');
        } catch (error) {
            console.error('Error resetting settings:', error);
            showToast('Failed to reset settings', 'error');
        }
    }
}

// --- Reports Module Implementation ---

function hideAllSections() {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
}

window.showSection = function (id) {
    hideAllSections();
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
};

// Wiring up Navigation
const reportsNav = document.getElementById('reportsNav');
if (reportsNav) {
    reportsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('reportsSection');
        reportsNav.parentElement.classList.add('active');
        fetchReportRecords();
    };
}

const analyticsNav = document.getElementById('analyticsNav');
if (analyticsNav) {
    analyticsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('analyticsSection');
        analyticsNav.parentElement.classList.add('active');
    };
}

const systemSettingsNav = document.getElementById('systemSettingsNav');
if (systemSettingsNav) {
    systemSettingsNav.onclick = (e) => {
        e.preventDefault();
        window.showSection('systemSettingsSection');
        systemSettingsNav.parentElement.classList.add('active');
    };
}

// Handle Report Type Toggle
const reportTypeSelect = document.getElementById('reportType');
if (reportTypeSelect) {
    reportTypeSelect.onchange = (e) => {
        const userGroup = document.getElementById('userFilterGroup');
        if (userGroup) userGroup.style.display = e.target.value === 'summary' ? 'none' : 'block';
    };
}

// Fetch Records for Report Table
async function fetchReportRecords() {
    const tbody = document.getElementById('reportRecordsTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">
        <i class="ri-loader-4-line" style="animation:spin 1s linear infinite; display:inline-block;"></i>
        Loading records…
    </td></tr>`;

    try {
        const res = await fetch('/api/pickup/all');

        // Check HTTP status before trying to parse
        if (!res.ok) {
            let detail = `HTTP ${res.status}`;
            try {
                const errBody = await res.json();
                detail = errBody.detail || errBody.message || detail;
            } catch (_) { /* body not JSON */ }
            throw new Error(detail);
        }

        const records = await res.json();

        if (!Array.isArray(records) || records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">
                <i class="ri-inbox-line" style="font-size:1.5rem;"></i><br>No records found.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = records.slice(0, 50).map(r => `
            <tr>
                <td>#${r.request_id}</td>
                <td>${r.user_name || '—'}</td>
                <td>${r.waste_type || '—'}</td>
                <td>${r.quantity != null ? r.quantity + ' kg' : '—'}</td>
                <td><span class="status-badge status-${(r.status || '').toLowerCase()}">${r.status || '—'}</span></td>
                <td>
                    <button onclick="downloadAdminReport(${r.request_id})" class="btn btn-sm btn-outline" style="padding:4px 8px; font-size:0.75rem;">
                        <i class="ri-file-pdf-line"></i> PDF
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('[Reports] fetchReportRecords error:', e.message);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">
            <span style="color:#ef4444;"><i class="ri-error-warning-line"></i> Error loading records: <code style="font-size:0.8rem;">${e.message}</code></span><br>
            <button onclick="fetchReportRecords()" class="btn btn-sm btn-outline" style="margin-top:0.75rem; padding:4px 12px;">
                <i class="ri-refresh-line"></i> Retry
            </button>
        </td></tr>`;
    }
}


// Download Report (Admin Actions)
window.downloadAdminReport = async function (requestId) {
    try {
        showToast('Processing report...', 'info');
        const response = await fetch(`/api/reports/request/${requestId}`, {
            headers: { 'admin-id': localStorage.getItem('admin_sys_id') }
        });

        if (!response.ok) throw new Error('Generation failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SortSense_Official_Report_${requestId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        showToast('PDF downloaded successfully.', 'success');
    } catch (error) {
        showToast('Failed to generate PDF.', 'error');
    }
};

// Bulk/Summary Report Generation
if (document.getElementById('btnGenerateReport')) {
    document.getElementById('btnGenerateReport').onclick = async () => {
        const type = document.getElementById('reportType').value;
        const from = document.getElementById('reportFromDate').value;
        const to = document.getElementById('reportToDate').value;
        const userId = document.getElementById('reportUserId').value;

        if (type === 'summary') {
            let url = `/api/reports/summary?fromDate=${from}&toDate=${to}`;
            if (userId) url += `&userId=${userId}`;

            showToast('Generating Summary PDF...', 'info');
            window.location.href = url; // Browser handles PDF stream
        } else {
            showToast('Please select a specific record from the table below for individual reports.', 'warning');
        }
    };
}

window.resetReportFilters = () => {
    document.getElementById('reportFromDate').value = '';
    document.getElementById('reportToDate').value = '';
    document.getElementById('reportUserId').value = '';
    document.getElementById('reportType').value = 'summary';
    document.getElementById('userFilterGroup').style.display = 'none';
};
