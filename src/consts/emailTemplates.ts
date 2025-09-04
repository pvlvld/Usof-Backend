const EMAIL_TEMPLATES = {
  emailConfirmation: (confirmationLink: string) => {
    return `
    <h1>USOF</h1>
    <br>
    <p>Thank you for registering! Please confirm your email by clicking the link below:</p>
    <a href="${confirmationLink}">${confirmationLink}</a>
    <br>
    <p>If you did not request this email, please ignore it.</p>
    `;
  },
  resetPassword: (confirmationLink: string) => {
    return `
      <h1>USOF</h1>
      <br>
      <p>To reset your password, click the link below:</p>
      <a href="${confirmationLink}">${confirmationLink}</a>
      <br>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;
  }
};

export { EMAIL_TEMPLATES };
