import env from "../config/env.config";

interface SendMailType {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const SendMail = async ({ from, to, subject, html, text }: SendMailType) => {
  const response = await fetch(env.BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Expenso Support",
        email: from ?? env.BREVO_USER,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      ...(text ? { textContent: text } : {}),
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Brevo API Error (${response.status}): ${JSON.stringify(errorData)}`,
    );
  }
  const result = (await response.json()) as { messageId?: string };
  console.log("Mail sent :", result.messageId);
};

export default { SendMail };
