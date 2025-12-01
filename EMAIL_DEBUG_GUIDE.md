# Email Notification Debug Guide

## Issue: Emails not being received after mouvement table updates

---

## ✅ Code Analysis Results

The email notification system **IS IMPLEMENTED** correctly in the code:
- ✅ `mouvementService.ts` calls `notificationService.sendEmail()` 
- ✅ Notifications triggered on: CREATE, UPDATE, DELETE operations
- ✅ Error handling in place (catches and logs errors)

---

## 🔍 Troubleshooting Steps

### 1. Check Environment Variables

Your `.env` file **MUST** contain the following variables (check which provider you're using):

#### Option A: Using SendGrid
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Service Bank
```

#### Option B: Using SMTP
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Service Bank
```

#### Option C: Testing (Log Only)
```env
EMAIL_PROVIDER=log
# No other variables needed - will only log to console
```

---

### 2. Check Server Logs

When you create/update/delete a mouvement, look for these log messages:

```
[NotificationService] provider: <provider> from: <email> to: <recipient>
```

**If you see:**
- `SENDGRID_API_KEY missing. Falling back to log provider.` → Your SendGrid API key is missing
- `Incomplete SMTP configuration. Falling back to log provider.` → Your SMTP config is incomplete
- `Compte sans email, notification non envoyée` → The account doesn't have an email address
- `Erreur envoi notification: <error>` → The actual error message will be shown

---

### 3. Verify Account Has Email

Check that the `compte` (account) has an email address:

```bash
# Using curl or Postman
GET http://localhost:3000/api/comptes/:id

# Response should include:
{
  "data": {
    "_id": "...",
    "email": "user@example.com",  # ← MUST EXIST
    ...
  }
}
```

**If email is missing**, update the account:
```bash
PUT http://localhost:3000/api/comptes/:id
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

### 4. Test Email Configuration

#### Test with LOG provider (easiest):
1. Set `EMAIL_PROVIDER=log` in `.env`
2. Restart server
3. Create a mouvement
4. Check console logs for:
```
[NotificationService] (LOG provider) Sending email: {
  to: 'user@example.com',
  subject: 'Transaction create',
  body: '...'
}
```

#### Test with SendGrid:
1. Get API key from https://app.sendgrid.com/settings/api_keys
2. Set `EMAIL_PROVIDER=sendgrid` and `SENDGRID_API_KEY=...` in `.env`
3. Verify sender email in SendGrid dashboard
4. Restart server and test

#### Test with SMTP (Gmail example):
1. Enable 2FA on Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Set SMTP config in `.env` (see above)
4. Restart server and test

---

### 5. Check Email Provider Issues

#### SendGrid:
- ✅ Verify API key is valid
- ✅ Sender email must be verified in SendGrid
- ✅ Check SendGrid dashboard for delivery status
- ✅ Check spam folder

#### SMTP:
- ✅ Verify credentials are correct
- ✅ Check firewall/network allows SMTP connection
- ✅ For Gmail: Must use App Password (not account password)
- ✅ Check spam folder

---

## 🛠️ Quick Fix Commands

### 1. View current logs when creating mouvement:
```bash
# Watch server logs in real-time
npm run dev

# In another terminal, create a mouvement:
curl -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "YOUR_COMPTE_ID",
    "typeMouvement": "CREDIT",
    "montant": 100,
    "description": "Test notification"
  }'
```

### 2. Check if .env is loaded:
Add this temporary debug line to `src/services/notificationService.ts` line 42:
```typescript
console.log('[DEBUG] EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
console.log('[DEBUG] EMAIL_FROM:', process.env.EMAIL_FROM);
```

### 3. Test nodemailer directly (if using SMTP):
```bash
npm install
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'your@email.com', pass: 'your-app-password' }
});
transporter.sendMail({
  from: 'your@email.com',
  to: 'recipient@example.com',
  subject: 'Test',
  text: 'Test email'
}).then(info => console.log('Success:', info)).catch(e => console.error('Error:', e));
"
```

---

## 📋 Checklist

- [ ] `.env` file exists in project root
- [ ] `EMAIL_PROVIDER` is set to `sendgrid`, `smtp`, or `log`
- [ ] Required credentials are set based on provider
- [ ] Server restarted after .env changes
- [ ] Account (`compte`) has valid email address
- [ ] Check server console logs for notification messages
- [ ] Check email spam/junk folder
- [ ] For SendGrid: Sender email is verified
- [ ] For SMTP: Using App Password (not account password)

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No logs at all | `.env` file not in root or `dotenv` not loading |
| "Falling back to log provider" | Missing or invalid API key/SMTP credentials |
| "Compte sans email" | Update account to include email field |
| Emails sent but not received | Check spam folder, verify sender domain |
| SMTP auth failed | Use App Password, not account password |
| Connection timeout | Check firewall, network restrictions |

---

## 📝 Working Example

Here's a complete working configuration for testing:

### .env (using Gmail SMTP)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/servicebank

# Server
PORT=3000
NODE_ENV=development

# Email - SMTP (Gmail)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourapp@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=yourapp@gmail.com
EMAIL_FROM_NAME=Service Bank
```

### Test Sequence:
```bash
# 1. Start server
npm run dev

# 2. Create account with email
curl -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{
    "numeroCompte": "ACC123456",
    "nomTitulaire": "John Doe",
    "email": "recipient@example.com",
    "solde": 1000
  }'

# 3. Create mouvement (should trigger email)
curl -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "<COMPTE_ID_FROM_STEP_2>",
    "typeMouvement": "DEBIT",
    "montant": 50,
    "description": "Test transaction"
  }'

# 4. Check logs for:
# [NotificationService] provider: smtp from: yourapp@gmail.com to: recipient@example.com
# [NotificationService][SMTP] sendMail result: { messageId: '...', ... }
```

---

## 💡 Need More Help?

If emails still don't work after following this guide:

1. **Share the server logs** when creating a mouvement
2. **Confirm your EMAIL_PROVIDER** value
3. **Check if the account has an email** field
4. **Try with `EMAIL_PROVIDER=log`** first to verify the code path works

The code is correct - it's most likely a configuration issue! 🎯
