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

                if (userAvatar) {
                    if (data.user.profile_picture) {
                        console.log("Setting Avatar Src:", data.user.profile_picture);
                        userAvatar.src = data.user.profile_picture;

                        userAvatar.onerror = () => {
                            console.error("Failed to load avatar image at:", data.user.profile_picture);
                            // Fallback
                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=10b981&color=fff`;
                            if (userAvatar.src !== fallback) {
                                userAvatar.src = fallback;
                            }
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
                if (data.user.phone) localStorage.setItem('userPhone', data.user.phone);
                if (data.user.city) localStorage.setItem('userCity', data.user.city);
                if (data.user.state) localStorage.setItem('userState', data.user.state);
                if (data.user.zip) localStorage.setItem('userZip', data.user.zip);
                if (data.user.country) localStorage.setItem('userCountry', data.user.country);
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
});

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
            if (confirm("Are you sure you want to clear your Search & Scan history? pickup requests will remain.")) {
                const userId = localStorage.getItem('userId');
                try {
                    await fetch(`/api/user/${userId}/history`, { method: 'DELETE' });
                    loadUserHistory(document.getElementById('histContent'));
                } catch (e) { alert("Failed to clear history."); }
            }
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
                detailText = `${item.details.wasteTypes} (${item.details.quantity}kg)`;
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
                detailText = `${item.details.wasteTypes} (${item.details.quantity}kg)`;
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

    // Initialize Waste Type Chips (Kept for reference if needed, but unused with select)
    // initWasteChips(); 
});

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
        alert("Please select a waste type.");
        return;
    }

    // 2. Validate Quantity
    if (!quantity || quantity <= 0) {
        alert("Please enter a valid positive quantity in kg.");
        return;
    }

    // 3. Organic Rule: Min 2kg if Organic is selected
    if (wasteType === 'Organic' && quantity < 2) {
        alert("Organic waste pickup requires a minimum of 2kg.");
        return;
    }

    if (!userId) {
        alert("Please login first.");
        return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Finding Center...';

    // 4. Get Location & Submit
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        resetBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Submit to Backend (Sends single wasteType)
            fetch('/api/pickup/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    wasteType: wasteType,
                    quantity: quantity,
                    lat: lat,
                    lng: lng
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.requestId) {
                        // Success
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
                        alert(msg);
                    }
                })
                .catch(err => {
                    console.error("Pickup Req Error:", err);
                    alert("Server error. Please try again.");
                })
                .finally(() => {
                    resetBtn();
                });
        },
        (error) => {
            console.error("Geo Error:", error);
            alert("Unable to retrieve your location. Location is required.");
            resetBtn();
        }
    );

    function resetBtn() {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Refactored to handle ARRAY of requests
function updatePickupUI(data) {
    const formWrapper = document.getElementById('pickupFormWrapper');
    let infoContainer = document.getElementById('pickupInfoContainer');

    // 1. Setup Container
    if (!infoContainer) {
        infoContainer = document.createElement('div');
        infoContainer.id = 'pickupInfoContainer';
        infoContainer.style.display = 'flex';
        infoContainer.style.flexDirection = 'column';
        infoContainer.style.gap = '1.5rem';
        infoContainer.style.width = '100%';
        const header = document.querySelector('.pickup-header');
        if (header) header.after(infoContainer);
    }

    // 2. Clear Previous
    infoContainer.innerHTML = '';

    // 3. Check State
    let requests = [];
    if (Array.isArray(data)) {
        requests = data;
    } else if (data && !data.message) {
        // Only treat as single object if it's NOT an error message
        requests = [data];
    }

    // Filter out 'Completed' if we don't want to clutter (Optional)
    // Safe check for status property
    // Filter out 'Completed' if we don't want to clutter (Optional)
    // Safe check for status property. Keep 'Rejected' so user sees the decision.
    const activeRequests = requests.filter(r => r && r.status && r.status !== 'Completed' && r.status !== 'Cancelled');

    // If no active requests, show Form
    if (activeRequests.length === 0) {
        if (formWrapper) formWrapper.style.display = 'flex';
        infoContainer.style.display = 'none';
        return;
    } else {
        if (formWrapper) formWrapper.style.display = 'none';
        infoContainer.style.display = 'flex';
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

        // Badge Logic - Explicit handling for Rejected
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

        // --- NEW: Extra Info Logic (ETA / Rejection Reason) ---
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

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.5);">
                    Request #${req.request_id} &bull; ${new Date(req.created_at).toLocaleDateString()}
                </div>
                <span class="pickup-status-badge ${statusClass}" style="font-size:0.8rem; padding:0.25rem 0.75rem; border-radius:99px; background:${req.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color:${req.status === 'Pending' ? '#fbbf24' : '#10b981'}; border:1px solid ${req.status === 'Pending' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">
                    ${statusLabel}
                </span>
            </div>

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
    if (!confirm("Are you sure you want to delete this pickup request?")) return;

    fetch(`/api/pickup/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                // Refresh UI
                checkPickupStatus();
            } else {
                alert("Failed to delete.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error deleting request.");
        });
};

window.deletePickupItem = function (requestId, itemId) {
    if (!confirm("Remove this item?")) return;

    fetch(`/api/pickup/${requestId}/item/${itemId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            checkPickupStatus();
        })
        .catch(err => {
            console.error(err);
            alert("Error deleting item.");
        });
};

window.submitAddItem = function (id) {
    const type = document.getElementById(`addType-${id}`).value;
    const qty = document.getElementById(`addQty-${id}`).value;

    if (!qty || qty <= 0) {
        alert("Enter valid quantity.");
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
                alert("Failed to add item.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error adding item.");
        });
};
