const axios = require('axios');
let threadName = '';
let messageInterval = 24*60*60*1000;
let setUserDefinedInterval = (messageInterval) => {
    setInterval(function () {
        threadName = '';
    }, messageInterval);
};

let sendMessage = (logType, categoryName, message, webhookUrl, appName) => {
    if(message.length>4096){
        console.log('log4js-google-chat warning: Length of error message exceeded 4096 characters. Hangout allows only 4096 characters, so error message trimmed to 4096 characters.');
        message = message.substr(0, 4096);
    }
    axios({
        method: 'POST',
        url: webhookUrl,
        data: {
            "cardsV2": [
              {
                "cardId": "unique-card-id",
                "card": {
                  "header": {
                    "title": appName,
                    "subtitle": logType,
                    "imageUrl":"https://w7.pngwing.com/pngs/452/24/png-transparent-js-logo-node-logos-and-brands-icon-thumbnail.png",
                    "imageType": "CIRCLE",
                    "imageAltText": "Node js",
                  },
                  "sections": [
                    {
                      "header": "Error Info",
                      "uncollapsibleWidgetsCount": 1,
                      "widgets": [
                        {
                            "textParagraph": {
                                "text": message
                            }
                        },
                        {
                            "divider": {}
                        },
                        {
                          "decoratedText": {
                            "icon": {
                              "knownIcon": "CLOCK",
                            },
                            "text": "Not an",
                            "switchControl": {
                                "name": "has_been_resolved",
                                "selected": false,
                                "controlType": "CHECKBOX"
                            }
                          }
                        },
                        {
                            "decoratedText": {
                              "icon": {
                                "knownIcon": "CLOCK",
                              },
                              "text": "Issue resolved",
                              "switchControl": {
                                  "name": "has_been_resolved",
                                  "selected": false,
                                  "controlType": "CHECKBOX"
                              }
                            }
                          }
                      ],
                    },
                  ],
                },
              }
            ],
          },
        header: {
            'Content-Type': 'application/json',
            'charset': 'UTF-8'
        }
    }).then(({data}) => {
        if(threadName === ''){
            threadName = data.thread.name;
        }
    })
        .catch(function (err) {
        console.error('log4js google chat appender - Error happened', 'Error in calling webhook', err);
    });

};

function configure(config, layouts) {
    let pattern = "`%p` %c%n%m";
    let layout = layouts.patternLayout(pattern);
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    if (!config.webhookUrl){
        console.error('log4js google chat appender - Incomplete configurations');
    }
    if (config.sendInterval && !isNaN(config.sendInterval)) {
        setUserDefinedInterval(parseInt(config.sendInterval))
    } else{
        setUserDefinedInterval(messageInterval);
    }
    return googleChatAppender(config, layout);
}

function googleChatAppender(config, layout, pattern) {
    const appender = (loggingEvent) => {
        if (!config.webhookUrl)
            console.error('log4js google chat appender - Error happened', 'WebHook not defined in config');
        else
            sendMessage(loggingEvent.level.levelStr, loggingEvent.categoryName, message, config.webhookUrl,loggingEvent.context.app_name);
    };
    return appender;
}
exports.configure = configure;

