export const greetingTemplate = (name: string) => {
  return `
    <div style="background-color: #f4f4f4; padding: 20px;">
      <h1 style="text-align: center; color: #333;">Hello ${name},</h1>
      <p style="text-align: center; color: #333;">Welcome to our platform</p>
    </div>
  `;
};

export const resetPasswordTemplate = (name: string, token: string) => {
  return `
    <div style="background-color: #f4f4f4; padding: 20px;">
      <h1 style="text-align: center; color: #333;">Hello ${name},</h1>
      <p style="text-align: center; color: #333;">You requested to reset your password</p>
      <p style="text-align: center; color: #333;">Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password</p>
    </div>
  `;
};
