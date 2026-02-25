// auth.js - Master Authentication & Session Management

// ── Shared redirect lock ────────────────────────────────────────────────────
// Prevents double-redirect glitch when logout fires while background
// timers or auth guards also detect a cleared session simultaneously.
window._authRedirecting = false;

// ── Kill all background timers ──────────────────────────────────────────────
// Cancels every setInterval / setTimeout currently running in the page.
// Called before any session-termination redirect so no pending fetch or
// polling callback can race with the navigation.
window._killAllTimers = function () {
    // setTimeout with no args returns the next available ID — a reliable upper bound
    const highestId = window.setTimeout(function () { }, 0);
    for (let i = 0; i <= highestId; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
    }
};

// ── Comprehensive Logout ────────────────────────────────────────────────────
window.logoutSafely = async function (type, role) {
    type = type || 'manual';
    role = role || 'USER';

    if (window._authRedirecting) return; // Already in progress — block duplicate calls
    window._authRedirecting = true;

    // 1. Kill ALL background polling/intervals immediately so nothing
    //    can update the DOM or issue auth-checks after we clear tokens.
    window._killAllTimers();

    // 2. Fire-and-forget server-side cleanup (JWT is stateless; just best-effort)
    try {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('adminToken') ||
            localStorage.getItem('center_sys_token') ||
            localStorage.getItem('centerToken');
        const endpoint = (role === 'CENTER') ? '/api/centers/auth/logout' : '/api/auth/logout';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + (token || '') }
        }).catch(function () { }); // Ignore network errors
    } catch (e) { }

    // 3. Wipe every stored session key
    const keysToRemove = [
        // Common
        'token', 'userId', 'userRole', 'userEmail', 'userName', 'sessionToken', 'role', 'isLoggedIn',
        // User
        'app_user_id', 'app_user_email', 'app_user_name', 'app_user_role', 'app_user_pic', 'userPicture',
        // Center
        'centerToken', 'centerId', 'centerLoggedIn', 'centerName',
        'center_sys_token', 'center_sys_id', 'center_sys_email', 'center_sys_role', 'center_sys_name', 'center_sys_user',
        // Admin
        'adminToken', 'adminRole', 'adminUser',
        'admin_sys_id', 'admin_sys_email', 'admin_sys_role', 'admin_sys_name', 'admin_sys_token', 'admin_sys_expiry',
    ];
    keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
    sessionStorage.clear();

    // 4. Hard replace to root landing page — no state preserved, back button safe
    window.location.replace('/');
};

// ── Simplified global helper (auto-detects role) ───────────────────────────
window.safeLogout = function () {
    var role = 'USER';
    if (localStorage.getItem('admin_sys_id') || localStorage.getItem('adminToken')) role = 'ADMIN';
    else if (localStorage.getItem('center_sys_id') || localStorage.getItem('centerToken')) role = 'CENTER';
    window.logoutSafely('manual', role);
};

// ── Auto-Login Guard & Redirects ───────────────────────────────────────────
// Only runs on login pages and the landing page.
// Smart logic: if user navigates to login.html with no ?role= param
// (e.g. clicking "Login" from landing), always show the login form —
// never bounce them back to a dashboard on stale tokens.
function checkAutoLogin() {
    var path = window.location.pathname;
    var urlParams = new URLSearchParams(window.location.search);
    var roleParam = urlParams.get('role');

    var isLoginPage = path.includes('login.html') ||
        path.includes('login-center.html') ||
        path.includes('login-user.html');
    var isLandingPage = path.includes('index.html') ||
        path.endsWith('/') ||
        path.endsWith('SORTSENSE');

    if (!isLoginPage && !isLandingPage) return;

    // Read session indicators
    var adminId = localStorage.getItem('admin_sys_id') || localStorage.getItem('adminToken');
    var centerId = localStorage.getItem('center_sys_id') || localStorage.getItem('centerToken');
    var userId = localStorage.getItem('app_user_id') || localStorage.getItem('token');

    var targetDash = null;
    var sessionRole = null;

    if (adminId) { targetDash = 'admin-dashboard.html'; sessionRole = 'ADMIN'; }
    else if (centerId) { targetDash = 'center-dashboard.html'; sessionRole = 'CENTER'; }
    else if (userId) { targetDash = 'dashboard.html'; sessionRole = 'USER'; }

    // No active session — show the page
    if (!targetDash) { revealPage(); return; }

    if (isLoginPage) {
        // No role param = user intentionally clicked Login — show the page
        if (!roleParam) { revealPage(); return; }

        // Has role param — only redirect if session role matches
        var p = roleParam.toUpperCase();
        var match = (p === 'ADMIN' && sessionRole === 'ADMIN') ||
            (p === 'CENTER' && sessionRole === 'CENTER') ||
            (p === 'USER' && sessionRole === 'USER');

        if (!match) {
            // Role switch scenario — show the page
            console.log('[Auth] Role mismatch (' + p + ' vs ' + sessionRole + '). Showing login.');
            revealPage();
            return;
        }
    }

    // Active matching session — redirect to dashboard
    console.log('[Auth] Active session (' + sessionRole + '). Navigating to ' + targetDash);
    var finalUrl = isLandingPage ? 'pages/' + targetDash : targetDash;
    window.location.replace(finalUrl);
}

function revealPage() {
    document.querySelectorAll('style').forEach(function (s) {
        if (s.innerText && s.innerText.includes('visibility: hidden')) s.remove();
    });
    var layout = document.querySelector('.auth-split-layout');
    if (layout) { layout.style.visibility = 'visible'; layout.style.opacity = '1'; }
    document.documentElement.style.visibility = 'visible';
}

// Execute immediately (before DOMContentLoaded) to prevent login-page flash
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAutoLogin);
} else {
    checkAutoLogin();
}
