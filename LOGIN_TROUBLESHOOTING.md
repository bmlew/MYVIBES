# 🔐 Business Login Troubleshooting Guide

## Error: "Invalid email or password"

This error means the login credentials don't match any registered business account.

### ✅ Updated Server Logging

I've added detailed logging to help debug login issues:

**Sign In Logs:**
- `🔐 Business sign in attempt: [email]`
- `✅ Auth successful for user: [user_id]`
- `✅ Business found: [business_id] [business_name]`
- `❌ Auth error during sign in: [error message]`
- `❌ Business not found for user: [user_id]`

### 🔍 Common Causes

1. **Account Not Registered Yet**
   - Solution: Register first using the "Register now" button
   - The registration creates both a Supabase Auth user AND a business record

2. **Wrong Password**
   - Solution: Double-check your password
   - Passwords are case-sensitive

3. **Wrong Email**
   - Solution: Use the exact email you registered with
   - Check for typos or extra spaces

4. **Email Not Confirmed** (rare)
   - Solution: Check your email for confirmation link
   - We auto-confirm emails, so this is unlikely

5. **Business Record Missing**
   - Possible if registration was interrupted
   - Server will log: `❌ Business not found for user: [user_id]`
   - Solution: Try registering again or contact support

### 🧪 How to Test

1. **Register a New Account:**
   ```
   - Business Name: "Test Restaurant"
   - Owner Name: "Test Owner"
   - Email: "test@business.com"
   - Phone: "082 123 4567"
   - City: "Johannesburg"
   - Address: "123 Test Street"
   - Password: "test123456"
   ```

2. **Check Server Logs:**
   - Look for: `📝 Business registration attempt: test@business.com Test Restaurant`
   - Should see: `✅ Business created: [business_id]`

3. **Try to Sign In:**
   - Use same email/password
   - Check server logs for signin attempt
   - Should see: `🔐 Business sign in attempt: test@business.com`
   - Should see: `✅ Auth successful for user: [user_id]`
   - Should see: `✅ Business found: [business_id] Test Restaurant`

### 🛠️ Debug Steps

**Step 1: Check if Supabase Auth is Working**
- Go to Supabase Dashboard → Authentication → Users
- See if your email is listed
- If not, registration failed

**Step 2: Check if Business Record Exists**
- The server should log business creation
- Look for successful registration in server logs

**Step 3: Verify Credentials**
- Make absolutely sure email and password are correct
- Try copy/pasting to avoid typos

**Step 4: Try a Fresh Registration**
- Use a completely new email address
- Go through full registration flow
- Then try to sign in immediately

### 📊 Error Messages Explained

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Invalid email or password. Please check your credentials and try again." | Supabase Auth rejected login | Check email/password spelling |
| "Please verify your email address before signing in." | Email not confirmed | Check email for confirmation link |
| "Business account not found. Please register first." | Auth succeeded but no business record | Register first or contact support |
| "Sign in failed. Please try again or contact support." | Generic auth error | Check server logs for details |

### 🔧 What I Fixed

**Better Error Messages:**
- More specific feedback on what went wrong
- Helps identify if it's auth issue vs missing business record

**Detailed Logging:**
- Every sign-in attempt is logged with email
- Auth success/failure logged
- Business lookup logged
- Makes it easy to see exactly where the failure occurs

**Error Differentiation:**
- Separates Supabase Auth errors from business lookup errors
- Helps identify root cause faster

### ✨ Next Steps

1. **Try to Register** a test account:
   - Go to Business Auth screen
   - Click "Register now"
   - Fill in all fields
   - Submit registration

2. **Watch Server Logs:**
   - Look for registration confirmation
   - Note the business ID created

3. **Try to Sign In:**
   - Use exact same credentials
   - Watch for sign-in logs
   - Should see successful auth + business found

4. **If Still Failing:**
   - Share the server logs showing:
     - Registration attempt
     - Sign-in attempt
     - Any error messages
   - This will help identify the exact issue

### 🎯 Quick Fix

**Most common issue:** Account not registered yet

**Solution:**
1. Click "Register now" on the login screen
2. Fill in all required fields
3. Submit registration
4. Wait for "Registration successful!" message
5. Then click "Sign In" and use same credentials

The registration process:
- ✅ Creates Supabase Auth user
- ✅ Auto-confirms email (no confirmation needed)
- ✅ Creates business KV record
- ✅ Links user ID to business
- ✅ Sets up subscription
- ✅ Ready to sign in immediately

---

## 🚀 Server Updates Applied

I've updated `/supabase/functions/server/index.tsx` with:

1. **Console logging** for sign-in attempts
2. **Detailed error messages** based on failure type
3. **User ID logging** after successful auth
4. **Business lookup logging** to verify record exists
5. **Specific error** for "account not found" vs "wrong password"

These logs will appear in your Supabase Edge Functions logs and help you debug the exact issue!
