from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

import random
import string

def generate_random_string(length=5):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_register():
    # Setup - Generate fresh data
    random_id = generate_random_string()
    test_name = f"Alex Test {random_id.upper()}"
    test_email = f"alex.test_{random_id}@example.com"
    test_pass = "Alex@2026#"

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Initialize the driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print(f"Testing registration for: {test_name} ({test_email})")
        print("Navigating to registration page...")
        driver.get("http://localhost:8000/pages/register-user.html")
        
        # Wait for the form to be present
        wait = WebDriverWait(driver, 10)
        fullname_field = wait.until(EC.presence_of_element_located((By.ID, "fullname")))
        email_field = driver.find_element(By.ID, "email")
        password_field = driver.find_element(By.ID, "password")
        confirm_password_field = driver.find_element(By.ID, "confirm-password")
        terms_checkbox = driver.find_element(By.ID, "terms")
        
        # Enter registration details
        print("Entering registration details...")
        fullname_field.clear()
        fullname_field.send_keys(test_name)
        
        email_field.clear()
        email_field.send_keys(test_email)
        
        password_field.clear()
        password_field.send_keys(test_pass)
        
        confirm_password_field.clear()
        confirm_password_field.send_keys(test_pass)
        
        # Click terms checkbox
        print("Accepting terms...")
        if not terms_checkbox.is_selected():
            # Sometimes normal click fails in headless, use JS click
            driver.execute_script("arguments[0].click();", terms_checkbox)
        
        # Submit the form
        print("Submitting registration form...")
        submit_button = driver.find_element(By.CLASS_NAME, "auth-submit-btn")
        submit_button.click()
        
        time.sleep(5)
        current_url = driver.current_url
        print(f"DEBUG: Current URL is {current_url}")
        
        if "login.html" in current_url or "dashboard.html" in current_url:
            print(f"REGISTRATION SUCCESSFUL: Redirected to {current_url}")
        else:
            print("REGISTRATION FAILED: Still on registration page. This might be due to user already existing or validation error.")
            # Check for potential error messages in the console or body
            page_text = driver.execute_script("return document.body.innerText")
            print("--- PAGE TEXT START ---")
            print(page_text)
            print("--- PAGE TEXT END ---")
            if "already exists" in page_text.lower():
                print("REASON: User already exists.")
            elif "not match" in page_text.lower():
                print("REASON: Password segments do not match.")
            elif "strong" in page_text.lower():
                print("REASON: Password not strong enough.")
                
    except Exception as e:
        print(f"An error occurred during the test: {e}")
    finally:
        print("Closing the browser.")
        driver.quit()

if __name__ == "__main__":
    test_register()
