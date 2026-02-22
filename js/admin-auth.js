/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         SortSense  ·  Admin Auth & Session Manager       ║
 * ║  Provides persistent login, route guards, expiry logic   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 *  Usage:
 *    · Include this script as the FIRST <script> on every admin page.
 *    · Admin dashboard pages  → AdminAuth.guardDashboard()   (auto-called)
 *    · Admin login page       → AdminAuth.guardLogin()        (auto-called)
 *    · Logout button          → AdminAuth.logout()
 */

(function (w) {
    'use strict';

    // ── Constants ────────────────────────────────────────────────────────────
    const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;   // 8 hours
    const ACTIVITY_EXTEND_MS = 30 * 60 * 1000;        // extend on activity if <30 min left
    const LOGIN_PAGE = 'login-admin.html';
    const DASHBOARD_PAGE = 'admin-dashboard.html';
    const WARN_BEFORE_EXPIRY = 5 * 60 * 1000;         // warn 5 min before expiry

    const KEYS = {
        id: 'admin_sys_id',
        email: 'admin_sys_email',
        role: 'admin_sys_role',
        name: 'admin_sys_name',
        token: 'admin_sys_token',
        expiry: 'admin_sys_expiry',
        adminUser: 'adminUser',             // legacy key — kept for backward-compat
    };

    // ── Internal Helpers ─────────────────────────────────────────────────────

    function _log(...args) {
        console.log('[AdminAuth]', ...args);
    }

    /** Resolve path-safe current page filename */
    function _page() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    /** True if we are on the admin login page */
    function _isLoginPage() {
        return _page() === LOGIN_PAGE;
    }

    /** True if we are on any protected admin page (not the login page) */
    function _isDashboardPage() {
        return !_isLoginPage();
    }

    /** Read stored session data */
    function _readSession() {
        return {
            id: localStorage.getItem(KEYS.id) || localStorage.getItem(KEYS.adminUser),
            email: localStorage.getItem(KEYS.email),
            role: localStorage.getItem(KEYS.role),
            name: localStorage.getItem(KEYS.name),
            expiry: parseInt(localStorage.getItem(KEYS.expiry) || '0', 10),
        };
    }

    /** Is the current session valid (exists + not expired)? */
    function _isValid() {
        const s = _readSession();
        if (!s.id) {
            _log('No session found.');
            return false;
        }
        if (!s.expiry || Date.now() > s.expiry) {
            _log('Session expired.');
            return false;
        }
        return true;
    }

    /** Extend session expiry on user activity */
    function _touch() {
        const expiry = parseInt(localStorage.getItem(KEYS.expiry) || '0', 10);
        const remaining = expiry - Date.now();
        // Only extend if less than ACTIVITY_EXTEND_MS remains (avoid redundant writes)
        if (remaining > 0 && remaining < ACTIVITY_EXTEND_MS) {
            const newExpiry = Date.now() + SESSION_DURATION_MS;
            localStorage.setItem(KEYS.expiry, newExpiry.toString());
            _log('Session extended to', new Date(newExpiry).toLocaleTimeString());
        }
    }

    /** Show a non-blocking expiry warning toast (if available) */
    function _warnExpiry(msLeft) {
        const mins = Math.ceil(msLeft / 60000);
        if (typeof window.showToast === 'function') {
            window.showToast(`⏱ Session expires in ${mins} minute${mins > 1 ? 's' : ''}. Keep working to stay logged in.`, 'warning');
        } else {
            _log(`Session expires in ${mins} minute(s).`);
        }
    }

    /** Clear all session keys */
    function _clear() {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        _log('Session cleared.');
    }

    // ── Expiry Watchdog ──────────────────────────────────────────────────────

    let _watchdogTimer = null;
    let _warnFired = false;

    function _startWatchdog() {
        if (_watchdogTimer) clearInterval(_watchdogTimer);
        _warnFired = false;

        _watchdogTimer = setInterval(() => {
            if (!_isValid()) {
                _log('Watchdog: session expired — redirecting.');
                clearInterval(_watchdogTimer);
                AdminAuth.logout('expired');
                return;
            }

            const remaining = parseInt(localStorage.getItem(KEYS.expiry) || '0', 10) - Date.now();

            // Fire warn once when approaching expiry
            if (!_warnFired && remaining <= WARN_BEFORE_EXPIRY && remaining > 0) {
                _warnFired = true;
                _warnExpiry(remaining);
            }
        }, 30_000); // check every 30s
    }

    // ── Activity Listeners (touch session on interaction) ────────────────────

    function _bindActivityListeners() {
        ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, _touch, { passive: true });
        });
    }

    // ── Multi-Tab Sync ───────────────────────────────────────────────────────
    // If logout happens in another tab, this tab logs out too.

    function _bindStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === KEYS.id && e.newValue === null) {
                // Another tab cleared the session
                _log('Multi-tab: session cleared in another tab — redirecting.');
                _redirectToLogin('multiTab');
            }
        });
    }

    // ── Redirect Helpers ─────────────────────────────────────────────────────

    function _redirectToLogin(reason) {
        _log('Redirecting to login. Reason:', reason);
        // All admin pages (including login-admin.html) are siblings inside /pages/.
        // Use a bare filename — the browser resolves it relative to the current directory.
        window.location.replace(`${LOGIN_PAGE}?reason=${reason}`);
    }

    function _redirectToDashboard() {
        _log('Already authenticated — redirecting to dashboard.');
        // Same directory sibling redirect
        window.location.replace(DASHBOARD_PAGE);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    const AdminAuth = {

        /**
         * Create / refresh a session after successful login.
         * Call this from the login form on successful auth response.
         *
         * @param {Object} user   - user object from API (user_id, email, role, name)
         */
        createSession(user) {
            const expiry = Date.now() + SESSION_DURATION_MS;
            localStorage.setItem(KEYS.id, String(user.user_id || user.id || ''));
            localStorage.setItem(KEYS.email, user.email || '');
            localStorage.setItem(KEYS.role, (user.role || 'ADMIN').toUpperCase());
            localStorage.setItem(KEYS.name, user.name || '');
            localStorage.setItem(KEYS.expiry, expiry.toString());
            // Legacy compat
            localStorage.setItem(KEYS.adminUser, String(user.user_id || user.id || ''));
            _log('Session created. Expires:', new Date(expiry).toLocaleTimeString());
        },

        /**
         * Returns the current admin session data, or null if not valid.
         */
        getSession() {
            return _isValid() ? _readSession() : null;
        },

        /**
         * Returns true if admin is currently authenticated.
         */
        isAuthenticated() {
            return _isValid();
        },

        /**
         * Route guard for ALL protected dashboard pages.
         * Call at the top of every admin page, or include this script which
         * auto-detects the page type and calls the right guard.
         */
        guardDashboard() {
            if (!_isValid()) {
                _log('Guard: not authenticated.');
                _redirectToLogin(_readSession().id ? 'expired' : 'unauthenticated');
                return false;
            }
            _log('Guard: session valid ✓');
            _startWatchdog();
            _bindActivityListeners();
            _bindStorageSync();
            return true;
        },

        /**
         * Route guard for the LOGIN PAGE.
         * If admin is already logged in → bounce them straight to dashboard.
         */
        guardLogin() {
            if (_isValid()) {
                _log('Guard (login): already authenticated — bouncing to dashboard.');
                _redirectToDashboard();
                return false;
            }
            // Check for expiry message to show
            const reason = new URLSearchParams(window.location.search).get('reason');
            if (reason === 'expired') {
                document.addEventListener('DOMContentLoaded', () => {
                    const err = document.getElementById('errorMsg');
                    if (err) {
                        err.innerText = '⏱ Your session has expired. Please log in again.';
                        err.style.display = 'block';
                    }
                });
            } else if (reason === 'multiTab') {
                document.addEventListener('DOMContentLoaded', () => {
                    const err = document.getElementById('errorMsg');
                    if (err) {
                        err.innerText = 'You were signed out in another tab.';
                        err.style.display = 'block';
                    }
                });
            }
            return true;
        },

        /**
         * Perform a clean logout.
         * @param {string} reason - optional reason tag
         */
        logout(reason = 'manual') {
            _log('Logging out. Reason:', reason);
            if (_watchdogTimer) clearInterval(_watchdogTimer);
            _clear();
            _redirectToLogin(reason);
        },

        /**
         * Expose logout globally so HTML onclick handlers work.
         */
        bindLogoutButton(elementId = 'logoutBtn') {
            const btn = document.getElementById(elementId);
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Use confirm dialog if available
                if (typeof window.showCustomConfirm === 'function') {
                    window.showCustomConfirm(
                        'Logout',
                        'Are you sure you want to logout from the Admin Panel?',
                        () => AdminAuth.logout('manual')
                    );
                } else {
                    AdminAuth.logout('manual');
                }
            });
        },
    };

    // ── Auto-detect page type and apply guard ────────────────────────────────
    // This runs immediately (before DOMContentLoaded) to prevent page flash.

    if (_isLoginPage()) {
        AdminAuth.guardLogin();
    } else {
        // Any other HTML file under /pages/ that loads this script is a protected page
        // Hide body immediately to prevent flash, reveal after guard passes
        document.documentElement.style.visibility = 'hidden';

        if (!AdminAuth.guardDashboard()) {
            // guardDashboard will redirect — body stays hidden
        } else {
            // Auth passed — reveal page smoothly
            document.addEventListener('DOMContentLoaded', () => {
                document.documentElement.style.visibility = 'visible';
                // Bind logout button
                AdminAuth.bindLogoutButton('logoutBtn');
                _log('Page secured and visible.');
            });
        }
    }

    // Expose globally
    w.AdminAuth = AdminAuth;

}(window));
