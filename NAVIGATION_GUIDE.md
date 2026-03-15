# 🧭 MYVIBES Navigation Guide

## ✅ Perpetual Login Feature

**Good News!** Customer logins are now **PERPETUAL** - customers stay logged in permanently and never have to sign in again unless they explicitly log out.

---

## How to Exit Customer App (Without Logging Out)

### **🏠 From Welcome/Profile Setup Screen:**
- Look for the **X button** in the top-right corner (white circle with X)
- Click it to exit and return to landing page
- **Your session is preserved** - you'll still be logged in when you return!

### **🏠 From Profile Page:**
- Scroll to the bottom of your profile
- Click the **"Exit to Home"** button with home icon 🏠
- Returns to landing page while **keeping you logged in**

### **🚪 To Actually Log Out (Clear Session):**
If you want to log out completely:
1. Tap **Profile icon** (bottom navigation)
2. Tap **"Log Out"** button (top-right corner)
3. This clears your session and logs you out

---

## Navigation from Other Dashboards

### **From Business Dashboard:**
1. **Top navigation bar** has a **"🏠 Landing"** button
2. Click it to return to landing page
3. **OR** scroll to bottom of left sidebar → Click **"Exit Admin"**

### **From Admin Portal:**
1. **Top navigation bar** → Click **"🏠 Landing"** button
2. **OR** if on login screen → Click **"← Back to Landing Page"** link
3. **OR** left sidebar bottom → Click **"Exit Admin"**

---

## Quick Reference Table

| Current View | How to Exit | Session Status |
|--------------|-------------|----------------|
| **Customer App (Welcome)** | Click X button (top-right) | ✅ Stays Logged In |
| **Customer App (Profile)** | Click "Exit to Home" (bottom) | ✅ Stays Logged In |
| **Customer App (Log Out)** | Profile → "Log Out" button | ❌ Logged Out |
| **Business Dashboard** | Click "🏠 Landing" (top nav) | ✅ Stays Logged In |
| **Admin Portal** | Click "🏠 Landing" (top nav) | Depends on action |

---

## Key Features

### 🔒 **Perpetual Login**
- Customers only need to create their profile **ONCE**
- They stay logged in indefinitely
- Even when exiting to landing page, session persists
- Perfect for mobile PWA experience!

### 🏠 **Exit Without Logout**
- "Exit to Home" button lets users return to landing page
- Session stays active in background
- When they return to Customer App, they're still logged in

### 🚪 **Optional Logout**
- "Log Out" button is still available if users want to clear their session
- Only use this if switching accounts or want to start fresh

---

## Browser Refresh (Emergency Method)

If you need to quickly return to landing:
- Press **F5** (Windows/Linux) or **Cmd + R** (Mac)
- This reloads the page and shows landing
- Customer session is still preserved in localStorage!

---

## For Developers

### How It Works:
1. **handleExit()** - Exits to landing WITHOUT clearing localStorage
2. **handleLogout()** - Clears session AND exits to landing
3. **localStorage persistence** - Session token, profile data preserved
4. **Auto-restore** - On return to Customer App, user is auto-logged in

### Session Storage Keys:
- `vibespot_session_token` - Auth token
- `vibespot_customer_profile` - User profile data
- `vibespot_customer_logged_in` - Login flag

These are preserved when using "Exit" buttons, but cleared when using "Log Out".
