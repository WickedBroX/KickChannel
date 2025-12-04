import crypto from 'crypto';

export const generateEmailToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = (email: string, token: string) => {
  // In production, use req.protocol + req.get('host') or env var
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;
  console.log(`
==================================================
[MOCK EMAIL SERVICE]
To: ${email}
Subject: Verify your email
Body: Please click the following link to verify your account:
${link}
==================================================
`);
};
