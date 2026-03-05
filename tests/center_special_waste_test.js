import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testCenterSpecialWaste() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("=== Selenium Test: Center Dashboard - Special Waste Section ===");

        // 1. Navigate to Login
        const loginUrl = 'http://localhost:8000/pages/login.html?role=center';
        console.log(`-> Navigating to: ${loginUrl}`);
        await driver.get(loginUrl);

        await driver.wait(until.elementLocated(By.id('email')), 10000);
        const usernameInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.css('button[type="submit"]'));

        console.log("-> Entering credentials...");
        await usernameInput.sendKeys('hkskkanjirapally');
        await passwordInput.sendKeys('hksk@1234');
        await loginBtn.click();

        // 2. Wait for redirection
        console.log("-> Waiting for redirection to center-dashboard.html...");
        await driver.wait(until.urlContains('center-dashboard.html'), 15000);
        console.log("-> Current URL:", await driver.getCurrentUrl());

        // 3. Click Special Waste nav
        console.log("-> Clicking 'Special Waste' sidebar item...");
        const navItem = await driver.wait(until.elementLocated(By.id('nav-special')), 10000);
        await driver.executeScript("arguments[0].click();", navItem);

        // 4. Verify Special Waste section display
        console.log("-> Checking Special Waste section visibility...");
        const section = await driver.wait(until.elementLocated(By.id('specialWasteSection')), 10000);
        await driver.wait(until.elementIsVisible(section), 10000);
        console.log("-> Section is visible.");

        // 5. Check Table data
        console.log("-> Waiting for data to load in #specialWasteList...");
        const list = await driver.findElement(By.id('specialWasteList'));

        // Wait for it to NOT be empty and NOT contain 'No special waste'
        // Actually, if I assigned one, it should have data.
        try {
            await driver.wait(async () => {
                const text = await list.getText();
                return text.length > 5 && !text.includes('No special waste assigned yet');
            }, 15000);

            const data = await list.getText();
            console.log("✅ Special Waste Data Loaded:\n" + data);
        } catch (e) {
            const tableText = await list.getText();
            console.log("⚠️ Table state after timeout:", tableText || "(empty)");

            // Log browser logs to see if there was a JS error
            const logs = await driver.manage().logs().get('browser');
            console.log("--- Browser Console Logs ---");
            logs.forEach(log => console.log(`[${log.level.name}] ${log.message}`));

            throw new Error("Timed out waiting for special waste data. See logs above.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        // Page Source for debugging if it was a missing element error
        if (error.message.includes("Unable to locate element")) {
            // const source = await driver.getPageSource();
            // console.log("--- Page Source Snapshot ---");
            // console.log(source.substring(0, 1000)); 
        }
    } finally {
        console.log("-> Terminating session...");
        await driver.quit();
        console.log("=== End of Test ===");
    }
}

testCenterSpecialWaste();
