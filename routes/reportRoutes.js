import express from 'express';
import {
    generateRequestReport,
    generateSummaryReport,
    generateMonthlyReport,
    verifyReport
} from '../controllers/reportController.js';

const router = express.Router();

// ── Single Request Detail Report ──────────────────────────────────────
// GET /api/reports/request/:requestId
// Accepts: ?adminId  (optional, header 'admin-id' also works)
router.get('/request/:requestId', generateRequestReport);

// ── Custom Date-Range / Filtered Summary Report ───────────────────────
// GET /api/reports/summary?fromDate=&toDate=&centerId=&userId=&category=&status=
router.get('/summary', generateSummaryReport);

// ── Monthly Summary Report ────────────────────────────────────────────
// GET /api/reports/monthly?year=2026&month=2
router.get('/monthly', generateMonthlyReport);

// ── Report Authenticity Verification ─────────────────────────────────
// GET /api/reports/verify/:reportHash
router.get('/verify/:reportHash', verifyReport);

export default router;
