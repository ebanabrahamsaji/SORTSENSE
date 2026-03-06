import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function runComprehensiveTest() {
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
        log("=== Comprehensive Dashboard Test Start (Port 8001) ===");

        // --- 1. ADMIN DASHBOARD TEST ---
        log("\n--- Testing Admin Dashboard ---");
        await driver.get('http://localhost:8001/pages/login.html?role=admin');
        await driver.wait(until.elementLocated(By.id('email')), 10000);
        await driver.findElement(By.id('email')).sendKeys('Admin');
        await driver.findElement(By.id('password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('admin-dashboard.html'), 15000);
        log("✅ Admin Login Success");

        await driver.wait(until.elementLocated(By.id('stats-total-users')), 10000);
        const usersCount = await driver.findElement(By.id('stats-total-users')).getText();
        log(`✅ Admin Stats (Users): ${usersCount}`);

        // Navigation check
        const specialWasteLink = await driver.findElement(By.xpath("//span[contains(text(), 'Special Waste')]/.."));
        await driver.executeScript("arguments[0].click();", specialWasteLink);
        await driver.wait(until.urlContains('admin-special-waste.html'), 10000);
        log("✅ Admin Special Waste Page Reached");

        // --- 2. USER DASHBOARD TEST ---
        log("\n--- Testing User Dashboard ---");
        await driver.get('http://localhost:8001/pages/login.html?role=user');
        await driver.wait(until.elementLocated(By.id('email')), 10000);
        await driver.findElement(By.id('email')).sendKeys('user@sortsense.com');
        await driver.findElement(By.id('password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('dashboard.html'), 15000);
        log("✅ User Login Success");

        await driver.wait(until.elementLocated(By.id('welcomeName')), 10000);
        const welcomeName = await driver.findElement(By.id('welcomeName')).getText();
        log(`✅ User Welcome Name: ${welcomeName}`);

        const ecoScore = await driver.findElement(By.id('ecoText')).getText();
        log(`✅ User Eco Score: ${ecoScore}`);

        // --- 3. CENTER DASHBOARD TEST ---
        log("\n--- Testing Center Dashboard ---");
        await driver.get('http://localhost:8001/pages/login.html?role=center');
        await driver.wait(until.elementLocated(By.id('email')), 10000);
        await driver.findElement(By.id('email')).sendKeys('hkskanjirapally');
        await driver.findElement(By.id('password')).sendKeys('hksk@1234');
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.urlContains('center-dashboard.html'), 15000);
        log("✅ Center Login Success");

        // Check Overview Stats
        await driver.wait(until.elementLocated(By.id('statTotalToday')), 10000);
        const todayCount = await driver.findElement(By.id('statTotalToday')).getText();
        log(`✅ Center Stats (Today): ${todayCount}`);

        // Check History for Special Waste
        log("-> Checking History for Special Waste integration...");
        const historyNav = await driver.findElement(By.id('nav-history'));
        await driver.executeScript("arguments[0].click();", historyNav);

        const historyList = await driver.wait(until.elementLocated(By.id('historyRequestsList')), 10000);
        await driver.wait(async () => {
            const text = await historyList.getText();
            return text.length > 5 && !text.includes('Loading...');
        }, 5000).catch(() => { });

        const historyText = await historyList.getText();
        const historyHtml = await driver.executeScript("return document.getElementById('historyRequestsList').innerHTML;");

        if (historyText.includes('(SW)') || historyHtml.includes('(SW)')) {
            log("✅ SUCCESS: Special Waste (SW) found in History list!");
        } else {
            log("❌ FAIL: (SW) indicator not found in History list.");
            fs.writeFileSync('history_fail_debug.html', historyHtml);
        }

        log("✅ ALL DASHBOARD TESTS COMPLETED.");

    } catch (error) {
        log("❌ TEST FAILED: " + error.message);
        try {
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('comprehensive_test_error.png', screenshot, 'base64');
            log("-> Error screenshot saved as comprehensive_test_error.png");
        } catch (e) { }
    } finally {
        const browserLogs = await driver.manage().logs().get('browser');
        log("\n--- Browser Console Logs ---");
        browserLogs.forEach(entry => log(`[${entry.level.name}] ${entry.message}`));

        await driver.quit();
        fs.writeFileSync('comprehensive_test_logs.txt', testLogs.join('\n'));
        log("=== Comprehensive Test Finished ===");
    }
}

runComprehensiveTest();
