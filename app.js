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

async function generatePlayersFile() {
  const browser = await puppeteer.launch(),
  page = await browser.newPage(),
  leaguesSelector = '.squads a',
  teamsSelector = 'h5 a';
  let players = [];

  await page.goto('http://www.footballsquads.co.uk/squads.htm');
  await page.waitForSelector(leaguesSelector);

  let leaguesLinks = await page.evaluate((leaguesSelector) => {
    return [...document.querySelectorAll(leaguesSelector)].map((link) => { return link.href; })
  }, leaguesSelector);

  for (let i = 0; i < leaguesLinks.length; i++) {
    await page.goto(leaguesLinks[i]);
    await page.waitForSelector(teamsSelector);

    let teamsLinks = await page.evaluate((teamsSelector) => {
      return [...document.querySelectorAll(teamsSelector)].map((link) => { return link.href; })
    }, teamsSelector);

    for (let j = 0; j < teamsLinks.length; j++) {
      const teamNameSelector = 'h2',
      playersSelector = 'tr';

      await page.goto(teamsLinks[j]);
      await page.waitForSelector(playersSelector);

      const currentPlayers = await page.evaluate((teamNameSelector, playersSelector) => {
        const allPlayersInfo = [...document.querySelectorAll(playersSelector)],
        teamName = document.querySelector(teamNameSelector).innerText,
        transferredPlayersIndex = allPlayersInfo.findIndex((element) => element.children.length === 1),
        currentPlayersAndBlankLines = allPlayersInfo.slice(1, transferredPlayersIndex),
        onlyPlayers = currentPlayersAndBlankLines.filter((player) => /\w/.test(player.children[1].innerText));

        return onlyPlayers.map((player) => {
          return {
            name: player.children[1].innerText,
            nationality: player.children[2].innerText,
            position: player.children[3].innerText,
            currentTeam: teamName
          };
        });

      }, teamNameSelector, playersSelector);

      players = players.concat(currentPlayers);
    }
  }

  await browser.close();

  createJSONFile('players', players);
}

function createJSONFile(name, data) {
  fs.writeFileSync(`${name}.json`, JSON.stringify(data));
}