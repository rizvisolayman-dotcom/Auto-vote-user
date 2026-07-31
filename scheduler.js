const fs = require('fs');
const path = require('path');
const https = require('https');
const { voteAll, voteEach, findLatestPoll } = require('./userbot.js');

const STATE = path.join(__dirname, 'schedule-state.json');

let schedule = null;
let lastPollId = null;

function renderApi(method, p, body) {
  return new Promise((resolve, reject) => {
    const u = new URL('https://api.render.com/v1' + p);
    const opts = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search,
      method,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RENDER_API_KEY },
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(res.statusCode));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function loadState() {
  try {
    if (process.env.SCHEDULE_STATE) return JSON.parse(process.env.SCHEDULE_STATE);
  } catch {}
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; }
}
function saveState() {
  const st = { schedule, lastPollId };
  try { fs.writeFileSync(STATE, JSON.stringify(st)); } catch {}
  if (process.env.RENDER_SERVICE_ID && process.env.RENDER_API_KEY) {
    renderApi('PUT', '/services/' + process.env.RENDER_SERVICE_ID + '/env-vars/SCHEDULE_STATE', { value: JSON.stringify(st) }).catch(() => {});
  }
}

const st = loadState();
if (st.schedule) schedule = st.schedule;
if (st.lastPollId) lastPollId = st.lastPollId;

function timeToMin(t) {
  if (!t || !t.includes(':')) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function inWindow(now) {
  if (!schedule) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = timeToMin(schedule.start);
  const e = timeToMin(schedule.end);
  if (s === null || e === null) return false;
  if (s === e) return false;
  if (s < e) return cur >= s && cur <= e;
  return cur >= s || cur <= e;
}

function setSchedule(start, end, options, defaultOption) {
  schedule = { start, end, options, defaultOption };
  lastPollId = null;
  saveState();
  return { ok: true, schedule };
}

function stopSchedule() {
  schedule = null;
  saveState();
  return { ok: true };
}

function getStatus() {
  return { schedule, lastPollId, active: !!schedule };
}

let checking = false;

async function checkOnce() {
  if (checking) return;
  checking = true;
  try {
    if (!inWindow(new Date())) return;
    const poll = await findLatestPoll();
    if (!poll) return;
    if (lastPollId && poll.pollId === lastPollId) return;
    lastPollId = poll.pollId;
    saveState();

    let result;
    const accCount = require('./load-config.js').accounts.length;
    let options = schedule.options && Array.isArray(schedule.options) ? schedule.options : [];
    if (options.length !== accCount) {
      options = Array.from({ length: accCount }, (_, i) => i + 2);
      console.log('Options mismatch, using defaults:', options.join(','));
    }
    result = await voteEach(options.join(' '));
    console.log('[' + new Date().toLocaleTimeString() + '] AUTO-VOTED poll', poll.pollId, '=>', result);
    return { pollId: poll.pollId, result };
  } catch (e) {
    console.log('Scheduler error:', e.message);
  } finally {
    checking = false;
  }
}

function start() {
  setInterval(checkOnce, 10000);
  console.log('Scheduler started. Window:', schedule ? schedule.start + '-' + schedule.end : 'none');
}

module.exports = { start, checkOnce, setSchedule, stopSchedule, getStatus, inWindow };
