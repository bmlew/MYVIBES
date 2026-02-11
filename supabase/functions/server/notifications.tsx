
export const sendReservationConfirmation = async (data: any) => {
  console.log('📧 [Mock] Sending reservation confirmation:', data);
  return { success: true };
};

export const sendBusinessNotification = async (data: any) => {
  console.log('📧 [Mock] Sending business notification:', data);
  return { success: true };
};

export const sendEmail = async (data: any) => {
  console.log('📧 [Mock] Sending email:', data);
  return { success: true };
};
