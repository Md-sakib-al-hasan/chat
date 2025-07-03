export const otpTemplate = (name: string, otp: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50;">Hello ${name},</h2>
      <p style="font-size: 16px; color: #555;">Your OTP is:</p>
      <div style="font-size: 28px; font-weight: bold; color: #333; background: #f1f1f1; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 4px;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #777; margin-top: 20px;">Valid for 10 minutes.</p>
    </div>
  </div>
`;