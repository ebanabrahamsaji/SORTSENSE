// =====================================================
// WASTE MARKETPLACE — Production JS
// =====================================================

// IMPORTANT: Read user ID dynamically at call-time (not load-time), because
// the script loads before the user logs in, so static read = always null.
function getActiveUserId() {
    const rawId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
    // Important: check for string 'undefined' which can result from failed setItem() calls
    if (!rawId || rawId === 'undefined' || rawId === 'null') return null;
    return String(rawId);
}
let allMarketItems = [];
let currentMarketTab = 'all';
let isDeleteMode = false;

window.toggleMarketplaceDeleteMode = function() {
    isDeleteMode = !isDeleteMode;
    const btn = document.getElementById('toggleDeleteBtn');
    if (btn) {
        if (isDeleteMode) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="ri-close-line"></i> Exit Delete Mode';
            if (window.showToast) window.showToast('Delete mode enabled. Click the trash icon on your items to remove them.', 'info', 'Manage Mode');
            // Switch to My Listings so only the user's own items are shown
            currentMarketTab = 'my';
            document.querySelectorAll('.mp-tab').forEach(t => t.classList.remove('active'));
            const myTab = document.querySelector('.mp-tab:nth-child(2)');
            if (myTab) myTab.classList.add('active');
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="ri-delete-bin-7-line"></i> Manage Items';
            // Switch back to All Items
            currentMarketTab = 'all';
            document.querySelectorAll('.mp-tab').forEach(t => t.classList.remove('active'));
            const allTab = document.querySelector('.mp-tab:nth-child(1)');
            if (allTab) allTab.classList.add('active');
        }
    }
    renderMarketplaceItems(allMarketItems);
};

// ── Image Upload Helpers ──────────────────────────────
window.handleMPImageFile = function (input) {
    const file = input.files[0];
    if (!file) return;
    uploadMPImage(file);
};

async function uploadMPImage(file) {
    const zone = document.getElementById('mpUploadZone');
    const inner = document.getElementById('mpUploadInner');
    const preview = document.getElementById('mpUploadPreviewImg');

    // Show spinner
    inner.style.display = 'none';
    const spinner = document.createElement('div');
    spinner.className = 'upload-spinner';
    spinner.innerHTML = '<i class="ri-loader-4-line"></i>';
    zone.appendChild(spinner);

    try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/marketplace/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success && data.url) {
            // Set the URL field so addItem() picks it up
            document.getElementById('itemImage').value = data.url;

            // Show thumbnail in the zone
            preview.src = data.url;
            preview.style.display = 'block';
            zone.classList.add('has-image');
            inner.style.display = 'none';

            window.updateMPPreview();
            if (window.showToast) window.showToast('Image uploaded successfully!', 'success', 'Upload Done');
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (err) {
        inner.style.display = 'flex';
        if (window.showToast) window.showToast(err.message || 'Image upload failed.', 'error', 'Upload Error');
    } finally {
        spinner.remove();
    }
}

function setupUploadZoneDragDrop() {
    const zone = document.getElementById('mpUploadZone');
    if (!zone) return;

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer?.files[0];
        if (file && file.type.startsWith('image/')) uploadMPImage(file);
    });
}

// Call once DOM is ready
document.addEventListener('DOMContentLoaded', setupUploadZoneDragDrop);

