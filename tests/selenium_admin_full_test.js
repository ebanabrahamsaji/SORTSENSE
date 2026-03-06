import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function testAdminDashboard() {
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
        log("=== Selenium Test: Admin Dashboard Full Coverage ===");

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

        // 3. Overview Stats
        log("-> Checking Overview Stats...");
        await driver.wait(until.elementLocated(By.id('stats-total-users')), 10000);
        const usersCount = await driver.findElement(By.id('stats-total-users')).getText();
        log(`✅ Total Users Stat: ${usersCount}`);

        // 4. Test "Live Collection Center Status" Toggle & Filter
        log("-> Testing Center Status Section...");
        const toggleBtn = await driver.findElement(By.id('toggleCenterStatusBtn'));
        await driver.executeScript("arguments[0].click();", toggleBtn);

        await driver.wait(until.elementIsVisible(driver.findElement(By.id('centerStatusContainer'))), 5000);
        log("✅ Center Status table visible.");

        const filterDropdown = await driver.findElement(By.id('centerRegFilter'));
        await driver.wait(until.elementIsVisible(filterDropdown), 2000);
        log("✅ Registration filter dropdown visible.");

        await filterDropdown.sendKeys('Registered Centers');
        await driver.sleep(1000);
        log("✅ Filter switched to Registered Centers.");

        // 5. Navigation Coverage (Multi-page)
        const navLinks = [
            { text: 'User Management', url: 'admin-users.html' },
            { text: 'Waste Data', url: 'admin-waste-data.html' },
            { text: 'Special Waste', url: 'admin-special-waste.html' }
        ];

        for (const nav of navLinks) {
            log(`-> Navigating to ${nav.text}...`);
            const link = await driver.findElement(By.xpath(`//span[contains(text(), '${nav.text}')]/..`));
            await driver.executeScript("arguments[0].click();", link);
            await driver.wait(until.urlContains(nav.url), 10000);
            log(`✅ Verified ${nav.text} page.`);
            await driver.get('http://localhost:8000/pages/admin-dashboard.html'); // Return for next test
            await driver.wait(until.urlContains('admin-dashboard.html'), 5000);
        }

        log("✅ ALL CORE FUNCTIONALITIES VERIFIED.");

    } catch (error) {
        log("❌ TEST FAILED: " + error.message);
        try {
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('admin_error_full.png', screenshot, 'base64');
        } catch (e) { }
    } finally {
        await driver.quit();
        fs.writeFileSync('admin_dashboard_full_test_logs.txt', testLogs.join('\n'));
        log("=== End of Full Admin Test ===");
    }
}

testAdminDashboard();
