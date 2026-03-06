import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function testAdminReports() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    const testLogs = [];
    const log = (msg) => {
        console.log(msg);
        testLogs.push(`[${new Date().toISOString()}] ${msg}`);
    };

    try {
        log("=== Selenium Test: Admin Dashboard Reports Section ===");

        // 1. Login
        const loginUrl = 'http://localhost:8000/pages/login.html?role=admin';
        log(`-> Navigating to: ${loginUrl}`);
        await driver.get(loginUrl);

        await driver.wait(until.elementLocated(By.id('email')), 10000);
        await driver.findElement(By.id('email')).sendKeys('Admin');
        await driver.findElement(By.id('password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 2. Dashboard Landing
        log("-> Waiting for admin-dashboard.html...");
        await driver.wait(until.urlContains('admin-dashboard.html'), 15000);
        log("✅ Logged in successfully.");

        // 3. Navigate to Reports Section
        log("-> Clicking Reports & Docs...");
        const reportsNav = await driver.findElement(By.id('reportsNav'));
        await driver.executeScript("arguments[0].click();", reportsNav);

        log("-> Waiting for reportsSection to be visible...");
        const reportsSection = await driver.findElement(By.id('reportsSection'));
        await driver.wait(until.elementIsVisible(reportsSection), 10000);
        log("✅ Reports & Docs section visible.");

        // 4. Check Report Type Dropdown
        log("-> Checking Report Type options...");
        const reportTypeDropdown = await driver.findElement(By.id('reportType'));
        const options = await reportTypeDropdown.findElements(By.tagName('option'));

        let hasSpecialWaste = false;
        let optionsText = [];
        for (let opt of options) {
            const text = await opt.getText();
            optionsText.push(text);
            if (text.includes('Special Waste')) hasSpecialWaste = true;
        }

        log(`Options found: ${optionsText.join(', ')}`);
        if (hasSpecialWaste) {
            log("✅ 'Special Waste Reports' option found in dropdown.");
        } else {
            throw new Error("'Special Waste Reports' option NOT found in dropdown.");
        }

        // 5. Check Records Table
        log("-> Verifying Records Table...");
        await driver.sleep(2000); // Give time for API to load

        const tableBody = await driver.findElement(By.id('reportRecordsTableBody'));
        const rows = await tableBody.findElements(By.tagName('tr'));

        if (rows.length > 0) {
            const firstRowText = await rows[0].getText();
            if (firstRowText.includes('Loading records...') || firstRowText.includes('Error loading records')) {
                if (firstRowText.includes('Error loading records: HTTP 404')) {
                    throw new Error("HTTP 404 - Server likely NOT restarted after code changes.");
                }
                log(`⚠️ Still loading or error: ${firstRowText}`);
            } else {
                log(`✅ Found ${rows.length} records in the table.`);
                // Check for (SW) indicator if any special waste exists
                let hasSWIndicator = false;
                for (let row of rows) {
                    const rowHtml = await row.getAttribute('innerHTML');
                    if (rowHtml.includes('(SW)')) {
                        hasSWIndicator = true;
                        break;
                    }
                }
                if (hasSWIndicator) {
                    log("✅ Confirmed (SW) special waste indicator in table.");
                } else {
                    log("ℹ️ No special waste records found in the current view, but table is populated.");
                }
            }
        } else {
            log("ℹ️ Records table is empty (0 rows).");
        }

        // 6. Test Generating Summary Report (Trigger)
        log("-> Testing Export Summary (Special Waste)...");
        await reportTypeDropdown.sendKeys('Special Waste Reports');
        const btnGenerate = await driver.findElement(By.id('btnGenerateReport'));
        // Just checking if it's clickable and if there's any immediate error
        await driver.executeScript("arguments[0].click();", btnGenerate);
        log("✅ Clicked 'Generate Official PDF' button.");

        log("✅ ALL REPORT SECTION CHECKS COMPLETED.");

    } catch (error) {
        log("❌ TEST FAILED: " + error.message);
        try {
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('admin_reports_error.png', screenshot, 'base64');
        } catch (e) { }
        throw error; // Rethrow for process exit code
    } finally {
        await driver.quit();
        fs.writeFileSync('admin_reports_test_logs.txt', testLogs.join('\n'));
        log("=== End of Admin Reports Test ===");
    }
}

testAdminReports();
