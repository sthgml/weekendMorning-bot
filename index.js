require("./server.js")

const dotenv = require("dotenv")
dotenv.config();

const { Client, Collection } = require("discord.js")
const { DateTime } = require("luxon");
const mySecret = process.env['TOKEN']
const client = (module.exports = new Client({ intents: [131071] }))
client.login(mySecret); //봇토큰

client.once("ready", () => {
  console.log(`${client.user.tag} 로그인`);
  
  // 실행시간 기준으로 다음 시간 계산
  const now = DateTime.now();

  // 다음 금요일 오후 9시를 계산
  // 현재 요일에서 다음 금,토요일까지의 일수를 더하고, 
  // 시간을 21:00으로 설정합니다.
  const nextFriday = now
    .plus({ days: (5 - now.weekday + 7) % 7 })
    .set({ hour: 0, minute: 0, second: 0 });
  const nextSaturday = now
    .plus({ days: (6 - now.weekday + 7) % 7 })
    .set({ hour: 0, minute: 0, second: 0 });

  // 다음 금, 토요일 메시지를 보낼 때까지 
  // 대기해야 하는 밀리초 단위의 시간을 계산합니다.
  let fridayDelay = nextFriday
    .diff(now)
    .as('milliseconds');
  let saturdayDelay = nextSaturday
    .diff(now)
    .as('milliseconds');

  // 당일일 때
  if(saturdayDelay <= 0 ){
    saturdayDelay += 604800000;
  }else if(fridayDelay <= 0){
    fridayDelay += 604800000;
  }

  // 확인
  console.log(`now: ${now} \n nextFriday: ${nextFriday} \n fridayDelay: ${fridayDelay}`);
  console.log(`now: ${now} \n nextSaturday: ${nextSaturday} \n saturdayDelay: ${saturdayDelay}`);
  
  // 다음 실행 예약
  setTimeout(() => {
    createThread();
  }, fridayDelay);
  setTimeout(() => {
    createThread();
  }, saturdayDelay);
})

function createThread() {
  client.channels
    .fetch("1161169358794530856") // 채널id
    .then(async (channel) => {
      console.log(channel.name);

      let date = new Date();

      const message = await channel.send({
        content: `${date.getMonth() + 1}월 ${date.getDate() + 1}일 스터디 참여 여부 조사`
      })

      const thread = await message.startThread({
        name: `${date.getMonth() + 1}월 ${date.getDate() + 1}일 스터디 참여 여부 조사`,
        autoArchiveDurateion: 60,
        reason: '주말 오전 할일하기 스터디 리마인딩, 불참 사유 조사',
      })

      console.log(`Created thread: ${thread.id}`);

      channel.threads.fetch
      const webhooks = await channel.fetchWebhooks();
      const webhook = webhooks.find(wh => wh.token);

      if (!webhook) {
        return console.log('No webhook was found that I can use!');
      }

      await webhook.send({
        content: '내일은 즐거운 휴일입니다! \n 잊지 말고 스터디에 참여해주세요~~ \n 오전에 일정이 있으신 분은 아래에 사유를 남겨주세요!',
        threadId: thread.id,
      });

      if (date.getDay() == 5) { // 금요일이면
        // 한 번 실행하고 나서 다시 Delay 시간 설정
        fridayDelay = 604800000;
        console.log(`fridayDelay: ${fridayDelay}`);
        // 다시 실행 예약
        setTimeout(() => {
          createThread();
        }, fridayDelay);
      } else if (date.getDay() == 6) { // 토요일이면
        // 한 번 실행하고 나서 다시 Delay 시간 설정
        saturdayDelay = 604800000;
        console.log(`saturdayDelay: ${saturdayDelay}`);
        // 다시 실행 예약
        setTimeout(() => {
          createThread();
        }, saturdayDelay);
      }
    })
    .catch(console.error);
}

client.on("messageCreate", (message) => {
  if (message.content == "쓰레드만들기") {
    // message.reply({ content: "**반갑습니다**" });
    createThread();
  }
  if (message.content == "안녕") {
    message.reply({ content: "**반갑습니다**" });
  }
})