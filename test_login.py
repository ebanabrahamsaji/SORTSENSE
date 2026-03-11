from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_login():
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode for server testing
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Initialize the driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print("Navigating to login page...")
        driver.get("http://localhost:8000/pages/login.html")
        
        # Wait for the email field to be present
        wait = WebDriverWait(driver, 10)
        email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
        password_field = driver.find_element(By.ID, "password")
        
        # Enter credentials
        print("Entering credentials...")
        email_field.clear()
        email_field.send_keys("ebanabraham28@gmail.com")
        
        password_field.clear()
        password_field.send_keys("eban@123")
        
        # Submit the form
        print("Submitting login form...")
        submit_button = driver.find_element(By.CSS_SERVER_SELECTOR, ".auth-submit-btn") if False else driver.find_element(By.CLASS_NAME, "auth-submit-btn")
        submit_button.click()
        
        # Wait for potential redirect or error
        time.sleep(3)
        
        current_url = driver.current_url
        print(f"Current URL after login attempt: {current_url}")
        
        if "dashboard.html" in current_url:
            print("LOGIN SUCCESSFUL: Redirected to dashboard.")
        else:
            # Check for error message
            try:
                error_msg_el = driver.find_element(By.ID, "login-error-msg")
                if error_msg_el.is_displayed():
                    print(f"LOGIN FAILED: Error message displayed: {error_msg_el.text}")
                else:
                    print("LOGIN FAILED: Still on login page, no visible error message.")
            except:
                print("LOGIN FAILED: Still on login page, could not find error message element.")
                
    except Exception as e:
        print(f"An error occurred during the test: {e}")
    finally:
        print("Closing the browser.")
        driver.quit()

if __name__ == "__main__":
    test_login()
