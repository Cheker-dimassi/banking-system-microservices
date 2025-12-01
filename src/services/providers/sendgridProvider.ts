import https from 'https';

export interface SendGridPayload {
  personalizations: Array<{
    to: Array<{ email: string }>;
    subject: string;
  }>;
  from: { email: string; name?: string };
  content: Array<{ type: 'text/plain' | 'text/html'; value: string }>;
}

export async function sendWithSendGrid(apiKey: string, payload: SendGridPayload): Promise<void> {
  const data = JSON.stringify(payload);

  const options: https.RequestOptions = {
    method: 'POST',
    hostname: 'api.sendgrid.com',
    path: '/v3/mail/send',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  await new Promise<void>((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`SendGrid API error: ${res.statusCode} ${res.statusMessage} - ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