// ── Demo Data ─────────────────────────────────────────
const demoItems = [
    { item_id: 'd1', user_id: '0', title: 'Clean Plastic Bottles', category: 'Plastic', description: 'Clear PET bottles, washed and dried. Ready for recycling or reuse projects.', created_at: new Date(Date.now() - 3600000).toISOString(), owner_name: 'Mathew', image_url: 'https://images.unsplash.com/photo-1558449028-08571068832a?auto=format&fit=crop&q=80&w=800' },
    { item_id: 'd2', user_id: '0', title: 'Cardboard Boxes', category: 'Paper', description: 'Flattened shipping boxes in good condition. Great for moving or crafts.', created_at: new Date(Date.now() - 7200000).toISOString(), owner_name: 'John', image_url: 'https://images.unsplash.com/photo-1513061397548-5224286289d7?auto=format&fit=crop&q=80&w=800' },
    { item_id: 'd3', user_id: '0', title: 'Glass Bottles & Jars', category: 'Glass', description: 'Mixed glass containers, cleaned and sorted. Perfect for DIY projects.', created_at: new Date(Date.now() - 10800000).toISOString(), owner_name: 'Binn', image_url: 'https://images.unsplash.com/photo-1621405108846-9f8841a0e88a?auto=format&fit=crop&q=80&w=800' },
    { item_id: 'd4', user_id: '0', title: 'Aluminum Soda Cans', category: 'Metal', description: 'Empty soda cans, bulk quantity available. Crushed or uncrushed.', created_at: new Date(Date.now() - 172800000).toISOString(), owner_name: 'Alex', image_url: 'https://images.unsplash.com/photo-1600511213386-89d15c7e0f21?auto=format&fit=crop&q=80&w=800' },
    { item_id: 'd5', user_id: '0', title: 'Scrap Copper Wires', category: 'Metal', description: 'High-grade copper wire scraps from electrical work. Good for recycling.', created_at: new Date(Date.now() - 86400000).toISOString(), owner_name: 'Don', image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=800' },
    { item_id: 'd6', user_id: '0', title: 'Old Laptop Spare Parts', category: 'E-Waste', description: 'Assorted laptop components for electronic hobbyists or repair shops.', created_at: new Date(Date.now() - 259200000).toISOString(), owner_name: 'Sarah', image_url: 'https://images.unsplash.com/photo-1593642532454-e138e28a63f4?auto=format&fit=crop&q=80&w=800' },
];

// ── Load Data ─────────────────────────────────────────
let realDbItems = []; // Only real items from DB (never demo)

async function loadMarketplace() {
    const container = document.getElementById('marketGrid');
    if (!container) return;

    container.innerHTML = `<div class="mp-empty"><i class="ri-loader-4-line" style="animation:spin 1s linear infinite;"></i><p>Loading marketplace...</p></div>`;

    try {
        const res = await fetch('/api/marketplace');
        if (!res.ok) throw new Error('API offline');
        const items = await res.json();
        realDbItems = Array.isArray(items) ? items : [];
        allMarketItems = realDbItems.length > 0 ? realDbItems : demoItems;
    } catch {
        realDbItems = [];
        allMarketItems = demoItems;
    }

    renderMarketplaceItems(allMarketItems);
}

// ── Render Cards ──────────────────────────────────────
function renderMarketplaceItems(items) {
    const container = document.getElementById('marketGrid');
    if (!container) return;

    let filtered;

    if (currentMarketTab === 'my') {
        // My Listings: ONLY real DB items posted by this user — never demo items
        filtered = realDbItems.filter(item => String(item.user_id) === String(getActiveUserId()));
    } else {
        filtered = [...items];
    }

    // Search filter (applies to both tabs)
    const query = (document.getElementById('marketSearch')?.value || '').toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(query) ||
            (item.category || '').toLowerCase().includes(query) ||
            (item.description || '').toLowerCase().includes(query)
        );
    }

    if (filtered.length === 0) {
        const isMyTab = currentMarketTab === 'my';
        container.innerHTML = `
            <div class="mp-empty">
                <i class="ri-${isMyTab ? 'store-2' : 'search-2'}-line"></i>
                <h3>${isMyTab ? 'No listings yet' : 'No items found'}</h3>
                <p>${isMyTab ? 'You haven\'t posted any items yet.' : 'Try a different search term.'}</p>
                ${isMyTab ? `<button onclick="openAddItem()"><i class="ri-add-line"></i> Post Your First Item</button>` : ''}
            </div>`;
        return;
    }

    container.innerHTML = filtered.map((item, i) => buildCard(item, i)).join('');
}

