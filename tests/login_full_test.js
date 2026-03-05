import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testFullLogin() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("=== Selenium Test: User Login ===");

        // 1. Navigate to Login
        console.log("-> Navigating to login page...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');

        // 2. Clear and Enter Credentials
        console.log("-> Entering credentials...");
        const emailInput = await driver.findElement(By.id('email'));
        const passInput = await driver.findElement(By.id('password'));
        const loginBtn = await driver.findElement(By.id('loginBtn'));

        await emailInput.sendKeys('user@sortsense.com');
        await passInput.sendKeys('password123');

        // 3. Click Login
        console.log("-> Clicking login button...");
        await loginBtn.click();

        // 4. Wait for redirection to dashboard
        console.log("-> Waiting for redirection to dashboard...");
        await driver.wait(until.urlContains('dashboard.html'), 5000);

        const currentUrl = await driver.getCurrentUrl();
        console.log("-> Success! Final URL:", currentUrl);

        if (currentUrl.includes('dashboard.html')) {
            console.log("✅ LOGIN SUCCESS: Reached dashboard.");
        } else {
            console.log("❌ LOGIN FAILED: Did not reach dashboard.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);

        // Take a "screenshot" of the page source if it fails
        const source = await driver.getPageSource();
        console.log("Page Source length at failure:", source.length);
    } finally {
        console.log("-> Cleaning up browser session...");
        await driver.quit();
        console.log("=== Test Complete ===");
    }
}

testFullLogin();
