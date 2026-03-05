import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function testCenterSpecialWaste() {
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
        log("=== Selenium Test: Center Dashboard - Special Waste Section ===");

        // 1. Navigate to Login
        const loginUrl = 'http://localhost:8000/pages/login.html?role=center';
        log(`-> Navigating to: ${loginUrl}`);
        await driver.get(loginUrl);

        await driver.wait(until.elementLocated(By.id('email')), 10000);
        const usernameInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.css('button[type="submit"]'));

        log("-> Entering credentials...");
        await usernameInput.sendKeys('hkskkanjirapally');
        await passwordInput.sendKeys('hksk@1234');
        await loginBtn.click();

        // 2. Wait for redirection
        log("-> Waiting for redirection to center-dashboard.html...");
        await driver.wait(until.urlContains('center-dashboard.html'), 15000);
        const currentUrl = await driver.getCurrentUrl();
        log("-> Current URL: " + currentUrl);

        // 3. Click Special Waste nav
        log("-> Clicking 'Special Waste' sidebar item...");
        const navItem = await driver.wait(until.elementLocated(By.id('nav-special')), 10000);
        await driver.executeScript("arguments[0].click();", navItem);

        // 4. Verify Special Waste section display
        log("-> Checking Special Waste section visibility...");
        const section = await driver.wait(until.elementLocated(By.id('specialWasteSection')), 10000);
        await driver.wait(until.elementIsVisible(section), 10000);
        log("-> Section is visible.");

        // 5. Check Table data
        log("-> Waiting for data to load in #specialWasteList...");
        const list = await driver.findElement(By.id('specialWasteList'));

        try {
            await driver.wait(async () => {
                const text = await list.getText();
                return text.length > 5 && !text.includes('Loading...');
            }, 10000);

            const data = await list.getText();
            log("✅ Special Waste Data Loaded:\n" + data);
        } catch (e) {
            const tableText = await list.getText();
            log("⚠️ Table state after timeout: " + (tableText || "(empty)"));

            // Log browser logs to see if there was a JS error
            const browserLogs = await driver.manage().logs().get('browser');
            log("--- Browser Console Logs ---");
            browserLogs.forEach(entry => log(`[${entry.level.name}] ${entry.message}`));

            // Log localStorage
            const localStore = await driver.executeScript("return JSON.stringify(localStorage);");
            log("--- LocalStorage ---");
            log(localStore);

            throw new Error(`Timed out waiting for special waste data (Table text: "${tableText}").`);
        }

    } catch (error) {
        log("❌ TEST FAILED: " + error.message);
    } finally {
        log("-> Terminating session...");
        await driver.quit();
        log("=== End of Test ===");
        fs.writeFileSync('special_waste_test_logs.txt', testLogs.join('\n'));
    }
}

testCenterSpecialWaste();
