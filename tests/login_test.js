import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function testLogin() {
    let options = new chrome.Options();
    options.addArguments('--headless'); // Basic headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("Navigating to login page...");
        await driver.get('http://localhost:8000/pages/login.html?role=user');

        console.log("Checking page title...");
        let title = await driver.getTitle();
        console.log("Page Title:", title);

        if (title.includes("Login") || title.includes("SortSense")) {
            console.log("✅ Title check passed.");
        } else {
            console.log("❌ Title check failed.");
        }

        console.log("Finding login form elements...");
        let emailField = await driver.findElement(By.id('email'));
        let passwordField = await driver.findElement(By.id('password'));

        console.log("Email and Password fields found.");

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        console.log("Cleaning up...");
        await driver.quit();
    }
}

testLogin();
