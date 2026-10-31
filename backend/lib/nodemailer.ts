import env from "../config/env.config";
import nodemailer from "nodemailer";

interface SendMailType {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

const SendMail = async ({ from, to, subject, html, text }: SendMailType) => {
  const result = await transport.sendMail({
    from: from ?? env.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
  console.log("Mail sent:", result.messageId);
};

export default { SendMail };
