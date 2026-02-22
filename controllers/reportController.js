import db from '../db.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environmental Impact Constants ---
// CO₂ saved per kg of each waste type (in kg CO₂ equivalent)
const IMPACT_FACTORS = {
    'Plastic': 2.53,
    'Paper': 1.29,
    'Metal': 4.32,
    'Glass': 0.87,
    'Organic': 1.51,
    'E-waste': 3.14,
    'E-Waste': 3.14,
    'Hazardous': 2.75,
    'Textile': 1.95,
    'Scrap': 2.10,
    'General': 1.00,
};
const TREE_ABSORPTION_KG_CO2_PER_YEAR = 22; // kg CO₂ absorbed by one tree per year
const SYSTEM_VERSION = 'v2.0.1';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

/**
 * Calculate Environmental Impact
 */
function calculateImpact(wasteType, quantity) {
    const rawQty = parseFloat(quantity) || 0;
    if (rawQty <= 0) return { co2Saved: '0.00', treesSaved: '0.00', landfillDiverted: '0.00' };

    const types = wasteType.split(',').map(t => t.trim()).filter(Boolean);
    let totalCO2 = 0;

    types.forEach(type => {
        const factor = IMPACT_FACTORS[type] || IMPACT_FACTORS['General'];
        totalCO2 += factor * (rawQty / types.length);
    });

    return {
        co2Saved: totalCO2.toFixed(2),
        treesSaved: (totalCO2 / TREE_ABSORPTION_KG_CO2_PER_YEAR).toFixed(3),
        landfillDiverted: (rawQty * 0.95).toFixed(2)
    };
}

/**
 * Generate SHA-256 hash of report content
 */
function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Generate a unique report ID
 */
