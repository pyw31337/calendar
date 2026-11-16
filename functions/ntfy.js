const https = require('https');

// ntfy push notification (phone alerts without app-specific setup)
function sendNtfy(title, message, topic) {
  const t = topic || process.env.NTFY_TOPIC || 'calendar-alert-pyw31337';
  const data = Buffer.from(String(message || ''));
  const req = https.request({
    hostname: 'ntfy.sh',
    path: '/' + encodeURIComponent(t),
    method: 'POST',
    headers: {
      'Title': String(title || '캘린더 알림'),
      'Priority': 'high',
      'Tags': 'calendar',
      'Click': 'https://pyw31337.github.io/calendar/',
      'Content-Length': data.length
    }
  }, () => {});
  req.on('error', err => console.error('ntfy error', err.message));
  req.write(data);
  req.end();
}

module.exports = { sendNtfy };
