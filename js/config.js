// Application Configuration
const APP_CONFIG = {
    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: '1033862193558-21l8mqvkjigogomhvonf256av4mmqo8q.apps.googleusercontent.com',

    // Backend endpoints (update these with your actual API endpoints)
    ENDPOINTS: {
        USER_LOGIN: '/api/auth/login',
        USER_REGISTER: '/api/auth/register',
        ADMIN_LOGIN: '/api/auth/admin/login',
        GOOGLE_AUTH: '/api/auth/google'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
