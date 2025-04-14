import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  url: string;
}

export async function sendEmail({ to, subject, url }: SendEmailParams) {
  const firstName = to.split("@")[0];

  const { error } = await resend.emails.send({
    from: "Presenteio <noreply@presenteio.app>",
    to,
    subject,
    react: EmailTemplate({
      firstName,
      url,
    }) as React.ReactElement,
  });

  if (error) {
    console.error("[Resend Error]", error);
    throw new Error("Erro ao enviar o e-mail");
  }
}