function buildCard(item, index) {
    const cat = (item.category || 'Plastic');
    const catKey = cat.toLowerCase().replace(/[^a-z]/g, '');
    const imageUrl = item.image_url || getCategoryPlaceholder(cat);
    const owner = item.owner_name || 'User';
    const dateStr = item.created_at ? formatRelativeTime(new Date(item.created_at)) : '';
    const avatar = owner.charAt(0).toUpperCase();
    const delay = Math.min(index * 0.05, 0.4);

    const activeId = getActiveUserId();
    // Safter comparison: ensure both are valid strings before comparing
    const isMe = activeId && item.user_id && String(item.user_id) === activeId;
    
    // In Delete Mode, we show the delete button for ALL items (backend will still verify ownership)
    const showDelete = isMe || isDeleteMode;
    
    // Debug log to confirm why delete button might be missing
    // console.log(`Item "${item.title}" owner: ${item.user_id}, Current user: ${activeId}, isMe: ${isMe}`);

    return `
        <div class="mp-card" style="animation-delay:${delay}s;">
            <div class="mp-card-img">
                <img src="${imageUrl}" alt="${item.title}" loading="lazy"
                     onerror="this.onerror=null;this.src='${getCategoryPlaceholder(cat)}'">
                <span class="mp-badge ${catKey}">${cat}</span>
                
                ${isDeleteMode ? `
                <button class="mp-delete-badge" onclick="deleteMarketItem('${item.item_id}')" title="Delete Item">
                    <i class="ri-delete-bin-line"></i>
                </button>
                ` : ''}
            </div>
            <div class="mp-card-body">
                <h3 title="${item.title}">${item.title}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <div class="mp-card-meta">
                    <div class="mp-avatar">${avatar}</div>
                    <span class="mp-owner-name">${owner}${dateStr ? ` · ${dateStr}` : ''}</span>
                </div>
                <div class="mp-card-actions">
                    ${isMe ? `
                    <button class="mp-action-btn" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05);" onclick="deleteMarketItem('${item.item_id}')" title="Delete Your Listing">
                        <i class="ri-delete-bin-line"></i> Delete My Item
                    </button>
                    ` : `
                    <button class="mp-action-btn" onclick="toggleSave(this, '${item.item_id}')" title="Save">
                        <i class="ri-heart-line"></i> Save
                    </button>
                    <button class="mp-action-btn" onclick="contactSeller('${item.item_id}')" title="Contact">
                        <i class="ri-chat-3-line"></i> Contact
                    </button>
                    `}
                </div>
            </div>
        </div>`;
}

// ── Filters & Tabs ────────────────────────────────────
window.filterMarket = function () {
    renderMarketplaceItems(allMarketItems);
};

window.switchMarketTab = function (tab, el) {
    currentMarketTab = tab;
    document.querySelectorAll('.mp-tab').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    renderMarketplaceItems(allMarketItems);
};

// ── Helpers ───────────────────────────────────────────
function getCategoryPlaceholder(cat) {
    const map = {
        'Plastic': 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=500',
        'Paper': 'https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?auto=format&fit=crop&q=80&w=500',
        'Glass': 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=500',
        'Metal': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=500',
        'E-Waste': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=500',
    };
    return map[cat] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=500';
}

function formatRelativeTime(date) {
    const diff = Date.now() - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

// ── Actions ───────────────────────────────────────────
window.openAddItem = function () {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('marketplaceForm').reset();
        document.getElementById('mpUploadPreviewImg').style.display = 'none';
        document.getElementById('mpUploadInner').style.display = 'flex';
        document.getElementById('mpUploadZone').classList.remove('has-image');
        document.getElementById('itemImage').value = '';
        window.updateMPPreview();
    }
};

window.closeAddItem = function () {
    const modal = document.getElementById('addItemModal');
    if (modal) modal.style.display = 'none';
};

window.updateMPPreview = function () {
    const title = document.getElementById('itemTitle')?.value || 'Item Title';
    const cat = document.getElementById('itemCategory')?.value || 'Plastic';
    const desc = document.getElementById('mpDesc')?.value || 'Item description will appear here...';
    let img = document.getElementById('itemImage')?.value || document.getElementById('mpUploadPreviewImg')?.src || '';
    if (!img || img === window.location.href) {
        img = getCategoryPlaceholder(cat);
    }

    // Update chars count
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.innerText = `${desc.length}/200`;

    const previewContainer = document.getElementById('mpLivePreview');
    if (!previewContainer) return;

    const catKey = cat.toLowerCase().replace(/[^a-z]/g, '');
    const userName = localStorage.getItem('userName') || 'You';
    const avatar = userName.charAt(0).toUpperCase();

    previewContainer.innerHTML = `
        <div class="mp-card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.5); pointer-events: none;">
            <div class="mp-card-img">
                <img src="${img}" alt="Preview" onerror="this.onerror=null;this.src='${getCategoryPlaceholder(cat)}'">
                <span class="mp-badge ${catKey}">${cat}</span>
            </div>
            <div class="mp-card-body">
                <h3>${title}</h3>
                <p>${desc}</p>
                <div class="mp-card-meta">
                    <div class="mp-avatar">${avatar}</div>
                    <span class="mp-owner-name">${userName} · Just now</span>
                </div>
            </div>
        </div>
    `;
};

