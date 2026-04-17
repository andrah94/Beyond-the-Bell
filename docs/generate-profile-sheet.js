#!/usr/bin/env node
// Generates docs/beyond-the-bell-participant-profile-sheet.{html,pdf}
// from the live Google Apps Script feed. Run: node docs/generate-profile-sheet.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const https = require("https");

const FEED = "https://script.google.com/macros/s/AKfycbzM9ngzOZNjdLQpNBPOs9Cgb8hJ7SxpE9SmTz7DIOF632sJa1k26vSd1c4Dg3qu7XnV/exec";
const REPO = path.resolve(__dirname, "..");
const LOCAL_HEADSHOTS = {
  "Jeremiah L. Thomas": path.join(REPO, "public/headshots/jeremiah-thomas.jpg"),
  "Dr. William Blake": path.join(REPO, "public/headshots/dr-william-blake.jpg"),
  "Desmond Williams": path.join(REPO, "public/headshots/desmond-williams.jpg"),
};

function fetchJson(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          return resolve(fetchJson(res.headers.location, redirects - 1));
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function fetchBuffer(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          return resolve(fetchBuffer(res.headers.location, redirects - 1));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(phone || "");
}

async function headshotSrc(p) {
  if (LOCAL_HEADSHOTS[p.fullName] && fs.existsSync(LOCAL_HEADSHOTS[p.fullName])) {
    const buf = fs.readFileSync(LOCAL_HEADSHOTS[p.fullName]);
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  }
  const h = String(p.headshot || "");
  const drive = h.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const url = drive ? `https://lh3.googleusercontent.com/d/${drive[1]}=s800` : h;
  if (!url.startsWith("http")) return null;
  try {
    const buf = await fetchBuffer(url);
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function bioHtml(bio) {
  return String(bio || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("\n        ");
}

function card(p, img) {
  const display = p.preferredName || p.fullName;
  const alt = p.preferredName && p.preferredName !== p.fullName ? p.fullName : null;
  const meta = [p.cityState, p.years ? `${p.years} years in education` : ""]
    .filter(Boolean)
    .join(" &middot; ");
  const notes = [];
  if (p["Dietary / Accessibility"]) {
    notes.push(`<span class="tag"><strong>Dietary/Access:</strong> ${esc(p["Dietary / Accessibility"])}</span>`);
  }
  const contact = [
    p.phone ? `<span>&#9742; ${esc(formatPhone(p.phone))}</span>` : "",
    p.email ? `<span>&#9993; ${esc(p.email)}</span>` : "",
    p.social ? `<span>&#64; ${esc(p.social)}</span>` : "",
  ]
    .filter(Boolean)
    .join("<span class='dot'>&middot;</span>");

  const headshot = img
    ? `<img class="headshot" src="${img}" alt="${esc(display)} headshot">`
    : `<div class="headshot placeholder">${esc(initials(display))}</div>`;

  return `
  <article class="profile">
    <div class="profile-head">
      ${headshot}
      <div class="identity">
        <h2>${esc(display)}</h2>
        ${alt ? `<p class="alt">(${esc(alt)})</p>` : ""}
        ${p.title ? `<p class="title">${esc(p.title)}</p>` : ""}
        ${p.school ? `<p class="school">${esc(p.school)}</p>` : ""}
        ${meta ? `<p class="meta">${meta}</p>` : ""}
        ${notes.length ? `<div class="notes">${notes.join("")}</div>` : ""}
      </div>
    </div>
    <div class="bio">
      ${bioHtml(p.bio)}
    </div>
    ${contact ? `<div class="contact">${contact}</div>` : ""}
  </article>`;
}

function pageHtml(cards, count) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ABLE: Unscripted — Beyond the Bell — Participant Profiles</title>
<style>
  @page { size: Letter; margin: 0.55in 0.65in; }
  * { box-sizing: border-box; }
  html, body {
    font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.45;
    margin: 0;
  }
  .masthead {
    border-bottom: 3px solid #1b7895;
    padding-bottom: 10pt;
    margin-bottom: 14pt;
  }
  .eyebrow {
    font-size: 8.5pt; letter-spacing: 2.5pt; text-transform: uppercase;
    color: #1b7895; font-weight: 600; margin: 0 0 4pt;
  }
  h1 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 28pt; font-weight: 700; margin: 0 0 2pt;
    letter-spacing: -0.5pt;
  }
  .subhead { font-size: 10pt; color: #555; margin: 0; }
  .count {
    font-size: 9pt; color: #888; margin-top: 4pt;
  }
  .profile {
    break-inside: avoid; page-break-inside: avoid;
    border: 1px solid #e4e4e7;
    border-radius: 4pt;
    padding: 12pt;
    margin-bottom: 14pt;
  }
  .profile-head {
    display: flex; gap: 14pt; align-items: flex-start;
    margin-bottom: 8pt;
  }
  .headshot {
    width: 110pt; height: 110pt; object-fit: cover;
    border-radius: 4pt; flex-shrink: 0;
  }
  .headshot.placeholder {
    background: #e0f0f5; color: #1b7895;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 32pt; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .identity h2 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 18pt; margin: 0 0 2pt; color: #1a1a1a;
  }
  .identity .alt {
    font-size: 9pt; color: #888; margin: 0 0 6pt; font-style: italic;
  }
  .identity .title {
    font-size: 10.5pt; font-weight: 600; margin: 0 0 1pt;
  }
  .identity .school {
    font-size: 9.5pt; color: #555; margin: 0;
  }
  .identity .meta {
    font-size: 8.5pt; color: #888; margin: 2pt 0 0;
  }
  .notes { margin-top: 5pt; }
  .tag {
    display: inline-block;
    background: #fff4e6;
    border: 1px solid #f5c78e;
    color: #8a5a00;
    font-size: 8.5pt;
    padding: 2pt 6pt;
    border-radius: 3pt;
  }
  .bio p {
    margin: 0 0 5pt;
    font-size: 9.5pt;
    line-height: 1.5;
    color: #2a2a2a;
  }
  .bio p:last-child { margin-bottom: 0; }
  .contact {
    margin-top: 8pt;
    padding-top: 6pt;
    border-top: 1px solid #e4e4e7;
    font-size: 9pt;
    color: #555;
  }
  .contact span { margin-right: 4pt; }
  .dot { color: #bbb; margin: 0 6pt; }
  .footer {
    margin-top: 12pt;
    padding-top: 8pt;
    border-top: 1px solid #d4d4d8;
    font-size: 8.5pt;
    color: #888;
    text-align: center;
  }
</style>
</head>
<body>
<div class="masthead">
  <p class="eyebrow">The ABLE Foundation Presents &middot; ABLE: Unscripted</p>
  <h1>Beyond the Bell</h1>
  <p class="subhead">Episode 01 &middot; Participant Profiles &middot; Creative &amp; Cultural Impact Pillar</p>
  <p class="count">${count} confirmed participant${count !== 1 ? "s" : ""}</p>
</div>

${cards.join("\n")}

<div class="footer">
  &copy; 2026 The ABLE Foundation &middot; ABLE: Unscripted &middot; Episode 01: Beyond the Bell &middot; Participant Profiles
</div>
</body>
</html>`;
}

(async () => {
  const feed = await fetchJson(FEED);
  const rows = feed.data || feed;
  console.log(`Loaded ${rows.length} participants from the live feed`);

  const cards = [];
  for (const p of rows) {
    const img = await headshotSrc(p);
    cards.push(card(p, img));
  }

  const html = pageHtml(cards, rows.length);
  const htmlPath = path.join(REPO, "docs/beyond-the-bell-participant-profile-sheet.html");
  const pdfPath = path.join(REPO, "docs/beyond-the-bell-participant-profile-sheet.pdf");
  fs.writeFileSync(htmlPath, html);
  console.log(`Wrote ${htmlPath}`);

  execFileSync(
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "inherit" },
  );
  console.log(`Wrote ${pdfPath}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
