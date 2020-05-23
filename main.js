/**
 * This is simple one-file script that looking for blocket link each 10 seconds (checkFrequency param)
 * And check all new post for current day and send it short description to your telegram bot
 * Also store a last check date to send you only new posts
 * 
 */


const Crawler = require('crawler');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');


const checkFrequency=10000;
let lastDate = '';
// Create a bot in telegram via BotFather and insert API key below
const telegramAPI = '******';

// Click start inside of the bot and send random message, program will show you you chatID with first start
// Stop the program and set chatID below.
const chatId = '*****';

// Go to this link and set your own search parameters
const blocketLink='https://www.blocket.se/annonser/stockholm/bostad/lagenheter?cg=3020&mre=25000&r=11&roe=10&ros=5&se=11&ss=5&st=u'

// additional filters, set false if you don't need them
const cityFilterName='Stockholms stad'
const nameShouldContain = 'Stockholm'

const getCurrentDate = () => {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  return year + '-' + month + '-' + day;
};

const writeToFile = (data) => {
  data = getCurrentDate() + ' ' + data;
  fs.writeFile('lastDate.txt', data, (err) => {
    if (err) console.log(err);
    console.log('Successfully Written to File.');
  });
};

async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('lastDate.txt', 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

const isNew = (time) => {
  const date = getCurrentDate();
  const time1Date = new Date(date + ' ' + time);
  const time2Date = new Date(lastDate);
  if (time1Date > time2Date) {
    return true;
  }
  return false;
};

const notifyMe = (data) => {
  let text = '';
  text += `${data.name}
  ${data.timeText}
  ${data.price}
  ${data.apartmentType}
  ${data.size}
  ${data.link}
  `;
  const bot = new TelegramBot(telegramAPI, {
    polling: false,
  });
  bot.sendMessage(chatId, `🏡 New post: ${text}`);
  return true;
};

const c = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      try {
        var $ = res.$;
        const todaysArticles = $('article:contains("Idag")'); // The site in Swedish, looking for 'idag'- today's posts
        console.log('Check...');
        console.log(todaysArticles.length);

        for (let index = todaysArticles.length - 1; index >= 0; index--) {
          const element = todaysArticles[index];

          let price;
          let apartmentType;
          let size;
          let city;
          let timeText;
          let name;
          let link;
          let time;
          try {
            city =
              element.children[1].children[0].children[1].children[2]
                .children[0].data;

            // You can customize you city here
            console.log('City: ' + city);
            if (cityFilterName && city !== cityFilterName) {
              console.log('skip...');
              continue;
            }

            price =
              element.children[1].children[2].children[0].childNodes[0]
                .children[1].children[0].data;
            apartmentType =
              element.children[1].children[2].children[0].childNodes[0]
                .children[0].children[0].data;
            size =
              element.children[1].children[2].children[0].childNodes[0]
                .children[2].children[0].data;

            timeText =
              element.children[1].children[0].children[2].children[0].data;
            name =
              element.children[1].children[1].children[0].children[0]
                .children[0].childNodes[0].data;

            if (nameShouldContain && !name.includes(nameShouldContain)) {
              console.log('skip.. because no Stockholm in name.');
              continue;
            }

            link =
              'https://www.blocket.se' +
              element.children[1].children[1].children[0].children[0].attribs
                .href;

            time = timeText.split(' ')[1];

            if (isNew(time)) {
              console.log(timeText);
              console.log(time);
              console.log(name);
              console.log(link);
              console.log(price);
              console.log(apartmentType);
              console.log(size);
              console.log('----');
              writeToFile(time);
              notifyMe({ name, timeText, link, price, apartmentType, size });
            }
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
        done();
      }
      done();
    }
  },
});

async function runCode() {
  c.queue(
    blocketLink;
  );
  lastDate = await readFile();
  console.log(lastDate);
  setTimeout(runCode, checkFrequency);
}
// Queue just one URL, with default callback
runCode();

const bot = new TelegramBot(telegramAPI, {
  polling: false,
});

// Show last chatID in your bot conversation
bot.getUpdates().then((res) => {
  console.dir(res[0].message.chat);
});
