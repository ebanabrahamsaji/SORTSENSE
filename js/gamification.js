
// Gamification Logic (Leaderboard & Challenges)

document.addEventListener('DOMContentLoaded', () => {
    // Check for logged in user using app_user_id (matches login-user.html)
    const userId = localStorage.getItem('app_user_id');
    const legacyUserId = localStorage.getItem('userId');
    const finalUserId = userId || legacyUserId;

    if (!finalUserId) {
        console.warn("Gamification: No user ID found in localStorage.");
        return;
    }

    // Initial Load
    refreshRewards(finalUserId);

    // Auto Refresh every 30 seconds
    setInterval(() => {
        refreshRewards(finalUserId);
    }, 30000);
});

// Global function to refresh all rewards data
async function refreshRewards(userId) {
    if (!userId) {
        userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
    }
    if (!userId) return;

    console.log("🔄 Refreshing Rewards Data...");
    await Promise.all([
        loadLeaderboard(),
        loadChallenges(userId),
        updateUserRewards(userId)
    ]);
}

async function updateUserRewards(userId) {
    try {
        const res = await fetch(`/api/user/profile?userId=${userId}`);
        const data = await res.json();
        if (data.user) {
            const creditsEl = document.getElementById("rewardEcoCredits");
            if (creditsEl) {
                const currentPoints = parseInt(creditsEl.textContent) || 0;
                animatePoints(creditsEl, currentPoints, data.user.points || 0);
            }

            // XP and Level Calculation (Example: 2000 points per level)
            const pts = data.user.points || 0;
            const level = Math.floor(pts / 2000) + 1;
            const xpInLevel = pts % 2000;
            const xpPercent = (xpInLevel / 2000) * 100;

            const levelText = document.getElementById("rewardLevelText");
            const levelBar = document.getElementById("rewardLevelBar");
            const xpText = document.getElementById("rewardXPText");

            if (levelText) levelText.textContent = `Level ${level} Recycler`;
            if (levelBar) levelBar.style.width = xpPercent + "%";
            if (xpText) xpText.textContent = `${2000 - xpInLevel} XP to Level ${level + 1}`;
        }
    } catch (e) { console.error("Update Rewards Error:", e); }
}

// Attach to window for navigation access
window.refreshRewards = refreshRewards;

async function loadLeaderboard() {
    const list = document.getElementById("leaderboardList");
    if (!list) return;

    try {
        const res = await fetch("/api/gamification/leaderboard");
        const users = await res.json();

        list.innerHTML = "";

        if (users.length === 0) {
            list.innerHTML = `<li class="empty-state" style="text-align:center; padding: 20px; color: #94a3b8;">No data yet. Start recycling!</li>`;
            return;
        }

        const currentUserId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');

        users.forEach((u) => {
            const isMe = u.user_id == currentUserId;
            const item = document.createElement('li');
            item.className = `leaderboard-item ${isMe ? 'highlight my-rank' : ''}`;

            item.innerHTML = `
                <div class="rank">#${u.rank}</div>
                <div class="user-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random" alt="${u.name}">
                    <span>${u.name} ${isMe ? '(You)' : ''}</span>
                </div>
                <div class="points" id="points-${u.user_id}">${u.monthly_points || 0} pts</div>
            `;
            list.appendChild(item);

            // Optional: Animate points if they changed (not implemented fully here but structure is ready)
        });
    } catch (err) {
        console.error("Leaderboard Error:", err);
        list.innerHTML = `<li class="error-state">Failed to load leaderboard.</li>`;
    }
}

async function loadChallenges(userId) {
    const container = document.getElementById("challengeList");
    if (!container) return;

    try {
        const res = await fetch(`/api/gamification/challenges/${userId}`);
        const challenges = await res.json();

        container.innerHTML = "";

        if (challenges.length === 0) {
            container.innerHTML = `<p class="empty-state" style="text-align:center; padding: 20px; color: #94a3b8;">No active challenges.</p>`;
            return;
        }

        challenges.forEach(ch => {
            const percent = Math.min(100, Math.floor((ch.progress / ch.target) * 100));
            const statusClass = ch.completed ? 'completed' : 'active';
            const icon = getChallengeIcon(ch.type);

            const card = document.createElement('div');
            card.className = `challenge-card ${statusClass}`;
            card.innerHTML = `
                <div class="challenge-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="challenge-details">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <h4 style="margin:0;">${ch.title}</h4>
                        <span style="font-size:0.75rem; color:#94a3b8;">${ch.progress}/${ch.target}</span>
                    </div>
                    <p>${ch.description}</p>
                    <div class="progress-w">
                        <div class="progress-bar-sm">
                            <div class="fill" style="width: 0%; transition: width 0.8s ease-out;"></div>
                        </div>
                    </div>
                </div>
                <div class="challenge-reward">
                    ${ch.completed
                    ? '<i class="ri-checkbox-circle-fill success-icon"></i>'
                    : `<span class="pts">+${ch.reward_points}</span>`}
                </div>
            `;
            container.appendChild(card);

            // Trigger animation after append
            setTimeout(() => {
                const fill = card.querySelector('.fill');
                if (fill) fill.style.width = percent + "%";
            }, 100);
        });

    } catch (err) {
        console.error("Challenge Error:", err);
        container.innerHTML = `<p class="error-state">Error loading challenges.</p>`;
    }
}

function animatePoints(el, start, end) {
    let val = start;
    const duration = 1000; // 1s
    const steps = 20;
    const increment = (end - start) / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
        val += increment;
        if ((increment >= 0 && val >= end) || (increment < 0 && val <= end)) {
            val = end;
            clearInterval(timer);
        }
        el.textContent = Math.floor(val) + " pts";
    }, stepTime);
}

function getChallengeIcon(type) {
    if (type === 'scan') return 'ri-qr-scan-2-line';
    if (type === 'pickup') return 'ri-truck-line';
    if (type === 'recycle') return 'ri-recycle-line';
    return 'ri-trophy-line';
}
