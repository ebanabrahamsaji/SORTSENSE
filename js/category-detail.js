
import { CATEGORY_DATA, CATEGORY_DATA_ML } from '../js/category-data.js';

document.addEventListener('DOMContentLoaded', () => {
    // Apply static translations from translations.js
    if (typeof window.applyTranslations === 'function') {
        window.applyTranslations();
    }

    // 1. Get Category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryKey = urlParams.get('category');

    // Fallback or Error if no category
    if (!categoryKey || !CATEGORY_DATA[categoryKey]) {
        // Try fallback to 'plastic' for demo or show error
        console.warn('Category not found:', categoryKey);
        // Optional: Redirect back or show error
        if (!categoryKey) {
            window.location.href = 'dashboard.html';
            return;
        }
        // If key exists but no data, maybe show generic?
        window.showWarning("Details for this category are coming soon.");
        window.location.href = 'dashboard.html';
        return;
    }

    const lang = localStorage.getItem('userLanguage');
    const data = (lang === 'MALAYALAM' && CATEGORY_DATA_ML && CATEGORY_DATA_ML[categoryKey])
        ? CATEGORY_DATA_ML[categoryKey]
        : CATEGORY_DATA[categoryKey];
    console.log("Loading data for:", categoryKey, "Language:", lang);
    console.log("Loading data for:", categoryKey);

    // 2. Populate Header / Hero
    document.getElementById('heroTitle').textContent = data.title;
    document.getElementById('heroDesc').textContent = data.definition;

    // Icons & Colors
    const heroIcon = document.getElementById('heroIcon');
    const heroBgIcon = document.getElementById('heroBgIcon');

    heroIcon.className = data.icon + " hero-icon";
    heroBgIcon.className = data.icon + " hero-bg-icon";

    // Set dynamic color var
    document.documentElement.style.setProperty('--category-color', data.color);

    // 3. Subtypes
    const subtypesGrid = document.getElementById('subtypesGrid');
    subtypesGrid.innerHTML = data.subtypes.map(sub => `
        <div class="subtype-card">
            <img src="${sub.image}" alt="${sub.name}" class="subtype-img">
            <div class="subtype-content">
                <div class="subtype-title">${sub.name}</div>
                <div class="subtype-desc">${sub.desc}</div>
            </div>
        </div>
    `).join('');

    // 4. Guidelines
    const guidelinesList = document.getElementById('guidelinesList');
    guidelinesList.innerHTML = data.guidelines.map(rule => `
        <p><i class="ri-checkbox-circle-fill"></i> ${rule}</p>
    `).join('');

    // 5. Steps (What to do)
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = data.steps.map((step, index) => `
        <div class="step-item">
            <div class="step-number">${index + 1}</div>
            <div class="step-text" style="font-size: 1.1rem;">${step}</div>
        </div>
    `).join('');

    // 6. Impact
    document.getElementById('impactText').textContent = data.impact.text;
    document.getElementById('impactKeywords').innerHTML = data.impact.keywords.map(k => `
        <span class="keyword">${k}</span>
    `).join('');

    // 7. Visual Guide
    document.getElementById('imgDo').src = data.do_image;
    document.getElementById('imgDont').src = data.dont_image;

    // Show Content
    document.getElementById('contentLoading').style.display = 'none';
    document.getElementById('detailContent').style.display = 'block';

    // 8. Sidebar/User Logic (Simple version)
    loadUserData();
});

function loadUserData() {
    const userName = localStorage.getItem('userName') || 'User';
    const userPicture = localStorage.getItem('userPicture');

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        if (userPicture) {
            userAvatar.src = userPicture;
        } else {
            const initials = userName.charAt(0);
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
        }
    }
}

// Log out
const logoutBtn = document.getElementById('sidebarLogoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.showCustomConfirm("Logout", "Are you sure you want to logout?", () => {
            localStorage.clear();
            window.location.href = 'login.html?role=user';
        });
    });
}
