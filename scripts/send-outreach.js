/**
 * TDA Engineering Studio — Automated Direct Outreach Tool
 * Reads leads from CSV and sends personalized cold emails via Gmail SMTP with anti-spam pacing.
 *
 * Usage:
 *   1. Copy scripts/leads.csv.example to scripts/leads.csv and add real store leads
 *   2. Run: node scripts/send-outreach.js --dry-run (to preview without sending)
 *   3. Run: node scripts/send-outreach.js --send (to dispatch with safe delays)
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach(l => {
    const idx = l.indexOf('=');
    if (idx > 0 && !l.startsWith('#')) {
      const k = l.substring(0, idx).trim();
      const v = l.substring(idx + 1).trim();
      if (k && !process.env[k]) process.env[k] = v;
    }
  });
}

const SMTP_USER = process.env.SMTP_USER || 'tdawebservices@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'haqo oorc oeiu rbjx';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Paths
const CSV_FILE = path.join(__dirname, 'leads.csv');
const HTML_TEMPLATE = path.join(__dirname, '..', 'templates', 'outreach-email.html');
const TXT_TEMPLATE = path.join(__dirname, '..', 'templates', 'outreach-email.txt');

// Parse CLI flags
const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--send');

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      rows.push(obj);
    }
  }
  return rows;
}

function renderTemplate(tpl, lead) {
  let output = tpl;
  const replacements = {
    '[Client Name]': lead.client_name || 'Store Owner',
    '{{client_name}}': lead.client_name || 'Store Owner',
    '[Store Name / Store URL]': lead.store_name || lead.store_url || 'your store',
    '{{store_name}}': lead.store_name || 'your store',
    '{{store_url}}': lead.store_url || '',
    '[Module Name, e.g. PerfectSearch™ / FestiveFlow™]': lead.module_name || 'PerfectSearch™',
    '{{module_name}}': lead.module_name || 'PerfectSearch™',
    '{{module_benefit}}': lead.module_benefit || 'eliminate search latency with instant sub-50ms live autocomplete',
    '{{product_slug}}': lead.product_slug || 'perfectsearch',
    '[Your Name]': 'Anoop Muhammed',
    '{{sender_name}}': 'Anoop Muhammed',
    '[Live Demo Store URL or https://tda.workn.in]': 'https://tda.workn.in/#/products/' + (lead.product_slug || 'perfectsearch'),
    '{{demo_url}}': 'https://tda.workn.in/#/products/' + (lead.product_slug || 'perfectsearch')
  };

  for (const [key, val] of Object.entries(replacements)) {
    output = output.split(key).join(val);
  }
  return output;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=====================================================');
  console.log('       TDA Studio Automated Outreach Dispatcher      ');
  console.log('=====================================================');

  const targetCsv = fs.existsSync(CSV_FILE) ? CSV_FILE : path.join(__dirname, 'leads.csv.example');
  console.log(`Loading leads from: ${targetCsv}`);

  const csvContent = fs.readFileSync(targetCsv, 'utf8');
  const leads = parseCSV(csvContent);

  if (leads.length === 0) {
    console.error('No valid leads found in CSV.');
    return;
  }

  console.log(`Found ${leads.length} lead(s).\nMode: ${isDryRun ? 'DRY-RUN (Preview only, no emails will be sent)' : 'LIVE SENDING'}`);
  if (isDryRun) {
    console.log('Tip: Pass --send to actually send emails.\n');
  }

  const htmlTpl = fs.readFileSync(HTML_TEMPLATE, 'utf8');
  const txtTpl = fs.readFileSync(TXT_TEMPLATE, 'utf8');

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`\n[${i + 1}/${leads.length}] Preparing email for ${lead.client_name} <${lead.client_email}> (${lead.store_name})`);

    const renderedHtml = renderTemplate(htmlTpl, lead);
    const renderedTxt = renderTemplate(txtTpl, lead);
    const subject = `PrestaShop performance & custom module for ${lead.store_name}`;

    if (isDryRun) {
      console.log(`  Subject: ${subject}`);
      console.log(`  To: ${lead.client_email}`);
      console.log(`  Status: [DRY-RUN OK] — Email preview generated successfully.`);
    } else {
      try {
        console.log(`  Sending email to ${lead.client_email}...`);
        await transporter.sendMail({
          from: `"Anoop | TDA Studio" <${SMTP_USER}>`,
          to: lead.client_email,
          replyTo: SMTP_USER,
          subject: subject,
          text: renderedTxt,
          html: renderedHtml
        });
        console.log(`  -> SUCCESS: Sent to ${lead.client_email}`);

        // Human-like delay between sends (30 - 60 seconds) to avoid spam filters
        if (i < leads.length - 1) {
          const delaySec = Math.floor(Math.random() * 25) + 35;
          console.log(`  Waiting ${delaySec}s before next send to protect inbox reputation...`);
          await sleep(delaySec * 1000);
        }
      } catch (err) {
        console.error(`  -> ERROR sending to ${lead.client_email}:`, err.message);
      }
    }
  }

  console.log('\n=====================================================');
  console.log('Finished processing all leads.');
}

run().catch(console.error);
