const { chromium } = require('playwright-core');


async function getAlphaStats(address) {
  const url = `https://www.bn-alpha.site/${address}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Чекаємо, поки зʼявляться блоки з поінтами
    await page.waitForSelector('p.text-lg.font-medium');

    // Зчитуємо з DOM
    const result = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p.text-lg.font-medium')).map(e => e.textContent.trim());
      const profit = document.querySelector('p.text-lg.font-medium.text-red-600')?.textContent.trim() || null;

      return {
        volume: all[0] || null,
        points: all[1] || null,
        profit
      };
    });

    await browser.close();
    return result;

  } catch (e) {
    await browser.close();
    console.error('❌ Помилка:', e.message);
    return null;
  }
}

// Тест
(async () => {
  const address = '0x102a1345F57987eA78a4F858834CCe44e42c0EaF';
  const stats = await getAlphaStats(address);

  if (stats) {
    console.log('📊 Alpha Wallet Stats:\n');
    console.log(`💵 Обсяг:  ${stats.volume}`);
    console.log(`🎯 Поінти: ${stats.points}`);
    console.log(`📉 PnL:    ${stats.profit}`);
  } else {
    console.log('⚠️ Не вдалося отримати дані');
  }
})();
