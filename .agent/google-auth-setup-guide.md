# Google Cloud Authentication Setup Guide

## Complete Guide to Setting Up Google Sign-In for SortSense

This guide will walk you through setting up Google Authentication from scratch in Google Cloud Console.

---

## 📋 Prerequisites

- A Google Account
- Your SortSense application running locally or deployed

---

## 🚀 Step-by-Step Setup

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top (next to "Google Cloud")
4. Click **"NEW PROJECT"**
5. Enter project details:
   - **Project Name**: `SortSense` (or your preferred name)
   - **Organization**: Leave as default (No organization)
6. Click **"CREATE"**
7. Wait for the project to be created (you'll see a notification)
8. Select your newly created project from the dropdown

---

### **Step 2: Enable Google Identity Services API**

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **"Google Identity Services"** or **"Google+ API"**
3. Click on **"Google Identity Services API"**
4. Click **"ENABLE"**
5. Wait for the API to be enabled

---

### **Step 3: Configure OAuth Consent Screen**

Before creating credentials, you must configure the OAuth consent screen.

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **User Type**:
   - Choose **"External"** (for testing with any Google account)
   - Click **"CREATE"**

3. **Fill in App Information**:
   - **App name**: `SortSense`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your logo
   - **Application home page**: `http://localhost:8080` (for testing)
   - **Application privacy policy link**: (Optional for testing)
   - **Application terms of service link**: (Optional for testing)
   - **Authorized domains**: Leave empty for local testing
   - **Developer contact information**: Your email address

4. Click **"SAVE AND CONTINUE"**

5. **Scopes** (Step 2):
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
     - `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. **Test Users** (Step 3):
   - Click **"+ ADD USERS"**
   - Add your email address and any other test users
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

7. **Summary** (Step 4):
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

---

### **Step 4: Create OAuth 2.0 Credentials**

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

4. **Configure OAuth Client**:
   - **Application type**: Select **"Web application"**
   - **Name**: `SortSense Web Client`

5. **Add Authorized JavaScript Origins**:
   
   Click **"+ ADD URI"** under "Authorized JavaScript origins" and add:
   
   **For Local Development:**
   ```
   http://localhost:8080
   ```
   ```
   http://127.0.0.1:8080
   ```
   
   **For Production (when you deploy):**
   ```
   https://yourdomain.com
   ```
   ```
   https://www.yourdomain.com
   ```

6. **Add Authorized Redirect URIs**:
   
   Click **"+ ADD URI"** under "Authorized redirect URIs" and add:
   
   **For Local Development:**
   ```
   http://localhost:8080/pages/dashboard.html
   ```
   ```
   http://localhost:8080/pages/login-user.html
   ```
   ```
   http://localhost:8080/pages/register-user.html
   ```
   
   **For Production (when you deploy):**
   ```
   https://yourdomain.com/pages/dashboard.html
   ```
   ```
   https://yourdomain.com/pages/login-user.html
   ```
   ```
   https://yourdomain.com/pages/register-user.html
   ```

7. Click **"CREATE"**

---

### **Step 5: Get Your Client ID**

1. After creation, a popup will show your credentials:
   - **Your Client ID**: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`
   - **Your Client Secret**: `XXXXXX-XXXXXXXXXXXXXXXXXXXX`

2. **IMPORTANT**: Copy your **Client ID** (you'll need this for your app)

3. You can also download the JSON file for backup

4. Click **"OK"**

---

### **Step 6: Update Your Application**

1. Open `js/config.js` in your SortSense project

2. Replace the `GOOGLE_CLIENT_ID` with your new Client ID:

```javascript
const APP_CONFIG = {
    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: 'YOUR-NEW-CLIENT-ID.apps.googleusercontent.com',
    
    // Backend endpoints
    ENDPOINTS: {
        USER_LOGIN: '/api/auth/login',
        USER_REGISTER: '/api/auth/register',
        ADMIN_LOGIN: '/api/auth/admin/login',
        GOOGLE_AUTH: '/api/auth/google'
    }
};
```

3. Save the file

---

### **Step 7: Update Login and Register Pages**

Make sure your HTML files use the correct Client ID:

**In `pages/login-user.html` and `pages/register-user.html`:**

```html
<div id="g_id_onload"
    data-client_id="YOUR-NEW-CLIENT-ID.apps.googleusercontent.com"
    data-context="signin"
    data-ux_mode="popup"
    data-callback="handleGoogleSignIn"
    data-auto_prompt="false">
</div>
```

---

## 🧪 Testing Your Setup

### **1. Start Local Server**

Run this command in your project directory:
```bash
python -m http.server 8080
```

Or use VS Code Live Server, Node.js http-server, etc.

### **2. Access Your Application**

Open your browser and go to:
```
http://localhost:8080/pages/login-user.html
```

### **3. Test Google Sign-In**

1. Click the **"Sign in with Google"** button
2. A Google Sign-In popup should appear
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard

---

## 🔍 Troubleshooting

### **Error: "Not a valid origin for the client"**

**Cause**: The origin you're accessing from is not authorized.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Add the exact origin (e.g., `http://localhost:8080`)
4. Save and wait 5-10 minutes for changes to propagate

---

### **Error: "redirect_uri_mismatch"**

**Cause**: The redirect URI is not authorized.

**Solution**:
1. Check the error message for the exact redirect URI being used
2. Add that exact URI to "Authorized redirect URIs" in Google Cloud Console
3. Save and wait for changes to propagate

---

### **Error: "Access blocked: This app's request is invalid"**

**Cause**: OAuth consent screen is not properly configured.

**Solution**:
1. Go to OAuth consent screen in Google Cloud Console
2. Make sure all required fields are filled
3. Add your email to test users
4. Publish the app or keep it in testing mode with authorized users

---

### **Google Sign-In Button Not Showing**

**Possible Causes & Solutions**:

1. **Not using a local server**:
   - Don't open HTML files directly (`file://` protocol)
   - Use `http://localhost:8080` instead

2. **Script not loading**:
   - Check browser console for errors
   - Make sure `https://accounts.google.com/gsi/client` is loading

3. **Client ID mismatch**:
   - Verify Client ID in `config.js` matches Google Cloud Console
   - Verify Client ID in HTML `data-client_id` attribute

---

### **Changes Not Taking Effect**

**Solution**:
1. Wait 5-10 minutes after saving changes in Google Cloud Console
2. Clear browser cache and cookies
3. Try in incognito/private browsing mode
4. Hard refresh the page (Ctrl + Shift + R or Cmd + Shift + R)

---

## 🌐 Production Deployment Checklist

When deploying to production:

### **1. Update OAuth Consent Screen**
- Add your production domain to "Authorized domains"
- Update Application home page URL
- Add Privacy Policy and Terms of Service URLs
- Consider publishing the app (move from Testing to Production)

### **2. Update OAuth Client**
- Add production JavaScript origins:
  ```
  https://yourdomain.com
  https://www.yourdomain.com
  ```
- Add production redirect URIs:
  ```
  https://yourdomain.com/pages/dashboard.html
  https://yourdomain.com/pages/login-user.html
  https://yourdomain.com/pages/register-user.html
  ```

### **3. Update Application Code**
- Update `config.js` with production endpoints
- Ensure HTTPS is used (Google Sign-In requires HTTPS in production)
- Test thoroughly before launch

### **4. Security Best Practices**
- Never commit Client Secret to version control
- Use environment variables for sensitive data
- Implement proper backend validation of Google tokens
- Set up CORS properly on your backend

---

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🎯 Quick Reference

### **Current Configuration**

**Client ID (from config.js):**
```
874714261612-hcvuc6qnl2a0kvpd9m32tgul14ff2dvs.apps.googleusercontent.com
```

**Local Development URLs:**
- JavaScript Origin: `http://localhost:8080`
- Redirect URIs:
  - `http://localhost:8080/pages/dashboard.html`
  - `http://localhost:8080/pages/login-user.html`
  - `http://localhost:8080/pages/register-user.html`

---

## ✅ Setup Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google Identity Services API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] OAuth 2.0 Client ID created
- [ ] JavaScript origins added
- [ ] Redirect URIs added
- [ ] Client ID copied and saved
- [ ] `config.js` updated with Client ID
- [ ] HTML files updated with Client ID
- [ ] Local server running
- [ ] Google Sign-In tested successfully

---

**Need Help?** Check the Troubleshooting section or refer to Google's official documentation.