function generateReportId(type, seed) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SS-${type}-${seed}-${ts}-${rand}`;
}

/**
 * Get status badge color (for PDF fills)
 */
function getStatusColor(status) {
    const map = {
        'Completed': '#10b981',
        'Pending': '#f59e0b',
        'Approved': '#3b82f6',
        'Collected': '#8b5cf6',
        'Rejected': '#ef4444',
        'Cancelled': '#94a3b8',
    };
    return map[status] || '#64748b';
}

/**
 * Draw PDF Header with branding
 */
function drawHeader(doc, reportId, generatedAt) {
    const pageW = doc.page.width;

    // Top gradient bar
    doc.rect(0, 0, pageW, 6).fill('#10b981');

    // Logo area (left)
    const logoPath = path.join(process.cwd(), 'logo.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 20, { width: 30 });
        doc.fillColor('#10b981').fontSize(20).font('Helvetica-Bold')
            .text('SortSense', 90, 25, { continued: true });
        doc.fillColor('#475569').fontSize(9).font('Helvetica')
            .text('  |  Personal Impact Report', 90, 31);
    } else {
        doc.fillColor('#10b981').fontSize(20).font('Helvetica-Bold')
            .text('SortSense', 50, 25, { continued: true });
        doc.fillColor('#475569').fontSize(9).font('Helvetica')
            .text('  |  Personal Impact Report', 50, 31);
    }

    // Tagline
    doc.fillColor('#94a3b8').fontSize(7.5)
        .text('Thank you for contributing to a cleaner, greener planet.', 50, 46);

    // Report ID (right side)
    doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold')
        .text('REPORT ID', pageW - 200, 25, { width: 150, align: 'right' });
    doc.fillColor('#059669').fontSize(7.5).font('Helvetica')
        .text(reportId, pageW - 200, 36, { width: 150, align: 'right' });
    doc.fillColor('#94a3b8').fontSize(7)
        .text(`Generated: ${generatedAt}`, pageW - 200, 48, { width: 150, align: 'right' });

    // Horizontal rule
    doc.strokeColor('#e2e8f0').lineWidth(0.75)
        .moveTo(50, 62).lineTo(pageW - 50, 62).stroke();
}

/**
 * Draw PDF Footer
 */
function drawFooter(doc, pageNum, totalPages, reportHash) {
    const pageW = doc.page.width;
    const footerY = doc.page.height - 50;

    doc.strokeColor('#e2e8f0').lineWidth(0.5)
        .moveTo(50, footerY - 8).lineTo(pageW - 50, footerY - 8).stroke();

    doc.rect(0, footerY + 2, pageW, 48).fill('#f8fafc');

    doc.fillColor('#94a3b8').fontSize(6.5).font('Helvetica')
        .text(`© ${new Date().getFullYear()} SortSense  ·  Your digital receipt for waste collection services.`,
            50, footerY + 8, { align: 'center', width: pageW - 100 });
    doc.text(`Doc ID: ${reportHash.slice(0, 32).toUpperCase()}`,
        50, footerY + 20, { align: 'center', width: pageW - 100 });
    doc.fillColor('#10b981')
        .text(`Verified Recycling Receipt`,
            50, footerY + 32, { align: 'center', width: pageW - 100 });

    // Page number
    doc.fillColor('#94a3b8').fontSize(7)
        .text(`Page ${pageNum} of ${totalPages}`, pageW - 100, footerY + 8, { width: 50, align: 'right' });
}

/**
 * Draw watermark on a page
 */
function drawWatermark(doc) {
    doc.save();
    doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
    doc.fillColor('#10b981').opacity(0.04).fontSize(72).font('Helvetica-Bold')
        .text('SORTSENSE RECAP', 80, doc.page.height / 2 - 40, { align: 'center', width: doc.page.width - 160 });
    doc.opacity(1).restore();
}

/**
 * Draw a section heading
 */
function drawSectionHeading(doc, title, y, icon = '●') {
    const pageW = doc.page.width;
    doc.rect(50, y, pageW - 100, 24).fill('#f1f5f9');
    doc.fillColor('#059669').fontSize(7).font('Helvetica-Bold')
        .text(`${icon}  ${title.toUpperCase()}`, 60, y + 8, { width: pageW - 120 });
    return y + 24;
}

/**
 * Draw a two-column info table row
 */
function drawInfoRow(doc, label, value, y, x1 = 60, x2 = 190, highlight = false) {
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(label, x1, y);
    doc.fillColor(highlight ? '#059669' : '#1e293b').font(highlight ? 'Helvetica-Bold' : 'Helvetica')
        .text(String(value || '—'), x2, y, { width: 200 });
    return y + 16;
}

// ============================================================
// ROUTE 1: Single Request Report  GET /api/reports/request/:id
// ============================================================
export const generateRequestReport = async (req, res) => {
    const { requestId } = req.params;
    const adminId = req.headers['admin-id'] || req.query.adminId || null;
    const requestingUserId = req.headers['user-id'] || null;

    try {
        // Fetch request data with JOINs
        const [rows] = await db.query(`
            SELECT r.*, 
                   u.name AS user_name, u.email AS user_email,
                   c.center_name, c.address AS center_address, c.type AS center_type
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            WHERE r.request_id = ?
        `, [requestId]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        const data = rows[0];

        // ── Ownership check ────────────────────────────────────────────────────
        // If a regular user is requesting (user-id header present, no admin-id),
        // verify the request belongs to them.
        if (requestingUserId && !adminId) {
            if (String(data.user_id) !== String(requestingUserId)) {
                return res.status(403).json({ success: false, message: 'Access denied: this report does not belong to your account.' });
            }
        }
        // ──────────────────────────────────────────────────────────────────────


        const impact = calculateImpact(data.waste_type || 'General', data.quantity || 0);
        const reportId = generateReportId('RPT', requestId);
        const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const reportPayload = { reportId, requestId, ...data, impact, generatedAt };
        const reportHash = generateHash(reportPayload);

        // Log to DB
        try {
            await db.query(
                `INSERT INTO tbl_reports (request_id, user_id, center_id, report_type, report_hash, impact_json, generated_by) 
                 VALUES (?, ?, ?, 'SINGLE', ?, ?, ?)`,
                [requestId, data.user_id, data.center_id, reportHash, JSON.stringify(impact), adminId]
            );
        } catch (_) { /* Non-critical */ }

        // QR Code
        const verifyUrl = `${BASE_URL}/pages/verify-report.html?h=${reportHash}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1, color: { dark: '#059669', light: '#fff' } });

        // PDF Setup
        const doc = new PDFDocument({ margin: 0, size: 'A4', info: { Title: `SortSense Waste Collection Report #${requestId}`, Author: 'SortSense System', Subject: 'Official Waste Collection Report' } });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SortSense_Report_${requestId}_${Date.now()}.pdf`);
        doc.pipe(res);

        const pageW = doc.page.width;

        // ── DRAW WATERMARK ──────────────────────────────────────────────
        drawWatermark(doc);

        // ── HEADER ───────────────────────────────────────────────────────
        drawHeader(doc, reportId, generatedAt);

        // ── QR CODE (top right) ─────────────────────────────────────────
        doc.image(qrDataUrl, pageW - 130, 70, { width: 80, height: 80 });
        doc.fillColor('#64748b').fontSize(6).font('Helvetica')
            .text('Scan to Verify', pageW - 130, 152, { width: 80, align: 'center' });

        // ── REPORT TITLE ────────────────────────────────────────────────
        doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
            .text('COLLECTION RECEIPT', 50, 75, { width: pageW - 200 });
        doc.fontSize(8.5).font('Helvetica').fillColor('#64748b')
            .text('Thank you for contributing to a sustainable future.', 50, 94);

        // Status Badge
        const statusColor = getStatusColor(data.status);
        doc.roundedRect(50, 112, 90, 18, 4).fill(statusColor);
        doc.fillColor('#fff').fontSize(7.5).font('Helvetica-Bold')
            .text(data.status?.toUpperCase() || 'UNKNOWN', 52, 117, { width: 86, align: 'center' });

        // ── REQUEST DETAILS SECTION ──────────────────────────────────────
        let y = 162;
        y = drawSectionHeading(doc, 'Collection Request Information', y, '◆');
        y += 10;

        const col1x = 60, col2x = 180, col3x = 330, col4x = 445;
        const lCol = '#64748b', vCol = '#1e293b';

        const reqDate = data.created_at ? new Date(data.created_at).toLocaleDateString('en-IN') : '—';
        const collDate = data.updated_at && data.status === 'Completed' ? new Date(data.updated_at).toLocaleDateString('en-IN') : 'Pending';
        const etaStr = data.estimated_pickup_time ? new Date(data.estimated_pickup_time).toLocaleDateString('en-IN') : '—';

        // Row 1
        doc.fillColor(lCol).fontSize(7.5).font('Helvetica').text('Request ID', col1x, y);
        doc.fillColor(vCol).font('Helvetica-Bold').text(`#${data.request_id}`, col2x, y);
        doc.fillColor(lCol).font('Helvetica').text('Requested Date', col3x, y);
        doc.fillColor(vCol).font('Helvetica-Bold').text(reqDate, col4x, y);
        y += 16;

        // Row 2
        doc.fillColor(lCol).font('Helvetica').text('Waste Category', col1x, y);
        doc.fillColor('#059669').font('Helvetica-Bold').text(data.waste_type || '—', col2x, y);
        doc.fillColor(lCol).font('Helvetica').text('Collected Date', col3x, y);
        doc.fillColor(vCol).font('Helvetica-Bold').text(collDate, col4x, y);
        y += 16;

        // Row 3
        doc.fillColor(lCol).font('Helvetica').text('Quantity (kg)', col1x, y);
        doc.fillColor('#059669').font('Helvetica-Bold').text(`${data.quantity || 0} kg`, col2x, y);
        doc.fillColor(lCol).font('Helvetica').text('Estimated Pickup', col3x, y);
        doc.fillColor(vCol).font('Helvetica-Bold').text(etaStr, col4x, y);
        y += 16;

        // Row 4
        doc.fillColor(lCol).font('Helvetica').text('Priority', col1x, y);
        doc.fillColor(vCol).font('Helvetica-Bold').text(data.priority || 'Normal', col2x, y);
        doc.fillColor(lCol).font('Helvetica').text('Request Status', col3x, y);
        doc.roundedRect(col4x, y - 1, 65, 13, 3).fill(statusColor);
        doc.fillColor('#fff').fontSize(7).text(data.status?.toUpperCase() || '—', col4x + 2, y + 1, { width: 61, align: 'center' });
        y += 24;

        // ── PARTIES SECTION ─────────────────────────────────────────────
        y = drawSectionHeading(doc, 'Involved Parties', y, '◆');
        y += 8;

        const halfW = (pageW - 120) / 2;

        // User box
        doc.rect(50, y, halfW, 64).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#059669').font('Helvetica-Bold').fontSize(7.5).text('SENDER / USER', 60, y + 8);
        doc.fillColor('#64748b').font('Helvetica').text('Name:', 60, y + 22);
        doc.fillColor('#1e293b').font('Helvetica-Bold').text(data.user_name || '—', 100, y + 22);
        doc.fillColor('#64748b').font('Helvetica').text('Email:', 60, y + 37);
        doc.fillColor('#1e293b').text(data.user_email || '—', 100, y + 37);
        doc.fillColor('#64748b').text('Address:', 60, y + 51);
        doc.fillColor('#1e293b').text((data.address || 'Not provided').slice(0, 50), 100, y + 51);

        // Center box
        const centerX = 65 + halfW;
        doc.rect(centerX, y, halfW, 64).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#059669').font('Helvetica-Bold').fontSize(7.5).text('COLLECTOR / CENTER', centerX + 10, y + 8);
        doc.fillColor('#64748b').font('Helvetica').text('Center:', centerX + 10, y + 22);
        doc.fillColor('#1e293b').font('Helvetica-Bold').text((data.center_name || '—').slice(0, 35), centerX + 50, y + 22);
        doc.fillColor('#64748b').font('Helvetica').text('Type:', centerX + 10, y + 37);
        doc.fillColor('#1e293b').text(data.center_type || 'General', centerX + 50, y + 37);
        doc.fillColor('#64748b').text('Address:', centerX + 10, y + 51);
        doc.fillColor('#1e293b').text((data.center_address || '—').slice(0, 35), centerX + 50, y + 51);
        y += 76;

        // ── GPS / LOCATION ──────────────────────────────────────────────
        y = drawSectionHeading(doc, 'Location Information', y, '◆');
        y += 10;
        doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Full Address:', col1x, y);
        doc.fillColor('#1e293b').font('Helvetica-Bold').text(data.address || (data.latitude ? `${data.latitude}, ${data.longitude}` : 'Not provided'), col2x, y, { width: pageW - col2x - 60 });
        y += 16;
        if (data.latitude && data.longitude) {
            doc.fillColor('#64748b').font('Helvetica').text('GPS Coordinates:', col1x, y);
            doc.fillColor('#3b82f6').font('Helvetica-Bold').text(`${data.latitude}° N, ${data.longitude}° E`, col2x, y);
            y += 16;
        }
        y += 8;

        // ── ENVIRONMENTAL IMPACT ────────────────────────────────────────
        y = drawSectionHeading(doc, 'Environmental Impact Summary', y, '◆');
        y += 8;

        // Green impact box
        doc.rect(50, y, pageW - 100, 80).fill('#dcfce7').stroke('#86efac');
        doc.fillColor('#065f46').fontSize(8.5).font('Helvetica-Bold')
            .text('YOUR POSITIVE IMPACT ON THE ENVIRONMENT', 60, y + 10, { align: 'center', width: pageW - 120 });

        const impW = (pageW - 140) / 3;
        const impStartX = 70;

        // CO₂ Saved
        doc.rect(impStartX, y + 24, impW - 10, 48).fill('#f0fdf4').stroke('#bbf7d0');
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('CO₂ AVOIDED', impStartX + 5, y + 30, { width: impW - 20, align: 'center' });
        doc.fillColor('#16a34a').fontSize(16).font('Helvetica-Bold').text(`${impact.co2Saved}`, impStartX + 5, y + 41, { width: impW - 20, align: 'center' });
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('kilograms CO₂ eq.', impStartX + 5, y + 59, { width: impW - 20, align: 'center' });

        // Trees Saved
        const t2x = impStartX + impW;
        doc.rect(t2x, y + 24, impW - 10, 48).fill('#f0fdf4').stroke('#bbf7d0');
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('TREES EQUIVALENT', t2x + 5, y + 30, { width: impW - 20, align: 'center' });
        doc.fillColor('#16a34a').fontSize(16).font('Helvetica-Bold').text(`${impact.treesSaved}`, t2x + 5, y + 41, { width: impW - 20, align: 'center' });
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('trees preserved (1 yr)', t2x + 5, y + 59, { width: impW - 20, align: 'center' });

        // Landfill Diverted
        const t3x = impStartX + impW * 2;
        doc.rect(t3x, y + 24, impW - 10, 48).fill('#f0fdf4').stroke('#bbf7d0');
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('LANDFILL DIVERTED', t3x + 5, y + 30, { width: impW - 20, align: 'center' });
        doc.fillColor('#16a34a').fontSize(16).font('Helvetica-Bold').text(`${impact.landfillDiverted}`, t3x + 5, y + 41, { width: impW - 20, align: 'center' });
        doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('kg kept from landfill', t3x + 5, y + 59, { width: impW - 20, align: 'center' });

        y += 92;

        // ── DIGITAL SIGNATURE ───────────────────────────────────────────
        y = drawSectionHeading(doc, 'Digital Verification & Integrity', y, '◆');
        y += 10;

        doc.rect(50, y, pageW - 100, 54).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text('✔ DIGITALLY VERIFIED', 65, y + 8);
        doc.fillColor('#475569').fontSize(7).font('Helvetica').text(`SHA-256 Report Hash:`, 65, y + 22);
        doc.fillColor('#64748b').font('Helvetica').text(reportHash, 65, y + 33, { width: pageW - 175 });
        doc.fillColor('#64748b').text(`Signed: ${generatedAt}  |  System: SortSense ${SYSTEM_VERSION}  |  Node: ${process.version}`, 65, y + 45);

        // Verified badge
        doc.roundedRect(pageW - 150, y + 10, 90, 28, 6).fill('#059669');
        doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold')
            .text('✔ DIGITALLY\n   VERIFIED', pageW - 148, y + 14, { width: 86, align: 'center' });
        y += 64;

        // ── REJECTION NOTE (conditional) ────────────────────────────────
        if (data.status === 'Rejected' && data.rejection_reason) {
            doc.rect(50, y, pageW - 100, 32).fill('#fef2f2').stroke('#fca5a5');
            doc.fillColor('#dc2626').fontSize(7.5).font('Helvetica-Bold').text('REJECTION REASON:', 60, y + 8);
            doc.fillColor('#7f1d1d').font('Helvetica').text(data.rejection_reason, 60, y + 20, { width: pageW - 120 });
            y += 40;
        }

        // ── FOOTER ───────────────────────────────────────────────────────
        drawFooter(doc, 1, 1, reportHash);

        doc.end();

    } catch (err) {
        console.error('Report Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate report.', error: err.message });
        }
    }
};

