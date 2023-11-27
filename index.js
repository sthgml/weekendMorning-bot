require("./server.js");

const dotenv = require("dotenv");
dotenv.config();

const { Client, Collection } = require("discord.js");
const { DateTime } = require("luxon");
const mySecret = process.env['TOKEN'];
const client = (module.exports = new Client({ intents: [131071] }));
client.login(mySecret); //봇토큰

client.once("ready", () => {
  console.log(`${client.user.tag} 로그인`);

  // 실행시간 기준으로 다음 시간 계산
  const now = DateTime.now();

  // 다음 날 오전 9시를 계산
  // 현재 요일에서  일수를 더하고, 
  // 시간을 09:00으로 설정합니다. (근디 서버시간이 한국이랑 9시간 시차 있음)
  const nextDay = now
    .plus({ days: (now.weekday + 1) % 7 })
    .set({ hour: 0, minute: 0, second: 0 });

  // 다음 날 메시지를 보낼 때까지 
  // 대기해야 하는 밀리초 단위의 시간을 계산합니다.
  let delay = nextDay
    .diff(now)
    .as('milliseconds');

  if (delay < 0) {
    delay += 86400000;
  }

  console.log(delay);

  // 다음 실행 예약
  setTimeout(() => {
    createThread();
  }, delay);
})

function createThread() {
  client.channels
    .fetch("1161169358794530856") // 채널id
    .then(async (channel) => {
      // console.log(channel.name);

      let date = new Date();

      const message = await channel.send({
        content: `${date.getMonth() + 1}월 ${date.getDate() + 1}일 스터디 참여 여부 조사`
      });

      const thread = await message.startThread({
        name: `${date.getMonth() + 1}월 ${date.getDate() + 1}일 스터디 참여 여부 조사`,
        autoArchiveDurateion: 60,
        reason: '평일 오전 할 일 하기 스터디 리마인딩, 불참 사유 조사',
      });

      // console.log(`Created thread: ${thread.id}`);

      channel.threads.fetch;
      const webhooks = await channel.fetchWebhooks();
      const webhook = webhooks.find(wh => wh.token);

      if (!webhook) {
        return console.log('No webhook was found that I can use!');
      }

      await webhook.send({
        content: '내일 오전과 오후 스터디 참여 여부를 오늘 자정까지 남겨주세요! \n ex) 오전: 참/ 오후: 불참 \n 오해의 소지가 있으니 변동사항이 생기면 메세지를 수정하지 마시고, 다시 남겨주세요 😘',
        threadId: thread.id,
      });

      // 다시 실행 예약
      delay = 86400000;
      setTimeout(() => {
        createThread();
      }, delay);
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