// /api/daily-digest.js
// Sends daily Lacuna digest to chanvit.kasetpiban@gmail.com at 00:00 Bangkok (17:00 UTC)
// Triggered by Vercel cron — see vercel.json

const LAUNCH_DATE = new Date('2026-05-03T00:00:00+07:00');
const TO_EMAIL = 'chanvit.kasetpiban@gmail.com';
const FROM_EMAIL = 'Lacuna <onboarding@resend.dev>';
const SITE = 'https://lacuna.page';

const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function thaiDate(d) {
  // Convert to Bangkok time
  const bangkok = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  return `${bangkok.getDate()} ${TH_MONTHS[bangkok.getMonth()]} ${bangkok.getFullYear() + 543}`;
}

function getPriority(daysSince) {
  if (daysSince <= 1) return {
    title: 'DM 5 เพื่อนสนิท',
    detail: 'ส่ง lacuna.page ให้เพื่อนสนิท 5 คนพร้อมข้อความ "ลองดูแล้วบอกความรู้สึกหน่อย" — feedback แรกสำคัญที่สุด'
  };
  if (daysSince <= 3) return {
    title: 'โพสต์ launch thread บน X',
    detail: 'ใช้ thread 7 tweets ที่ Claude เขียนไว้ — ตอนนี้พี่มี 30-50 คนที่ DM ไปแล้ว เขาน่าจะ retweet'
  };
  if (daysSince <= 7) return {
    title: 'Pitch essay #1 ไป publications',
    detail: 'ส่ง cold email ไป 3-5 newsletters: Maybe Baby, Dense Discovery, Ask Polly — ใช้ "Three Days" essay เป็น hook'
  };
  if (daysSince <= 14) return {
    title: 'เริ่ม draft essay #2',
    detail: '"On Forgiveness, and the Letters We Write to Ourselves" — content compounds มากกว่า marketing'
  };
  if (daysSince <= 30) return {
    title: 'Plan Phase 2 — build the app',
    detail: 'ถ้า waitlist > 100 = signal ดี ลุยต่อ Next.js + Supabase setup'
  };
  return {
    title: 'Review & decide direction',
    detail: 'ผ่านมา 30+ วัน ดู metrics: waitlist size, traffic, feedback → ตัดสินใจ scale หรือ pivot'
  };
}

async function checkSite(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

function buildHtml(data) {
  const { date, daysSince, sites, priority } = data;
  const allOk = sites.every(s => s.ok);
  const statusEmoji = allOk ? '🟢' : '🔴';
  const statusText = allOk ? 'ทุกหน้าออนไลน์' : 'มีหน้าที่มีปัญหา';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; background: #f5f3ee; color: #2a2a3e; max-width: 580px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  .header { text-align: center; padding: 2rem 0 1.5rem; border-bottom: 1px solid #d4c2a0; }
  h1 { font-style: italic; font-weight: 400; font-size: 2.2rem; color: #1a1d35; margin: 0 0 0.5rem; }
  .meta { font-size: 0.85rem; color: #8a8098; letter-spacing: 0.1em; }
  h2 { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #6b6478; margin: 2.5rem 0 1rem; font-weight: 400; }
  .stat-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #e8e4dc; }
  .stat-label { color: #8a8098; }
  .stat-value { color: #1a1d35; font-weight: 500; }
  ol { padding-left: 1.5rem; }
  ol li { margin-bottom: 0.75rem; }
  .priority-box { background: #fef3e8; border-left: 3px solid #e8a87c; padding: 1.25rem 1.5rem; margin: 1rem 0; border-radius: 2px; }
  .priority-title { font-style: italic; font-size: 1.15rem; color: #1a1d35; margin-bottom: 0.5rem; font-weight: 500; }
  .priority-detail { font-size: 0.95rem; color: #5a5468; }
  .footer { text-align: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #d4c2a0; font-size: 0.8rem; color: #8a8098; font-style: italic; }
  .footer a { color: #c4896a; text-decoration: none; }
</style>
</head>
<body>

<div class="header">
  <h1>🌙 Lacuna Daily Digest</h1>
  <div class="meta">${date} · DAY ${daysSince}</div>
</div>

<h2>📊 Status</h2>
<div class="stat-row">
  <span class="stat-label">Site health</span>
  <span class="stat-value">${statusEmoji} ${statusText}</span>
</div>
${sites.map(s => `
<div class="stat-row">
  <span class="stat-label">${s.label}</span>
  <span class="stat-value">${s.ok ? '✓' : '✗'} ${s.status || 'error'}</span>
</div>`).join('')}

<h2>📈 ตัวเลข 24 ชม.</h2>
<div class="stat-row">
  <span class="stat-label">Days since launch</span>
  <span class="stat-value">${daysSince}</span>
</div>
<div class="stat-row">
  <span class="stat-label">Pages indexed (sitemap)</span>
  <span class="stat-value">3</span>
</div>
<div class="stat-row">
  <span class="stat-label">📝 Note</span>
  <span class="stat-value" style="font-style: italic; font-size: 0.85rem;">Vercel Analytics ดูใน dashboard</span>
</div>

<h2>🔍 AI วิเคราะห์</h2>
<ol>
  <li><strong>สถานะวันนี้:</strong> Lacuna ${allOk ? 'ทำงานเรียบร้อย ทุก URL ตอบสนองดี' : 'มีบางหน้าที่อาจมีปัญหา ตรวจ logs ก่อน'}</li>
  <li><strong>สิ่งที่น่าสังเกต:</strong> ผ่านมา ${daysSince} วันหลัง launch ${daysSince < 7 ? '— ช่วงสำคัญในการ seed audience' : daysSince < 30 ? '— ควรเริ่ม content cadence' : '— ดู signal เพื่อตัดสินใจทิศทาง'}</li>
  <li><strong>แนะนำพรุ่งนี้:</strong> ${priority.detail}</li>
</ol>

<h2>🎯 Today's Priority</h2>
<div class="priority-box">
  <div class="priority-title">${priority.title}</div>
  <div class="priority-detail">${priority.detail}</div>
</div>

<div class="footer">
  ส่งทุกวัน 00:00 Bangkok · automated digest<br>
  <a href="https://lacuna.page">lacuna.page</a> · made quietly in Bangkok
</div>

</body>
</html>`;
}

export default async function handler(req, res) {
  // Optional: protect with cron secret
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const today = new Date();
  const daysSince = Math.max(0, Math.floor((today - LAUNCH_DATE) / 86400000));

  // Health-check key URLs
  const urls = [
    { label: 'Landing', url: SITE },
    { label: 'Journal', url: SITE + '/journal' },
    { label: 'Three Days essay', url: SITE + '/journal/three-days' },
    { label: 'Sitemap', url: SITE + '/sitemap.xml' },
    { label: 'OG image', url: SITE + '/og-image.png' }
  ];

  const sites = await Promise.all(urls.map(async u => ({
    label: u.label,
    ...(await checkSite(u.url))
  })));

  const priority = getPriority(daysSince);
  const date = thaiDate(today);

  const html = buildHtml({ date, daysSince, sites, priority });
  const subject = `🌙 Lacuna · Day ${daysSince} · ${date}`;

  // Send via Resend
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject,
        html
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'send failed', detail: data });
    }

    return res.status(200).json({ success: true, id: data.id, daysSince });
  } catch (e) {
    console.error('Send error:', e);
    return res.status(500).json({ error: e.message });
  }
}
