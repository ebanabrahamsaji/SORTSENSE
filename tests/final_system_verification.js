import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

const BASE_URL = 'http://localhost:8000';

async function runFinalSystemVerification() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    const results = {
        admin: { status: 'PENDING', steps: [] },
        user: { status: 'PENDING', steps: [] },
        center: { status: 'PENDING', steps: [] }
    };

    const logStep = (role, step, success, detail = '') => {
        results[role].steps.push({ step, success, detail });
        console.log(`[${role.toUpperCase()}] ${step}: ${success ? '✅' : '❌'} ${detail}`);
    };

    try {
        console.log("=== Starting Final System Verification ===");

        // 1. ADMIN TEST
        try {
            await driver.get(`${BASE_URL}/pages/login.html?role=admin`);
            await driver.wait(until.elementLocated(By.id('email')), 10000);
            await driver.findElement(By.id('email')).sendKeys('Admin');
            await driver.findElement(By.id('password')).sendKeys('password123');
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('admin-dashboard.html'), 15000);
            logStep('admin', 'Login', true);

            // Dashboard Stats
            await driver.wait(until.elementLocated(By.id('stats-total-users')), 10000);
            const statsUsers = await driver.findElement(By.id('stats-total-users')).getText();
            logStep('admin', 'Dashboard Overview Stats', true, `Total Users: ${statsUsers}`);

            // User Management Navigation
            const userMgmtLink = await driver.findElement(By.xpath("//span[contains(text(), 'User Management')]/.."));
            await driver.executeScript("arguments[0].click();", userMgmtLink);
            await driver.wait(until.urlContains('admin-users.html'), 10000);
            logStep('admin', 'User Management Navigation', true);

            // Check Extended Stats on User Management Page
            await driver.wait(until.elementLocated(By.id('statTotalUsers')), 10000);
            const topUsers = await driver.findElement(By.id('statTotalUsers')).getText();
            const centersReg = await driver.findElement(By.id('statCentersRegistered')).getText();
            logStep('admin', 'User Management Extended Stats', true, `Top Users: ${topUsers}, Centers: ${centersReg}`);

            // Verify New Filter Buttons
            const usersBtn = await driver.findElement(By.id('typeBtn-users'));
            const centersBtn = await driver.findElement(By.id('typeBtn-centers'));
            const allBtn = await driver.findElement(By.id('typeBtn-all'));
            logStep('admin', 'New Filter Buttons Existence', true);

            // Test Toggle Filter (Users -> Centers)
            await driver.executeScript("arguments[0].click();", centersBtn);
            await driver.sleep(1500); // Wait for re-render
            const tableTitleAfterCenters = await driver.findElement(By.id('tableTitle')).getText();
            if (tableTitleAfterCenters.includes('Centers')) {
                logStep('admin', 'Type Filter Toggle (Centers)', true);
            } else {
                logStep('admin', 'Type Filter Toggle (Centers)', false, `Title was: ${tableTitleAfterCenters}`);
            }

            // Test Toggle Filter (Centers -> Show All)
            await driver.executeScript("arguments[0].click();", allBtn);
            await driver.sleep(1500);
            const tableTitleAfterAll = await driver.findElement(By.id('tableTitle')).getText();
            if (tableTitleAfterAll.toLowerCase().includes('all')) {
                logStep('admin', 'Type Filter Toggle (Show All)', true);
            } else {
                logStep('admin', 'Type Filter Toggle (Show All)', false, `Title was: ${tableTitleAfterAll}`);
            }

            results.admin.status = 'PASSED';
        } catch (err) {
            results.admin.status = 'FAILED';
            logStep('admin', 'General Failure', false, err.message);
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('admin_error.png', screenshot, 'base64');
        }

        // 2. USER TEST
        try {
            await driver.get(`${BASE_URL}/pages/login-user.html`); // Use the correct user login page if possible
            await driver.wait(until.elementLocated(By.id('email')), 10000);
            await driver.findElement(By.id('email')).sendKeys('melbinjames1212@gmail.com');
            await driver.findElement(By.id('password')).sendKeys('password123');
            await driver.findElement(By.css('button[type="submit"]')).click();

            // Should redirect to dashboard.html
            await driver.wait(until.urlContains('dashboard.html'), 15000);
            logStep('user', 'Login', true);

            await driver.wait(until.elementLocated(By.id('welcomeName')), 10000);
            const welcomeMsg = await driver.findElement(By.id('welcomeName')).getText();
            logStep('user', 'Dashboard Welcome', true, welcomeMsg);

            results.user.status = 'PASSED';
        } catch (err) {
            results.user.status = 'FAILED';
            logStep('user', 'General Failure', false, err.message);
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('user_error.png', screenshot, 'base64');
        }

        // 3. CENTER TEST
        try {
            await driver.get(`${BASE_URL}/pages/login.html?role=center`);
            await driver.wait(until.elementLocated(By.id('email')), 10000);
            await driver.findElement(By.id('email')).sendKeys('hkskanjirapally');
            await driver.findElement(By.id('password')).sendKeys('hksk@1234');
            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('center-dashboard.html'), 15000);
            logStep('center', 'Login', true);

            await driver.wait(until.elementLocated(By.id('statTotalToday')), 10000);
            const todayStat = await driver.findElement(By.id('statTotalToday')).getText();
            logStep('center', 'Dashboard Stats', true, `Today: ${todayStat}`);

            results.center.status = 'PASSED';
        } catch (err) {
            results.center.status = 'FAILED';
            logStep('center', 'General Failure', false, err.message);
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('center_error.png', screenshot, 'base64');
        }

    } catch (e) {
        console.error("TOTAL VERIFICATION FAILURE:", e);
    } finally {
        await driver.quit();
        fs.writeFileSync('final_test_results.json', JSON.stringify(results, null, 4));
        console.log("=== Verification Complete. Results saved to final_test_results.json ===");
    }
}

runFinalSystemVerification();
