// Dashboard JavaScript

// Load user data from localStorage
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'User';
    const userPicture = localStorage.getItem('userPicture');

    // Update user name displays
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        // Robust First Name Extraction
        // 1. If it's an email (contains @), take part before @
        let nameToProcess = userName.includes('@') ? userName.split('@')[0] : userName;

        // 2. Split by any non-word character (space, dot, dash, underscore) to get the first name
        let firstName = nameToProcess.split(/[\s._-]+/)[0];

        // 3. Cleanup: Remove any remaining non-alphanumeric chars if any
        firstName = firstName.replace(/[^a-zA-Z0-9]/g, '');

        // 4. Fallback if empty
        if (!firstName) firstName = 'User';

        // 5. Truncate if too long (e.g. > 12 chars) to prevent layout break
        if (firstName.length > 12) {
            firstName = firstName.substring(0, 12) + '...';
        }

        // 6. Capitalize first letter
        welcomeName.textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }

    // Update avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        if (userPicture) {
            userAvatar.src = userPicture;
        } else {
            const initials = userName.split(' ').map(n => n[0]).join('');
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=9CA3AF&color=fff`;
        }
    }
}


async function logUserActivity(action, status = 'completed', statusLabel = 'Viewed') {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || 'Guest'; // If you store email
    try {
        await fetch('http://localhost:8000/api/log-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: userEmail !== 'Guest' ? userEmail : userName,
                action: action,
                status: status,
                statusLabel: statusLabel
            })
        });
    } catch (e) {
        console.error("Failed to log activity", e);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('googleCredential');
        window.location.href = '../index.html';
    }
}

// Navigation and Interactions
document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    checkAuth();

    // File Upload Interaction
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (dropZone && fileInput) {
        // Trigger file input on click
        dropZone.addEventListener('click', () => fileInput.click());

        // Handle File Selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    async function handleFileUpload(file) {
        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image (JPG/PNG).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File size too large. Max 5MB.');
            return;
        }

        // Show Loading State
        const originalText = dropZone.innerHTML;
        dropZone.innerHTML = `<div class="loading-spinner"></div><p>Analyzing Waste...</p>`;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('userEmail', localStorage.getItem('userEmail') || 'Guest');

        try {
            const response = await fetch('http://localhost:8000/api/waste/identify', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || 'Server error');
            }

            // Save result to session for the result page
            sessionStorage.setItem('analysisResult', JSON.stringify(result));

            // Generate a preview URL for the result page
            const reader = new FileReader();
            reader.onload = function (e) {
                sessionStorage.setItem('wasteImage', e.target.result);
                window.location.href = 'analysis-result.html';
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Analysis failed:', error);
            alert(error.message || 'Failed to analyze image. Please try again.');
            dropZone.innerHTML = originalText;
        }
    }

    // Avatar Click -> Logout
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', logout);
    }

    // Sidebar Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Manual Search Interaction
    const searchInput = document.querySelector('.manual-card input');
    const searchBtn = document.querySelector('.manual-card button');

    if (searchInput && searchBtn) {
        const handleManualSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            // Simple keyword mapping
            const rules = {
                organic: ['organic', 'food', 'vegetable', 'fruit', 'peel', 'leaf', 'flower', 'meat', 'bone', 'garden', 'tea', 'coffee', 'egg', 'leftover'],
                plastic: ['plastic', 'bottle', 'container', 'cover', 'bag', 'wrapper', 'packet', 'milk packet', 'straw', 'cup', 'toy', 'bucket'],
                paper: ['paper', 'newspaper', 'book', 'magazine', 'cardboard', 'carton', 'box', 'envelope', 'ticket', 'receipt'],
                glass: ['glass', 'bottle', 'jar', 'broken glass', 'mirror', 'window'],
                metal: ['metal', 'can', 'tin', 'aluminum', 'foil', 'steel', 'iron', 'copper', 'screw', 'nail', 'utensil', 'pot', 'pan', 'knife', 'fork', 'spoon'],
                battery: ['battery', 'cell', 'power bank', 'aa', 'aaa', 'lithium', 'alkaline', 'button cell'],
                ewaste: ['computer', 'laptop', 'keyboard', 'mouse', 'monitor', 'screen', 'phone', 'mobile', 'charger', 'cable', 'wire', 'printer', 'television', 'tv', 'remote', 'bulb', 'lamp', 'light', 'tubelight', 'fluorescent'],
                hazardous: ['chemical', 'pesticide', 'insecticide', 'paint', 'varnish', 'solvent', 'cleaner', 'poison', 'acid', 'oil'],
                biomedical: ['medical', 'hospital', 'syringe', 'needle', 'injection', 'bandage', 'cotton', 'blood', 'glove', 'medicine', 'drug', 'pill'],
                sanitary: ['sanitary', 'pad', 'napkin', 'diaper', 'mask', 'tissue', 'wipe', 'condom'],
                construction: ['construction', 'brick', 'cement', 'concrete', 'tile', 'wood', 'debris', 'rubble', 'stone', 'plaster'],
                agricultural: ['agricultural', 'farm', 'crop', 'husk', 'manure', 'dung', 'straw', 'hay'],
                mixed: ['mixed', 'soiled', 'dirty', 'contaminated', 'shoe', 'cloth', 'rag', 'foam', 'rubber', 'tetra pack', 'multilayer']
            };

            let detectedCategory = null;

            for (const [category, keywords] of Object.entries(rules)) {
                if (keywords.some(k => query.includes(k))) {
                    detectedCategory = category;
                    break;
                }
            }

            if (detectedCategory) {
                logUserActivity(`Searched for ${query} (${detectedCategory})`, 'completed', 'Search');
                sessionStorage.setItem('manualCategory', detectedCategory);
                window.location.href = `category-detail.html?category=${detectedCategory}`;
            } else {
                alert("Sorry, we couldn't identify that item. Please try a different keyword.");
            }
        };

        searchBtn.addEventListener('click', handleManualSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleManualSearch();
        });
    }

    // Category Click Handling
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const knownCategories = ['plastic', 'organic', 'paper', 'glass', 'ewaste', 'hazardous', 'metal', 'battery', 'biomedical', 'construction', 'agricultural', 'sanitary', 'mixed'];
            let category = null;

            card.classList.forEach(cls => {
                if (knownCategories.includes(cls) || cls === 'e-waste') {
                    category = cls === 'e-waste' ? 'ewaste' : cls;
                }
            });

            if (category) {
                logUserActivity(`Viewed ${category} category`, 'completed', 'Viewed');
                window.location.href = `category-detail.html?category=${category}`;
            } else {
                console.log("Unknown category card clicked");
            }
        });
    });
});

function checkAuth() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        // Optional: Redirect to login if strictly required
        // window.location.href = 'login-user.html'; 
    }
}
