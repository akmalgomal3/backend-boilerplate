export const verificationEmailTemplate = (name: string, token: string) => {
  return `
    <div>
      <h1>Hello, ${name}</h1>
      <p>Thank you for registering on our platform. To complete your registration, please click the link below:</p>
      <a href="http://localhost:3001/auth/verify-email?token=${token}">Verify email</a>
    </div>
  `;
};
