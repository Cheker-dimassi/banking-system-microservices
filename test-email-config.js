/**
 * Email Configuration Test Utility
 * 
 * Run this script to test your email configuration without running the full app
 * 
 * Usage:
 *   node test-email-config.js
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('📧 EMAIL CONFIGURATION TEST');
console.log('='.repeat(60));
console.log();

// Check environment variables
console.log('📋 Environment Variables:');
console.log('----------------------------------------------------------');
console.log('EMAIL_PROVIDER      :', process.env.EMAIL_PROVIDER || '❌ NOT SET');
console.log('EMAIL_FROM          :', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('EMAIL_FROM_NAME     :', process.env.EMAIL_FROM_NAME || '❌ NOT SET');
console.log();

const provider = process.env.EMAIL_PROVIDER?.trim() || 'log';

if (provider === 'sendgrid') {
  console.log('🔷 SENDGRID Configuration:');
  console.log('----------------------------------------------------------');
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  console.log('SENDGRID_API_KEY    :', apiKey ? `✅ SET (${apiKey.substring(0, 10)}...)` : '❌ NOT SET');
  console.log();
  
  if (apiKey) {
    console.log('⚙️  Testing SendGrid...');
    testSendGrid(apiKey, process.env.EMAIL_FROM, 'test@example.com');
  } else {
    console.log('⚠️  Cannot test SendGrid - API key missing');
  }
} else if (provider === 'smtp') {
  console.log('📮 SMTP Configuration:');
  console.log('----------------------------------------------------------');
  console.log('SMTP_HOST           :', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT           :', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_SECURE         :', process.env.SMTP_SECURE || 'false');
  console.log('SMTP_USER           :', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASS           :', process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log();
  
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  
  if (host && user && pass) {
    console.log('⚙️  Testing SMTP connection...');
    testSMTP();
  } else {
    console.log('⚠️  Cannot test SMTP - configuration incomplete');
    console.log('   Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
  }
} else {
  console.log('📝 LOG Provider (Console Only):');
  console.log('----------------------------------------------------------');
  console.log('Emails will only be logged to console.');
  console.log('Set EMAIL_PROVIDER to "sendgrid" or "smtp" to send real emails.');
  console.log();
}

console.log('='.repeat(60));
console.log();

// Test SendGrid
async function testSendGrid(apiKey, from, to) {
  try {
    console.log(`   From: ${from}`);
    console.log(`   To: ${to}`);
    console.log();
    console.log('   Note: This is a dry-run test. To send a real test email,');
    console.log('   install @sendgrid/mail and uncomment the code below.');
    console.log();
    
    // Uncomment to actually send test email:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(apiKey);
    const msg = {
      to,
      from,
      subject: 'Test Email from Service Bank',
      text: 'This is a test email to verify SendGrid configuration.',
    };
    await sgMail.send(msg);
    console.log('✅ Test email sent successfully!');
    */
    
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
  }
}

// Test SMTP
async function testSMTP() {
  try {
    const nodemailer = require('nodemailer');
    
    const config = {
      host: process.env.SMTP_HOST?.trim(),
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim(),
      },
    };
    
    console.log(`   Testing connection to ${config.host}:${config.port}...`);
    console.log();
    
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log();
    
    // Option to send test email
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    readline.question('Send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        readline.question('Enter recipient email: ', async (recipient) => {
          try {
            const info = await transporter.sendMail({
              from: {
                name: process.env.EMAIL_FROM_NAME || 'Service Bank',
                address: process.env.EMAIL_FROM || config.auth.user,
              },
              to: recipient,
              subject: 'Test Email from Service Bank',
              text: 'This is a test email to verify SMTP configuration.\n\nIf you receive this, your email settings are working correctly!',
            });
            
            console.log();
            console.log('✅ Test email sent successfully!');
            console.log('   Message ID:', info.messageId);
            console.log('   Check your inbox (and spam folder).');
          } catch (error) {
            console.error('❌ Failed to send test email:', error.message);
          }
          readline.close();
        });
      } else {
        console.log('Test email cancelled.');
        readline.close();
      }
    });
    
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log();
    console.log('Common issues:');
    console.log('  - Wrong host/port');
    console.log('  - Invalid credentials');
    console.log('  - Firewall blocking connection');
    console.log('  - Need to enable "Less secure app access" or use App Password');
  }
}
