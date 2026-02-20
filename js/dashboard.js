// dashboard.js - Handles Dashboard interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check (Role-based)
    let userId = localStorage.getItem('app_user_id');
    let userEmail = localStorage.getItem('app_user_email');

    // Migration/Fallback logic for existing sessions (optional, but requested to fix root cause, so we should be strict)
    // If we want to support old sessions without immediate logout loops, we could check 'userId' but that risks contamination.
    // Given the request is "critical... incorrect state", strict is better.
    // However, to avoid breaking the user's *current* demo session if they don't re-login, we could temporarily migrate.
    if (!userId && localStorage.getItem('userId') && localStorage.getItem('userRole') !== 'CENTER') {
        // Auto-migrate old User session
        userId = localStorage.getItem('userId');
        localStorage.setItem('app_user_id', userId);
        const legEmail = localStorage.getItem('userEmail');
        localStorage.setItem('app_user_email', legEmail);
        userEmail = legEmail;
    }

    if (!userEmail || !userId) {
        // Not logged in or Wrong Role
        window.location.href = '../index.html';
        return;
    }

    // Set globally for other functions in this file
    window.currentUserId = userId; // explicit window var to avoid confusion with local vars

    // Legacy support: Some code might still look for 'userId' in localStorage if I miss a spot.
    // To be safe, I will NOT set 'userId' back to localStorage to avoid Center side reading it.
    // Instead, I will ensure this file uses 'userId' variable correctly.

    // 2. Fetch Latest Profile Data
    const welcomeName = document.getElementById('welcomeName');
    const userAvatar = document.getElementById('userAvatar');

    if (welcomeName) welcomeName.textContent = "Loading...";

    // User is always USER role here
    const fetchUrl = `/api/user/profile?userId=${userId}`;

    fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                console.log("Dashboard Profile Data:", data.user); // DEBUG

                if (welcomeName) welcomeName.textContent = data.user.name;

                // Update Header User Details
                const headerUserName = document.getElementById('headerUserName');
                const headerUserEmail = document.getElementById('headerUserEmail');

                if (headerUserName) headerUserName.textContent = data.user.name || "User";
                if (headerUserEmail) headerUserEmail.textContent = data.user.email || userEmail || "";

                // Update Eco Score
                if (typeof updateEcoScore === 'function') {
                    updateEcoScore(data.user.points || data.user.eco_score || 0); // Default 0 if missing
                }

                if (userAvatar) {
                    // Prioritize Backend Profile Pic -> LocalStorage -> Fallback
                    const picUrl = data.user.profile_picture || localStorage.getItem('app_user_pic');

                    if (picUrl && picUrl !== "undefined" && picUrl !== "null") {
                        console.log("Setting Avatar Src:", picUrl);
                        userAvatar.src = picUrl;

                        userAvatar.onerror = () => {
                            console.error("Failed to load avatar image at:", picUrl);
                            // Fallback
                            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=10b981&color=fff`;
                        };
                    } else {
                        console.log("No profile picture found, using fallback.");
                        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=10b981&color=fff`;
                    }
                }

                // Cache for other pages
                // Restore userId if missing (Migration/Fix)
                if (!localStorage.getItem('userId') && data.user.user_id) {
                    console.log("Restoring missing userId:", data.user.user_id);
                    localStorage.setItem('userId', data.user.user_id);
                    // Reload to ensure state is fresh for pickup logic
                    window.location.reload();
                }

                localStorage.setItem('app_user_name', data.user.name);
                if (data.user.profile_picture) localStorage.setItem('userPicture', data.user.profile_picture);
            } else {
                console.warn("User found in local storage but not in Backend (Mock DB reset?).");
                if (welcomeName) welcomeName.textContent = localStorage.getItem('app_user_name') || "User";
                // We don't force logout to avoid disrupting dev flow, but we show cached name if possible.
            }
        })
        .catch(err => {
            console.error("Profile load error:", err);
            // Fallback to cache ONLY if network fails
            if (welcomeName) welcomeName.textContent = localStorage.getItem('app_user_name') || "User";
        });

    // 3. Quick Search Logic
    const searchInput = document.querySelector('.waste-name-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchBtn && searchInput) {
        // Click Handler
        searchBtn.addEventListener('click', () => {
            performQuickSearch(searchInput.value);
        });

        // Enter Key Handler
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performQuickSearch(searchInput.value);
            }
        });
    }



    // --- Notification & History Init ---
    initNotifications();
    initHistoryLink();
    // -----------------------------------

    // 4. Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear(); // Clear all user data
            window.location.href = '../index.html';
        });
    }

    // 5. Category Card Click Logic
    const categoryCards = document.querySelectorAll('.category-card');
    console.log("Found category cards:", categoryCards.length);

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log("Clicked card:", card.className);
            let categoryKey = '';

            if (card.classList.contains('plastic')) categoryKey = 'plastic';
            else if (card.classList.contains('organic')) categoryKey = 'organic';
            else if (card.classList.contains('paper')) categoryKey = 'paper';
            else if (card.classList.contains('glass')) categoryKey = 'glass';
            else if (card.classList.contains('e-waste')) categoryKey = 'ewaste';
            else if (card.classList.contains('hazardous')) categoryKey = 'hazardous';

            console.log("Navigating to:", categoryKey);

            if (categoryKey) {
                window.location.href = `category-detail.html?category=${categoryKey}`;
            }
        });
    });

    // 6. View All Categories (Optional)
    const viewAllBtn = document.querySelector('.view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.categories-grid').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 7. Smart Disposal Tip
    displayDailyTip();

    // 8. Gamification Init
    if (typeof initGamification === 'function') {
        initGamification();
    }
});

