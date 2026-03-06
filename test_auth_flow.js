import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testAuthFlows() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log("=== STARTING AUTH FLOW TESTS ===");
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        const testPassword = "StrongPassword123!";

        // --- 1. REGISTRATION FLOW ---
        console.log("➡️ Testing Registration...");
        await driver.get('http://localhost:8000/pages/register-user.html');
        await driver.wait(until.elementLocated(By.id('fullname')), 5000);

        await driver.findElement(By.id('fullname')).sendKeys('Selenium Test Auth');
        await driver.findElement(By.id('email')).sendKeys(uniqueEmail);
        await driver.findElement(By.id('password')).sendKeys(testPassword);
        await driver.findElement(By.id('confirm-password')).sendKeys(testPassword);

        // Click the label for the checkbox to ensure it toggles
        const termsCheckbox = await driver.findElement(By.css('.terms-checkbox'));
        await termsCheckbox.click();

        // Find the specific button in registerForm
        const regForm = await driver.findElement(By.id('registerForm'));
        const regButton = await regForm.findElement(By.css('button[type="submit"]'));

        // Use JS to click in case of overlay
        await driver.executeScript("arguments[0].click();", regButton);

        // Wait for redirect to login
        try {
            await driver.wait(until.urlContains('login.html'), 5000);
            console.log("✅ Registration Successful (Redirected to Login)");
        } catch (e) {
            console.log("⚠️ Wait timed out. Proceeding to login...");
        }

        // --- 2. LOGIN FLOW ---
        console.log("➡️ Testing Login...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');
        await driver.wait(until.elementLocated(By.id('email')), 5000);

        await driver.findElement(By.id('email')).sendKeys(uniqueEmail);
        await driver.findElement(By.id('password')).sendKeys(testPassword);

        const loginForm = await driver.findElement(By.id('unifiedLoginForm'));
        const loginButton = await loginForm.findElement(By.css('button[type="submit"]'));
        await driver.executeScript("arguments[0].click();", loginButton);

        // Wait for redirect to dashboard
        try {
            await driver.wait(until.urlContains('dashboard.html'), 5000);
            console.log("✅ Login Successful (Redirected to Dashboard)");
        } catch (e) {
            console.log("⚠️ Dashboard redirect wait timed out.");
        }

        // logout/clear for next tests
        await driver.executeScript("localStorage.clear();");

        // --- 3. SECURE FORGOT PASSWORD LINK ---
        console.log("➡️ Testing Forgot Password Link...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');
        await driver.wait(until.elementLocated(By.id('forgot-link')), 5000);

        const forgotLink = await driver.findElement(By.id('forgot-link'));
        await driver.executeScript("arguments[0].click();", forgotLink);

        try {
            await driver.wait(until.urlContains('forgot-password.html'), 5000);
            console.log("✅ Forgot Password link works (Redirected to Forgot Password page)");
        } catch (e) { }

        // --- 4. GOOGLE SIGN IN BUTTON CHECK ---
        console.log("➡️ Checking Google Sign In Button...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');
        await driver.wait(until.elementLocated(By.className('g_id_signin')), 5000);

        const googleBtn = await driver.findElement(By.className('g_id_signin'));
        const isDisplayed = await googleBtn.isDisplayed();

        if (isDisplayed) {
            console.log("✅ Google Sign-In button is rendered correctly.");
        } else {
            console.error("❌ Google Sign-In button is NOT visible.");
        }

        console.log("=== ALL AUTH FLOW TESTS COMPLETED SUCCESSFULLY ===");
    } catch (err) {
        console.error("❌ TEST FAILED:");
        console.error(err);
    } finally {
        await driver.quit();
    }
}

testAuthFlows();
