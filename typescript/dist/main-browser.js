"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var smart_bot_1 = require("./smart-bot");
var bomberjam_backend_1 = require("bomberjam-backend");
var myBot = new smart_bot_1.SmartBot("saves/myBot.json");
var bot1 = new smart_bot_1.SmartBot("saves/bot1.json");
var bot2 = new smart_bot_1.SmartBot("saves/bot2.json");
var bot3 = new smart_bot_1.SmartBot("saves/bot3.json");
var bots = [myBot, bot1, bot2, bot3];
bomberjam_backend_1.playInBrowser(bots).catch(console.log);