/**
 * NEW: User-Specific Report Download by Report ID
 * GET /api/user/report/download/:reportId
 */
export const downloadUserReport = async (req, res) => {
    const { reportId } = req.params;
    const userIdFromQuery = req.query.userId; // Basic security for now

    try {
        // 1. Fetch report details from tbl_reports
        const [reports] = await db.query(
            "SELECT * FROM tbl_reports WHERE report_id = ?",
            [reportId]
        );

        if (!reports || reports.length === 0) {
            return res.status(404).json({ success: false, message: "Report record not found." });
        }

        const report = reports[0];

        // 2. Ownership Check (Very Important)
        if (userIdFromQuery && String(report.user_id) !== String(userIdFromQuery)) {
            return res.status(403).json({ success: false, message: "Access denied: Report ownership mismatch." });
        }

        // 3. Reuse request report generation logic using the requestId from report record
        // We set req.params.requestId and let generateRequestReport handle it
        req.params.requestId = report.request_id;

        // Ensure the header is set so generateRequestReport does its own ownership check too
        if (userIdFromQuery) req.headers['user-id'] = userIdFromQuery;

        return generateRequestReport(req, res);

    } catch (err) {
        console.error('Download User Report Error:', err);
        res.status(500).json({ success: false, message: "Internal server error during download." });
    }
};

