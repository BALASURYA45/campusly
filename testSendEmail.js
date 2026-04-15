const sendEmail = require('./backend/src/utils/sendEmail');
require('dotenv').config({ path: './backend/.env' });

console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

(async () => {
  try {
    await sendEmail({
      email: 'balasuryad13062006@gmail.com',
      subject: 'Test Email',
      message: 'This is a test email from the Smart Curriculum app.',
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error.message);
  }
})();