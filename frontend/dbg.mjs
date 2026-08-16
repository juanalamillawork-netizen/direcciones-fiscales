import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:5173');
await p.waitForTimeout(3000);
const btns = await p.evaluate(() => Array.from(document.querySelectorAll('button')).map(x => ({t: (x.innerText||'').trim().slice(0,30), dis: x.disabled, aria: x.getAttribute('aria-label')})));
console.log(JSON.stringify(btns, null, 1));
console.log('labels:', await p.evaluate(() => Array.from(document.querySelectorAll('label')).map(x=>x.textContent)));
await b.close();
