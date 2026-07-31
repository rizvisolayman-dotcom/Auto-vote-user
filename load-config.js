const fs = require('fs');
const path = require('path');

let accounts, API_ID, API_HASH, CHAT_ID;

try {
  const cfg = require('./config.js');
  accounts = cfg.accounts;
  API_ID = cfg.API_ID;
  API_HASH = cfg.API_HASH;
  CHAT_ID = cfg.CHAT_ID;
} catch (e) {
  const envCfg = process.env.VOTE_CONFIG;
  if (!envCfg) throw new Error('No config.js and no VOTE_CONFIG env var');
  const cfg = JSON.parse(envCfg);
  accounts = cfg.accounts;
  API_ID = cfg.API_ID;
  API_HASH = cfg.API_HASH;
  CHAT_ID = cfg.CHAT_ID;
}

module.exports = { accounts, API_ID, API_HASH, CHAT_ID };