function displayDailyTip() {
    const tips = [
        "Wash plastic containers before recycling to prevent contamination.",
        "Compost organic waste at home to reduce landfill usage.",
        "Remove batteries from e-waste before disposal; they need special handling.",
        "Flatten cardboard boxes to save space in recycling bins.",
        "Glass can be recycled endlessly without losing quality.",
        "Don't bag your recyclables; keep them loose in the bin.",
        "Rinse metal cans to avoid attracting pests."
    ];

    // Use date to pick a consistent tip for the day
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = dayOfYear % tips.length;

    const tipContainer = document.getElementById('dailyTipContainer');
    if (tipContainer) {
        tipContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-radius: 12px; padding: 15px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); display:flex; gap:15px; align-items:center;">
                <div style="background:rgba(255,255,255,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i class="ri-lightbulb-flash-line" style="color:#f59e0b; font-size:1.2rem;"></i>
                </div>
                <div>
                    <h5 style="margin:0 0 5px 0; font-size:0.9rem; color:#e2e8f0;">Smart Tip of the Day</h5>
                    <p style="margin:0; font-size:0.85rem; color:#94a3b8; line-height:1.4;">${tips[tipIndex]}</p>
                </div>
            </div>
        `;
    }
}



/* --- Helper Functions for Notifications & History --- */

function initNotifications() {
    const badge = document.querySelector('.notification-badge');
    const panel = document.getElementById('notificationPanel');
    const list = document.getElementById('notifList');
    const dot = document.querySelector('.notification-badge .dot');

    if (!badge || !panel) return;

    // Toggle Panel
    badge.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click closing
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            loadNotifications(list, dot);
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !badge.contains(e.target)) {
            panel.classList.remove('active');
        }
    });

    // Initial check for unread
    checkUnread(dot);
}

async function loadNotifications(listContainer, dot) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    listContainer.innerHTML = '<div style="padding:1rem; text-align:center; color:gray;">Loading...</div>';

    try {
        const res = await fetch(`/api/user/${userId}/notifications`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            listContainer.innerHTML = '<div class="no-notifs">No notifications yet.</div>';
            return;
        }

        listContainer.innerHTML = '';
        data.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;
            item.innerHTML = `
                <span class="notif-title">${notif.title}</span>
                <span class="notif-msg">${notif.message}</span>
                <span class="notif-time">${new Date(notif.created_at).toLocaleString()}</span>
            `;

            // Mark as read on click
            if (!notif.is_read) {
                item.addEventListener('click', async () => {
                    await fetch(`/api/user/notifications/${notif.notification_id}/read`, { method: 'PUT' });
                    item.classList.remove('unread');
                    checkUnread(dot); // Re-check dot status
                });
            }

            listContainer.appendChild(item);
        });

    } catch (e) {
        console.error("Notif Load Error:", e);
        listContainer.innerHTML = '<div class="no-notifs" style="color:red;">Error loading notifications.</div>';
    }
}

async function checkUnread(dot) {
    const userId = window.currentUserId || localStorage.getItem('app_user_id');
    if (!userId || !dot) return;

    try {
        const res = await fetch(`/api/user/${userId}/notifications`);
        const data = await res.json();
        const hasUnread = Array.isArray(data) && data.some(n => !n.is_read);
        dot.style.display = hasUnread ? 'block' : 'none';
    } catch (e) { /* ignore silent fail */ }
}

function initHistoryLink() {
    const historyLink = document.querySelector('a span[data-i18n="history_menu"]');
    if (historyLink && historyLink.parentElement) {
        historyLink.parentElement.addEventListener('click', (e) => {
            e.preventDefault();
            showUserHistoryModal();
        });
    }
}

function showUserHistoryModal() {
    const modalId = 'userHistoryModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.8); z-index: 2000;
            display: flex; justify-content: center; align-items: center;
        `;
        modal.innerHTML = `
            <div style="background:#0f172a; width:90%; max-width:800px; max-height:80vh; border-radius:16px; border:1px solid rgba(255,255,255,0.1); padding:2rem; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2 style="color:white; margin:0;">Activity History</h2>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button id="clearHistBtn" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.2); color:#ef4444; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                            <i class="ri-delete-bin-line"></i> Clear
                        </button>
                        <button id="closeHistBtn" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;"><i class="ri-close-line"></i></button>
                    </div>
                </div>
                <div id="histContent" style="flex:1; overflow-y:auto; color:gray;">
                    Loading history...
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#closeHistBtn').onclick = () => {
            modal.style.display = 'none';
        };

        modal.querySelector('#clearHistBtn').onclick = async () => {
            window.showCustomConfirm("Clear History", "Are you sure you want to clear your Search & Scan history? pickup requests will remain.", async () => {
                const userId = localStorage.getItem('userId');
                try {
                    await fetch(`/api/user/${userId}/history`, { method: 'DELETE' });
                    loadUserHistory(document.getElementById('histContent'));
                    window.showSuccess("History cleared.");
                } catch (e) { window.showError("Failed to clear history."); }
            });
        };
    }

    modal.style.display = 'flex';
    loadUserHistory(document.getElementById('histContent'));
}

async function loadHistory() {
    const historyContainer = document.querySelector('.history-list');
    if (!historyContainer) return;

    historyContainer.innerHTML = '<p class="loading-text">Loading...</p>';

    try {
        // Using window.currentUserId set at top
        const res = await fetch(`/api/user/history?userId=${window.currentUserId || localStorage.getItem('app_user_id')}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            historyContainer.innerHTML = '<p style="text-align:center;">No activity recorded yet.</p>';
            return;
        }

        let html = '<table style="width:100%; border-collapse:collapse; color:white; font-size:0.9rem;">';
        html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;"><th style="padding:10px;">Date</th><th style="padding:10px;">Activity</th><th style="padding:10px;">Details</th><th style="padding:10px;">Status</th></tr>';

        data.forEach(item => {
            let detailText = '';
            if (item.type === 'SCAN') {
                const d = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                detailText = `Scanned: <strong>${d.category}</strong> (${Math.round(d.confidence || 0)}%)`;
            } else if (item.type === 'SEARCH') {
                const d = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                detailText = `Searched: "<strong>${d.query}</strong>"`;
            } else if (item.type === 'PICKUP') {
                const slot = item.details.timeSlot || (item.details.address && item.details.address.includes('SLOT:') ? item.details.address.split('SLOT:')[1] : "");
                detailText = `${item.details.wasteTypes} (${item.details.quantity}kg)${slot ? ` <br><span style="font-size:0.8rem; color:#f59e0b;"><i class="ri-time-line"></i> ${slot}</span>` : ''}`;
            }

            let sColor = '#94a3b8';
            let statusText = item.status || 'Done';
            if (statusText === 'Completed' || statusText === 'Approved') sColor = '#10b981';
            if (statusText === 'Rejected' || statusText === 'Cancelled') sColor = '#ef4444';
            if (statusText === 'Pending') sColor = '#f59e0b';

            // Override for actions
            if (item.type === 'SCAN' || item.type === 'SEARCH') {
                statusText = 'Recorded';
                sColor = '#3b82f6';
            }

            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:12px; color:#94a3b8;">${new Date(item.date).toLocaleDateString()}</td>
                    <td style="padding:12px; font-weight:600;">
                        ${item.type === 'PICKUP' ? '<i class="ri-truck-line"></i> Pickup' :
                    item.type === 'SCAN' ? '<i class="ri-camera-line"></i> Scan' :
                        '<i class="ri-search-line"></i> Search'}
                    </td>
                    <td style="padding:12px;">${detailText}</td>
                    <td style="padding:12px;"><span style="color:${sColor}; border:1px solid ${sColor}; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${statusText}</span></td>
                </tr>
            `;
        });

        html += '</table>';
        historyContainer.innerHTML = html;

    } catch (e) {
        historyContainer.innerText = "Failed to load history.";
        console.error(e);
    }
}

async function loadUserHistory(container) {
    const userId = window.currentUserId || localStorage.getItem('app_user_id');
    try {
        const res = await fetch(`/api/user/${userId}/history`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No activity recorded yet.</p>';
            return;
        }

        let html = '<table style="width:100%; border-collapse:collapse; color:white; font-size:0.9rem;">';
        html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;"><th style="padding:10px;">Date</th><th style="padding:10px;">Activity</th><th style="padding:10px;">Details</th><th style="padding:10px;">Status</th></tr>';

        data.forEach(item => {
            let detailText = '';
            if (item.type === 'SCAN') {
                const d = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                detailText = `Scanned: <strong>${d.category}</strong> (${Math.round(d.confidence || 0)}%)`;
            } else if (item.type === 'SEARCH') {
                const d = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                detailText = `Searched: "<strong>${d.query}</strong>"`;
            } else if (item.type === 'PICKUP') {
                const slot = item.details.timeSlot || (item.details.address && item.details.address.includes('SLOT:') ? item.details.address.split('SLOT:')[1] : "");
                detailText = `${item.details.wasteTypes} (${item.details.quantity}kg)${slot ? ` <br><span style="font-size:0.8rem; color:#f59e0b;"><i class="ri-time-line"></i> ${slot}</span>` : ''}`;
            }

            let sColor = '#94a3b8';
            let statusText = item.status || 'Done';
            if (statusText === 'Completed' || statusText === 'Approved') sColor = '#10b981';
            if (statusText === 'Rejected' || statusText === 'Cancelled') sColor = '#ef4444';
            if (statusText === 'Pending') sColor = '#f59e0b';

            // Override for actions
            if (item.type === 'SCAN' || item.type === 'SEARCH') {
                statusText = 'Recorded';
                sColor = '#3b82f6';
            }

            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:12px; color:#94a3b8;">${new Date(item.date).toLocaleDateString()}</td>
                    <td style="padding:12px; font-weight:600;">
                        ${item.type === 'PICKUP' ? '<i class="ri-truck-line"></i> Pickup' :
                    item.type === 'SCAN' ? '<i class="ri-camera-line"></i> Scan' :
                        '<i class="ri-search-line"></i> Search'}
                    </td>
                    <td style="padding:12px;">${detailText}</td>
                    <td style="padding:12px;"><span style="color:${sColor}; border:1px solid ${sColor}; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${statusText}</span></td>
                </tr>
            `;
        });

        html += '</table>';
        container.innerHTML = html;

    } catch (e) {
        container.innerText = "Failed to load history.";
        console.error(e);
    }
}

async function performQuickSearch(query) {
    if (!query || query.trim() === '') {
        alert("Please enter a waste item name (e.g., 'plastic bottle').");
        return;
    }

    const searchBtn = document.querySelector('.search-btn');
    const originalIcon = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>'; // Loading state
    searchBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8000/api/waste/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                userId: localStorage.getItem('userId')
            })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.removeItem('wasteImage');
            sessionStorage.setItem('analysisResult', JSON.stringify(data));
            window.location.href = 'analysis-result.html';
        } else {
            alert(data.message || "Search failed. Please try again.");
        }

    } catch (error) {
        console.error("Search Error:", error);
        alert("Could not connect to the server.");
    } finally {
        searchBtn.innerHTML = originalIcon;
        searchBtn.disabled = false;
    }
}

