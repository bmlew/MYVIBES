# 📧 MYVIBE Notification Setup Guide

## Overview

MYVIBE uses **SMTP2GO** for email notifications and **WhatsApp** for instant messaging. This guide will help you configure the notification system.

---

## 🔐 Required Environment Variables

You'll need to configure the following secret in your Supabase dashboard:

### 1. SMTP2GO_API_KEY
- **Purpose**: Send email confirmations to customers and businesses
- **Get it from**: [SMTP2GO Dashboard](https://app.smtp2go.com/)

---

## 📧 Email Setup (SMTP2GO)

### Step 1: Create SMTP2GO Account
1. Go to [https://www.smtp2go.com/](https://www.smtp2go.com/)
2. Sign up for a free account (1,000 emails/month free)
3. Verify your account via email

### Step 2: Generate API Key
1. Log in to [SMTP2GO Dashboard](https://app.smtp2go.com/)
2. Navigate to **Settings → Users**
3. Click **Add New User** or edit existing user
4. Under **API Key**, click **Generate API Key**
5. Copy the API key (it will only be shown once!)

### Step 3: Configure in Figma Make
The SMTP2GO_API_KEY environment variable has already been created for you.

You should have already provided this API key.

### Step 4: Verify Domain (Optional but Recommended)
1. In SMTP2GO dashboard, go to **Settings → Sender Domains**
2. Add your domain (e.g., `myvibe.co.za`)
3. Add the SPF and DKIM records to your DNS
4. Update the `from` address in `/supabase/functions/server/notifications.tsx`:
   ```typescript
   from = 'MYVIBE <noreply@myvibe.co.za>'
   ```

---

## 📱 WhatsApp Setup

### Current Configuration
- **MYVIBE Admin Number**: `27600183904`
- **Purpose**: Receive reservation notifications

### WhatsApp Business API Integration (Future)

To enable WhatsApp notifications to customers, you'll need to integrate with a WhatsApp Business API provider:

#### Option 1: Twilio WhatsApp API
1. Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. Get a WhatsApp-enabled phone number
3. Add these environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`

#### Option 2: 360dialog
1. Sign up at [https://www.360dialog.com/](https://www.360dialog.com/)
2. Get API credentials
3. Follow their WhatsApp Business API setup

#### Option 3: Other Providers
- **Vonage** (formerly Nexmo)
- **MessageBird**
- **Infobip**

### Updating the WhatsApp Code

Once you have a provider, update `/supabase/functions/server/notifications.tsx`:

```typescript
export async function sendWhatsApp({ to, message }: WhatsAppParams): Promise<boolean> {
  try {
    // Example with Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., 'whatsapp:+14155238886'
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioNumber,
          To: `whatsapp:+${to}`,
          Body: message,
        }).toString(),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ WhatsApp sent to ${to}`);
      return true;
    } else {
      console.error('❌ WhatsApp send failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return false;
  }
}
```

---

## 🧪 Testing Notifications

### Test Email Notifications

1. **Make a Test Reservation**:
   - Open the customer app
   - Browse to any restaurant
   - Fill in the reservation form with a valid email
   - Select "Email" as notification preference
   - Submit

2. **Check Logs**:
   ```bash
   # View Supabase function logs
   supabase functions logs make-server-175b2872
   ```

3. **Expected Output**:
   ```
   ✅ Email sent to customer@example.com: Reservation Confirmed at Mr Restaurant - 2026-01-20
   ```

### Test WhatsApp Notifications (Admin)

When any reservation is made, check WhatsApp on `27600183904` for:
```
🔔 NEW RESERVATION via MYVIBE

🏪 Business: Mr Restaurant
👤 Customer: John Doe
📅 2026-01-20 at 19:00
👥 4 people
```

---

## 🎯 Notification Flow

### When a Customer Makes a Reservation:

1. **Customer Confirmation** (Email or WhatsApp based on preference):
   - Beautiful HTML email with reservation details
   - OR WhatsApp message with same info

2. **Business Owner Notification** (Email):
   - Email to restaurant owner with customer details
   - Includes customer contact info for follow-up

3. **Admin Alert** (WhatsApp to `27600183904`):
   - Instant notification about new reservation
   - Quick overview of key details

---

## 📊 Email Templates

All email templates are in `/supabase/functions/server/notifications.tsx`:

- **Customer Confirmation**: Beautiful gradient design with MYVIBE branding
- **Business Notification**: Professional layout with action items
- Both are mobile-responsive and include all reservation details

---

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check API Key**:
   ```bash
   # In Supabase Dashboard → Settings → Edge Functions → Secrets
   # Verify SMTP2GO_API_KEY exists
   ```

2. **Check SMTP2GO Dashboard**:
   - Log in to [app.smtp2go.com](https://app.smtp2go.com/)
   - Go to **Reports → Activity Log**
   - Check for failed sends and error messages

3. **Check Function Logs**:
   ```bash
   supabase functions logs make-server-175b2872 --follow
   ```

4. **Common Issues**:
   - Invalid API key → Regenerate in SMTP2GO
   - Email rejected → Verify sender domain
   - Rate limit → Upgrade SMTP2GO plan

### WhatsApp Not Working

1. **Currently Expected**: WhatsApp is logged but not sent (placeholder implementation)
2. **To Enable**: Follow "WhatsApp Setup" section above
3. **Check**: Console logs will show "WhatsApp message queued"

---

## 💰 Costs

### SMTP2GO Pricing
- **Free Tier**: 1,000 emails/month
- **Starter**: R200/month (~$11) - 10,000 emails
- **Professional**: R600/month (~$35) - 50,000 emails

### WhatsApp Pricing (Twilio Example)
- **Setup**: Free
- **Per Message**: ~R0.10 - R0.50 ($0.005 - $0.02) depending on region
- **Very affordable** for reservation confirmations

---

## 🚀 Next Steps

1. ✅ SMTP2GO_API_KEY configured (already done!)
2. ⏳ Test email notifications by making a reservation
3. ⏳ Sign up for WhatsApp Business API provider (optional)
4. ⏳ Configure WhatsApp environment variables
5. ⏳ Update notification service with WhatsApp API code
6. ⏳ Test end-to-end notification flow

---

## 📞 Support

- **SMTP2GO Support**: [https://www.smtp2go.com/support/](https://www.smtp2go.com/support/)
- **WhatsApp Business**: [https://business.whatsapp.com/](https://business.whatsapp.com/)
- **MYVIBE Admin**: WhatsApp `27600183904`

---

**Last Updated**: January 2026  
**Version**: 1.0
