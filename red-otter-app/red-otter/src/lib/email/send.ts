/**
 * Placeholder email sender.
 *
 * Replace this with a real email service (Resend, SendGrid, Postmark, etc.)
 * when ready to send actual emails. The interface is intentionally simple so
 * swapping implementations only requires changing this file.
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<void> {
  console.log("--- [Email Placeholder] ---");
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body:    ${body}`);
  console.log("--- /Email Placeholder ---");
}
