import { NextResponse } from "next/server";
import { Resend } from "resend";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzM9ngzOZNjdLQpNBPOs9Cgb8hJ7SxpE9SmTz7DIOF632sJa1k26vSd1c4Dg3qu7XnV/exec";

const NOTIFICATION_RECIPIENTS = [
  "andra.howard@ablethefoundation.org",
  "Grant.Poston@ABLEtheFoundation.org",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to Google Apps Script
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {
      // Google Apps Script forwarding is best-effort
    });

    // Send notification email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fullName = body.fullName || "Unknown";

      await resend.emails.send({
        from: "Beyond the Bell <onboarding@resend.dev>",
        to: NOTIFICATION_RECIPIENTS,
        subject: `New Beyond the Bell Submission: ${fullName}`,
        html: buildEmailHtml(body),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

function buildEmailHtml(data: Record<string, string>): string {
  const field = (label: string, value: string | undefined) =>
    value ? `<tr><td style="padding:8px 12px;font-weight:600;color:#1a1a1a;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:8px 12px;color:#444">${escapeHtml(value)}</td></tr>` : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
      <div style="background:#1b7895;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">Beyond the Bell</h1>
        <p style="color:#d4eef5;margin:8px 0 0;font-size:14px">New Participant Submission</p>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>
            ${field("Full Name", data.fullName)}
            ${field("Preferred Name", data.preferredName)}
            ${field("Professional Title", data.title)}
            ${field("School / Organization", data.school)}
            ${field("Years in Education", data.years)}
            ${field("City & State", data.cityState)}
            ${field("Email", data.email)}
            ${field("Phone", data.phone)}
            ${field("Social Media", data.social)}
            ${field("Dietary / Accessibility", data.dietary)}
          </tbody>
        </table>

        ${data.bio ? `
        <div style="margin-top:20px;padding:16px;background:#f7f7f7;border-radius:6px">
          <h3 style="margin:0 0 8px;font-size:14px;color:#1a1a1a">Professional Bio</h3>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.6">${escapeHtml(data.bio)}</p>
        </div>` : ""}

        ${data.headshot ? `
        <p style="margin-top:16px;font-size:13px;color:#888">📷 Headshot uploaded (${escapeHtml(data.headshotName || "file")})</p>` : ""}

        ${data.anythingElse ? `
        <div style="margin-top:16px;padding:16px;background:#f7f7f7;border-radius:6px">
          <h3 style="margin:0 0 8px;font-size:14px;color:#1a1a1a">Additional Notes</h3>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.6">${escapeHtml(data.anythingElse)}</p>
        </div>` : ""}
      </div>
      <div style="padding:16px 24px;background:#f9f9f9;text-align:center;font-size:12px;color:#999">
        The ABLE Foundation &middot; Beyond the Bell
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
