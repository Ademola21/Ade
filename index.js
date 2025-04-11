const puppeteer = require('puppeteer-core'); const chromium = require('@sparticuz/chromium'); const fs = require('fs');

// CONFIGURATION const TOKEN_FILE = './tokens.txt'; const USER_AGENT_FILE = './user_agents.txt'; const HEADLESS = false; const TOKEN_DELAY_MS = 5000; const COOLDOWN_MINUTES = 16; const DEBUG = true;

function readLines(file) { try { return fs.readFileSync(file, 'utf8') .split('\n') .filter(line => line.trim() !== ''); } catch (err) { console.error(Error reading ${file}:, err); return []; } }

const tokens = readLines(TOKEN_FILE); const userAgents = readLines(USER_AGENT_FILE);

if (tokens.length === 0 || userAgents.length === 0) { console.error("Missing tokens or user agents!"); process.exit(1); }

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function processAccount(browser, token, userAgent, index) { const page = await browser.newPage(); try { await page.setUserAgent(userAgent); await page.setViewport({ width: 1280, height: 720 }); await page.evaluateOnNewDocument(() => { delete navigator.proto.webdriver; });

await page.goto('https://telegram.geagle.online/', {
  waitUntil: 'networkidle2',
  timeout: 30000
});

await page.evaluate((t) => {
  localStorage.setItem("session_token", t);
  document.cookie = `session_token=${t}; domain=telegram.geagle.online; path=/; secure`;
}, token);

await delay(2000);
await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
await delay(3000);

const tapSuccess = await page.evaluate(async () => {
  try {
    const button = document.querySelector("._tapArea_njdmz_15");
    if (!button) return false;
    
    for (let i = 0; i < 1000; i += 50) {
      await new Promise(resolve => {
        for (let j = 0; j < 50; j++) {
          setTimeout(() => button.click(), j * 5);
        }
        setTimeout(resolve, 300);
      });
    }
    return true;
  } catch (e) {
    return false;
  }
});

if (!tapSuccess) throw new Error('Tapping failed');

console.log(`✅ [${index + 1}] Token claimed. Cooldown: ${COOLDOWN_MINUTES} minutes`);

await delay(COOLDOWN_MINUTES * 60 * 1000);
console.log(`🔄 [${index + 1}] Cooldown ended. Retrying...`);
processAccount(browser, token, userAgent, index);

} catch (error) { console.error(❌ [${index + 1}] Failed:, error.message); await page.close(); } }

(async () => { const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [ ...chromium.args, '--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled' ], headless: HEADLESS, });

for (let i = 0; i < tokens.length; i++) { const userAgent = userAgents[i % userAgents.length]; processAccount(browser, tokens[i], userAgent, i); await delay(TOKEN_DELAY_MS); } })();

// To create files via terminal: // echo "your_token_here" | cat > tokens.txt // echo "your_user_agent_here" | cat > user_agents.txt

