const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { requireAdmin } = require('../dist/middleware/adminAccess');
const { submissionLimiter } = require('../dist/middleware/rateLimiter');
const emailService = require('../dist/utils/emailService').default;

async function withServer(app, cb) {
  const server = app.listen(0);
  try {
    await new Promise(resolve => server.once('listening', resolve));
    return await cb(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('per-IP submission limit isolates IPs through exactly one trusted proxy hop', async () => {
  const app = express();
  app.set('trust proxy', 1);
  app.post('/submit', submissionLimiter, (req, res) => res.json({ ip: req.ip }));
  await withServer(app, async base => {
    const post = ip => fetch(base + '/submit', { method: 'POST', headers: { 'x-forwarded-for': ip } });
    for (let i = 0; i < 5; i++) assert.equal((await post('203.0.113.21')).status, 200);
    assert.equal((await post('203.0.113.21')).status, 429);
    const other = await post('198.51.100.40');
    assert.equal(other.status, 200);
    assert.equal((await other.json()).ip, '198.51.100.40');
  });
});

test('administrator routes are closed without a valid server-side key', async () => {
  const app = express();
  app.get('/private', requireAdmin, (_req, res) => res.json({ ok: true }));
  const old = process.env.ADMIN_API_KEY;
  try {
    await withServer(app, async base => {
      delete process.env.ADMIN_API_KEY;
      assert.equal((await fetch(base + '/private')).status, 503);
      process.env.ADMIN_API_KEY = 'testsecret'.repeat(5);
      assert.equal((await fetch(base + '/private')).status, 401);
      assert.equal((await fetch(base + '/private', {headers: {'x-admin-key': 'testsecret'.repeat(5)}})).status, 200);
    });
  } finally {
    if (old === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = old;
  }
});

test('rejected Resend responses throw rather than being logged as successful', async () => {
  const original = emailService.resend;
  emailService.resend = { emails: {send: async () => ({data: null, error: {name: 'validation_error', message: 'Domain not verified'}})} };
  try {
    await assert.rejects(emailService.sendApplicationConfirmation('person@example.org', 'Tester'), /Domain not verified/);
  } finally {
    emailService.resend = original;
  }
});

test('admin notification honors ADMIN_EMAIL and escapes applicant input', async () => {
  const prevEmail = process.env.ADMIN_EMAIL;
  const original = emailService.resend;
  let captured;
  emailService.resend = {emails: {send: async params => {captured = params; return {data: {id: 'test_123'}, error: null};}}};
  process.env.ADMIN_EMAIL = 'admin@example.org';
  const app = {
    _id:'abc', fullName:'<img src=x onerror=alert(1)>', primaryRole:'Developer',
    portfolioLinks:['example.com'], email:'user@example.org', phone:'000', location:'Lagos',
    experience:'1–3', skills:['typescript'], availability:'Immediate', ukHours:'Yes',
    officeWork:'No', salaryRange:'Below ₦400,000', summary:'Hello', submissionDate:new Date()
  };
  try {
    await emailService.sendAdminNotification(app);
    assert.equal(captured.to, 'admin@example.org');
    assert.match(captured.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(captured.html, /<img src=x onerror=alert\(1\)>/);
    assert.match(captured.html, /https:\/\/example\.com/);
    delete process.env.ADMIN_EMAIL;
    await assert.rejects(emailService.sendAdminNotification(app), /ADMIN_EMAIL is missing/);
  } finally {
    emailService.resend = original;
    if (prevEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = prevEmail;
  }
});
