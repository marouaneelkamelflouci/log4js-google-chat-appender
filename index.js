const axios = require('axios');
let threadName = '';
let messageInterval = 24*60*60*1000;
let setUserDefinedInterval = (messageInterval) => {
    // console.log("In set interval...");
    setInterval(function () {
        // console.log('Reseting thread name ', new Date().toLocaleTimeString());
        threadName = '';
    }, messageInterval);
};

let sendMessage = (message, webhookUrl) => {
    if(message.length>4096){
        console.log('log4js-hangout warning: Length of error message exceeded 4096 characters. Hangout allows only 4096 characters, so error message trimmed to 4096 characters.');
        message = message.substr(0, 4096);
    }
    axios({
        method: 'POST',
        url: webhookUrl,
        data: {
            text: message,
            thread: {
                name: threadName
            }
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
        console.error('log4js hangout appender - Error happened', 'Error in calling webhook', err);
    });

};

function configure(config, layouts) {
    let pattern = "`%p` %c%n%m";
    let layout = layouts.patternLayout(pattern);
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    if (config.space && config.key && config.token)
        config.webhookUrl = `https://chat.googleapis.com/v1/spaces/${config.space}/messages?key=${config.key}&token=${config.token}`;
    else if (!config.webhookUrl)
        console.error('log4js hangout appender - Incomplete configurations');
    if (config.sendInterval && !isNaN(config.sendInterval)) {
        setUserDefinedInterval(parseInt(config.sendInterval))
    }
    else{
        setUserDefinedInterval(messageInterval);
    }
    return hangoutAppender(config, layout);
}

function hangoutAppender(config, layout, pattern) {
    const appender = (loggingEvent) => {
        if (!config.webhookUrl)
            console.error('log4js hangout appender - Error happened', 'WebHook not defined in config');
        else
            sendMessage(layout(loggingEvent), config.webhookUrl);
    };

    //TODO: implement time-interval
    return appender;
}

exports.configure = configure;

