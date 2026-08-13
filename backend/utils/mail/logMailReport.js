import MailReport from "../../src/models/MailReport.js";

export async function logMailReport({
  to,
  purpose,
  subject = "",
  status = "sent",
  error = null,
  meta = {},
}) {
  try {
    await MailReport.create({ to, purpose, subject, status, error, meta });
  } catch (err) {
    console.error("❌ Failed to log mail report:", err);
  }
}
