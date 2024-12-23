export const verificationEmailTemplate = (name: string, token: string) => {
  return `
    <div>
      <h1>Hello, ${name}</h1>
      <p>Thank you for registering on our platform. To complete your registration, please click the link below:</p>
      <a href="${process.env.SERVER_BASE_URL}/auth/verify-email?token=${token}">Verify email</a>
    </div>
  `;
};

export const sendForgotPasswordEmailTemplate = (
  name: string,
  token: string,
) => {
  return `
    <div>
      <h1>Hello, ${name}</h1>
      <p>We received a request to reset your password. To reset your password, please click the link below:</p>
      <a href="${process.env.SERVER_BASE_URL}/auth/reset-password?token=${token}">Reset password</a>
    </div>
  `;
};

export const sendUpdateEmailTemplate = (name: string, token: string) => {
  return `
    <div>
      <h1>Hello, ${name}</h1>
      <p>We received a request to update your email. To verify your email, please click link below:</p>
      <a href="${process.env.SERVER_BASE_URL}/auth/update-email?token=${token}">Update email</a>
    </div>
  `;
};