window.addItem = async function () {
    const userId = getActiveUserId();
    if (!userId) {
        if (window.showToast) window.showToast('Please log in to post an item.', 'error');
        return;
    }

    const title = document.getElementById('itemTitle').value.trim();
    const category = document.getElementById('itemCategory').value;
    const description = document.getElementById('mpDesc').value.trim();
    let image_url = document.getElementById('itemImage').value.trim();

    // Fall back to preview img if external URL is empty but file was uploaded
    if (!image_url) {
        const previewSrc = document.getElementById('mpUploadPreviewImg').src;
        if (previewSrc && previewSrc !== window.location.href) {
            image_url = previewSrc;
        }
    }

    if (!title || !category || !description) {
        if (window.showToast) window.showToast('Please fill in all required fields.', 'error');
        return;
    }

    const btn = document.getElementById('submitPostBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Posting...';
    }

    try {
        const res = await fetch('/api/marketplace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, title, description, category, image_url })
        });

        const data = await res.json();

        if (data.success) {
            window.closeAddItem();
            if (window.showToast) window.showToast('Item posted successfully!', 'success');
            // Refresh market
            loadMarketplace();
        } else {
            console.error(data.errors || data.message);
            throw new Error(data.message || (data.errors ? data.errors[0].message : 'Failed to post item'));
        }
    } catch (err) {
        if (window.showToast) {
            window.showToast(err.message, 'error', 'Error');
        } else {
            alert(err.message);
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>Post Item Now</span> <i class="ri-send-plane-fill"></i>';
        }
    }
};

window.toggleSave = async function (btn, itemId) {
    const icon = btn.querySelector('i');
    const isSaved = icon.classList.contains('ri-heart-fill');

    // Optimistic UI update
    icon.classList.toggle('ri-heart-line', isSaved);
    icon.classList.toggle('ri-heart-fill', !isSaved);
    btn.classList.toggle('saved', !isSaved);

    try {
        const res = await fetch('/api/marketplace/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: itemId, user_id: getActiveUserId() })
        });
        const data = await res.json();
        if (!data.success) throw new Error('Save failed');
        if (window.showToast) window.showToast(
            data.saved ? 'Item saved to your list!' : 'Item removed from saved.',
            'success', data.saved ? '❤️ Saved' : 'Removed'
        );
    } catch {
        // Revert on failure
        icon.classList.toggle('ri-heart-line', !isSaved);
        icon.classList.toggle('ri-heart-fill', isSaved);
        btn.classList.toggle('saved', isSaved);
        if (window.showToast) window.showToast('Could not save item.', 'error', 'Error');
    }
};

window.closeConfirmModal = function () {
    const modal = document.getElementById('confirmActionModal');
    if (modal) modal.style.display = 'none';
};

window.deleteMarketItem = async function (itemId) {
    const modal = document.getElementById('confirmActionModal');
    const btn = document.getElementById('confirmActionBtn');
    
    if (modal && btn) {
        modal.style.display = 'flex';
        btn.onclick = async function () {
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';
            btn.disabled = true;
            try {
                const res = await fetch(`/api/marketplace/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: getActiveUserId() })
                });
                const data = await res.json();
                
                if (data.success) {
                    if (window.showToast) window.showToast('Item deleted successfully.', 'success', 'Deleted');
                    loadMarketplace(); // Refresh the list
                } else {
                    throw new Error(data.message || 'Failed to delete item');
                }
            } catch (err) {
                if (window.showToast) {
                    window.showToast(err.message, 'error', 'Error');
                } else {
                    alert(err.message);
                }
            } finally {
                btn.innerHTML = 'Proceed';
                btn.disabled = false;
                closeConfirmModal();
            }
        };
    } else {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`/api/marketplace/${itemId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: getActiveUserId() })
            });
            const data = await res.json();
            
            if (data.success) {
                if (window.showToast) window.showToast('Item deleted successfully.', 'success', 'Deleted');
                loadMarketplace(); // Refresh the list
            } else {
                throw new Error(data.message || 'Failed to delete item');
            }
        } catch (err) {
            if (window.showToast) {
                window.showToast(err.message, 'error', 'Error');
            } else {
                alert(err.message);
            }
        }
    }
};

// ── Messaging & Inbox ─────────────────────────────────
let currentContactItem = null;
let inboxThreads = {};
let activeThreadId = null;

