var Crawler = require('crawler');
var fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
var lastDate = '';
const telegramAPI = '1022476304:AAEAaGiU9iLj4B5eC3bna5ngLzSPqqzceoQ';
const chatId = '7070569';

const getCurrentDate = () => {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  return day + '/' + month + '/' + year;
};

const writeToFile = data => {
  data = getCurrentDate() + ' ' + data;
  fs.writeFile('lastDate.txt', data, err => {
    if (err) console.log(err);
    console.log('Successfully Written to File.');
  });
};

async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('lastDate.txt', 'utf8', function(err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

const isNew = time => {
  const date = getCurrentDate();
  const time1Date = new Date(date + ' ' + time);
  const time2Date = new Date(lastDate);
  if (time1Date > time2Date) {
    return true;
  }
  return false;
};

const notifyMe = data => {
  let text = '';
  text += `${data.name}
  ${data.timeText}
  ${data.price}
  ${data.apartmentType}
  ${data.size}
  ${data.link}
  `;
  // Notify both founder from Telegram
  const bot = new TelegramBot(telegramAPI, {
    polling: false
  });
  bot.sendMessage(chatId, `🏡 New post: ${text}`);
  return true;
};
var c = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      try {
        var $ = res.$;
        const todaysArticles = $('article:contains("Idag")');
        console.log('Check...');
        console.log(todaysArticles.length);

        for (let index = todaysArticles.length - 1; index >= 0; index--) {
          const element = todaysArticles[index];
          let price;
          let apartmentType;
          let size;
          let timeText;
          let name;
          let link;
          let time;
          try {
            price =
              element.children[1].children[3].children[0].children[0]
                .children[0].children[0].data;
            apartmentType =
              element.children[1].children[2].children[0].children[0]
                .children[0].data;
            size =
              element.children[1].children[2].children[0].children[2]
                .children[0].data;
            timeText =
              element.children[1].children[0].children[2].children[0].data;
            name =
              element.children[1].children[1].children[0].children[0]
                .children[0].childNodes[0].data;
            link =
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
  }
});

async function runCode() {
  c.queue(
    'https://www.blocket.se/annonser/stockholm/bostad/lagenheter?cg=3020&mre=10000&r=11&roe=3&ros=1&se=3&ss=0&st=u'
  );
  lastDate = await readFile();
  console.log(lastDate);
  setTimeout(runCode, 10000);
}
// Queue just one URL, with default callback
runCode();
