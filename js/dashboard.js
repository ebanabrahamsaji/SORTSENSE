// Dashboard JavaScript

// Load user data from localStorage
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userPicture = localStorage.getItem('userPicture');

    // Update user name displays
    document.getElementById('userName').textContent = userName.split(' ')[0];
    document.getElementById('welcomeName').textContent = userName.split(' ')[0];

    // Update avatar
    if (userPicture) {
        document.getElementById('userAvatar').src = userPicture;
    } else {
        const initials = userName.split(' ').map(n => n[0]).join('');
        document.getElementById('userAvatar').src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=10b981&color=fff`;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('googleCredential');

        // Redirect to home
        window.location.href = '../index.html';
    }
}

// Scan button functionality
document.addEventListener('DOMContentLoaded', function () {
    loadUserData();

    const scanBtn = document.querySelector('.scan-btn');
    if (scanBtn) {
        scanBtn.addEventListener('click', function () {
            alert('Camera scanning feature coming soon!\n\nThis will allow you to scan waste items and get instant sorting guidance.');
        });
    }

    // Add click handlers to achievement badges
    const badges = document.querySelectorAll('.achievement-badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function () {
            const badgeName = this.querySelector('span').textContent;
            const isEarned = this.classList.contains('earned');

            if (isEarned) {
                alert(`🏆 ${badgeName}\n\nCongratulations! You've earned this achievement.`);
            } else {
                alert(`🔒 ${badgeName}\n\nKeep going! This achievement is locked.\nComplete more eco-friendly actions to unlock it.`);
            }
        });
    });

    // Animate stats on load
    animateStats();
});

// Animate stat numbers
function animateStats() {
    const stats = document.querySelectorAll('.stat-info h3');

    stats.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));

        if (numericValue) {
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current).toLocaleString();
                }
            }, 20);
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        // Redirect to login if not authenticated
        window.location.href = 'login-user.html';
    }
}

// Run auth check
checkAuth();
