import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testCenterDashboard() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("=== Selenium Test: Center Dashboard Login ===");

        // 1. Navigate to Login (with role=center param)
        const loginUrl = 'http://localhost:8000/pages/login.html?role=center';
        console.log(`-> Navigating to: ${loginUrl}`);
        await driver.get(loginUrl);

        // 2. Wait for page load and find elements
        await driver.wait(until.elementLocated(By.id('email')), 5000);

        console.log("-> Entering Center credentials...");
        const usernameInput = await driver.findElement(By.id('email')); // ID remains 'email' even for centers
        const passwordInput = await driver.findElement(By.id('password'));
        const loginForm = await driver.findElement(By.id('unifiedLoginForm'));

        // Clear and type
        await usernameInput.clear();
        await usernameInput.sendKeys('hkskkanjirapally');

        await passwordInput.clear();
        await passwordInput.sendKeys('hksk@1234');

        // 3. Submit
        console.log("-> Clicking login button...");
        await loginForm.submit();

        // 4. Wait for redirection
        console.log("-> Waiting for redirection to center dashboard...");
        await driver.wait(until.urlContains('center-dashboard.html'), 10000);

        const currentUrl = await driver.getCurrentUrl();
        console.log("-> Current URL:", currentUrl);

        if (currentUrl.includes('center-dashboard.html')) {
            console.log("✅ REDIRECTION SUCCESS: Reached Center Dashboard.");

            // 5. Verify Dashboard Content
            console.log("-> Verifying dashboard elements...");
            await driver.wait(until.elementLocated(By.id('headerCenterName')), 5000);

            const centerName = await driver.findElement(By.id('headerCenterName')).getText();
            console.log(`-> Logged in as Center: "${centerName}"`);

            if (centerName && centerName !== "Collection Center") {
                console.log("✅ DASHBOARD DATA VERIFIED.");
            } else {
                console.log("⚠️ Dashboard loaded but center name might still be default/loading.");
            }

            // Check if stats are visible
            const pendingStat = await driver.findElement(By.id('statPending')).getText();
            console.log(`-> Pending requests count displayed: ${pendingStat}`);

        } else {
            console.log("❌ REDIRECTION FAILED: Did not reach Center Dashboard.");
            const errorMsg = await driver.findElement(By.id('login-error-msg')).getText();
            if (errorMsg) console.log(`-> Error Message on UI: "${errorMsg}"`);
        }

    } catch (error) {
        console.error("❌ TEST ENCOUNTERED AN ERROR:", error.message);
    } finally {
        console.log("-> Terminating browser session...");
        await driver.quit();
        console.log("=== Test Run Finished ===");
    }
}

testCenterDashboard();
