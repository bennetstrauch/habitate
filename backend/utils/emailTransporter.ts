import fs from "fs";

type Attachment = {
  filename: string;
  path?: string;
  content?: string | Buffer;
  cid?: string;
};

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Attachment[];
};

async function sendMail(options: MailOptions): Promise<void> {
  const fromMatch = options.from.match(/^"(.+)" <(.+)>$/);
  const senderName = fromMatch?.[1] ?? "Habitate";
  const senderEmail = fromMatch?.[2] ?? options.from;

  const body: Record<string, unknown> = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: options.to }],
    subject: options.subject,
    ...(options.html ? { htmlContent: options.html } : { textContent: options.text }),
  };

  if (options.attachments?.length) {
    const inlineImages = options.attachments
      .filter((a) => a.cid)
      .map((a) => {
        const content = a.path
          ? fs.readFileSync(a.path).toString("base64")
          : Buffer.isBuffer(a.content)
          ? a.content.toString("base64")
          : Buffer.from(a.content ?? "").toString("base64");
        return { name: a.filename, content, cid: a.cid };
      });
    if (inlineImages.length) body.inlineImages = inlineImages;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${error}`);
  }
}

export const transporter = { sendMail };
