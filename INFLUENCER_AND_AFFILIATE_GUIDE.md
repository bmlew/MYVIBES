# MYVIBES Partner & Influencer Program Documentation

## 1. Executive Summary

The MYVIBES Partner Program is a hybrid growth engine designed to leverage two key groups:
1.  **B2B Affiliates:** Sales agents or partners who refer restaurants and venues to the platform.
2.  **B2C Influencers:** Social media personalities who drive user downloads and engagement.

The system provides a unified **Partner Portal** where both groups can track their performance, earnings, and payout status.

---

## 2. The Two Revenue Streams

### Stream A: Business Referrals (Affiliate Model)
*   **Target:** Sales agents, hospitality consultants, networking groups.
*   **Action:** Refer a venue (Restaurant, Club, Bar) to sign up for MYVIBES Business.
*   **Mechanism:** The venue enters the Affiliate's **Unique Code** during registration.
*   **Reward:** **10% Recurring Commission** on the venue's monthly subscription fees for as long as they remain active.
*   **Tracking:** Fully automated via the backend `commissions` table.

### Stream B: User Acquisition (Influencer Model)
*   **Target:** Lifestyle influencers, food bloggers, event promoters.
*   **Action:** Drive followers to download the app or book tables.
*   **Mechanism:** Influencers share a **Deep Link** (e.g., `myvibes.app/?ref=VIBEQUEEN`).
*   **Reward:** Campaign-based (e.g., "R500 for every 100 verified downloads" or "R50 per booking").
*   **Tracking:** The system tracks `total_referrals` (signups) and `app_downloads` linked to their code. Remuneration is calculated based on active campaigns.

---

## 3. User Experience & User Flow

### 1. Registration
*   Users access the **Partner Portal** via the Customer App Profile.
*   They register with their Name, Email, Phone, and **Banking Details** (for payouts).
*   The system generates a unique, immutable **Affiliate Code** (e.g., `JOH1234`).

### 2. The Dashboard
The dashboard provides real-time insights:
*   **Pending Payout:** Money earned but not yet paid out.
*   **Total Earnings:** Lifetime earnings history.
*   **Performance Metrics:** App Downloads, Business Referrals.
*   **Tools:**
    *   "Copy Code" button.
    *   "Share Link" generator (creates deep links for social media).
    *   "Bank Details" editor.

### 3. The Referral Process
*   **Business Signup:** When a business registers, they enter the code in the "Affiliate Code" field. The system links the business ID to the Affiliate ID.
*   **User Signup:** When a user opens a link like `/?ref=CODE`, the code is stored in `localStorage`. Upon registration, this code is attached to the new user profile.

---

## 4. Technical Architecture

### Database Schema
The system relies on three core tables in Supabase:

1.  **`affiliates`**
    *   Stores personal info, bank details, and aggregated stats (`pending_balance`, `total_earnings`).
    *   `status`: 'pending', 'approved', 'suspended'.

2.  **`commissions`**
    *   Logs individual earning events.
    *   `type`: 'Subscription' (B2B) or 'Referral' (B2C).
    *   `status`: 'pending' -> 'paid'.

3.  **`payments`**
    *   Tracks outgoing payouts from MYVIBES to the Affiliate.

### Backend Logic (`/supabase/functions/server/`)
*   **Subscription Hook:** Every time a business pays their monthly subscription, the system checks for a `referred_by` ID. If found, it calculates 10% and creates a `pending` commission record for that affiliate.
*   **Referral Hook:** When a user registers with a `referral_code`, the affiliate's `total_referrals` counter is incremented atomically.

---

## 5. Operational Guide (Admin)

### How to Pay Influencers
Since payouts are essentially B2B payments (EFTs), the process is a "Check & Clear" workflow:

1.  **Review:**
    *   Admin views the **Affiliates List** in the Admin Dashboard.
    *   Identify partners with a positive `pending_balance`.
2.  **Pay:**
    *   Use the **Bank Details** provided in the portal to make an EFT payment from the company bank account.
3.  **Clear:**
    *   Click the **"Mark as Paid"** button in the Admin Dashboard for that affiliate.
    *   **System Action:**
        *   Sets `pending_balance` to 0.
        *   Moves amount to `paid_earnings`.
        *   Updates all related `pending` commission records to `paid`.
        *   Logs the payout in the ledger.

---

## 6. Campaign Configuration (Optional)
To run specific influencer campaigns (e.g., "Summer Vibe Drive"), you do not need code changes.
1.  **Define Metric:** "We pay R10 per user signup."
2.  **Measure:** At the end of the month, query the database:
    ```sql
    SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'referral_code' = 'INFLUENCER_CODE' AND created_at > '2023-11-01';
    ```
3.  **Credit:** Manually add a commission record or simply include it in the EFT and mark as paid.
