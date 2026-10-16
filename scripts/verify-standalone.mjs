import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath,args:['--no-sandbox']});
try {
 const context=await browser.newContext({offline:true});
 const origin='http://signal-zero-offline.test/';
 const html=await readFile(resolve('release/Signal-Zero.html'),'utf8');
 // This managed browser blocks file:// navigation. Fulfill the single HTML
 // document in memory instead; offline mode stays enabled for all requests.
 await context.route(origin,route=>route.fulfill({status:200,contentType:'text/html',body:html}));
 const page=await context.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&r.url()!==origin)requests.push(r.url());});
 await page.goto(origin);
 await page.getByRole('button',{name:'Begin operation'}).click();
 await page.getByRole('button',{name:'Enter the field'}).click();
 await page.getByRole('textbox',{name:'Terminal command'}).fill('cat ./scope.txt');
 await page.getByRole('textbox',{name:'Terminal command'}).press('Enter');
 await page.locator('.handler-decisions').getByRole('button').nth(1).click();
 await page.locator('.debrief-card').waitFor();
 await page.getByRole('button',{name:'Next operation'}).click();
 if(!await page.getByRole('heading',{name:'The room behind the room.'}).isVisible())throw Error('Progression failed');
 await page.reload();
 if((await page.evaluate(()=>JSON.parse(localStorage.getItem('signal-zero-v1')).completed.length))!==1)throw Error('Local file save failed');
 if(errors.length||requests.length)throw Error(JSON.stringify({errors,requests}));
 console.log('PASS: portable HTML works offline; first mission, supervisor reaction, progression, and save restoration passed. No remote requests or browser errors.');
} finally {await browser.close();}
