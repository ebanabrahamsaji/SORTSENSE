// ═══════════════════════════════════════════════════
// SortSense — Google Sign-In Handler (Production-Ready)
// ═══════════════════════════════════════════════════

// 1. Initialize Google Identity Services
// This function is the entry point for the "Sign in with Google" flow.
// It is called automatically by the Google library when a user successfully signs in.
async function handleGoogleSignIn(response) {
    const msgEl = document.getElementById('googleMsg');

    if (!response.credential) {
        console.error("Google Sign-In Error: No credential received.");
        if (msgEl) {
            msgEl.innerText = "Sign-in failed. Please try again.";
            msgEl.style.color = '#ef4444';
        }
        return;
    }

    console.log("Google Credential Received. Verifying...");
    if (msgEl) {
        msgEl.innerText = "Verifying...";
        msgEl.style.color = '#64748b';
    }

    try {
        // Send the JWT credential to the backend for verification
        // This is crucial for security. Do NOT trust client-side decoding alone for session creation.
        // The backend handles the "Extract and store: user name, email, profile picture, and Google ID" requirement.
        await verifyAndLogin(response.credential);
    } catch (err) {
        console.error('Google Auth Verification Error:', err);
        if (msgEl) {
            // Display clean error message without 'Authentication failed:' prefix if it's already descriptive
            // unlikely user wants to see 'Authentication failed: Too many requests...' repeated
            msgEl.innerText = err.message || "Authentication failed.";
            msgEl.style.color = '#ef4444';
        }
    }
}

// 2. Backend Verification & Session Creation
async function verifyAndLogin(token) {
    const res = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }) // Send ONLY the token. No mock data.
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Verification failed on server.');
    }

    if (!data.success || !data.user) {
        throw new Error('Invalid response from server.');
    }

    const user = data.user;
    console.log("Login Successful for:", user.email);

    // 3. Session Handling (Requirement: Save user in localStorage)
    localStorage.setItem('app_user_id', user.user_id);
    localStorage.setItem('app_user_email', user.email);
    localStorage.setItem('app_user_name', user.name);
    localStorage.setItem('app_user_role', 'USER');
    localStorage.setItem('app_user_pic', user.picture || ''); // Store profile picture

    // 4. Auto-Redirect (Requirement: Prevent returning to login page)
    console.log("Redirecting to dashboard...");
    window.location.href = 'dashboard.html';
}

// 5. Auto-Login Check (Requirement: Check session but allow user choice)
function checkSession() {
    const userId = localStorage.getItem('app_user_id');
    const userEmail = localStorage.getItem('app_user_email');
    const userName = localStorage.getItem('app_user_name') || 'User';
    const userPic = localStorage.getItem('app_user_pic');

    // Identify if we are on an auth page
    const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register');

    if (userId && userEmail && isAuthPage) {
        console.log("Active session found. Requesting user action.");

        // Option 3: Professional "Continue As" UI
        // We inject this into the existing form container
        const container = document.querySelector('.login-wrapper') || document.querySelector('.auth-form-container');

        if (container) {
            // Determine Avatar (use stored pic or generic initial)
            const avatarHtml = userPic
                ? `<img src="${userPic}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:1.5rem; border:4px solid #fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">`
                : `<div style="width:80px; height:80px; background:#e2e8f0; border-radius:50%; margin:0 auto 1.5rem; display:flex; align-items:center; justify-content:center; font-size:2rem; color:#64748b; border:4px solid #fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"><i class="ri-user-smile-line"></i></div>`;

            container.innerHTML = `
                <div style="text-align: center; padding: 2rem 1rem; animation: fadeIn 0.4s ease-out;">
                    ${avatarHtml}
                    <h2 style="margin-bottom: 0.5rem; color: #1e293b; font-family: 'Outfit', sans-serif;">Welcome Back!</h2>
                    <p style="color: #64748b; margin-bottom: 2rem; line-height: 1.5;">
                        You are currently logged in as<br>
                        <strong style="color: #0f172a;">${userEmail}</strong>
                    </p>
                    
                    <button onclick="window.location.href='dashboard.html'" class="btn btn-primary" style="width: 100%; padding: 1rem; margin-bottom: 1rem; border-radius: 12px; font-weight: 600; display:flex; align-items:center; justify-content:center; gap:0.5rem; font-size:1rem;">
                        Continue to Dashboard <i class="ri-arrow-right-line"></i>
                    </button>
                    
                    <button onclick="logout()" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem; font-weight:500; display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.5rem; margin:0 auto; width:auto;">
                        <i class="ri-logout-box-line"></i> Switch Account
                    </button>
                </div>
            `;
        }
    }
}

// 6. Logout System (Requirement: Clear session, disable auto-select, redirect)
function logout() {
    console.log("Logging out...");

    // Clear Local Storage
    localStorage.removeItem('app_user_id');
    localStorage.removeItem('app_user_email');
    localStorage.removeItem('app_user_name');
    localStorage.removeItem('app_user_role');
    localStorage.removeItem('app_user_pic');

    // Disable Google Auto-Select to prevent immediate re-login loop
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }

    // Redirect to Login
    window.location.href = '../index.html';
}

// Make functions global for HTML access
window.handleGoogleSignIn = handleGoogleSignIn;
window.logout = logout;

// Run session check on load
document.addEventListener('DOMContentLoaded', checkSession);

console.log('✅ Production Google Auth Loaded');
