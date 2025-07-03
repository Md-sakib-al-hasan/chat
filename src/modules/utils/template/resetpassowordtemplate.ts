export const resetPasswordTemplate = (name: string, resetLink: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #FF5722;">Hello ${name},</h2>
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password. Click below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #FF5722; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Reset Password
        </a>
      </div>
    </div>
  </div>
`;