'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');

// create LINE SDK client
const client = new line.Client(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
// 
// simple reply function
const replyText = (token, message) => {
  console.log('--------------');
  console.log(message);
  console.log('--------------');
  message = Array.isArray(message) ? message : [message];
  console.log('*--------------');
  console.log(message);
  console.log('*--------------');
  // ---------------------------------
  return client.replyMessage(
    token,
    message.map((text) => (text))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  var text = message.text;
  var message;
  if (text == "#symptom") { //btn อาการ
    message = [{
      "altText": "Flex Message",
      "contents": {
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": []
        },
        "hero": {
          "type": "image",
          "url": "https://sixmuscle.github.io/images/messageAPI/header.png",
          "size": "full",
          "aspectRatio": "1:1"
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "action": {
                "label": "อาการเบื้องต้น",
                "text": "อาการเบื้องต้น",
                "type": "message"
              },
              "color": "#000000",
              "style": "primary",
              "type": "button"
            },
            {
              "margin": "sm",
              "action": {
                "type": "message",
                "label": "มีไข้",
                "text": "มีไข้"
              },
              "color": "#000000",
              "style": "primary",
              "type": "button"
            },
            {
              "action": {
                "type": "message",
                "text": "อาการหนัก",
                "label": "อาการหนัก"
              },
              "type": "button",
              "style": "primary",
              "color": "#000000",
              "margin": "sm"
            },
            {
              "size": "sm",
              "type": "spacer"
            }
          ]
        },
        "type": "bubble",
        "size": "mega"
      },
      "type": "flex"
    }]


  } else if (text == "อาการเบื้องต้น") { // btn อาการ -> อาการเบื้องต้น
    message = [{
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_01.png?ignored=_",
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_01.png?ignored=_",
      "type": "image"
    }]
  } else if (text == "มีไข้") { // btn อาการ -> มีไข้
    message = [{
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_02.png?ignored=_",
      "type": "image",
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_02.png?ignored=_"
    }]
  } else if (text == "อาการหนัก") { // btn อาการ -> มีไข้
    message = [{
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_03.png?ignored=_",
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/symptom_03.png?ignored=_",
      "type": "image"
    }]
  } else if (text == "ขอความช่วยเหลือ") { // btn ขอความช่วยเหลือ
    message = [{
      "type": "text",
      "text": "กำลังดำเนินการติดต่อเจ้าหน้าที่ กรุณารอสักครู่..."
    }];
  } else if (text == "อื่นๆ") { // btn อื่นๆ
    message = [{
      "text": "เลือกหัวข้อตามที่ต้องการ สามารถคลิกได้จากปุ่มตัวเลือกด้านล่างนี้",
      "quickReply": {
        "items": [
          {
            "imageUrl": "https://sixmuscle.github.io/images/messageAPI/covid.gif?_ignored=",
            "action": {
              "label": "โควิด-19",
              "text": "โควิด-19",
              "type": "message"
            },
            "type": "action"
          },
          {
            "imageUrl": "https://sixmuscle.github.io/images/messageAPI/infect.gif",
            "action": {
              "type": "message",
              "text": "การแพร่เชื้อ",
              "label": "การแพร่เชื้อ"
            },
            "type": "action"
          },
          {
            "type": "action",
            "action": {
              "label": "ข้อมูลเพิ่มเติม",
              "type": "message",
              "text": "ข้อมูลเพิ่มเติม"
            },
            "imageUrl": "https://sixmuscle.github.io/images/messageAPI/information.gif"
          }
        ]
      },
      "type": "text"
    }]
  } else if (text == "โควิด-19") {
    message = [{
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/covid.png?ignored=_",
      "type": "image",
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/covid.png?ignored=_"
    }]
  } else if (text == "การแพร่เชื้อ") {
    message = [{
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/infect.png?ignored=_",
      "type": "image",
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/infect.png?ignored=_"
    }]
  } else if (text == "ข้อมูลเพิ่มเติม") {
    message = [{
      "originalContentUrl": "https://sixmuscle.github.io/images/messageAPI/infect.png?ignored=_",
      "type": "image",
      "previewImageUrl": "https://sixmuscle.github.io/images/messageAPI/infect.png?ignored=_"
    }]
  } else {
    message = [{
      "type": "text",
      "text": "สวัสดีชาวโลก เรามาอย่างสันติ"
    }];
  }
  return replyText(replyToken, message);
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