// ============================================================
// ROUTE 2: Summary / Custom-Range Report  GET /api/reports/summary
// ============================================================
export const generateSummaryReport = async (req, res) => {
    const { fromDate, toDate, centerId, userId, category, status } = req.query;
    const adminId = req.headers['admin-id'] || req.query.adminId || null;

    try {
        let sql = `
            SELECT r.*, u.name AS user_name, u.email AS user_email, c.center_name
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            WHERE 1=1
        `;
        const params = [];

        if (fromDate) { sql += ' AND DATE(r.created_at) >= ?'; params.push(fromDate); }
        if (toDate) { sql += ' AND DATE(r.created_at) <= ?'; params.push(toDate); }
        if (centerId) { sql += ' AND r.center_id = ?'; params.push(centerId); }
        if (userId) { sql += ' AND r.user_id = ?'; params.push(userId); }
        if (category) { sql += ' AND r.waste_type LIKE ?'; params.push(`%${category}%`); }
        if (status) { sql += ' AND r.status = ?'; params.push(status); }
        sql += ' ORDER BY r.created_at DESC LIMIT 200';

        const [rows] = await db.query(sql, params);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No data found for the selected filters.' });
        }

        const totalWeight = rows.reduce((acc, r) => acc + (parseFloat(r.quantity) || 0), 0);
        const totalImpact = calculateImpact('General', totalWeight);
        const reportId = generateReportId('SUM', rows.length);
        const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const reportHash = generateHash({ reportId, rows: rows.map(r => r.request_id), totalWeight, generatedAt });

        // Count by status
        const statusCounts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
        const completedCount = statusCounts['Completed'] || 0;
        const pendingCount = statusCounts['Pending'] || 0;

        // QR Code for summary verification
        const verifyUrl = `${BASE_URL}/pages/verify-report.html?h=${reportHash}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 90, margin: 1, color: { dark: '#059669', light: '#fff' } });

        // Log
        try {
            await db.query(
                `INSERT INTO tbl_reports (user_id, report_type, report_hash, impact_json, filters_json, generated_by) 
                 VALUES (?, 'SUMMARY', ?, ?, ?, ?)`,
                [adminId || rows[0].user_id, reportHash, JSON.stringify(totalImpact),
                JSON.stringify({ fromDate, toDate, centerId, userId, category, status }), adminId]
            );
        } catch (_) { /* Non-critical */ }

        const doc = new PDFDocument({ margin: 0, size: 'A4', info: { Title: 'SortSense Summary Report', Author: 'SortSense System' } });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SortSense_Summary_${Date.now()}.pdf`);
        doc.pipe(res);

        const pageW = doc.page.width;
        let currentPage = 1;
        const totalPages = Math.ceil(rows.length / 28) + 1; // estimate

        // ── WATERMARK ───────────────────────────────────────────────────
        drawWatermark(doc);

        // ── HEADER ───────────────────────────────────────────────────────
        drawHeader(doc, reportId, generatedAt);

        // Title & QR
        doc.image(qrDataUrl, pageW - 120, 70, { width: 70, height: 70 });
        doc.fillColor('#1e293b').fontSize(15).font('Helvetica-Bold')
            .text('PERSONAL RECYCLING SUMMARY', 50, 75, { width: pageW - 190 });
        doc.fontSize(8).font('Helvetica').fillColor('#64748b')
            .text(`Period: ${fromDate || 'All Time'} to ${toDate || 'Present'} · Filtered by: ${category || 'All Categories'} · Status: ${status || 'All'}`,
                50, 96, { width: pageW - 190 });

        // ── AGGREGATED STATS BOX ─────────────────────────────────────────
        let y = 160;
        doc.rect(50, y, pageW - 100, 72).fill('#f1f5f9').stroke('#e2e8f0');

        const metricW = (pageW - 120) / 4;
        const metrics = [
            { label: 'TOTAL REQUESTS', value: rows.length, color: '#3b82f6' },
            { label: 'TOTAL WEIGHT', value: `${totalWeight.toFixed(1)} kg`, color: '#059669' },
            { label: 'COMPLETED', value: completedCount, color: '#10b981' },
            { label: 'PENDING', value: pendingCount, color: '#f59e0b' },
        ];

        metrics.forEach((m, i) => {
            const mx = 60 + metricW * i;
            doc.fillColor('#94a3b8').fontSize(6.5).font('Helvetica').text(m.label, mx, y + 10, { width: metricW - 10, align: 'center' });
            doc.fillColor(m.color).fontSize(22).font('Helvetica-Bold').text(String(m.value), mx, y + 23, { width: metricW - 10, align: 'center' });
        });
        y += 80;

        // ── ENVIRONMENTAL IMPACT ─────────────────────────────────────────
        y = drawSectionHeading(doc, 'Your Environmental Impact', y, '❤');
        y += 8;

        doc.rect(50, y, pageW - 100, 52).fill('#dcfce7').stroke('#86efac');
        doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(7.5).text('TOTAL ENVIRONMENTAL CONTRIBUTION', 60, y + 8, { align: 'center', width: pageW - 120 });

        const iW = (pageW - 130) / 3;
        const iItems = [
            { label: 'CO₂ Avoided', value: `${totalImpact.co2Saved} kg`, sub: 'CO₂ equivalent' },
            { label: 'Equiv. Trees', value: totalImpact.treesSaved, sub: 'trees (1 year)' },
            { label: 'Landfill Diverted', value: `${totalImpact.landfillDiverted} kg`, sub: 'kept from landfill' },
        ];
        iItems.forEach((item, i) => {
            const ix = 60 + iW * i;
            doc.fillColor('#15803d').fontSize(6.5).font('Helvetica').text(item.label.toUpperCase(), ix, y + 22, { width: iW - 10, align: 'center' });
            doc.fillColor('#16a34a').fontSize(14).font('Helvetica-Bold').text(String(item.value), ix, y + 32, { width: iW - 10, align: 'center' });
        });
        y += 60;

        // ── COLLECTION RECORDS TABLE ─────────────────────────────────────
        y = drawSectionHeading(doc, `Collection Records (${rows.length} entries)`, y, '◆');
        y += 6;

        // Table header
        const colWidths = [38, 95, 70, 42, 55, 58, 55];
        const colX = [50, 88, 183, 253, 295, 350, 408];
        const headers = ['REQ ID', 'USER', 'WASTE TYPE', 'QTY (kg)', 'STATUS', 'CENTER', 'DATE'];

        doc.rect(50, y, pageW - 100, 16).fill('#1e293b');
        headers.forEach((h, i) => {
            doc.fillColor('#f8fafc').fontSize(6.5).font('Helvetica-Bold')
                .text(h, colX[i], y + 5, { width: colWidths[i], align: 'left' });
        });
        y += 16;

        doc.fontSize(7).font('Helvetica');
        let rowNum = 0;
        for (const row of rows.slice(0, 200)) {
            if (y > doc.page.height - 80) {
                drawFooter(doc, currentPage, totalPages, reportHash);
                doc.addPage({ margin: 0, size: 'A4' });
                drawWatermark(doc);
                currentPage++;
                y = 30;
                drawHeader(doc, reportId, generatedAt);
                y = 80;
                // Redraw table header
                doc.rect(50, y, pageW - 100, 16).fill('#1e293b');
                headers.forEach((h, i) => {
                    doc.fillColor('#f8fafc').fontSize(6.5).font('Helvetica-Bold')
                        .text(h, colX[i], y + 5, { width: colWidths[i], align: 'left' });
                });
                y += 16;
                doc.fontSize(7).font('Helvetica');
            }

            const bg = rowNum % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(50, y, pageW - 100, 14).fill(bg).stroke('#f1f5f9');

            const sColor = getStatusColor(row.status);
            doc.fillColor('#374151').text(`#${row.request_id}`, colX[0], y + 4, { width: colWidths[0] });
            doc.fillColor('#374151').text((row.user_name || '—').slice(0, 14), colX[1], y + 4, { width: colWidths[1] });
            doc.fillColor('#059669').text((row.waste_type || '—').slice(0, 16), colX[2], y + 4, { width: colWidths[2] });
            doc.fillColor('#374151').text(`${row.quantity || 0}`, colX[3], y + 4, { width: colWidths[3], align: 'center' });

            // Status chip
            doc.roundedRect(colX[4], y + 2, 52, 10, 2).fill(sColor);
            doc.fillColor('#fff').text((row.status || '—').slice(0, 10), colX[4] + 2, y + 4, { width: 48, align: 'center' });

            doc.fillColor('#374151').text((row.center_name || '—').slice(0, 14), colX[5], y + 4, { width: colWidths[5] });
            doc.fillColor('#94a3b8').text(row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '—', colX[6], y + 4, { width: colWidths[6] });

            y += 14;
            rowNum++;
        }

        y += 16;

        // ── VERIFICATION SECTION ────────────────────────────────────────
        if (y > doc.page.height - 120) {
            drawFooter(doc, currentPage, totalPages, reportHash);
            doc.addPage({ margin: 0, size: 'A4' });
            drawWatermark(doc);
            currentPage++;
            y = 50;
        }
        y = drawSectionHeading(doc, 'Report Integrity & Digital Verification', y, '◆');
        y += 10;
        doc.rect(50, y, pageW - 100, 40).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text('✔ REPORT DIGITALLY SIGNED', 60, y + 8);
        doc.fillColor('#475569').fontSize(6.5).font('Helvetica').text(`Hash: ${reportHash}`, 60, y + 20, { width: pageW - 120 });
        doc.fillColor('#94a3b8').text(`Generated: ${generatedAt}  ·  ${SYSTEM_VERSION}`, 60, y + 31);
        y += 52;

        drawFooter(doc, currentPage, totalPages, reportHash);
        doc.end();

    } catch (err) {
        console.error('Summary Report Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate summary report.', error: err.message });
        }
    }
};

