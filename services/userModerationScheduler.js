/**
 * ═══════════════════════════════════════════════════════════
 *  Automated User Moderation Scheduler
 *  Runs every hour and evaluates ALL non-admin users.
 *
 *  Score bands (updated to match spec):
 *    0  – 20  → Active
 *    21 – 50  → Flagged
 *    51 – 80  → High Risk
 *    81+      → Suspended  ← auto-suspend, no admin action needed
 *
 *  Rules evaluated every cycle:
 *    1. Fake / invalid waste reports            → +10
 *    2. Repeated pickup cancellations (≥3)     → +15/each over threshold
 *    3. Spam messages to centers               → +20 (per detected batch)
 *    4. Abuse complaint from a center          → +25 (already applied live)
 *    5. Multiple reports from centers/users    → +30 (per report_count milestone)
 *    6. Long inactivity + prior violation      → +10
 *    7. Failed logins ≥10 in 7 days            → +10
 *    8. Duplicate scan spam ≥5 in 7 days       → +10
 * ═══════════════════════════════════════════════════════════
 */

import db from '../db.js';
import ModerationService, { RISK_SCORES } from './moderationService.js';

// ── Tunable thresholds ───────────────────────────────
const RULES = {
    REPORTS_TO_FLAG: 3,    // report_count that starts flagging
    REPORTS_TO_SUSPEND: 6,    // report_count that triggers suspension
    CANCELLATIONS_TO_PUNISH: 3,    // cancellations in 30 days before +score
    INACTIVITY_DAYS: 60,   // days without login + prior violation
    FAILED_LOGINS_LIMIT: 10,   // failed login count in 7 days
    DUPLICATE_SCAN_LIMIT: 5,    // duplicate scans in 7 days
    SPAM_MSG_LIMIT: 5,    // messages in 1 hour to same center
};

/**
 * Core moderation scan — evaluates every non-suspended regular user
 * and applies automated risk scoring via ModerationService.
 */
export async function runUserModerationScan() {
    try {
        const [users] = await db.query(`
            SELECT 
                u.user_id, u.name, u.email, u.role,
                u.user_status, u.risk_score,
                u.report_count,
                u.last_active,
                u.last_violation
            FROM tbl_users u
            WHERE u.role NOT IN ('ADMIN', 'CENTER')
              AND u.user_status != 'suspended'
        `);

        if (!users.length) return;

        console.log(`[AutoMod] 🔍 Scanning ${users.length} users...`);
        let adjusted = 0, flagged = 0, highRisk = 0, suspended = 0;

        for (const user of users) {
            const risks = [];
            let scoreToAdd = 0;

            // ── Rule 1 & 5: Report Count ─────────────────────────────────
            // Multiple reports → +30 each milestone
            if (user.report_count >= RULES.REPORTS_TO_SUSPEND) {
                risks.push(`High report count (${user.report_count}) — suspension threshold`);
                const deficit = 81 - (user.risk_score || 0);
                if (deficit > 0) scoreToAdd += Math.min(deficit, RISK_SCORES.MULTIPLE_REPORTS);
            } else if (user.report_count >= RULES.REPORTS_TO_FLAG) {
                risks.push(`Elevated report count (${user.report_count})`);
                const needed = 21 - (user.risk_score || 0);
                if (needed > 0) scoreToAdd += Math.min(needed, RISK_SCORES.MULTIPLE_REPORTS);
            }

            // ── Rule 2: Repeated Pickup Cancellations (+15 each over threshold) ──
            try {
                const [cancels] = await db.query(`
                    SELECT COUNT(*) AS cnt
                    FROM tbl_pickup_requests
                    WHERE user_id = ?
                      AND status IN ('Rejected', 'Cancelled')
                      AND created_at >= NOW() - INTERVAL 30 DAY
                `, [user.user_id]);

                const cancelCount = cancels[0].cnt || 0;
                if (cancelCount >= RULES.CANCELLATIONS_TO_PUNISH) {
                    const extra = cancelCount - RULES.CANCELLATIONS_TO_PUNISH;
                    const score = RISK_SCORES.PICKUP_CANCELLATION * (1 + extra);
                    risks.push(`${cancelCount} pickup cancellations in 30 days`);
                    scoreToAdd += score;
                }
            } catch (_) { /* table may not exist in older setups */ }

            // ── Rule 3: Spam Messages ────────────────────────────────────
            try {
                const [spamMsgs] = await db.query(`
                    SELECT COUNT(*) AS cnt
                    FROM tbl_user_center_messages
                    WHERE sender_id = ?
                      AND sender_role = 'user'
                      AND created_at >= NOW() - INTERVAL 1 HOUR
                `, [user.user_id]);

                if ((spamMsgs[0].cnt || 0) >= RULES.SPAM_MSG_LIMIT) {
                    risks.push(`${spamMsgs[0].cnt} messages to centers in last hour (spam)`);
                    scoreToAdd += RISK_SCORES.SPAM_MESSAGE;
                }
            } catch (_) { }

            // ── Rule 6: Inactivity + Prior Violation ─────────────────────
            if (user.last_active && user.last_violation) {
                const daysSinceActive = (Date.now() - new Date(user.last_active)) / (1000 * 60 * 60 * 24);
                if (daysSinceActive > RULES.INACTIVITY_DAYS) {
                    risks.push(`Inactive ${Math.floor(daysSinceActive)}d with prior violation`);
                    scoreToAdd += RISK_SCORES.INACTIVITY_VIOLATION;
                }
            }

            // ── Rule 7: Failed Logins ─────────────────────────────────────
            try {
                const [failedLogins] = await db.query(`
                    SELECT COUNT(*) AS cnt FROM tbl_user_audit_logs
                    WHERE target_user = ? AND action LIKE '%failed login%'
                      AND created_at >= NOW() - INTERVAL 7 DAY
                `, [user.name]);

                if ((failedLogins[0].cnt || 0) >= RULES.FAILED_LOGINS_LIMIT) {
                    risks.push(`${failedLogins[0].cnt} failed logins in 7 days`);
                    scoreToAdd += RISK_SCORES.FAILED_LOGINS;
                }
            } catch (_) { }

            // ── Rule 8: Duplicate Scan Spam ───────────────────────────────
            try {
                const [dupScans] = await db.query(`
                    SELECT COUNT(*) AS cnt
                    FROM tbl_user_history
                    WHERE user_id = ?
                      AND activity_type = 'SCAN'
                      AND created_at >= NOW() - INTERVAL 7 DAY
                      AND details LIKE '%"duplicate":true%'
                `, [user.user_id]);

                if ((dupScans[0].cnt || 0) >= RULES.DUPLICATE_SCAN_LIMIT) {
                    risks.push(`${dupScans[0].cnt} duplicate scans in 7 days`);
                    scoreToAdd += RISK_SCORES.DUPLICATE_ENTRY;
                }
            } catch (_) { }

            // ── Apply score if any risk found ─────────────────────────────
            if (scoreToAdd > 0 && risks.length > 0) {
                const reason = risks.join('; ');
                const result = await ModerationService.updateRiskScore(
                    user.user_id, scoreToAdd, `[AutoMod] ${reason}`
                );
                adjusted++;

                if (result?.newStatus === 'suspended') suspended++;
                else if (result?.newStatus === 'high_risk') highRisk++;
                else if (result?.newStatus === 'flagged') flagged++;
            }
        }

        console.log(`[AutoMod] ✅ Scan complete — ${adjusted} adjusted (${flagged} flagged, ${highRisk} high_risk, ${suspended} suspended)`);

    } catch (err) {
        console.error('[AutoMod] ❌ Scan error:', err.message);
    }
}
