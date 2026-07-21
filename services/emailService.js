import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sendEmailService = async ({ to, subject, html, text }) => {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_PASS?.trim();

  if (!gmailUser || !gmailPass) {
    throw new Error('Email credentials are not configured.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const info = await transporter.sendMail({
    from: `GameTopUpDZ <${gmailUser}>`,
    to,
    subject,
    text: text || 'GameTopUpDZ notification',
    html: html || `<p>${escapeHtml(text || 'GameTopUpDZ notification')}</p>`,
  });

  return info;
};