/* --- Autocomplete Feature Logic --- */
const WASTE_ITEM_DB = [
    // Plastic
    { name: "Plastic Bottle", cat: "Plastic", icon: "ri-recycle-line" },
    { name: "Plastic Bag", cat: "Plastic", icon: "ri-recycle-line" },
    { name: "Plastic Cup", cat: "Plastic", icon: "ri-recycle-line" },
    { name: "Milk Packet", cat: "Plastic", icon: "ri-drop-line" },
    { name: "Shampoo Bottle", cat: "Plastic", icon: "ri-recycle-line" },
    { name: "Food Container", cat: "Plastic", icon: "ri-archive-line" },
    { name: "Plastic Straw", cat: "Plastic", icon: "ri-recycle-line" },
    { name: "Plastic Toy", cat: "Plastic", icon: "ri-gamepad-line" },

    // Glass
    { name: "Glass Bottle", cat: "Glass", icon: "ri-goblet-line" },
    { name: "Broken Glass", cat: "Glass", icon: "ri-alert-line" },
    { name: "Mirror", cat: "Glass", icon: "ri-layout-line" },
    { name: "Light Bulb", cat: "Glass", icon: "ri-lightbulb-line" },

    // Paper
    { name: "Newspaper", cat: "Paper", icon: "ri-newspaper-line" },
    { name: "Magazine", cat: "Paper", icon: "ri-book-open-line" },
    { name: "Cardboard Box", cat: "Paper", icon: "ri-inbox-archive-line" },
    { name: "Paper Cup", cat: "Paper", icon: "ri-cup-line" },
    { name: "Tetra Pack", cat: "Paper", icon: "ri-file-paper-line" },

    // Metal
    { name: "Soda Can", cat: "Metal", icon: "ri-drinks-fill" },
    { name: "Aluminum Foil", cat: "Metal", icon: "ri-file-list-line" },
    { name: "Iron Scrap", cat: "Metal", icon: "ri-hammer-line" },

    // Organic
    { name: "Vegetable Peel", cat: "Organic", icon: "ri-leaf-line" },
    { name: "Leftover Food", cat: "Organic", icon: "ri-restaurant-line" },
    { name: "Garden Waste", cat: "Organic", icon: "ri-plant-line" },
    { name: "Egg Shell", cat: "Organic", icon: "ri-leaf-line" },

    // E-waste
    { name: "Mobile Phone", cat: "E-waste", icon: "ri-smartphone-line" },
    { name: "Laptop", cat: "E-waste", icon: "ri-macbook-line" },
    { name: "Battery", cat: "E-waste", icon: "ri-battery-charge-line" },
    { name: "Charger", cat: "E-waste", icon: "ri-plug-line" },
    { name: "Earphones", cat: "E-waste", icon: "ri-headphone-line" },

    // Hazardous
    { name: "Paint Can", cat: "Hazardous", icon: "ri-paint-brush-line" },
    { name: "Thermometer", cat: "Hazardous", icon: "ri-temp-hot-line" },
    { name: "Syringe", cat: "Hazardous", icon: "ri-capsule-line" },
    { name: "Spray Can", cat: "Hazardous", icon: "ri-mist-line" }
];

function initAutocomplete() {
    const input = document.querySelector('.waste-name-input');
    if (!input) return;

    let container = document.querySelector('.autocomplete-items');
    if (!container) {
        container = document.createElement('div');
        container.setAttribute('class', 'autocomplete-items');
        input.parentNode.appendChild(container);
    }

    let currentFocus = -1;

    input.addEventListener('input', function (e) {
        const val = this.value;
        closeAllLists();
        if (!val) return false;

        currentFocus = -1;

        // Filter Items
        const matches = WASTE_ITEM_DB.filter(item =>
            item.name.substr(0, val.length).toUpperCase() === val.toUpperCase()
        ).slice(0, 5); // Limit to 5 suggestions

        if (matches.length === 0) return;

        container.style.display = 'block';

        matches.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'suggestion-item'; // For styling

            // Icon
            const iconHtml = `<i class="${item.icon || 'ri-search-line'} suggestion-icon"></i>`;

            // Name with Bold Match
            const matchName = "<strong>" + item.name.substr(0, val.length) + "</strong>" + item.name.substr(val.length);

            // Category Label
            const catLabel = `<span class="suggestion-cat">${item.cat}</span>`;

            itemDiv.innerHTML = `
                <div class="suggestion-left">
                    ${iconHtml}
                    <span class="suggestion-text">${matchName}</span>
                </div>
                ${catLabel}
                <input type='hidden' value='${item.name}'>
            `;

            itemDiv.addEventListener('click', function (e) {
                input.value = this.querySelector("input").value;
                closeAllLists();
                performQuickSearch(input.value);
            });

            container.appendChild(itemDiv);
        });
    });

    input.addEventListener('keydown', function (e) {
        let x = container.querySelectorAll('.suggestion-item');
        if (e.keyCode == 40) { // Down
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // Up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            } else {
                closeAllLists();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
        x[currentFocus].scrollIntoView({ block: "nearest" });
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        container.innerHTML = '';
        container.style.display = 'none';
    }

    document.addEventListener("click", function (e) {
        if (e.target !== input) {
            closeAllLists();
        }
    });
}

// Call init once DOM matches
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutocomplete);
} else {
    initAutocomplete();
}

