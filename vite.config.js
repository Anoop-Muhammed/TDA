import { defineConfig, loadEnv } from 'vite';
import nodemailer from 'nodemailer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      {
        name: 'tda-mailer',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url.startsWith('/api/send-mail') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: env.SMTP_USER || process.env.SMTP_USER || 'tdawebservices@gmail.com',
                      pass: env.SMTP_PASS || process.env.SMTP_PASS
                    }
                  });

                const mailOptions = {
                  from: '"TDA Studio Inquiry" <tdawebservices@gmail.com>',
                  to: 'tdawebservices@gmail.com',
                  replyTo: data.email || 'tdawebservices@gmail.com',
                  subject: `[New Inquiry] ${data.interest || 'General'} from ${data.name || 'Prospective Client'}`,
                  html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #FEF3E2; color: #1C150C; border-radius: 8px;">
                      <h2 style="color: #891818; margin-top: 0; font-size: 22px; border-bottom: 2px solid #891818; padding-bottom: 10px;">
                        New Inquiry Received — TDA Engineering Studio
                      </h2>
                      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #6E5D4B;">Client Name:</td>
                          <td style="padding: 8px 0; font-size: 16px;">${data.name || 'Not provided'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Email Address:</td>
                          <td style="padding: 8px 0; font-size: 16px;"><a href="mailto:${data.email}" style="color: #891818; font-weight: bold;">${data.email || 'Not provided'}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Interest / Product:</td>
                          <td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #891818;">${data.interest || 'General Inquiry'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Store URL / Stack:</td>
                          <td style="padding: 8px 0; font-size: 16px;">${data.store || 'Not specified'}</td>
                        </tr>
                      </table>
                      <div style="margin-top: 24px; padding: 18px; background: #ffffff; border: 1px solid rgba(28,21,12,0.15); border-radius: 6px;">
                        <strong style="color: #1C150C; display: block; margin-bottom: 8px;">Message / Project Requirements:</strong>
                        <div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message || 'No additional message provided.'}</div>
                      </div>
                      <p style="margin-top: 24px; font-size: 12px; color: #9C8974; border-top: 1px solid rgba(28,21,12,0.1); padding-top: 12px;">
                        This inquiry was submitted via the TDA Engineering Showcase website.
                      </p>
                    </div>
                  `
                };

                await transporter.sendMail(mailOptions);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: true, 
                  message: 'Your inquiry has been sent directly to our senior engineers! We will respond within 4 hours.' 
                }));
              } catch (err) {
                console.error('SMTP Send Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
};
});
