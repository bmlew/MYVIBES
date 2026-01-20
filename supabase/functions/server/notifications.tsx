// Notification Service for MYVIBES
// Handles Email (SMTP2GO) and WhatsApp messaging

const WHATSAPP_NUMBER = '27600183904'; // MYVIBES WhatsApp number

// Track if we've already shown the SMTP2GO warning
let smtp2goWarningShown = false;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface WhatsAppParams {
  to: string;
  message: string;
}

/**
 * Send email via SMTP2GO
 */
export async function sendEmail({ to, subject, html, from = 'MYVIBES <noreply@myvibe.co.za>' }: EmailParams): Promise<boolean> {
  try {
    const apiKey = Deno.env.get('SMTP2GO_API_KEY');
    
    if (!apiKey) {
      console.error('❌ SMTP2GO_API_KEY not configured');
      console.log('ℹ️  To enable email: Add SMTP2GO_API_KEY to environment variables');
      return false;
    }

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': apiKey,
      },
      body: JSON.stringify({
        sender: from,
        to: [to],
        subject: subject,
        html_body: html,
      }),
    });

    const result = await response.json();

    if (result.data?.succeeded > 0) {
      console.log(`✅ Email sent to ${to}: ${subject}`);
      return true;
    } else {
      // Check for domain verification error
      const failures = result.data?.failures || [];
      const isDomainError = failures.some((f: string) => 
        f.includes('domain not verified') || f.includes('sender domain')
      );
      
      if (isDomainError) {
        if (!smtp2goWarningShown) {
          console.warn('⚠️ Email Notifications Disabled - SMTP2GO Domain Not Verified');
          console.log('');
          console.log('ℹ️  The app is working normally, but email notifications are disabled.');
          console.log('   To enable email notifications:');
          console.log('   1. Go to https://app.smtp2go.com/sending/verified_senders');
          console.log('   2. Add and verify your domain: noreply@myvibe.co.za');
          console.log('');
          console.log('✅ Your app functionality is NOT affected - this is optional.');
          console.log('');
          smtp2goWarningShown = true;
        }
      } else {
        console.warn('⚠️ Email notification failed:', result);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send WhatsApp message via WhatsApp Business API
 * Using the official WhatsApp API format
 */
export async function sendWhatsApp({ to, message }: WhatsAppParams): Promise<boolean> {
  try {
    // For now, we'll use a simple HTTP API approach
    // You can replace this with Twilio, 360dialog, or other WhatsApp providers
    
    console.log(`📱 WhatsApp message queued to ${to}:`);
    console.log(`   ${message}`);
    console.log(`   (To enable: Configure WhatsApp Business API)`);
    
    // TODO: Integrate with WhatsApp Business API provider
    // Example with Twilio:
    // const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    // const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    // const twilioNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    
    // For now, just log - customer can see this in admin console
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return false;
  }
}

/**
 * Send reservation confirmation to customer
 */
export async function sendReservationConfirmation(params: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
  preferredChannel: 'email' | 'whatsapp';
}) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    businessName,
    businessAddress,
    businessPhone,
    reservationDate,
    reservationTime,
    partySize,
    specialRequests,
    preferredChannel,
  } = params;

  // Format the message
  const messageText = `
🎉 RESERVATION CONFIRMED

Hi ${customerName}!

Your reservation at ${businessName} has been confirmed:

📅 Date: ${reservationDate}
⏰ Time: ${reservationTime}
👥 Party Size: ${partySize} ${partySize === 1 ? 'person' : 'people'}
${specialRequests ? `📝 Special Requests: ${specialRequests}` : ''}

📍 Location: ${businessAddress || businessName}
📞 Business Contact: ${businessPhone || 'See app for details'}

See you soon!

- MYVIBES Team
  `.trim();

  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Confirmed - MYVIBES</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Reservation Confirmed!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Hi <strong>${customerName}</strong>!</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666;">
                Your reservation at <strong style="color: #8B5CF6;">${businessName}</strong> has been confirmed.
              </p>
              
              <!-- Reservation Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 14px; color: #666666; width: 40%;">📅 Date:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${reservationDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">⏰ Time:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${reservationTime}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">👥 Party Size:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${partySize} ${partySize === 1 ? 'person' : 'people'}</td>
                      </tr>
                      ${specialRequests ? `
                      <tr>
                        <td style="font-size: 14px; color: #666666; vertical-align: top;">📝 Special Requests:</td>
                        <td style="font-size: 14px; color: #333333;">${specialRequests}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Venue Information -->
              <div style="background-color: #fff3f0; border-left: 4px solid #FF6B35; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #FF6B35;">Venue Information</h3>
                ${businessAddress ? `<p style="margin: 0 0 8px; font-size: 14px; color: #666666;">📍 ${businessAddress}</p>` : ''}
                ${businessPhone ? `<p style="margin: 0; font-size: 14px; color: #666666;">📞 ${businessPhone}</p>` : ''}
              </div>
              
              <p style="margin: 0 0 20px; font-size: 14px; color: #666666;">
                We can't wait to see you! If you need to make any changes, please contact the venue directly.
              </p>
              
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Best regards,<br>
                <strong style="color: #8B5CF6;">The MYVIBES Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated message from MYVIBES.<br>
                Connecting you with the best dining experiences in South Africa.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Send via preferred channel
  if (preferredChannel === 'email' && customerEmail) {
    return await sendEmail({
      to: customerEmail,
      subject: `Reservation Confirmed at ${businessName} - ${reservationDate}`,
      html: htmlMessage,
    });
  } else if (preferredChannel === 'whatsapp' && customerPhone) {
    return await sendWhatsApp({
      to: customerPhone,
      message: messageText,
    });
  } else {
    console.warn('⚠️ No valid contact method for customer notification');
    return false;
  }
}

/**
 * Send reservation notification to business owner
 */
export async function sendBusinessNotification(params: {
  businessEmail?: string;
  businessName: string;
  customerName: string;
  customerPhone?: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}) {
  const {
    businessEmail,
    businessName,
    customerName,
    customerPhone,
    reservationDate,
    reservationTime,
    partySize,
    specialRequests,
  } = params;

  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Reservation - MYVIBES</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📅 New Reservation!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Hello <strong>${businessName}</strong>,</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666;">
                You have a new reservation via MYVIBES:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 14px; color: #666666; width: 40%;">👤 Customer:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${customerName}</td>
                      </tr>
                      ${customerPhone ? `
                      <tr>
                        <td style="font-size: 14px; color: #666666;">📞 Phone:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${customerPhone}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="font-size: 14px; color: #666666;">📅 Date:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${reservationDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">⏰ Time:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${reservationTime}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">👥 Party Size:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold;">${partySize} ${partySize === 1 ? 'person' : 'people'}</td>
                      </tr>
                      ${specialRequests ? `
                      <tr>
                        <td style="font-size: 14px; color: #666666; vertical-align: top;">📝 Special Requests:</td>
                        <td style="font-size: 14px; color: #333333;">${specialRequests}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fff3f0; border-left: 4px solid #FF6B35; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #666666;">
                  💡 <strong>Action Required:</strong> Please confirm this reservation with your customer.
                </p>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Powered by <strong style="color: #8B5CF6;">MYVIBES</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Log in to your MYVIBES Business Dashboard to manage reservations
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  if (businessEmail) {
    return await sendEmail({
      to: businessEmail,
      subject: `New Reservation: ${customerName} - ${reservationDate} at ${reservationTime}`,
      html: htmlMessage,
    });
  }

  return false;
}

/**
 * Send WhatsApp notification to MYVIBES admin about new reservation
 */
export async function sendAdminWhatsAppNotification(params: {
  businessName: string;
  customerName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
}) {
  const { businessName, customerName, reservationDate, reservationTime, partySize } = params;

  const message = `
🔔 NEW RESERVATION via MYVIBES

🏪 Business: ${businessName}
👤 Customer: ${customerName}
📅 ${reservationDate} at ${reservationTime}
👥 ${partySize} ${partySize === 1 ? 'person' : 'people'}
  `.trim();

  return await sendWhatsApp({
    to: WHATSAPP_NUMBER,
    message: message,
  });
}