/* --- Pickup Request Feature (Real Backend) --- */
document.addEventListener('DOMContentLoaded', () => {
    const requestPickupBtn = document.getElementById('requestPickupBtn');

    // Initial Status Check
    checkPickupStatus();

    // Poll every 30 seconds for updates (Real-time sync)
    setInterval(checkPickupStatus, 10000);

    if (requestPickupBtn) {
        requestPickupBtn.addEventListener('click', () => {
            handlePickupRequest();
        });
    }

    /* --- "Use My Location" Button Logic --- */
    const useLocationBtn = document.getElementById('useUserLocationBtn');
    const latInput = document.getElementById('pickupLat');
    const lngInput = document.getElementById('pickupLng');

    if (useLocationBtn) {
        // Clear hidden coords if user types manually
        const addressInput = document.getElementById('pickupAddress');
        if (addressInput) {
            addressInput.addEventListener('input', () => {
                if (latInput) latInput.value = "";
                if (lngInput) lngInput.value = "";
                useLocationBtn.classList.remove('active');
                const locationText = document.getElementById('locationText');
                if (locationText) locationText.innerText = "Use GPS";
            });
        }

        useLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            useLocationBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Detecting...';
            useLocationBtn.disabled = true;

            // Reset State
            useLocationBtn.classList.remove('active', 'error');

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    if (latInput) latInput.value = lat;
                    if (lngInput) lngInput.value = lng;

                    try {
                        useLocationBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Fetching Address...';
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();

                        const addressInput = document.getElementById('pickupAddress');
                        if (addressInput) addressInput.value = data.display_name || "";

                        let displayLoc = "Location Set";
                        if (data.address) {
                            // Try to find the most relevant part
                            displayLoc = data.address.road || data.address.suburb || data.address.residential || data.address.neighbourhood || data.address.city || data.address.town || data.address.village;

                            // If still generic or empty, try display_name first part
                            if (!displayLoc && data.display_name) {
                                displayLoc = data.display_name.split(',')[0];
                            }
                            if (!displayLoc) displayLoc = "Unknown Loc";
                        }

                        // Truncate if too long
                        if (displayLoc.length > 25) displayLoc = displayLoc.substring(0, 23) + '..';

                        useLocationBtn.innerHTML = `<i class="ri-map-pin-user-fill"></i> ${displayLoc}`;
                        useLocationBtn.title = data.display_name || "Current Location";

                        useLocationBtn.classList.add('active');
                        checkNearestCenter(lat, lng);
                    } catch (error) {
                        // Fallback
                        useLocationBtn.innerHTML = `<i class="ri-map-pin-user-fill"></i> ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                        useLocationBtn.classList.add('active');
                    }

                    useLocationBtn.disabled = false;
                },
                (err) => {
                    console.error("Geo Error:", err);
                    useLocationBtn.innerHTML = '<i class="ri-error-warning-line"></i> Failed';
                    useLocationBtn.classList.add('error');

                    setTimeout(() => {
                        useLocationBtn.innerHTML = '<i class="ri-map-pin-line"></i> Use My Location';
                        useLocationBtn.classList.remove('error');
                        useLocationBtn.disabled = false;
                    }, 2000);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    }

    // function initWasteChips() {
    //     const chips = document.querySelectorAll('.waste-chip');
    //     const hiddenInput = document.getElementById('pickupWasteType');

    //     if (!hiddenInput) return;

    //     chips.forEach(chip => {
    //         chip.addEventListener('click', () => {
    //             // 1. Toggle active class
    //             chip.classList.toggle('active');

    //             // 2. Gather all active values
    //             const activeChips = Array.from(document.querySelectorAll('.waste-chip.active'));
    //             const values = activeChips.map(c => c.getAttribute('data-value'));

    //             // 3. Update hidden input with comma-separated string
    //             hiddenInput.value = values.join(',');
    //         });
    //     });
    // }

    function checkPickupStatus() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        fetch(`/api/pickup/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                // data will be null if no active request, or the request object
                updatePickupUI(data);
            })
            .catch(err => console.error("Status Check Error:", err));
    }

    function handlePickupRequest() {
        const typeSelect = document.getElementById('pickupWasteType'); // Now a SELECT element
        const quantityInput = document.getElementById('pickupQuantity');
        const btn = document.getElementById('requestPickupBtn');

        const wasteType = typeSelect.value;
        const quantity = parseFloat(quantityInput.value);
        const userId = localStorage.getItem('userId');

        // 1. Validate Selection
        if (!wasteType) {
            window.showWarning("Please select a waste type.");
            return;
        }

        // 2. Validate Quantity
        if (!quantity || quantity <= 0) {
            window.showWarning("Please enter a valid positive quantity in kg.");
            return;
        }

        // 3. Organic Rule: Min 2kg if Organic is selected
        if (wasteType === 'Organic' && quantity < 2) {
            window.showWarning("Organic waste pickup requires a minimum of 2kg.");
            return;
        }

        // 4. Validate Time Slot (New Requirement)
        const timeSlotSelect = document.getElementById('pickupTimeSlot');
        const timeSlot = timeSlotSelect ? timeSlotSelect.value : null;

        if (!timeSlot) {
            window.showWarning("Please select a preferred time slot.");
            return;
        }

        if (!userId) {
            window.showError("Please login first.");
            return;
        }

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Finding Center...';

        // 4. Get Location & Submit (with Fallback)
        const submitPickup = (lat, lng, manualAddress = null) => {
            fetch('/api/pickup/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    wasteType: wasteType,
                    quantity: quantity,
                    timeSlot: timeSlot, // New Field
                    lat: lat,
                    lng: lng,
                    address: (manualAddress || (document.getElementById('pickupAddress') ? document.getElementById('pickupAddress').value : "")) + ` || SLOT:${timeSlot}` // Append to address for fallback storage
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.requestId) {
                        // Success
                        clearPickupForm(); // Clear the form fields
                        checkPickupStatus(); // Refresh UI immediately

                        // Show SuccessMsg
                        const successMsg = document.getElementById('pickupSuccessMsg');
                        if (successMsg) {
                            successMsg.style.display = 'flex';
                            setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
                        }
                    } else {
                        // Handle Errors
                        console.error("Pickup Request Failed:", data);
                        const msg = data.message || "Failed to create request.";
                        window.showError(msg);
                    }
                })
                .catch(err => {
                    console.error("Pickup Req Error:", err);
                    window.showError("Server error. Please try again.");
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                });
        };

        const manualLat = document.getElementById('pickupLat') ? document.getElementById('pickupLat').value : null;
        const manualLng = document.getElementById('pickupLng') ? document.getElementById('pickupLng').value : null;
        const manualAddress = document.getElementById('pickupAddress') ? document.getElementById('pickupAddress').value : "";

        if (manualLat && manualLng) {
            console.log("Using GPS set location:", manualLat, manualLng);
            submitPickup(parseFloat(manualLat), parseFloat(manualLng));
        }
        else if (manualAddress && manualAddress.trim().length > 0) {
            // User typed an address manually but no coordinates
            console.log("Using manually typed address:", manualAddress);
            submitPickup(null, null, manualAddress);
        }
        else if (!navigator.geolocation) {
            console.warn("Geolocation not supported. Proceeding with fallback.");
            submitPickup(null, null);
        } else {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    let fetchedAddress = "";
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        fetchedAddress = data.display_name || "";
                    } catch (e) {
                        console.warn("Auto-geocoding address fetch failed:", e);
                    }

                    submitPickup(lat, lng, fetchedAddress);
                },
                (error) => {
                    console.warn("Unable to retrieve location. Proceeding with fallback strategy.", error);
                    submitPickup(null, null);
                },
                { timeout: 5000, enableHighAccuracy: true }
            );
        }

        function resetBtn() {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    function clearPickupForm() {
        console.log("🧹 Clearing Pickup Form...");
        const typeSelect = document.getElementById('pickupWasteType');
        const slotSelect = document.getElementById('pickupTimeSlot');
        const quantityInput = document.getElementById('pickupQuantity');
        const addressInput = document.getElementById('pickupAddress');
        const latInput = document.getElementById('pickupLat');
        const lngInput = document.getElementById('pickupLng');
        const useLocationBtn = document.getElementById('useUserLocationBtn');

        if (typeSelect) typeSelect.selectedIndex = 0;
        if (slotSelect) slotSelect.selectedIndex = 0;
        if (quantityInput) quantityInput.value = "";
        if (addressInput) addressInput.value = "";
        if (latInput) latInput.value = "";
        if (lngInput) lngInput.value = "";

        if (useLocationBtn) {
            useLocationBtn.classList.remove('active');
            useLocationBtn.innerHTML = '<i class="ri-map-pin-line"></i> Use GPS';
            useLocationBtn.style.color = "";
            useLocationBtn.style.background = "";
        }

        const infoDiv = document.getElementById('nearestCenterInfo');
        if (infoDiv) {
            infoDiv.style.display = 'none';
            infoDiv.innerHTML = '';
        }

        // Reset Center availability text
        const statusEl = document.getElementById("centerStatus");
        const slotsEl = document.getElementById("centerSlots");
        const loadEl = document.getElementById("centerLoad");
        if (statusEl) statusEl.textContent = "--";
        if (slotsEl) slotsEl.textContent = "--";
        if (loadEl) loadEl.textContent = "--";
    }

    function updatePickupUI(data) {
        const formWrapper = document.getElementById('pickupFormWrapper');
        const mainFormCard = document.querySelector('.pickup-section > .pickup-card');
        let infoContainer = document.getElementById('pickupInfoContainer');
        const pickupSection = document.querySelector('.pickup-section');

        // 1. Setup Container
        if (!infoContainer && pickupSection) {
            infoContainer = document.createElement('div');
            infoContainer.id = 'pickupInfoContainer';
            infoContainer.style.display = 'flex';
            infoContainer.style.flexDirection = 'column';
            infoContainer.style.gap = '1rem';
            infoContainer.style.width = '100%';
            pickupSection.appendChild(infoContainer);
        }

        // 2. Clear Previous content
        if (infoContainer) infoContainer.innerHTML = '';

        // 3. Check State
        let requests = [];
        if (Array.isArray(data)) {
            requests = data;
        } else if (data && !data.message) {
            requests = [data];
        }

        const activeRequests = requests.filter(r => r && r.status && r.status !== 'Completed' && r.status !== 'Cancelled');

        // Toggle Form vs Cards
        if (activeRequests.length === 0) {
            if (typeof window.checkPickupReminder === 'function') window.checkPickupReminder([]);
            if (mainFormCard) mainFormCard.style.display = 'block';
            if (formWrapper) formWrapper.style.display = 'flex';
            if (infoContainer) infoContainer.style.display = 'none';
            return;
        } else {
            if (typeof window.checkPickupReminder === 'function') window.checkPickupReminder(activeRequests);
            if (mainFormCard) mainFormCard.style.display = 'none';
            if (infoContainer) infoContainer.style.display = 'flex';
        }

        // 4. Render Cards
        const t = (k) => typeof getTranslation === 'function' ? getTranslation(k) : k;


        activeRequests.forEach(req => {
            // Create Card
            const card = document.createElement('div');
            card.className = 'pickup-card';
            card.style.background = 'rgba(255,255,255,0.05)';
            card.style.border = '1px solid rgba(255,255,255,0.1)';
            card.style.borderRadius = '12px';
            card.style.padding = '1.5rem';
            card.style.position = 'relative';

            // Badge Logic
            const statusClass = req.status.toLowerCase();
            let statusBadgeInfo = { text: req.status, color: '#fff', bg: 'rgba(255,255,255,0.1)' };

            if (statusClass === 'pending') {
                statusBadgeInfo = { text: t('status_pending'), color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
            } else if (statusClass === 'approved') {
                statusBadgeInfo = { text: t('status_approved'), color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' };
            } else if (statusClass === 'rejected') {
                statusBadgeInfo = { text: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
            }

            const statusLabel = statusBadgeInfo.text;

            // --- Status Stepper Visualization ---
            const steps = ['Requested', 'Scheduled', 'Collected', 'Completed'];
            let currentStepIdx = 0;
            let isRejected = false;

            if (req.status === 'Approved') currentStepIdx = 1;
            if (req.status === 'Collected') currentStepIdx = 2;
            if (req.status === 'Completed') currentStepIdx = 3;
            if (req.status === 'Rejected') {
                isRejected = true;
                currentStepIdx = -1; // No active positive step
            }

            let stepperHtml = `<div class="stepper-wrapper ${isRejected ? 'rejected' : ''}">`;

            steps.forEach((step, index) => {
                let stepClass = '';
                let iconContent = index + 1;

                if (!isRejected) {
                    if (index < currentStepIdx) {
                        stepClass = 'completed';
                        iconContent = '<i class="ri-check-line"></i>';
                    } else if (index === currentStepIdx) {
                        stepClass = 'active';
                    }
                } else {
                    // If rejected, mark 'Requested' as error state (handled by CSS .rejected)
                    if (index === 0) {
                        stepClass = 'active';
                        iconContent = '<i class="ri-close-line"></i>';
                    }
                }

                stepperHtml += `
                    <div class="stepper-item ${stepClass}">
                        <div class="step-counter">${iconContent}</div>
                        <div class="step-name">${step}</div>
                    </div>
                `;
            });
            stepperHtml += '</div>';

            // --- Extra Info Logic (ETA / Rejection Reason) ---
            let extraInfoHtml = '';
            if (req.status === 'Rejected' && req.rejection_reason) {
                extraInfoHtml = `
                <div style="margin-top:0.5rem; padding:0.5rem; background:rgba(239, 68, 68, 0.1); border-left:3px solid #ef4444; border-radius:4px;">
                    <strong style="color:#ef4444; font-size:0.8rem;">Reason:</strong> 
                    <span style="color:#fca5a5; font-size:0.85rem;">"${req.rejection_reason}"</span>
                </div>
            `;
            }
            if (req.status === 'Approved' && req.estimated_pickup_time) {
                extraInfoHtml = `
                 <div style="margin-top:0.5rem; padding:0.5rem; background:rgba(59, 130, 246, 0.1); border-left:3px solid #3b82f6; border-radius:4px;">
                    <strong style="color:#60a5fa; font-size:0.8rem;">ETA:</strong> 
                    <span style="color:#93c5fd; font-size:0.85rem;">${req.estimated_pickup_time}</span>
                </div>
            `;
            }

            // Items List
            let itemsHtml = '';
            if (req.items && req.items.length > 0) {
                itemsHtml = req.items.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem;">
                        <i class="ri-recycle-line" style="color:#10b981;"></i> ${t(item.waste_type)}
                    </span>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <strong style="font-size:0.9rem; margin-right:0.5rem;">${item.quantity} kg</strong>
                        ${req.status === 'Pending' ?
                        `<i class="ri-close-circle-line" onclick="deletePickupItem(${req.request_id}, ${item.item_id})" style="color:#ef4444; cursor:pointer; font-size:1.1rem; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8" title="Remove Item"></i>`
                        : ''}
                    </div>
                </div>
            `).join('');
            }

            // Combine Items + Extra Info
            if (extraInfoHtml) {
                itemsHtml = extraInfoHtml + '<div style="margin-top:0.5rem;">' + itemsHtml + '</div>';
            }

            // Actions
            let actionsHtml = '';
            // Fixed: Use hardcoded options since the main SELECT was replaced by Chips
            const typeOptions = `
             <option value="Plastic" data-i18n="plastic" style="background-color: #1f2937; color: white;">Plastic</option>
             <option value="Paper" data-i18n="paper" style="background-color: #1f2937; color: white;">Paper</option>
             <option value="Organic" data-i18n="organic" style="background-color: #1f2937; color: white;">Organic</option>
             <option value="Glass" data-i18n="glass" style="background-color: #1f2937; color: white;">Glass</option>
             <option value="Metal" data-i18n="metal" style="background-color: #1f2937; color: white;">Metal</option>
             <option value="E-Waste" data-i18n="ewaste" style="background-color: #1f2937; color: white;">E-Waste</option>
             <option value="Hazardous" data-i18n="hazardous" style="background-color: #1f2937; color: white;">Hazardous</option>
        `;

            if (req.status === 'Pending' || req.status === 'Rejected') {
                actionsHtml = `
                    <div class="pickup-actions" style="display:flex; gap:1rem; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:1rem; margin-top:1rem;">
                        <button onclick="deletePickup(${req.request_id})" class="btn-action-delete" style="color:#ef4444; background:rgba(239,68,68,0.1); padding:0.5rem 1rem; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:all 0.2s;">
                            <i class="ri-delete-bin-2-line"></i> ${req.status === 'Rejected' ? 'Clear Request' : t('delete_request')}
                        </button>
                        <div style="flex:1;"></div>
                        ${req.status === 'Pending' ? `
                        <button onclick="toggleAddForm(${req.request_id})" class="btn-action-add" style="color:#10b981; background:rgba(16,185,129,0.1); padding:0.5rem 1rem; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:all 0.2s;">
                           <i class="ri-add-circle-line"></i> ${t('add_more_items')}
                        </button>` : ''}
                    </div>
            `;
            } else if (req.status === 'Approved') {
                // Show Add Item but Logic creates NEW request
                actionsHtml = `
                <div class="pickup-actions" style="display:flex; gap:1rem; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:1rem; margin-top:1rem;">
                        <div style="flex:1;"></div>
                        <button onclick="toggleAddForm(${req.request_id})" class="btn-action-add" style="color:#10b981; background:rgba(16,185,129,0.1); padding:0.5rem 1rem; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:all 0.2s;">
                           <i class="ri-add-circle-line"></i> New Item
                        </button>
                </div>
            `;
            }

            // Add Form Section
            // Styled to match the requested "Premium" horizontal layout
            const addFormHtml = `
             <div id="addItemForm-${req.request_id}" style="display:none; gap:10px; align-items:stretch; padding-top:1rem; margin-top:0.5rem; border-top:1px dashed rgba(255,255,255,0.1); animation: fadeIn 0.3s ease;">
                    <select id="addType-${req.request_id}" style="flex:1; background:#1e293b; border:1px solid rgba(255,255,255,0.1); color:white; padding:0 1rem; height:42px; border-radius:8px; outline:none; font-family:inherit;">
                        ${typeOptions}
                    </select>
                    <input type="number" id="addQty-${req.request_id}" placeholder="Kg" style="width:80px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); color:white; padding:0 0.8rem; height:42px; border-radius:8px; outline:none; font-family:inherit;">
                    <button onclick="submitAddItem(${req.request_id})" style="background:#10b981; color:white; border:none; padding:0 1.5rem; height:42px; border-radius:6px; cursor:pointer; font-weight:600; font-family:inherit; transition:all 0.2s;">Add</button>
            </div>
        `;

            // Extract Time Slot from Address if present (Fallback) or use direct field
            const slotMatch = req.address && req.address.includes('SLOT:') ? req.address.split('SLOT:')[1].trim() : (req.timeSlot || req.time_slot || "");

            card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.5);">
                    Request #${req.request_id} &bull; ${new Date(req.created_at).toLocaleDateString()}
                    ${slotMatch ? `<br><span style="color:#f59e0b; font-weight:600;"><i class="ri-time-line"></i> ${slotMatch}</span>` : ''}
                </div>
                <span class="pickup-status-badge ${statusClass}" style="font-size:0.8rem; padding:0.25rem 0.75rem; border-radius:99px; background:${statusBadgeInfo.bg}; color:${statusBadgeInfo.color}; border:1px solid ${statusBadgeInfo.bg};">
                    ${statusLabel}
                </span>
            </div>

            ${stepperHtml}

            <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:0.75rem; display:flex; flex-direction:column; gap:0.25rem;">
                ${itemsHtml}
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.5rem; margin-top:0.25rem; border-top:1px solid rgba(255,255,255,0.1); color:#10b981;">
                    <span style="font-weight:600;">${t('total')}</span>
                    <strong>${req.quantity} kg</strong>
                </div>
            </div>

            ${actionsHtml}
            ${addFormHtml}
        `;

            infoContainer.appendChild(card);
        });

    }

    // Helper to toggle form
    window.toggleAddForm = function (id) {
        const el = document.getElementById(`addItemForm-${id}`);
        if (el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
    }

    // --- Helper Functions for Pickup Features ---

    window.deletePickup = function (id) {
        showCustomConfirm(
            "Delete Request",
            "Are you sure you want to delete this pickup request?",
            () => {
                fetch(`/api/pickup/${id}`, { method: 'DELETE' })
                    .then(async res => {
                        const data = await res.json();
                        if (res.ok) {
                            checkPickupStatus();
                            window.showToast("Request deleted successfully.", "success");
                        } else {
                            window.showToast(data.message || "Failed to delete request.", "error");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        window.showToast("Error deleting request.", "error");
                    });
            }
        );
    };

    window.deletePickupItem = function (requestId, itemId) {
        showCustomConfirm(
            "Remove Item",
            "Are you sure you want to remove this item from your request?",
            () => {
                fetch(`/api/pickup/${requestId}/item/${itemId}`, { method: 'DELETE' })
                    .then(async res => {
                        const data = await res.json();
                        if (res.ok) {
                            checkPickupStatus();
                            window.showToast("Item removed.", "success");
                        } else {
                            window.showToast(data.message || "Failed to delete item.", "error");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        window.showToast("Error deleting item.", "error");
                    });
            }
        );
    };

    window.submitAddItem = function (id) {
        const type = document.getElementById(`addType-${id}`).value;
        const qty = document.getElementById(`addQty-${id}`).value;

        if (!qty || qty <= 0) {
            window.showToast("Enter valid quantity.", "warning");
            return;
        }

        fetch(`/api/pickup/${id}/add`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wasteType: type, quantity: qty })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    checkPickupStatus();
                } else {
                    window.showToast("Failed to add item.", "error");
                }
            })
            .catch(err => {
                console.error(err);
                window.showToast("Error adding item.", "error");
            });
    };

});

/* --- Feature 1 & 3: Chatbot & Voice Search --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Voice Search
    const voiceBtn = document.getElementById('voiceSearchBtn');
    const input = document.getElementById('wasteSearchInput');

    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        voiceBtn.onclick = () => {
            if (voiceBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
                voiceBtn.classList.add('listening');
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (input) {
                input.value = transcript;
                // Trigger search
                performQuickSearch(transcript);
            }
            voiceBtn.classList.remove('listening');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };

        recognition.onerror = (e) => {
            console.error("Speech Error", e);
            voiceBtn.classList.remove('listening');
        };
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none'; // Hide if not supported
    }

    // 2. Chatbot Helpers
    window.toggleChat = () => {
        const widget = document.getElementById('chatbot-widget');
        const icon = document.getElementById('chat-toggle-icon');
        if (widget) {
            widget.classList.toggle('collapsed');
            if (widget.classList.contains('collapsed')) {
                icon.classList.remove('ri-arrow-down-s-line');
                icon.classList.add('ri-arrow-up-s-line');
            } else {
                icon.classList.remove('ri-arrow-up-s-line');
                icon.classList.add('ri-arrow-down-s-line');
            }
        }
    };

    window.handleChatKey = (e) => {
        if (e.key === 'Enter') sendMessage();
    }

    window.sendMessage = async () => {
        const input = document.getElementById('chatInput');
        const body = document.getElementById('chatBody');
        const msg = input.value.trim();
        if (!msg) return;

        // User Msg
        body.innerHTML += `<div class="chat-message user">${msg}</div>`;
        input.value = '';
        body.scrollTop = body.scrollHeight;

        try {
            const res = await fetch('/api/chatbot/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();

            // Bot Msg
            body.innerHTML += `<div class="chat-message bot">${data.reply}</div>`;
            body.scrollTop = body.scrollHeight;
        } catch (e) {
            body.innerHTML += `<div class="chat-message bot" style="color:red">Error connecting to assistant.</div>`;
        }
    };

    // Initialize Chatbot State (Collapsed by default)
    const widget = document.getElementById('chatbot-widget');
    if (widget) widget.classList.add('collapsed');
});

// 8. Auto Suggest Best Center (Load Balancing)
async function checkNearestCenter(lat, lng) {
    const infoDiv = document.getElementById('nearestCenterInfo');
    const typeSelect = document.getElementById('pickupWasteType');
    const category = typeSelect ? typeSelect.value : '';

    if (!infoDiv) return;

    infoDiv.style.display = 'flex';
    infoDiv.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Finding best center...';

    try {
        let url = `/api/centers?lat=${lat}&lng=${lng}`;
        if (category) url += `&category=${category}`;

        const res = await fetch(url);
        const centers = await res.json();

        if (centers && centers.length > 0) {
            // Logic: Prefer OPEN centers with > 20% slots. If multiple, pick nearest.
            // If all busy, just pick nearest.

            let bestCenter = centers.find(c => c.status === 'OPEN' && c.available_slots > (c.max_slots * 0.2));

            // Fallback 1: Any OPEN center
            if (!bestCenter) bestCenter = centers.find(c => c.status === 'OPEN');

            // Fallback 2: Just strict nearest (index 0 is sorted by distance)
            if (!bestCenter) bestCenter = centers[0];

            // Render Info
            const color = bestCenter.status === 'CLOSED' || bestCenter.available_slots === 0 ? '#ef4444' : '#10b981';
            const icon = bestCenter.status === 'CLOSED' ? 'ri-close-circle-line' : 'ri-checkbox-circle-line';

            let suggestionTag = '';
            if (bestCenter !== centers[0]) {
                suggestionTag = '<span style="font-size:0.7rem; background:#3b82f6; padding:2px 6px; border-radius:4px; margin-left:5px;">Recommended</span>';
            }

            infoDiv.innerHTML = `
                <i class="${icon}" style="color:${color}; font-size:1.2rem;"></i>
                <div style="flex:1;">
                    <div style="font-weight:600; color:white;">${bestCenter.center_name} ${suggestionTag}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; display:flex; gap:10px;">
                        <span>${bestCenter.distance} km away</span>
                    </div>
                </div>
            `;

            // Store selected center ID in a hidden input if needed, or global var
            // ideally we should pass this ID when creating request, but current API uses lat/lng to find nearest again.
            // CAUTION: The backend createPickupRequest currently RE-CALCULATES nearest. 
            // If we want "Best Center", we need to update backend to accept center_id OR update backend logic too.
            // For this task, we will just display it. Updating backend logic to match is safer.
            // But let's assume the backend will pick the same if we just send lat/lng? No, backend picks STRICT nearest.
            // We should PROBABLY send centerId if we want to support this feature fully. 
            // For now, let's keep visual suggestion.

            loadCenterAvailability(bestCenter.center_id);

        } else {
            infoDiv.innerHTML = '<span style="color:#ef4444;">No centers found nearby.</span>';
        }
    } catch (e) {
        console.error(e);
        infoDiv.style.display = 'none';
    }
}

// User Request: Real-time Collection Center Availability
async function loadCenterAvailability(centerId) {
    if (!centerId) return;

    try {
        const res = await fetch(`/api/centers/${centerId}`);
        const center = await res.json();

        const statusEl = document.getElementById("centerStatus");
        const slotsEl = document.getElementById("centerSlots");
        const loadEl = document.getElementById("centerLoad");
        const nameEl = document.querySelector(".center-availability h4");

        if (statusEl) {
            statusEl.textContent = center.status;
            if (center.status === "OPEN") statusEl.style.color = "#22c55e";
            else statusEl.style.color = "#ef4444";
        }

        if (slotsEl) {
            slotsEl.textContent = center.max_slots ? `${center.available_slots} / ${center.max_slots}` : `${center.available_slots} slots`;
        }

        if (loadEl) loadEl.textContent = center.busyLevel || 'Free';
        if (nameEl) nameEl.innerHTML = `Collection Center: <span style="font-weight:400; font-size: 0.9em; color:#e2e8f0; margin-left: 5px;">${center.center_name}</span>`;

        if (center.available_slots === 0 || center.status === "CLOSED") {
            disableBooking("Center full — try another center.");
        } else {
            // Re-enable if previously disabled (unless there's another reason)
            const btn = document.getElementById("requestPickupBtn"); // Changed to match actual button ID
            if (btn) {
                btn.disabled = false;
                btn.title = "";
                btn.style.opacity = 1;
                btn.innerHTML = '<i class="ri-truck-line"></i> Schedule Pickup';
            }
        }
    } catch (error) {
        console.error("Failed to load center availability:", error);
    }
}

function disableBooking(message) {
    const btn = document.getElementById("requestPickupBtn"); // Changed to match actual button ID
    if (btn) {
        btn.disabled = true;
        btn.title = message;
        btn.style.opacity = 0.5;
        btn.innerHTML = `<i class="ri-forbid-line"></i> ${message}`;
    }
}

// --- Robust Navigation Logic ---
document.addEventListener("DOMContentLoaded", function () {

    // --- Rewards Nav ---
    const rewardsBtn = document.getElementById("rewardsNav");
    const rewardsSection = document.getElementById("rewardsSection");

    // Navigation handled by inline script in dashboard.html for better section control


    // --- New Features (Pickup Reminder & Eco Score) ---

    // 1️⃣ Pickup Reminder
    window.checkPickupReminder = function (pickups) {
        if (!pickups || pickups.length === 0) return;

        const today = new Date();
        // Reset time for accurate date comparison
        today.setHours(0, 0, 0, 0);

        pickups.forEach(p => {
            // Use scheduled_date if available (preferred), else created_at
            const dateStr = p.scheduled_date || p.created_at;
            const pickupDate = new Date(dateStr);
            pickupDate.setHours(0, 0, 0, 0);

            // Calculate difference in days
            const diffTime = pickupDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                showToast("🔔 Reminder: Pickup scheduled for tomorrow!", "info");
            } else if (diffDays === 0) {
                showToast("🔔 Reminder: You have a pickup scheduled today!", "info");
            } else if (p.status === 'Completed' && diffDays === 0) {
                showToast("✅ Pickup completed successfully!", "success");
            }
        });
    }

    // 2️⃣ Eco Score Progress Bar
    window.updateEcoScore = function (points) {
        const max = 2000;
        // Clamp points between 0 and max
        const safePoints = Math.max(0, Math.min(points, max));
        const percent = (safePoints / max) * 100;

        const fill = document.getElementById("ecoFill");
        const text = document.getElementById("ecoText");

        if (fill) fill.style.width = percent + "%";
        if (text) text.textContent = safePoints + " / " + max;
    };

    // ── Badge Check (Gamification) ────────────────────
    window.checkBadges = async function (uid) {
        const id = uid || localStorage.getItem('app_user_id') || localStorage.getItem('userId');
        if (!id) return;
        try {
            const res = await fetch('/api/gamification/check-badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: id })
            });
            const data = await res.json();
            if (data.unlocked && data.unlocked.length > 0) {
                data.unlocked.forEach((badge, i) => {
                    setTimeout(() => {
                        if (window.showToast) window.showToast(`Badge Unlocked: ${badge}`, 'success', '🏅 Achievement');
                    }, i * 800);
                });
            }
        } catch (e) { /* silent fail */ }
    };

});

