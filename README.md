# SortSense - Smart Waste Management System

## 🌱 Overview
SortSense is a professional web application for smart waste management with AI-powered waste detection, localized disposal guidelines, and green score rewards.

## 🚀 Running the Application

### Quick Start
```bash
# Navigate to the project directory
cd c:\Users\Eban\OneDrive\Documents\sortsense\SORTSENSE

# Start the local development server
python -m http.server 3000

# Open in browser
http://localhost:3000
```

### Alternative Methods
- **File System**: Open `index.html` directly in a browser
- **Live Server**: Use VS Code Live Server extension
- **Node.js**: `npx http-server -p 3000`

## 🔐 Google Sign-In Integration

### Current Status: ✅ **CONFIGURED**

Your Google OAuth Client ID is integrated across all authentication pages:
- **Client ID**: `874714261612-hcvuc6qnl2a0kvpd9m32tgul14ff2dvs.apps.googleusercontent.com`

### Features
- ✅ Google Sign-In on Login Page
- ✅ Google Sign-Up on Registration Page  
- ✅ JWT Token Parsing
- ✅ User Profile Extraction
- 📝 Backend Integration (pending)

### Testing Google Sign-In

1. **Start the server** (required for Google OAuth):
   ```bash
   python -m http.server 3000
   ```

2. **Navigate to authentication pages**:
   - Login: `http://localhost:3000/pages/login-user.html`
   - Register: `http://localhost:3000/pages/register-user.html`

3. **Click "Sign in with Google"** or **"Sign up with Google"**

4. **Authorize with your Google account**

5. **View the response**:
   - JWT token will be decoded
   - User info (name, email, picture) will be displayed
   - Check browser console for detailed logs

### Important Notes

⚠️ **Google Sign-In requires a web server** (not `file://`)
- Use `http://localhost:3000` ✅
- Don't use `file:///c:/Users/...` ❌

🔒 **Authorized Origins**
Make sure these are added to your Google Cloud Console:
- `http://localhost:3000`
- `http://localhost:5173`
- Your production domain when ready

### Backend Integration (Next Steps)

The frontend is ready! Now you need to:

1. **Create backend endpoints**:
   ```javascript
   POST /api/auth/google/login
   POST /api/auth/google/register
   POST /api/auth/admin/login
   ```

2. **Verify the JWT token** on your backend:
   ```python
   # Example using Python/Flask
   from google.oauth2 import id_token
   from google.auth.transport import requests
   
   idinfo = id_token.verify_oauth2_token(
       token, 
       requests.Request(), 
       "YOUR_CLIENT_ID"
   )
   ```

3. **Update the endpoint URLs** in your JavaScript files:
   - Currently showing alerts (demo mode)
   - Replace with actual API calls

## 📁 Project Structure

```
SORTSENSE/
├── index.html              # Landing page
├── pages/
│   ├── login-admin.html    # Admin login (NEW & PROFESSIONAL)
│   ├── login-user.html     # User login (with Google Sign-In)
│   └── register-user.html  # User registration (with Google Sign-Up)
├── css/
│   └── style.css           # Global styles
├── js/
│   ├── script.js           # Main JavaScript
│   └── config.js           # Google OAuth configuration
└── images/
    └── hero-ai.png         # Hero section image
```

## 🎨 Design Features

### Admin Portal
- **Split-screen design** with administrative branding
- **Security badge** with SSL encryption indicator
- **Admin badge** with pulsing animation
- **Warning notice** for unauthorized access
- **Two-factor authentication** field (optional)
- **Dark gradient theme** for authority

### User Authentication
- **Modern split-screen layout**
- **Google Sign-In integration**
- **Smooth animations and transitions**
- **Glassmorphism effects**
- **Responsive design**
- **SEO optimized**

## 🔧 Configuration

### Google OAuth Settings
Edit `js/config.js` to update:
- Client ID
- API endpoints
- OAuth scopes

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/index.html` | Landing page with hero section |
| User Login | `/pages/login-user.html` | User authentication |
| User Register | `/pages/register-user.html` | New user signup |
| **Admin Login** | `/pages/login-admin.html` | **Professional admin portal** |

## 🎯 Access Points

- **Landing Page**: Click "Admin" button (top-right) → Admin Login
- **User Login**: Click "Login" button → User authentication
- **Registration**: Click "Get Started" → New user signup

## 💡 Features

### User Features
- 🤖 AI-powered waste detection
- 📍 Localized disposal guidelines (Kerala & India)
- ⚠️ Hazardous material warnings
- 🏆 Green score rewards system
- 🔐 Google Sign-In authentication

### Admin Features
- 🛡️ Secure admin portal
- 📊 System monitoring dashboard
- 💾 Data management tools
- 📈 Analytics and reporting
- 🔒 Two-factor authentication support

## 🌐 Browser Support
- Chrome (recommended)
- Edge
- Firefox
- Safari

## 📝 Next Steps

1. ✅ **Frontend Complete**: All UI pages are ready
2. ⏳ **Backend Setup**: Create API endpoints
3. ⏳ **Database**: Set up user and admin tables
4. ⏳ **Google OAuth**: Complete backend verification
5. ⏳ **Deployment**: Deploy to production server

## 🤝 Support

For questions or issues:
- Check browser console for errors
- Verify Google OAuth setup in Google Cloud Console
- Ensure server is running on correct port

---

**Last Updated**: December 17, 2025  
**Version**: 1.0.0  
**Status**: Frontend Complete ✓ | Backend Pending ⏳