// 1. Open Contact Modal (Buyer Side)
window.contactSeller = function (itemId) {
    const item = allMarketItems.find(i => String(i.item_id) === String(itemId));
    if (!item) return;

    const activeUserId = getActiveUserId();

    // Prevent messaging self
    if (String(item.user_id) === String(activeUserId)) {
        if (window.showToast) window.showToast("You cannot message yourself.", "error", "Oops");
        return;
    }

    currentContactItem = item;

    // Populate Modal
    document.getElementById('contactSellerName').innerText = item.owner_name || 'Seller';
    document.getElementById('contactItemName').innerText = item.title;
    document.getElementById('contactMessage').value = '';

    // Show
    const modal = document.getElementById('contactSellerModal');
    if (modal) modal.style.display = 'flex';
};

window.closeContactModal = function () {
    document.getElementById('contactSellerModal').style.display = 'none';
    currentContactItem = null;
};

// 2. Send First Message (Buyer Side)
window.sendContactMessage = async function () {
    const msg = document.getElementById('contactMessage').value.trim();
    const btn = document.getElementById('sendContactBtn');

    const activeUserId = getActiveUserId();
    if (!activeUserId) {
        if (window.showToast) window.showToast("Please log in to send messages.", "error");
        return;
    }

    if (!msg) {
        if (window.showToast) window.showToast("Message cannot be empty.", "error");
        return;
    }

    if (!currentContactItem) return;

    btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';
    btn.disabled = true;

    console.log(`Sending Contact Message | Sender: ${activeUserId} | Item: ${currentContactItem.item_id}`);

    try {
        const res = await fetch('/api/marketplace/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: activeUserId,
                item_id: currentContactItem.item_id,
                message: msg
            })
        });

        const data = await res.json();

        if (data.success) {
            window.closeContactModal();
            if (window.showToast) window.showToast('Message sent successfully!', 'success', 'Sent');
        } else {
            console.error("Message Send Failed (Backend):", data);
            throw new Error(data.error || 'Failed to send');
        }
    } catch (err) {
        console.error("Message Send Failed (Network/Client):", err);
        if (window.showToast) {
            window.showToast(err.message, 'error', 'Error');
        } else {
            alert(err.message);
        }
    } finally {
        if (btn) {
            btn.innerHTML = '<span>Send Message</span> <i class="ri-send-plane-fill"></i>';
            btn.disabled = false;
        }
    }
};

// 3. Load & Render Inbox
window.loadInbox = async function () {
    const listContainer = document.getElementById('inboxList');
    if (!listContainer) return;

    const activeUserId = getActiveUserId();
    console.log('[Inbox] Loading for userId:', activeUserId);

    if (!activeUserId) {
        listContainer.innerHTML = `<div style="padding:30px; text-align:center; color:#94a3b8;"><i class="ri-lock-line" style="font-size:2rem;"></i><p style="margin-top:10px;">Please log in to view messages.</p></div>`;
        return;
    }

    listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;"><i class="ri-loader-4-line ri-spin"></i> Loading...</div>';

    try {
        const res = await fetch(`/api/marketplace/messages/${activeUserId}`);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
        }

        const data = await res.json();
        console.log('[Inbox] API Response:', data);

        if (!data.success || !Array.isArray(data.messages)) {
            throw new Error(data.error || 'Invalid server response');
        }

        if (data.messages.length === 0) {
            listContainer.innerHTML = '<div style="padding:30px; text-align:center; color:#94a3b8;"><i class="ri-chat-off-line" style="font-size:2rem;"></i><p style="margin-top:10px;">No messages yet.</p></div>';
            return;
        }

        // Group by Thread (Product + Other User)
        inboxThreads = {};

        data.messages.forEach(msg => {
            const isMeSender = String(msg.sender_id) === String(activeUserId);
            const otherId = isMeSender ? msg.receiver_id : msg.sender_id;
            const otherName = isMeSender ? msg.receiver_name : msg.sender_name;
            const otherPic = isMeSender ? msg.receiver_pic : msg.sender_pic;
            const productId = msg.product_id;
            const threadKey = `${productId}_${otherId}`;

            if (!inboxThreads[threadKey]) {
                inboxThreads[threadKey] = {
                    threadId: threadKey,
                    otherUserId: otherId,
                    otherName: otherName || 'User',
                    otherPic: otherPic,
                    productId: productId,
                    productTitle: msg.product_title || 'Item',
                    productImage: msg.product_image,
                    messages: []
                };
            }
            inboxThreads[threadKey].messages.push(msg);
        });

        const sortedThreads = Object.values(inboxThreads).sort((a, b) => {
            return new Date(b.messages[0].created_at) - new Date(a.messages[0].created_at);
        });

        renderInboxList(sortedThreads);

    } catch (err) {
        console.error('[Inbox] Load Error:', err);
        const isOffline = err.message === 'Failed to fetch';
        listContainer.innerHTML = `
            <div style="padding:40px 20px; text-align:center;">
                <i class="ri-error-warning-line" style="font-size:2.5rem; color:#ef4444; margin-bottom:10px;"></i>
                <h3 style="color:white; font-size:1.1rem; margin-bottom:5px;">${isOffline ? 'Server Offline' : 'Failed to Load'}</h3>
                <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:12px;">${isOffline ? 'Cannot reach the server.' : err.message}</p>
                <button onclick="loadInbox()" style="padding:8px 16px; border-radius:8px; border:none; background:#334155; color:white; cursor:pointer; font-size:0.9rem;">Retry</button>
            </div>`;
    }
};