/* ═══════════════════════════════════════
   GAMIFICATION SYSTEM (XP, LEADERBOARD, BADGES)
   ═══════════════════════════════════════ */

// Initialize Gamification
async function initGamification() {
    const userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
    if (!userId) return;

    const sections = {
        levelDisplay: document.getElementById('userLevelDisplay'),
        xpRing: document.getElementById('xpRing'),
        levelTitle: document.getElementById('levelTitle'),
        currentXP: document.getElementById('currentXP'),
        nextLevelXP: document.getElementById('nextLevelXP'),
        dayStreak: document.getElementById('dayStreak'),
        totalPoints: document.getElementById('totalPoints'),
        impactWaste: document.getElementById('impactWaste'),
        impactCO2: document.getElementById('impactCO2'),
        impactTrees: document.getElementById('impactTrees'),
        challengesList: document.getElementById('challengesList'),
        leaderboardContent: document.getElementById('leaderboardContent'),
        badgesGrid: document.getElementById('badgesGrid')
    };

    // 1. Fetch User History for Calculations
    try {
        const res = await fetch(`/api/user/${userId}/history`);
        const history = await res.json();

        // --- Calculate Stats ---
        const today = new Date().toDateString();
        let totalXP = 0;
        let totalWasteKg = 0;
        let streakCount = calculateStreak(history);

        const challengeProgress = {
            dailyScans: 0,
            dailyRecycle: 0
        };

        if (Array.isArray(history)) {
            history.forEach(item => {
                const itemDate = new Date(item.date).toDateString();

                // Points Logic
                if (item.type === 'SCAN') {
                    totalXP += 15;
                    if (itemDate === today) challengeProgress.dailyScans++;
                } else if (item.type === 'PICKUP' && (item.status === 'Completed' || item.status === 'Approved')) {
                    const qty = (item.details && item.details.quantity) ? item.details.quantity : (typeof item.details === 'string' && item.details.includes('quantity') ? 5 : 0);
                    const qInt = parseInt(qty) || 0;
                    totalXP += 50 + (qInt * 10);
                    totalWasteKg += qInt;
                    if (itemDate === today) challengeProgress.dailyRecycle += qInt;
                } else if (item.type === 'SEARCH') {
                    totalXP += 2;
                }
            });
        }

        // Add bonus for Streak
        totalXP += streakCount * 5;

        // --- Update Hero UI ---
        updateLevelUI(totalXP, sections);

        if (sections.dayStreak) sections.dayStreak.textContent = streakCount;
        if (sections.totalPoints) sections.totalPoints.textContent = totalXP.toLocaleString();

        // --- Update Impact UI ---
        // 1kg Waste ~ 2.5kg CO2 avoided
        // 1 Tree absorbs ~20kg CO2/year
        const co2Saved = (totalWasteKg * 2.5).toFixed(1);
        const trees = (co2Saved / 20).toFixed(1);

        if (sections.impactWaste) sections.impactWaste.textContent = `${totalWasteKg} kg`;
        if (sections.impactCO2) sections.impactCO2.textContent = `${co2Saved} kg`;
        if (sections.impactTrees) sections.impactTrees.textContent = trees;

        // --- Challenges ---
        renderChallenges(challengeProgress, sections.challengesList);

        // --- Badges ---
        renderBadges(totalXP, totalWasteKg, streakCount, sections.badgesGrid);

        // --- Leaderboard ---
        renderLeaderboard(totalXP, userId);

        // --- Reward History Log ---
        renderRewardLog(history);

    } catch (e) {
        console.error("Gamification Error:", e);
    }
}

