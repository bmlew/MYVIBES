const SMTP2GO_API_KEY = Deno.env.get('SMTP2GO_API_KEY');

export const sendEmail = async (data: { to: string; subject: string; html: string; from?: string }) => {
  if (!SMTP2GO_API_KEY) {
    console.log('⚠️ SMTP2GO_API_KEY not configured, skipping email send');
    return { success: true, mock: true };
  }

  try {
    console.log('📧 Preparing to send email:', {
      to: data.to,
      subject: data.subject,
      from: data.from || 'MYVIBES <noreply@myvibes.co.za>'
    });
    
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
      },
      body: JSON.stringify({
        api_key: SMTP2GO_API_KEY,
        to: [data.to],
        sender: data.from || 'MYVIBES <noreply@myvibes.co.za>',
        subject: data.subject,
        html_body: data.html,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ SMTP2GO API error response:', {
        status: response.status,
        statusText: response.statusText,
        result: result
      });
      throw new Error(`SMTP2GO error: ${JSON.stringify(result)}`);
    }

    console.log('✅ Email sent successfully:', {
      to: data.to,
      subject: data.subject,
      result: result
    });
    return { success: true, result };
  } catch (error) {
    console.error('❌ Error sending email:', {
      error: error.message,
      stack: error.stack,
      to: data.to,
      subject: data.subject
    });
    // Don't throw - just log and return failure
    return { success: false, error: error.message };
  }
};

export const sendReservationConfirmation = async (data: {
  to: string;
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}) => {
  console.log('📧 Sending confirmation email with data:', {
    to: data.to,
    customerName: data.customerName,
    businessName: data.businessName,
    date: data.date,
    time: data.time,
    partySize: data.partySize,
    specialRequests: data.specialRequests
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Reservation Confirmed! 🎉</h2>
      <p>Dear ${data.customerName},</p>
      <p>Great news! Your reservation at <strong>${data.businessName}</strong> has been confirmed.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
        <p style="margin: 5px 0;"><strong>Party Size:</strong> ${data.partySize} guests</p>
        ${data.specialRequests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
      </div>
      
      <p>We look forward to seeing you! If you need to make any changes to your reservation, please contact us directly.</p>
      <p>Best regards,<br/>${data.businessName}</p>
    </div>
  `;

  return sendEmail({
    to: data.to,
    subject: `Reservation Confirmed - ${data.businessName}`,
    html,
  });
};

export const sendReservationRejection = async (data: {
  to: string;
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  partySize: number;
  reason: string;
}) => {
  console.log('📧 Sending rejection email with data:', {
    to: data.to,
    customerName: data.customerName,
    businessName: data.businessName,
    date: data.date,
    time: data.time,
    partySize: data.partySize,
    reason: data.reason
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Reservation Update</h2>
      <p>Dear ${data.customerName},</p>
      <p>Unfortunately, <strong>${data.businessName}</strong> is unable to accommodate your reservation request for:</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
        <p style="margin: 5px 0;"><strong>Party Size:</strong> ${data.partySize} guests</p>
      </div>
      
      <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Reason:</strong> ${data.reason || 'Not available'}</p>
      </div>
      
      <p>We apologize for any inconvenience. Please feel free to contact us directly to explore alternative dates or times.</p>
      <p>Best regards,<br/>${data.businessName}</p>
    </div>
  `;

  return sendEmail({
    to: data.to,
    subject: `Reservation Update - ${data.businessName}`,
    html,
  });
};

export const sendBusinessNotification = async (data: any) => {
  console.log('📧 [Mock] Sending business notification:', data);
  return { success: true };
};