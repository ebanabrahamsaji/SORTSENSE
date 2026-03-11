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
        # Step 1: Register/Login a user
        rand_id = generate_random_string()
        email = f"search_test_{rand_id}@example.com"
        print(f"Creating test user: {email}")
        
        driver.get("http://localhost:8000/pages/register-user.html")
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.ID, "fullname"))).send_keys("Search Tester")
        driver.find_element(By.ID, "email").send_keys(email)
        driver.find_element(By.ID, "password").send_keys("Test@1234")
        driver.find_element(By.ID, "confirm-password").send_keys("Test@1234")
        driver.execute_script("document.getElementById('terms').click();")
        driver.find_element(By.CLASS_NAME, "auth-submit-btn").click()
        
        # Wait for dashboard
        wait.until(EC.url_contains("dashboard.html"))
        print("Logged in successfully. Testing Quick Search...")
        
        # Step 2: Use Quick Search
        search_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "waste-name-input")))
        search_input.send_keys("Plastic Bottle")
        
        search_btn = driver.find_element(By.CLASS_NAME, "search-btn")
        search_btn.click()
        
        # Step 3: Verify redirection to analysis-result.html
        wait.until(EC.url_contains("analysis-result.html"))
        print(f"SUCCESS: Redirected to {driver.current_url}")
        
        # Verify content
        result_title = wait.until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        category_badge = wait.until(EC.presence_of_element_located((By.ID, "categoryBadge")))
        
        if "Analysis Result" in result_title.text and category_badge.is_displayed():
            print(f"SUCCESS: Analysis result verified. Category: {category_badge.text}")
        else:
            print("FAILED: Result page content mismatch.")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