// Helper: Streak Calc works by finding consecutive days with activity
function calculateStreak(history) {
    if (!history || !Array.isArray(history) || history.length === 0) return 0;

    // Get unique dates sorted descending
    const dates = [...new Set(history.map(h => new Date(h.date).toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => b - a);

    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let lastDate = today;

    // Check if activity today
    if (dates[0].getTime() === today.getTime()) {
        streak = 1;
        lastDate = dates[0];
    } else {
        // Check if activity yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (dates[0].getTime() === yesterday.getTime()) {
            streak = 1;
            lastDate = dates[0];
        } else {
            return 0; // Streak broken
        }
    }

    // Iterate backwards
    for (let i = 1; i < dates.length; i++) {
        const diffTime = Math.abs(lastDate - dates[i]);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
            lastDate = dates[i];
        } else {
            break;
        }
    }
    return streak;
}

function updateLevelUI(xp, els) {
    // Level Curve: XP = 100 * (Level^2)
    // Level = Sqrt(XP / 100)

    let level = Math.floor(Math.sqrt(xp / 100));
    if (level < 1) level = 1;

    // XP for current level start
    const currentLevelStartXP = 100 * Math.pow(level, 2);
    // XP for next level
    const nextLevelXP = 100 * Math.pow(level + 1, 2);

    // Progress
    const range = nextLevelXP - currentLevelStartXP;
    const progress = xp - currentLevelStartXP;
    let percent = (progress / range) * 100;
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    if (els.levelDisplay) els.levelDisplay.textContent = level;
    if (els.currentXP) els.currentXP.textContent = xp;
    if (els.nextLevelXP) els.nextLevelXP.textContent = nextLevelXP; // Target

    // Titles
    const titles = ["Newbie", "Eco Novice", "Recycler", "Green Guardian", "Earth Hero", "Sustainability Master", "Planet Legend"];
    const title = titles[Math.min(level - 1, titles.length - 1)] || "Planet Legend";
    if (els.levelTitle) els.levelTitle.textContent = title;

    // Ring Animation
    // Circumference = 2 * PI * 54 ≈ 339.292
    const circumference = 339.292;
    const offset = circumference - (percent / 100) * circumference;
    if (els.xpRing) els.xpRing.style.strokeDashoffset = offset;
}

