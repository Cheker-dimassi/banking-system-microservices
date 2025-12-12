# 📧 TESTING EMAIL NOTIFICATIONS (AYMAN'S FEATURE)

## 📋 EMAIL FEATURE OVERVIEW

Ayman implemented **automatic email notifications** in the accounts-service!

**Emails are automatically sent when:**
- ✅ Admin credits an account (POST /credit/:id)
- ✅ Admin debits an account (POST /debit/:id)

---

## 🎯 HOW TO TEST

### **Method 1: Log-Only Mode (Default - NO SETUP NEEDED)**

By default, emails are just logged to console (not actually sent).

**Test it:**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 500,
  "description": "Test email",
  "adminUser": "admin@test.com"
}
```

**Check Docker logs:**
```bash
docker logs accounts-service
```

**You'll see:**
```
[NotificationService] (LOG provider) Sending email: {
  to: 'user@example.com',
  subject: 'Transaction create',
  body: 'Operation: create\nMontant: 500\n...'
}
```

---

### **Method 2: Real Email with SMTP (Gmail, Outlook, etc.)**

To actually send emails, configure SMTP in docker-compose.yml:

**Edit `docker-compose.yml` - accounts-service section:**
```yaml
accounts-service:
  environment:
    - PORT=3004
    - MONGODB_URI=mongodb://mongodb:27017/accounts-service
    - EMAIL_PROVIDER=smtp
    - SMTP_HOST=smtp.gmail.com
    - SMTP_PORT=587
    - SMTP_SECURE=false
    - SMTP_USER=your-email@gmail.com
    - SMTP_PASS=your-app-password
    - EMAIL_FROM=your-email@gmail.com
    - EMAIL_FROM_NAME=Banking System
```

**For Gmail:**
1. Enable 2FA
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password as SMTP_PASS

**Restart accounts-service:**
```bash
docker-compose up -d accounts-service
```

**Test:**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 1000,
  "description": "Test real email",
  "adminUser": "admin@test.com"
}
```

**Email will be sent to the account's email!**

---

### **Method 3: SendGrid (Professional)**

**Setup SendGrid:**
1. Get API key from SendGrid
2. Update docker-compose.yml:

```yaml
accounts-service:
  environment:
    - EMAIL_PROVIDER=sendgrid
    - SENDGRID_API_KEY=your-sendgrid-api-key
    - EMAIL_FROM=verified@yourdomain.com
    - EMAIL_FROM_NAME=Banking System
```

**Restart and test:**
```bash
docker-compose up -d accounts-service
```

---

## 📊 EMAIL CONFIGURATION OPTIONS

### **Environment Variables:**

| Variable | Options | Default |
|----------|---------|---------|
| `EMAIL_PROVIDER` | `log`, `smtp`, `sendgrid` | `log` |
| `EMAIL_FROM` | Your email | `no-reply@example.com` |
| `EMAIL_FROM_NAME` | Display name | `Service Bank` |

### **SMTP Variables:**
| Variable | Example | Description |
|----------|---------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | Use SSL/TLS |
| `SMTP_USER` | `you@gmail.com` | Login email |
| `SMTP_PASS` | `app-password` | Login password |

### **SendGrid Variables:**
| Variable | Example | Description |
|----------|---------|-------------|
| `SENDGRID_API_KEY` | `SG.xxx...` | API key |

---

## 🧪 TESTING WORKFLOW

### **1. Check Current Email Settings:**
```bash
docker logs accounts-service | grep NotificationService
```

### **2. Trigger Email (Credit):**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 500,
  "description": "Email test - credit",
  "adminUser": "admin@test.com"
}
```

### **3. Trigger Email (Debit):**
```
POST http://localhost:3000/api/mouvements/debit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 100,
  "description": "Email test - debit",
  "adminUser": "admin@test.com"
}
```

### **4. Check Logs:**
```bash
docker logs accounts-service --tail 50 | grep -A 10 "NotificationService"
```

---

## 📧 EMAIL CONTENT

**Subject:**
```
Transaction create
```

**Body:**
```
Operation: create
Montant: 500
Description: Test email
Date: 2025-12-09T11:06:14.000Z
Solde mis à jour: 11500
Référence: TXN_ABC123
```

---

## 🎯 QUICK TEST (No Setup)

**Just run this:**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 100,
  "description": "Testing Ayman's email feature",
  "adminUser": "tester@bank.com"
}
```

**Then check logs:**
```bash
docker logs accounts-service --tail 20
```

**You'll see email logged!** ✅

---

## 🔧 TROUBLESHOOTING

### **No email in logs?**
```bash
docker logs accounts-service --tail 100
```
Look for errors

### **Email not sending with SMTP?**
- ✅ Check SMTP credentials are correct
- ✅ For Gmail, use App Password not regular password
- ✅ Check SMTP port (usually 587 or 465)

### **Email goes to spam?**
- Use verified domain email
- Configure SPF/DKIM records
- Use professional email service (SendGrid)

---

## ✅ VERIFICATION

**Email feature works if you see:**
```bash
[NotificationService] provider: log from: no-reply@example.com to: user@example.com
[NotificationService] (LOG provider) Sending email: {...}
```

---

## 🎉 SUMMARY

**Ayman's email feature:**
- ✅ Automatically sends emails on credit/debit
- ✅ Works in 3 modes: log, smtp, sendgrid
- ✅ No setup needed for testing (log mode)
- ✅ Easy to configure for real emails

**To test right now:**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a

{
  "montant": 999,
  "description": "Email test",
  "adminUser": "me@test.com"
}
```

**Check logs:**
```bash
docker logs accounts-service
```

**DONE! 📧✅**
