from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
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
        email = f"pickup_test_{rand_id}@example.com"
        print(f"Creating test user for pickup: {email}")
        
        driver.get("http://localhost:8000/pages/register-user.html")
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.ID, "fullname"))).send_keys("Pickup Tester")
        driver.find_element(By.ID, "email").send_keys(email)
        driver.find_element(By.ID, "password").send_keys("Test@1234")
        driver.find_element(By.ID, "confirm-password").send_keys("Test@1234")
        driver.execute_script("document.getElementById('terms').click();")
        driver.find_element(By.CLASS_NAME, "auth-submit-btn").click()
        
        # Wait for dashboard
        wait.until(EC.url_contains("dashboard.html"))
        print("Logged in. Testing Pickup Scheduling...")
        
        # 1. Select Waste Type
        Select(driver.find_element(By.ID, "pickupWasteType")).select_by_value("Plastic")
        
        # 2. Select Time Slot
        Select(driver.find_element(By.ID, "pickupTimeSlot")).select_by_value("Morning")
        
        # 3. Enter Quantity
        driver.find_element(By.ID, "pickupQuantity").send_keys("10")
        
        # 4. Enter Phone
        driver.find_element(By.ID, "pickupPhone").send_keys("9876543210")
        
        # 5. Enter Area (Triggers Center Search)
        area_input = driver.find_element(By.ID, "pickupAreaInput")
        area_input.send_keys("Kanjirapally")
        time.sleep(5) # Wait for debounce/API/Center load
        
        # 6. Select a Center (First radio button in the checklist)
        print("Waiting for center selection to appear...")
        wait.until(EC.visibility_of_element_located((By.ID, "centerSelectionSection")))
        centers = driver.find_elements(By.NAME, "assignedCenterId")
        if centers:
            driver.execute_script("arguments[0].click();", centers[0])
            print("Center selected.")
        else:
            print("FAILED: No centers found for Kanjirapally.")
            return

        # 7. Enter Full Address
        wait.until(EC.visibility_of_element_located((By.ID, "step7")))
        driver.find_element(By.ID, "pickupFullAddress").send_keys("123 Test Street, Kanjirapally, Kerala")
        
        # 8. Submit Request
        submit_btn = driver.find_element(By.ID, "requestPickupBtn")
        if submit_btn.is_enabled():
            submit_btn.click()
            print("Pickup request submitted.")
        else:
            print("FAILED: Submit button is disabled.")
            return
            
        # 9. Verify Success
        print("Waiting for pickup info card to appear...")
        # After submission, the form is hidden and the info container is shown with cards
        info_container = wait.until(EC.visibility_of_element_located((By.ID, "pickupInfoContainer")))
        
        # Wait for a card to be rendered inside (it might take a second for the API to return)
        wait.until(lambda d: len(d.find_elements(By.CLASS_NAME, "pickup-card")) > 0)
        
        cards = driver.find_elements(By.CLASS_NAME, "pickup-card")
        print(f"SUCCESS: Pickup request verified. Total active requests: {len(cards)}")
        
        # Also check for the success toast if possible (optional but good)
        # toast = driver.find_elements(By.CLASS_NAME, "toast-success")
        # if toast:
        #     print(f"Toast message: {toast[0].text}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        # Print page source for debugging
        # print(driver.page_source)
    finally:
        driver.quit()

if __name__ == "__main__":
    run_test()
