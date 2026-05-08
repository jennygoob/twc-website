const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { first_name, last_name, email, phone, interest, message } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const interestMap = {
      general: 'General Inquiry',
      clarity: 'CLARITY Program',
      'iv-therapy': 'IV Therapy',
      softwave: 'SoftWave',
      aesthetics: 'Aesthetics',
      'peptide-therapy': 'Peptide Therapy',
      other: 'Other',
    };

    await resend.emails.send({
      from: 'THE WELLNESS CO. Website <clarity@urwellness.co>',
      to: ['info@urwellness.co'],
      replyTo: email,
      subject: `Website Contact: ${first_name} ${last_name} — ${interestMap[interest] || 'General'}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="font-family:Playfair Display,serif;color:#2A2A2A;border-bottom:2px solid #C6A96C;padding-bottom:12px;">
            New Website Contact Form Submission
          </h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px 0;font-weight:600;width:120px;">Name:</td><td style="padding:8px 0;">${esc(first_name)} ${esc(last_name)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;">Email:</td><td style="padding:8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding:8px 0;font-weight:600;">Phone:</td><td style="padding:8px 0;"><a href="tel:${phone.replace(/\D/g, '')}">${esc(phone)}</a></td></tr>` : ''}
            <tr><td style="padding:8px 0;font-weight:600;">Interest:</td><td style="padding:8px 0;">${interestMap[interest] || 'Not specified'}</td></tr>
          </table>
          ${message ? `<div style="background:#FAF8F5;padding:16px;border-left:3px solid #C6A96C;margin:16px 0;"><strong>Message:</strong><br>${esc(message).replace(/\n/g, '<br>')}</div>` : ''}
          <p style="color:#888;font-size:12px;margin-top:24px;">Submitted from www.urwellness.co/contact</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
