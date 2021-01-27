var TelegramBot = require('node-telegram-bot-api')

var core = require('./core')

var util = require('./util')

var game = require('./game')

var AsyncLock = require('async-lock');
var lock = new AsyncLock();


port = process.env.PORT || 443
host = '0.0.0.0'  // probably this change is not required
externalUrl = process.env.URL || 'https://bluebird-minebot.herokuapp.com'
token = process.env.TOKEN
bot = new TelegramBot(process.env.TOKEN, {webHook: {port: port, host: host}});

bot.setWebHook(externalUrl + ':443'+'/bot' + token);


/*
// replace the value below with the Telegram token you receive from @BotFather
const token = '';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true,  request: {proxy:"http://127.0.0.1:8000"}});
*/

bot.onText(/^\/start/,(msg, match) => {
    bot.sendMessage(
        msg.chat.id,
        '我还活着',
        {
            reply_to_message_id: msg.message_id,
        }
    )
})
bot.onText(/^\/mine(@\w+)?(?: (\d+) (\d+) (\d+))?$/, (msg, match) => {
    bot.sendMessage(
        msg.chat.id,
        '扫雷开始',
        {
            reply_to_message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [[{
                    text: '...',
                    callback_data: '-',
                }]],
            },
        }
    ).then((sentmsg) => {

        row = parseInt(match[2], 10) || 8
        col = parseInt(match[3], 10) || 8
        count = parseInt(match[4], 10) || 12
        let errorMsg = util.validate(row, col, count)
        if (errorMsg !== null) {
            bot.editMessageText(
                errorMsg,
                {
                    chat_id: sentmsg.chat.id,
                    message_id: sentmsg.message_id,
                    reply_to_message_id: msg.message_id,
                }
            );
        }

        mineCore = game.gameInit(sentmsg.chat.id + '_' + sentmsg.message_id,row,col,count)


        bot.editMessageReplyMarkup(
            {
                inline_keyboard: util.coreToKeyboard(mineCore,null),
            },
            {
                chat_id: sentmsg.chat.id,
                message_id: sentmsg.message_id,
            }
        )
    })

}, 1);


bot.on('callback_query', (query) => {
    const msg = query.message;

    gameId = msg.chat.id + '_' + msg.message_id

    const info = JSON.parse(query.data);

    if (typeof info[0] !== 'number' || typeof info[1] !== 'number') {
        throw Error(JSON.stringify(query));
    }
    lock.acquire(gameId, function(done) {
        if(!game.getGame(gameId)){
            done("no error", "ok");
            return
        }
        let result = game.gameClick(msg.chat.id + '_' + msg.message_id,info[0],info[1])

        // 游戏已经结束或者点击已经打开/标记的格子
        if(result === null){
            bot.answerCallbackQuery(query.id).catch((err) => {
                // nothing
            });
            return
        }

        let win = game.isGameWin(msg.chat.id + '_' + msg.message_id)
        if(win === 1){
            username =  query.from.username || query.from.first_name;
            bot.sendMessage(
                msg.chat.id,
                "@"+ username+" 你已经打开了所有地雷",
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }else  if(win  === -1){
            username =  query.from.username || query.from.first_name;
            bot.editMessageReplyMarkup(
                {
                    inline_keyboard: util.coreToKeyboard(result,true),
                },
                {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                }
            )
            bot.sendMessage(
                msg.chat.id,
                "@"+ username+" 你炸了",
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }else {
            bot.editMessageReplyMarkup(
                {
                    inline_keyboard: util.coreToKeyboard(result,null),
                },
                {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                }
            )
        }
        bot.answerCallbackQuery(query.id).catch((err) => {
            // nothing
        });
        done("no error", "ok");
    }, function(err, ret) {
        console.log(err)

        // lock released
    }, null);

})

