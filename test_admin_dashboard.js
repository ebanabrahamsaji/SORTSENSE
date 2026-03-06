import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testAdminDashboard() {
    let options = new chrome.Options();
    options.addArguments('--headless'); // Headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1200,900');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("Navigating to admin login page...");
        await driver.get('http://localhost:8000/pages/login.html?role=admin');

        console.log("Entering admin credentials...");
        await driver.findElement(By.id('email')).sendKeys('Admin');
        await driver.findElement(By.id('password')).sendKeys('password123');

        console.log("Submitting login form...");
        // Click the submit button
        await driver.findElement(By.css('button[type="submit"]')).click();

        console.log("Waiting for admin dashboard to load...");
        // Wait until url changes to admin dashboard
        await driver.wait(until.urlContains('admin-dashboard.html'), 10000);
        console.log("✅ Successfully logged in as Admin. URL is now:", await driver.getCurrentUrl());

        console.log("Checking admin dashboard elements...");
        // Wait for system status or a key admin element
        let statsContainer = await driver.wait(until.elementLocated(By.className('stat-card')), 5000);
        let statValue = await statsContainer.getText();
        console.log(`✅ Admin stat card located. Text preview: '${statValue.split('\\n')[0]}'`);

        console.log("🎉 Admin Dashboard test passed successfully!");

    } catch (error) {
        console.error("❌ Test failed with error:", error);
    } finally {
        console.log("Cleaning up...");
        await driver.quit();
    }
}

testAdminDashboard();
