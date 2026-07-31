#!/bin/bash
# Watchdog: keeps panel and tunnel running
P="node vote-web.js"
T="cloudflared tunnel"
cd /root/Auto-vote-user

# Panel
if ! pgrep -f "$P" >/dev/null; then
  nohup node vote-web.js > /tmp/vote-web.log 2>&1 < /dev/null &
  echo "$(date) started panel" >> /tmp/watchdog.log
fi

# Tunnel (persistent named tunnel keeps same URL)
if ! pgrep -f "$T" >/dev/null; then
  nohup /tmp/cloudflared tunnel --url http://localhost:8080 > /tmp/cf.log 2>&1 < /dev/null &
  echo "$(date) started tunnel" >> /tmp/watchdog.log
fi