// ============================================================
// ROUTE 3: Monthly Report  GET /api/reports/monthly
// ============================================================
export const generateMonthlyReport = async (req, res) => {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);

    req.query.fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    req.query.toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    req.query.status = req.query.status || '';
    req.query.category = req.query.category || '';
    req.query.centerId = req.query.centerId || '';
    req.query.userId = req.query.userId || '';

    return generateSummaryReport(req, res);
};

// ============================================================
// ROUTE 4: Verify Report  GET /api/reports/verify/:reportHash
// ============================================================
export const verifyReport = async (req, res) => {
    const { reportHash } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT r.*, u.name AS user_name, u.email AS user_email
             FROM tbl_reports r
             JOIN tbl_users u ON r.user_id = u.user_id
             WHERE r.report_hash = ?
             LIMIT 1`,
            [reportHash]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ valid: false, message: 'Report not found or may be invalid/forged.' });
        }

        const report = rows[0];
        const impactData = typeof report.impact_json === 'string' ? JSON.parse(report.impact_json || '{}') : (report.impact_json || {});

        res.json({
            valid: true,
            message: 'Report authenticity confirmed by SortSense system.',
            badge: 'DIGITALLY_VERIFIED',
            data: {
                report_id: report.report_id,
                request_id: report.request_id,
                report_hash: report.report_hash,
                report_type: report.report_type,
                user_name: report.user_name,
                date_generated: report.date_generated,
                impact: impactData,
                system_version: SYSTEM_VERSION,
            }
        });

    } catch (err) {
        console.error('Verify Report Error:', err);
        res.status(500).json({ valid: false, message: 'Verification service error. Please try again.' });
    }
};
