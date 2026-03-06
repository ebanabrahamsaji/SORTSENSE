import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function testCenterDashboardData() {
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
        log("=== Selenium Test: Center Dashboard Requests ===");

        // 1. Navigate to Login
        const loginUrl = 'http://localhost:8000/pages/login.html?role=center';
        log(`-> Navigating to: ${loginUrl}`);
        await driver.get(loginUrl);

        await driver.wait(until.elementLocated(By.id('email')), 10000);
        const usernameInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.css('button[type="submit"]'));

        log("-> Entering credentials...");
        await usernameInput.sendKeys('hkskanjirapally');
        await passwordInput.sendKeys('hksk@1234');
        await loginBtn.click();

        // 2. Wait for redirection
        log("-> Waiting for redirection to center-dashboard.html...");
        await driver.wait(until.urlContains('center-dashboard.html'), 15000);
        log("-> Successfully logged in.");

        // 3. Check Pickup Requests Data
        log("-> Checking Active Pickup Requests...");
        const requestList = await driver.wait(until.elementLocated(By.id('activeRequestsQuickPanel')), 10000);

        await driver.wait(async () => {
            const text = await requestList.getText();
            return text.length > 5 && !text.includes('Loading...');
        }, 5000).catch(() => { });

        const pickupText = await requestList.getText();
        log("✅ Pickup Requests Section Text:\n" + (pickupText || "(empty)"));

        // 4. Click Special Waste nav
        log("-> Clicking 'Special Waste' sidebar item...");
        const navItem = await driver.wait(until.elementLocated(By.id('nav-special')), 10000);
        await driver.executeScript("arguments[0].click();", navItem);

        // 5. Check Special Waste Data
        log("-> Checking Special Waste Data...");
        const specialWasteList = await driver.wait(until.elementLocated(By.id('specialWasteList')), 10000);

        await driver.wait(async () => {
            const text = await specialWasteList.getText();
            return text.length > 5 && !text.includes('Loading...');
        }, 5000).catch(() => { });

        const specialText = await specialWasteList.getText();
        log("✅ Special Waste Section Text:\n" + (specialText || "(empty)"));

    } catch (error) {
        log("❌ TEST FAILED: " + error.message);
    } finally {
        log("-> Terminating session...");
        await driver.quit();
        log("=== End of Test ===");
        fs.writeFileSync('center_dashboard_test_logs.txt', testLogs.join('\n'));
    }
}

testCenterDashboardData();
