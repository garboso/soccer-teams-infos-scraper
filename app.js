const fs = require('fs'),
puppeteer = require('puppeteer');

async function generateSquadsFile() {
  const browser = await puppeteer.launch(),
  page = await browser.newPage(),
  leaguesSelector = '.squads a',
  teamsSelector = 'h5';
  let squadsNames = [];

  await page.goto('http://www.footballsquads.co.uk/squads.htm');
  await page.waitForSelector(leaguesSelector);

  const links = await page.evaluate((leaguesSelector) => {
    return [...document.querySelectorAll(leaguesSelector)].map((link) => { return link.href; })
  }, leaguesSelector);

  for (let i = 0; i < links.length; i++) {
    await page.goto(links[i]);
    await page.waitForSelector(teamsSelector);

    squadsNames = squadsNames.concat(await page.evaluate((teamsSelector) => {
      return [...document.querySelectorAll(teamsSelector)].map((squad) => { return squad.innerText; })
    }, teamsSelector));
  }

  await browser.close();

  createJSONFile('squads', squadsNames);
}

function createJSONFile(name, data) {
  fs.writeFileSync(`${name}.json`, JSON.stringify(data));
}