const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Konfigurera e-post transport
const transporter = nodemailer.createTransporter({
  service: 'gmail', // eller använd SMTP
  auth: {
    user: 'din-email@gmail.com', // Din Gmail-adress
    pass: 'din-app-lösenord' // Gmail app-lösenord (inte ditt vanliga lösenord)
  }
});

exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email och kod krävs');
  }

  try {
    const mailOptions = {
      from: 'din-email@gmail.com',
      to: email,
      subject: 'Verifiera din e-post - WebBuilder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Verifiera din e-post</h2>
          <p>Hej!</p>
          <p>Din verifieringskod är:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4f46e5; font-size: 32px; margin: 0; font-family: monospace;">${code}</h1>
          </div>
          <p>Ange denna kod på verifieringssidan för att aktivera ditt konto.</p>
          <p>Koden utgår om 5 minuter.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Om du inte försökte skapa ett konto, kan du ignorera detta e-postmeddelande.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Verifieringskod skickad' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Kunde inte skicka e-post');
  }
});
