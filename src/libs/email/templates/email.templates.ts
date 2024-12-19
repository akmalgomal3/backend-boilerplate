export const verificationEmailTemplate = (name: string, token: string) => {
  return `
    <div>
      <h1>Hello, ${name}</h1>
      <p>Thank you for registering on our platform. To complete your registration, please click the link below:</p>
      <a href="http://localhost:3001/auth/verify-email?token=${token}">Verify email</a>
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
      <a href="http://localhost:3001/auth/reset-password?token=${token}">Reset password</a>
    </div>
  `;
};
