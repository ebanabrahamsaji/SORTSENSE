import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testUserDashboard() {
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
        console.log("Navigating to login page...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');

        console.log("Entering credentials...");
        await driver.findElement(By.id('email')).sendKeys('ebanabraham28@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('eban@123');

        console.log("Submitting login form...");
        // Assuming the login button is the submit button
        await driver.findElement(By.css('button[type="submit"]')).click();

        console.log("Waiting for dashboard to load...");
        // Wait until url changes to dashboard
        await driver.wait(until.urlContains('dashboard.html'), 10000);
        console.log("✅ Successfully logged in. URL is now:", await driver.getCurrentUrl());

        console.log("Checking dashboard elements...");
        // Wait for welcome text or pickup section
        let welcomeText = await driver.wait(until.elementLocated(By.id('welcomeName')), 5000);
        let name = await welcomeText.getText();
        console.log(`✅ Welcome Message Found: 'Welcome ${name}'`);

        // Check for pickup section
        let pickupHeader = await driver.findElement(By.css('.pickup-header h3'));
        let headerText = await pickupHeader.getText();
        console.log(`✅ Pickup Section Found: '${headerText}'`);

        // Check if waste type select is present
        let wasteTypeSelect = await driver.findElement(By.id('pickupWasteType'));
        console.log("✅ Waste Type selection dropdown found.");

        console.log("🎉 User Dashboard Layout test passed successfully!");

    } catch (error) {
        console.error("❌ Test failed with error:", error);
    } finally {
        console.log("Cleaning up...");
        await driver.quit();
    }
}

testUserDashboard();
