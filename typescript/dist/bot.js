"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var smart_bot_1 = require("./smart-bot");
var myBot = new smart_bot_1.SmartBot("saves/myBot.json");
var bot1 = new smart_bot_1.SmartBot("saves/bot1.json");
var bot2 = new smart_bot_1.SmartBot("saves/bot2.json");
var bot3 = new smart_bot_1.SmartBot("saves/bot3.json");
function yourBot(state, myPlayerId) {
    return myBot.doAction(state, myPlayerId);
}
function otherBot(bot) {
    return function (state, myPlayerId) { return bot.doAction(state, myPlayerId); };
}
function dumbBot(state, myPlayerId) {
    return 'stay';
}
module.exports = [yourBot, otherBot(bot1), otherBot(bot2), otherBot(bot3)];
