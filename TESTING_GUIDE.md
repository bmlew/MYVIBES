# Testing Guide for MYVIBES

This guide outlines the steps to manually test the system from a clean slate, verifying the registration, approval, and management workflows.

## 1. System Reset (Clean Slate)

To clear all data from the system and start fresh:

1. Navigate to the **Admin Dashboard** by clicking the "🛡️ Admin" button in the top-right developer menu.
2. Located near the "Export CSV" button, click the red **Reset System** button.
3. Confirm the action.
4. **Result**: All businesses, users, reviews, and other data will be permanently deleted. The lists should now be empty.

## 2. Business Registration (Manual)

You can register a new business using the UI or via API calls (Postman/Curl).

### Option A: Using the UI
1. Click the "💼 Business" button in the top-right menu.
2. Select "Register Your Business".
3. Fill in the form with test data:
   - **Business Name**: Test Restaurant
   - **Owner Name**: John Doe
   - **Email**: test@example.com
   - **Phone**: 0123456789
   - **City**: Cape Town
4. Submit the form.
5. **Result**: You should be redirected to the dashboard or see a "Pending Approval" message.

### Option B: Using API (JSON Payload)
**Endpoint**: `POST https://<PROJECT_ID>.supabase.co/functions/v1/make-server-175b2872/auth/business/register`

**Payload**:
```json
{
  "business_name": "Test Restaurant",
  "owner_name": "John Doe",
  "email": "test@example.com",
  "password": "password123",
  "phone": "0821234567",
  "city": "Cape Town",
  "business_type": "Restaurant"
}
```

## 3. Admin Approval

1. Return to the **Admin Dashboard**.
2. Locate the new "Test Restaurant" entry. It should show a status of **Pending**.
3. Click the **Actions** menu (three dots) on the right.
4. Select **Approve Business**.
5. **Result**: The status should update to **Active** (Green checkmark). The business is now live.

## 4. Verification & Suspension

1. Verify the business is Active.
2. Click the **Actions** menu again.
3. Select **Suspend Business**.
4. **Result**: The status should immediately change to **Suspended** (Red badge).
5. Click **Actions** -> **Re-activate Business** to restore it.

## 5. Customer App Visibility

1. Click the "📱 Customer" button in the top-right menu.
2. Verify that "Test Restaurant" appears in the list (when Active).
3. Verify that it disappears when Suspended.