function renderInboxList(threads) {
    const container = document.getElementById('inboxList');
    container.innerHTML = '';

    if (threads.length === 0) {
        container.innerHTML = '<div style="padding:30px; text-align:center; color:#94a3b8;"><i class="ri-chat-off-line" style="font-size:2rem;"></i><p style="margin-top:8px;">No messages yet.</p></div>';
        return;
    }

    const meId = getActiveUserId();

    threads.forEach(thread => {
        const lastMsg = thread.messages[0]; // API returns DESC, so [0] = latest
        const timeStr = formatRelativeTime(new Date(lastMsg.created_at));

        // Determine relationship label: am I the SELLER or BUYER in this thread?
        // If the last message was sent TO me, the other person is the buyer
        const otherIsSender = String(lastMsg.sender_id) === String(thread.otherUserId);
        const roleLabel = otherIsSender ? 'Buyer' : 'You messaged';
        const roleBadgeColor = otherIsSender ? '#10b981' : '#3b82f6';

        const avatarUrl = thread.otherPic
            ? thread.otherPic
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.otherName)}&background=random&color=fff&size=80`;

        const el = document.createElement('div');
        el.className = 'inbox-item';
        el.style.cssText = `
            padding: 14px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            gap: 12px;
            align-items: center;
        `;
        el.onmouseover = () => el.style.background = 'rgba(255,255,255,0.06)';
        el.onmouseout = () => el.style.background = 'transparent';

        el.innerHTML = `
            <!-- Avatar -->
            <img src="${avatarUrl}" 
                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(thread.otherName)}&background=475569&color=fff&size=80';"
                 style="width:46px; height:46px; border-radius:50%; object-fit:cover; flex-shrink:0; border:2px solid ${roleBadgeColor}33;">

            <!-- Content -->
            <div style="flex:1; min-width:0;">
                <!-- Row 1: Name + Time -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                    <div style="display:flex; align-items:center; gap:7px;">
                        <span style="font-weight:700; color:#f1f5f9; font-size:0.9rem;">${thread.otherName}</span>
                        <span style="
                            font-size:0.65rem; font-weight:600; letter-spacing:0.03em;
                            padding:2px 7px; border-radius:20px;
                            background:${roleBadgeColor}22; color:${roleBadgeColor};
                            border: 1px solid ${roleBadgeColor}55;
                        ">${roleLabel}</span>
                    </div>
                    <span style="font-size:0.72rem; color:#64748b; flex-shrink:0;">${timeStr}</span>
                </div>

                <!-- Row 2: Last message preview -->
                <div style="font-size:0.82rem; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px;">
                    ${String(lastMsg.sender_id) === String(meId) ? '<span style="color:#64748b;">You: </span>' : ''}${lastMsg.message_text}
                </div>

                <!-- Row 3: Product name -->
                <div style="font-size:0.75rem; color:#10b981; display:flex; align-items:center; gap:4px;">
                    <i class="ri-price-tag-3-line"></i>
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${thread.productTitle}</span>
                </div>
            </div>
        `;

        el.onclick = () => openThread(thread);
        container.appendChild(el);
    });
}


// 4. Thread View & Replying
function openThread(thread) {
    activeThreadId = thread.threadId;

    const meId = getActiveUserId();

    // Determine if "other" is the buyer or seller
    const firstMsg = thread.messages[thread.messages.length - 1]; // oldest
    const otherIsBuyer = String(firstMsg.sender_id) === String(thread.otherUserId);
    const roleLabel = otherIsBuyer ? 'Buyer' : 'Seller';
    const roleColor = otherIsBuyer ? '#10b981' : '#3b82f6';

    // Header
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';

    // Set name + badge
    const chatNameEl = document.getElementById('chatName');
    chatNameEl.innerHTML = `
        ${thread.otherName}
        <span style="
            font-size:0.6rem; font-weight:600;
            padding:2px 8px; border-radius:20px; margin-left:6px;
            background:${roleColor}22; color:${roleColor};
            border:1px solid ${roleColor}55; vertical-align:middle;
        ">${roleLabel}</span>
    `;

    document.getElementById('chatProduct').innerText = thread.productTitle;
    document.getElementById('chatAvatar').src = thread.otherPic
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.otherName)}&background=475569&color=fff&size=80`;

    // Messages
    const msgsContainer = document.getElementById('chatMessages');
    msgsContainer.innerHTML = '';

    // Sort chronological for display (oldest at top)
    const chronMessages = [...thread.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    chronMessages.forEach(msg => {
        const isMe = String(msg.sender_id) === String(meId);
        const senderLabel = isMe ? 'You' : thread.otherName;

        // Sender name label (only for received messages)
        if (!isMe) {
            const nameLabel = document.createElement('div');
            nameLabel.style.cssText = `
                font-size: 0.72rem;
                color: #94a3b8;
                margin-bottom: 2px;
                padding-left: 4px;
                align-self: flex-start;
            `;
            nameLabel.innerText = senderLabel;
            msgsContainer.appendChild(nameLabel);
        }

        const bubble = document.createElement('div');
        bubble.style.cssText = `
            align-self: ${isMe ? 'flex-end' : 'flex-start'};
            background: ${isMe ? '#3b82f6' : 'rgba(255,255,255,0.1)'};
            color: white;
            padding: 10px 14px;
            border-radius: 12px;
            border-${isMe ? 'bottom-right' : 'bottom-left'}-radius: 2px;
            max-width: 70%;
            font-size: 0.95rem;
            line-height: 1.4;
        `;
        bubble.innerText = msg.message_text;
        bubble.title = new Date(msg.created_at).toLocaleString();

        // Time tooltip?
        bubble.title = new Date(msg.created_at).toLocaleString();

        msgsContainer.appendChild(bubble);
    });

    // Scroll to bottom
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

window.sendReply = async function () {
    const activeUserId = getActiveUserId();
    if (!activeUserId) {
        if (window.showToast) window.showToast('Please log in to reply.', 'error');
        return;
    }

    const input = document.getElementById('replyInput');
    const text = input.value.trim();
    if (!text || !activeThreadId) return;

    const thread = inboxThreads[activeThreadId];
    if (!thread) return;

    const tempId = 'temp_' + Date.now();

    // Optimistic Append
    const msgsContainer = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.style.cssText = `
        align-self: flex-end;
        background: #3b82f6; opacity: 0.7;
        color: white; padding: 10px 14px;
        border-radius: 12px; border-bottom-right-radius: 2px;
        max-width: 70%; font-size: 0.95rem;
    `;
    bubble.innerText = text;
    msgsContainer.appendChild(bubble);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
    input.value = '';

    try {
        const res = await fetch('/api/marketplace/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: activeUserId,
                receiver_id: thread.otherUserId,
                product_id: thread.productId,
                message: text
            })
        });

        const data = await res.json();
        if (data.success) {
            bubble.style.opacity = '1';
            // Silently refresh inbox in background to sync thread state
            loadInbox();
        } else {
            throw new Error(data.error || 'Failed to send reply');
        }
    } catch (err) {
        console.error('[Reply] Send Error:', err);
        bubble.style.backgroundColor = '#ef4444';
        bubble.title = `Failed to send: ${err.message}`;
    }
};


// ── Init ──────────────────────────────────────────────
window.loadMarketplace = loadMarketplace;
window.renderMarketplaceUI = function () {
    const c = document.getElementById('marketGrid');
    if (c) c.innerHTML = `<div class="mp-empty"><i class="ri-store-2-line"></i><p>Loading...</p></div>`;
};
