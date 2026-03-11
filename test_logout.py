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
    return "".join(random.choice(letters) for i in range(length))

def run_test():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        rand_id = generate_random_string()
        email = f"logout_test_{rand_id}@example.com"
        print(f"Creating test user for logout: {email}")
        
        # Step 1: Login
        driver.get("http://localhost:8000/pages/register-user.html")
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.ID, "fullname"))).send_keys("Logout Tester")
        driver.find_element(By.ID, "email").send_keys(email)
        driver.find_element(By.ID, "password").send_keys("Test@1234")
        driver.find_element(By.ID, "confirm-password").send_keys("Test@1234")
        driver.execute_script("document.getElementById('terms').click();")
        driver.find_element(By.CLASS_NAME, "auth-submit-btn").click()
        
        wait.until(EC.url_contains("dashboard.html"))
        print("Logged in successfully.")
        
        # Step 2: Click Logout
        logout_btn = wait.until(EC.presence_of_element_located((By.ID, "logoutBtn")))
        print("Clicking logout...")
        driver.execute_script("arguments[0].click();", logout_btn)
        
        # Step 3: Verify redirection to login.html or landing page (/)
        print("Waiting for redirection...")
        wait.until(lambda d: "login.html" in d.current_url or d.current_url.endswith("/") or "index.html" in d.current_url)
        print(f"SUCCESS: Logged out and redirected to {driver.current_url}")
        
        # Step 4: Verify Guard (Try to access dashboard directly)
        print("Testing Auth Guard: Attempting direct dashboard access...")
        driver.get("http://localhost:8000/pages/dashboard.html")
        time.sleep(2)
        
        if "login.html" in driver.current_url:
            print("SUCCESS: Auth Guard active. Redirected back to login.")
        else:
            print(f"FAILED: Auth Guard failed. Still on {driver.current_url}")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
