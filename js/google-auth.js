// google-auth.js - SortSense Google Sign-In Handler

/**
 * Handle successful Google Sign-In response
 */
async function handleGoogleSignIn(response) {
    if (!response.credential) {
        console.error("Google Sign-In Error: No credential received.");
        return;
    }

    const msgEl = document.getElementById('googleMsg');
    if (msgEl) {
        msgEl.innerText = "Verifying...";
        msgEl.style.color = '#64748b';
    }

    try {
        const res = await fetch('/api/auth/google/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (data.success) {
            const user = data.user;

            // Core Session Storage
            const uid = user.user_id || user.id;
            if (uid) {
                localStorage.setItem('app_user_id', uid);
                localStorage.setItem('userId', uid);
            }
            
            localStorage.setItem('app_user_email', user.email);
            localStorage.setItem('app_user_name', user.name);
            localStorage.setItem('app_user_role', 'USER');
            localStorage.setItem('app_user_pic', user.picture || '');

            // Authorization Token
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // Legacy Fallbacks
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userRole', 'USER');

            console.log("✅ Google Login Verified. Redirecting...");
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || "Google Authentication Failed");
        }
    } catch (err) {
        console.error("Google Auth Error:", err);
        if (msgEl) {
            msgEl.innerText = err.message;
            msgEl.style.color = '#ef4444';
        }
    }
}

/**
 * Check if a session already exists on Auth pages
 */
function checkSession() {
    const userId = localStorage.getItem('app_user_id');
    const userEmail = localStorage.getItem('app_user_email');
    const userPic = localStorage.getItem('app_user_pic');

    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');

    if (userId && userEmail && isLoginPage) {
        // Prevent showing "Continue As" if we are explicitly on a non-user login path
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        if (role && role !== 'user') return;

        const container = document.querySelector('.login-wrapper') || document.querySelector('.auth-form-container');
        if (container) {
            const avatarHtml = userPic
                ? `<div style="position: relative; width: 96px; height: 96px; margin: 0 auto 1.5rem;">
                     <img src="${userPic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid #10b981; box-shadow:0 8px 16px -4px rgba(16, 185, 129, 0.4);">
                     <div style="position: absolute; bottom: 4px; right: 4px; width: 24px; height: 24px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #0f172a;">
                        <i class="ri-checkbox-circle-fill" style="color:white; font-size:16px;"></i>
                     </div>
                   </div>`
                : `<div style="width:96px; height:96px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:50%; margin:0 auto 1.5rem; display:flex; align-items:center; justify-content:center; font-size:2.8rem; color:#10b981; border:3px solid rgba(16, 185, 129, 0.5); box-shadow:0 8px 16px -4px rgba(0, 0, 0, 0.4);">
                     <i class="ri-user-smile-fill"></i>
                   </div>`;

            container.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 2rem; border-radius: 24px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: white; animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
                    ${avatarHtml}
                    <h2 style="margin-bottom: 0.75rem; color: #fff; font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">Welcome Back</h2>
                    <p style="color: #94a3b8; margin-bottom: 2.5rem; line-height: 1.6; font-size: 1rem; font-family: 'Inter', sans-serif;">
                        You are already signed in as<br>
                        <span style="color: #10b981; font-weight: 600; font-size: 1.1rem;">${userEmail}</span>
                    </p>
                    
                    <button onclick="window.location.href='dashboard.html'" class="btn btn-primary" style="width: 100%; padding: 1.1rem; margin-bottom: 1.25rem; border-radius: 14px; font-weight: 700; display:flex; align-items:center; justify-content:center; gap:0.75rem; font-size:1.1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); transition: all 0.3s ease; font-family: 'Outfit', sans-serif;">
                        Continue to Dashboard <i class="ri-arrow-right-line"></i>
                    </button>
                    
                    <button onclick="logout()" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.95rem; font-weight:500; display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.75rem; margin:0 auto; width:auto; border-radius: 8px; transition: all 0.2s ease; font-family: 'Inter', sans-serif;">
                        <i class="ri-logout-box-r-line"></i> Not you? <span style="color: #ef4444; font-weight: 600; margin-left: 2px;">Switch Account</span>
                    </button>
                </div>
                <style>
                    @keyframes slideUpFade {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            `;
        }
    }
}

/**
 * Central logout for Google flow
 */
window.logout = function () {
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    if (window.logoutSafely) {
        window.logoutSafely('manual', 'USER');
    } else {
        localStorage.clear();
        window.location.href = 'login.html?role=user';
    }
};

// Listeners
window.handleGoogleSignIn = handleGoogleSignIn;
document.addEventListener('DOMContentLoaded', checkSession);
