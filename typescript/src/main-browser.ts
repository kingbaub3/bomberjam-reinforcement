import { SmartBot } from "./smart-bot";
import { playInBrowser } from "bomberjam-backend";

const myBot = new SmartBot("saves/myBot.json");
const bot1 = new SmartBot("saves/bot1.json");
const bot2 = new SmartBot("saves/bot2.json");
const bot3 = new SmartBot("saves/bot3.json");

const bots = [myBot, bot1, bot2, bot3];

playInBrowser(bots).catch(console.log);
