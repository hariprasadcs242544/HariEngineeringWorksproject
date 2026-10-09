/**
 * Optional email dispatcher for order / RFQ tokens
 */
async function sendTokenEmail(enquiry) {
  if (process.env.ENABLE_EMAIL !== 'true') {
    console.log(`[Mailer] Email disabled. Token ${enquiry.token} generated for ${enquiry.email}`);
    return false;
  }

  try {
    // Standard nodemailer integration when configured in .env
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"Hari Engineering Works" <${process.env.SMTP_USER || 'no-reply@hariengineeringworks.com'}>`,
      to: enquiry.email,
      subject: `Tracking Token: ${enquiry.token} - Hari Engineering Works`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0b3c5d;">Hari Engineering Works</h2>
          <p>Dear ${enquiry.name},</p>
          <p>Thank you for submitting your <strong>${enquiry.type || 'Request'}</strong>.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;">Your Reference Token Number:</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0077b6;">${enquiry.token}</p>
          </div>
          <p><strong>Item / Subject:</strong> ${enquiry.productInterested}</p>
          <p>You can track the status of your request anytime on our website using your reference token.</p>
          <p style="margin-top: 25px; color: #64748b; font-size: 13px;">Hari Engineering Works &bull; Industrial Quality & Service Excellence</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email sent successfully to ${enquiry.email} for token ${enquiry.token}`);
    return true;
  } catch (err) {
    console.error(`[Mailer Error] Failed to send email for token ${enquiry.token}:`, err.message);
    return false;
  }
}

module.exports = { sendTokenEmail };
