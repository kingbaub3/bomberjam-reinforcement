import { SmartBot } from "./smart-bot";
import { RandomBot } from "./random-bot";
import { playInBrowser } from "bomberjam-backend";

const myBot = new SmartBot("saves/myBot.json");
const bot1 = new RandomBot();
const bot2 = new SmartBot("saves/bot2.json");
const bot3 = new RandomBot();

const bots = [myBot, bot1, bot2, bot3];

playInBrowser(bots).catch(console.log);
