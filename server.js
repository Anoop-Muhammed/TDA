const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load local .env if available
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(l => {
      const idx = l.indexOf('=');
      if (idx > 0 && !l.startsWith('#')) {
        const key = l.substring(0, idx).trim();
        const val = l.substring(idx + 1).trim();
        if (key && !process.env[key]) process.env[key] = val;
      }
    });
  }
} catch (e) {}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'dist');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'tdawebservices@gmail.com',
    pass: process.env.SMTP_PASS
  }
});

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle SMTP Send Mail API
  if (req.url.startsWith('/api/send-mail') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
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
    return;
  }

  // Serve static files from dist or root
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexFile = fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))
        ? path.join(PUBLIC_DIR, 'index.html')
        : path.join(__dirname, 'index.html');

      fs.readFile(indexFile, (readErr, content) => {
        if (readErr) {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (ext === '.mp4' || ext === '.webm') {
      const range = req.headers.range;
      const fileSize = stats.size;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });
        fileStream.pipe(res);
        return;
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`TDA Studio production server running on http://localhost:${PORT}`);
});
