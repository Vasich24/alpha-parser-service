const express = require('express');
const { chromium } = require('playwright-core');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Семафор: максимум 2 Chromium одночасно
let active = 0;
const queue = [];
const MAX = 1;
const cache = new Map();

app.use(cors());

process.on('unhandledRejection', err => console.error('UnhandledRejection:', err));
process.on('uncaughtException', err => console.error('UncaughtException:', err));

function enqueue(task) {
  return new Promise((resolve, reject) => {
    const wrapped = async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        active--;
        processQueue();
      }
    };
    queue.push(wrapped);
    processQueue();
  });
}

function processQueue() {
  if (active >= MAX || queue.length === 0) return;
  const next = queue.shift();
  active++;
  next();

  setTimeout(() => {
    if (queue.length > 0) {
      processQueue();
    }
  }, 2000);
}

app.get('/api/wallet-info', async (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const now = Date.now();
  const cached = cache.get(address);
  if (cached && now - cached.timestamp < 30000) {
    return res.json(cached.data);
  }

  try {
    const data = await enqueue(() => getAlphaStats(address));
    cache.set(address, { data, timestamp: now });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

async function getAlphaStats(address) {
  const url = `https://www.bn-alpha.site/${address}`;
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('p.text-lg.font-medium', { timeout: 10000 });

    const data = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('p.text-lg.font-medium')).map(e => e.textContent.trim());
      const profit = document.querySelector('p.text-lg.font-medium.text-red-600')?.textContent.trim() || null;
      return {
        volume: list[0] || null,
        points: list[1] || null,
        profit
      };
    });

    return data;
  } catch (err) {
    console.error('❌ Chromium error:', err.message);
    throw err;
  } finally {
    if (browser) {
      await browser.close().catch(e => console.error('❌ Close browser fail:', e.message));
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Alpha Parser running on http://localhost:${PORT}`);
});
