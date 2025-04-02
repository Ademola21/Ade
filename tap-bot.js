const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Change to `true` later
  const page = await browser.newPage();

  // Set testing account token (NOT your main account!)
  await page.goto('https://telegram.geagle.online/');
  await page.evaluate(() => {
    localStorage.setItem("session_token", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiZmNiYjg2MWQtMmY5ZS00OGQ3LTlmZTMtYmQzMjdmMzA5ODg4IiwiZmlyc3RfbmFtZSI6IkFuYWJlbCIsImxhbmd1YWdlX2NvZGUiOiJlbiIsInVzZXJuYW1lIjoiQW5hYmVsQ2FzdGVsbGEifSwic2Vzc2lvbl9pZCI6MTYwMzgwMiwic3ViIjoiZmNiYjg2MWQtMmY5ZS00OGQ3LTlmZTMtYmQzMjdmMzA5ODg4IiwiZXhwIjoxNzQ0OTc0ODI2fQ.c-jge3nQtZcI4nqUJN3MCoiHaxfKUFzQOB6-l7sU3Bk");
  });
  await page.reload();

  // Auto-tap function
  await page.evaluate(async () => {
    let clickCount = 0;
    const maxTaps = 1000;
    const tapCooldown = 16 * 60 * 1000; // 16 minutes

    function bulkTap() {
      const button = document.querySelector("._tapArea_njdmz_15");
      
      if (!button) {
        console.log("⚠️ Button missing! Retrying...");
        setTimeout(bulkTap, 5000);
        return;
      }

      console.log(`⏳ Tapping ${maxTaps} times...`);
      for (let i = 0; i < maxTaps; i++) {
        setTimeout(() => {
          button.click();
          if (i % 200 === 0) console.log(`✅ ${i + 1} taps done`);
        }, Math.random() * 50);
      }

      clickCount += maxTaps;
      console.log(`💰 Total taps: ${clickCount}. Waiting ${tapCooldown/60000} mins...`);

      setTimeout(() => {
        clickCount = 0;
        bulkTap();
      }, tapCooldown + (Math.random() * 60 * 1000)); // + random 0-60 sec
    }

    bulkTap();
  });

  // Keep browser open
  await new Promise(() => {});
})()