function renderChallenges(progress, container) {
    if (!container) return;

    const challenges = [
        {
            id: 1,
            title: "Daily Sort",
            desc: "Scan 3 waste items",
            target: 3,
            current: progress.dailyScans,
            xp: 50,
            icon: "ri-camera-lens-line"
        },
        {
            id: 2,
            title: "Heavy Lifter",
            desc: "Recycle 5kg of waste",
            target: 5,
            current: progress.dailyRecycle,
            xp: 100,
            icon: "ri-weight-line"
        },
        {
            id: 3,
            title: "Market Mover",
            desc: "List an item on marketplace",
            target: 1,
            current: 0, // Mocked for now
            xp: 75,
            icon: "ri-store-3-line"
        }
    ];

    let html = '';
    challenges.forEach(c => {
        const isDone = c.current >= c.target;
        const width = Math.min((c.current / c.target) * 100, 100);

        html += `
            <div class="challenge-card ${isDone ? 'completed' : ''}">
                <div class="challenge-icon">
                    <i class="${isDone ? 'ri-checkbox-circle-fill' : c.icon}"></i>
                </div>
                <div class="challenge-info">
                    <h4>${c.title}</h4>
                    <p>${c.desc}</p>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${width}%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#94a3b8;">
                        <span>${Math.min(c.current, c.target)} / ${c.target}</span>
                        ${isDone ? '<span style="color:#10b981">Completed</span>' : ''}
                    </div>
                </div>
                <div class="challenge-reward">
                    <div class="xp-reward"><i class="ri-flashlight-fill"></i> +${c.xp}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function renderLeaderboard(userXP, userId) {
    const list = document.getElementById('leaderboardContent');
    const sticky = document.getElementById('userRankItem');
    if (!list) return;

    list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.9rem;">Loading...</div>';

    try {
        const res = await fetch('/api/gamification/leaderboard');
        const board = await res.json();

        if (!Array.isArray(board)) {
            list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #ef4444; font-size: 0.9rem;">Unable to load leaderboard.</div>';
            return;
        }

        let html = '';
        let userRankIndex = -1;

        // Current User ID for matching
        const currentId = String(userId);

        board.forEach((u, i) => {
            const rank = i + 1;
            // Match safely
            const isMe = (String(u.user_id) === currentId);
            if (isMe) userRankIndex = i;

            const displayName = isMe ? "You" : u.name;
            const imgUrl = u.profile_picture
                ? u.profile_picture
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`;

            // Using monthly_points or green_score
            const score = u.monthly_points !== undefined ? u.monthly_points : u.green_score;

            const row = `
                <div class="lb-item ${isMe ? 'highlight' : ''}">
                    <div class="lb-rank top-${rank}">${rank}</div>
                    <div class="lb-user">
                        <img src="${imgUrl}" alt="${displayName}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=random'">
                        <span>${displayName}</span>
                    </div>
                    <div class="lb-xp">${(score || 0).toLocaleString()} XP</div>
                </div>
            `;
            html += row;
        });

        if (board.length === 0) {
            html = '<div style="padding: 1rem; text-align: center; color: #94a3b8;">No active users yet.</div>';
        }

        list.innerHTML = html;

        // Sticky User Rank
        if (sticky) {
            if (userRankIndex !== -1) {
                const u = board[userRankIndex];
                const score = u.monthly_points !== undefined ? u.monthly_points : u.green_score;
                const imgUrl = u.profile_picture
                    ? u.profile_picture
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff`;

                sticky.innerHTML = `
                    <div class="lb-item" style="border:none;">
                        <div class="lb-rank">${userRankIndex + 1}</div>
                        <div class="lb-user">
                            <img src="${imgUrl}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=random'">
                            <span>You</span>
                        </div>
                        <div class="lb-xp">${(score || 0).toLocaleString()} XP</div>
                    </div>
                `;
                sticky.style.display = 'block';
            } else {
                sticky.style.display = 'none';
            }
        }

    } catch (e) {
        console.error("Leaderboard Fetch Error:", e);
        list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #ef4444; font-size: 0.9rem;">Connection error.</div>';
    }
}

function renderBadges(xp, waste, streak, container) {
    if (!container) return;

    const badges = [
        { name: "First Steps", desc: "Earn your first XP", icon: "ri-footprint-line", condition: xp > 0, date: "Unlocked" },
        { name: "Recycling Pro", desc: "Recycle 50kg Waste", icon: "ri-recycle-line", condition: waste >= 50, date: "Locked" },
        { name: "Streak Master", desc: "7 Day Streak", icon: "ri-fire-fill", condition: streak >= 7, date: "Locked" },
        { name: "Eco Legend", desc: "Reach Level 5", icon: "ri-medal-fill", condition: xp >= 2500, date: "Locked" },
        { name: "Market Tycoon", desc: "Sell 5 items", icon: "ri-store-2-fill", condition: false, date: "Locked" },
        { name: "Inspector", desc: "Scan 50 items", icon: "ri-search-eye-line", condition: xp > 500, date: "Locked" }
    ];

    let html = '';
    badges.forEach(b => {
        html += `
            <div class="badge-card ${b.condition ? '' : 'locked'}">
                <i class="${b.icon} badge-icon" style="color: ${b.condition ? '#fbbf24' : '#94a3b8'}"></i>
                <h4>${b.name}</h4>
                <span class="badge-date">${b.condition ? 'Unlocked' : 'Locked'}</span>
                <div class="badge-tooltip">${b.desc}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderRewardLog(history) {
    const container = document.getElementById('rewardLogContainer');
    if (!container || !Array.isArray(history) || !history.length) {
        if (container) container.innerHTML = '<p style="color:#94a3b8; text-align:center;">No rewards earned yet.</p>';
        return;
    }

    // Filter only XP earning events and take top 20
    // Filter only XP earning events and take top 20
    const logs = history.filter(h => h.type === 'SCAN' || h.type === 'PICKUP')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    let html = '';
    logs.forEach(log => {
        let pts = 0;
        let action = '';
        if (log.type === 'SCAN') { pts = 15; action = 'Waste Scan'; }
        if (log.type === 'PICKUP') { pts = 50; action = 'Pickup Completed'; }

        html += `
            <div class="log-item">
                <span><i class="ri-check-double-line"></i> ${action}</span>
                <span class="log-xp">+${pts} XP</span>
            </div>
        `;
    });
    container.innerHTML = html || '<p style="color:#94a3b8; text-align:center;">No rewards earned yet.</p>';
}

window.toggleRewardLog = function () {
    const el = document.getElementById('rewardLogContainer');
    if (el) {
        // Toggle based on computed style or inline style
        if (el.style.display === 'none' || el.style.display === '') {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
}

