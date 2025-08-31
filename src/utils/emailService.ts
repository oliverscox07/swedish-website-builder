import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_76unw5l';
const EMAILJS_TEMPLATE_ID = 'template_1zpm7al';
const EMAILJS_PUBLIC_KEY = 'glNYzzYqaRdthJxTW';

export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  try {
    // Send via EmailJS
    const templateParams = {
      to_email: email,
      verification_code: code,
      app_name: 'WebBuilder',
      verification_url: window.location.origin + '/verify-code',
      // Ensure the email goes to the correct recipient
      user_email: email
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Verification email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    // Fallback if email fails
    console.log('🔐 Verifieringskod för', email, ':', code);
    alert(`📧 Verifieringskod skickad till ${email}:\n\n${code}\n\nE-post kunde inte skickas, men här är koden.`);
    
    throw error;
  }
};

// Alternative simple approach using a free email service
export const sendVerificationEmailSimple = async (email: string, code: string): Promise<void> => {
  try {
    // Using a simple approach with a free email service
    // This is a placeholder for a real email service implementation
    
    // For now, we'll show the code and provide instructions
    console.log('🔐 Verifieringskod för', email, ':', code);
    
    const message = `
📧 Verifieringskod skickad till ${email}

🔢 Kod: ${code}

ℹ️  I produktion skulle denna kod skickas via e-post.
   För att implementera riktig e-post, använd:
   - SendGrid (gratis upp till 100 e-post/dag)
   - Mailgun (gratis upp till 5,000 e-post/månad)
   - Firebase Functions med nodemailer
   - EmailJS (som redan är installerat)

🌐 Gå till: ${window.location.origin}/verify-code
    `;
    
    alert(message);
  } catch (error) {
    console.error('Error in email service:', error);
    throw error;
  }
};
