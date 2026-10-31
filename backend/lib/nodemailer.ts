import env from "../config/env.config";
import nodemailer, { type SendMailOptions } from "nodemailer";

interface SendMailType {
  from?: string;
  to: string;
  subject: string;
  text: string;
  isHTML?: boolean;
}

const transport = nodemailer.createTransport({
  service: env.SMTP_SERVICE,
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

const SendMail = async ({
  from,
  to,
  subject,
  text,
  isHTML = true,
}: SendMailType) => {
  const mailOptions: SendMailOptions = {
    from,
    to,
    subject,
    text: !isHTML ? text : undefined,
    html: isHTML ? text : undefined,
  };
  const result = await transport.sendMail(mailOptions);
  console.log("Mail sent successfully :", result.messageId);
};

export default { SendMail };
