// Copy this file to config.js and fill in your own accounts
// Run: node generate-session.js to create session strings
// IMPORTANT: Never share config.js or your session strings with anyone

const accounts = [
  {n:'#1 Your Name', s:'YOUR_SESSION_STRING_HERE'},
  // Add more accounts:
  // {n:'#2 Another', s:'ANOTHER_SESSION_STRING'},
];

const API_ID = 12345678;        // Replace with your API_ID from https://my.telegram.org
const API_HASH = 'your_api_hash_here';  // Replace with your API_HASH
const CHAT_ID = '-1000000000000';  // Replace with your group/channel ID

module.exports = { accounts, API_ID, API_HASH, CHAT_ID };
