import { ICompteBancaire, IMouvementCompte } from '../types';
import { sendWithSendGrid } from './providers/sendgridProvider';

export interface NotificationInfo {
  operation: 'create' | 'update' | 'delete';
  montant: number;
  description: string;
  date: Date;
  soldeMisAJour: number;
  email: string;
  referenceTransaction?: string;
}

class NotificationService {
  // Lazy getters to always read env at runtime
  private getProvider(): string {
    return process.env.EMAIL_PROVIDER?.trim() || 'log';
  }

  private getFromEmail(): string {
    return process.env.EMAIL_FROM?.trim() || 'no-reply@example.com';
  }

  private getFromName(): string {
    return process.env.EMAIL_FROM_NAME?.trim() || 'Service Bank';
  }

  private getSmtpConfig() {
    return {
      host: process.env.SMTP_HOST?.trim(),
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    };
  }

  async sendEmail(info: NotificationInfo): Promise<void> {
    if (!info.email) throw new Error('Recipient email is missing');

    const provider = this.getProvider();
    const fromEmail = this.getFromEmail();
    const fromName = this.getFromName();

    console.log('[NotificationService] provider:', provider, 'from:', fromEmail, 'to:', info.email);

    const subject = `Transaction ${info.operation}`;
    const text = [
      `Operation: ${info.operation}`,
      `Montant: ${info.montant}`,
      `Description: ${info.description}`,
      `Date: ${info.date.toISOString()}`,
      `Solde mis à jour: ${info.soldeMisAJour}`,
      info.referenceTransaction ? `Référence: ${info.referenceTransaction}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    if (provider === 'sendgrid') {
      const apiKey = process.env.SENDGRID_API_KEY?.trim();
      if (!apiKey) {
        console.warn('SENDGRID_API_KEY missing. Falling back to log provider.');
        return this.logEmail(info, subject, text);
      }
      await sendWithSendGrid(apiKey, {
        personalizations: [{ to: [{ email: info.email }], subject }],
        from: { email: fromEmail, name: fromName },
        content: [{ type: 'text/plain', value: text }],
      });
      return;
    }

    if (provider === 'smtp') {
      const nodemailer = await import('nodemailer');
      const { host, port, secure, user, pass } = this.getSmtpConfig();

      console.log('[NotificationService][SMTP] host:', host, 'port:', port, 'secure:', secure, 'user:', user);

      if (!host || !user || !pass) {
        console.warn('Incomplete SMTP configuration. Falling back to log provider.');
        return this.logEmail(info, subject, text);
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      try {
        const result = await transporter.sendMail({
          from: { name: fromName, address: fromEmail },
          to: info.email,
          subject,
          text,
        });
        console.log('[NotificationService][SMTP] sendMail result:', {
          messageId: (result as any)?.messageId,
          accepted: (result as any)?.accepted,
          rejected: (result as any)?.rejected,
          response: (result as any)?.response,
        });
      } catch (e) {
        console.error('[NotificationService][SMTP] sendMail error:', e);
        throw e;
      }
      return;
    }

    // Default: log
    return this.logEmail(info, subject, text);
  }

  private async logEmail(info: NotificationInfo, subject: string, text: string) {
    console.log('[NotificationService] (LOG provider) Sending email:', {
      to: info.email,
      subject,
      body: text,
    });
  }
}

// Export singleton
export default new NotificationService();
