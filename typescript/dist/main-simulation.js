"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bomberjam_backend_1 = require("bomberjam-backend");
var smart_bot_1 = require("./smart-bot");
var random_bot_1 = require("./random-bot");
var myBot = new random_bot_1.RandomBot(); // new SmartBot("saves/myBot.json");
// const bot1 = new SmartBot("saves/bot1.json");
var bot1 = new random_bot_1.RandomBot();
var bot2 = new smart_bot_1.SmartBot("saves/bot2.json");
var bot3 = new smart_bot_1.SmartBot("saves/bot3.json");
var bots = [myBot, bot1, bot2, bot3];
function simulateGame(isLastIteration) {
    var saveGamelog = true;
    var simulation = bomberjam_backend_1.startSimulation(bots, saveGamelog);
    while (!simulation.isFinished) {
        simulation.executeNextTick();
    }
    for (var _i = 0, bots_2 = bots; _i < bots_2.length; _i++) {
        var bot = bots_2[_i];
        bot.saveLearningIteration(simulation.currentState, isLastIteration);
    }
}
var iterationCount = 1000;
console.time('learning');
for (var i = 1; i <= iterationCount; ++i) {
    simulateGame(i === iterationCount);
    if (i % 100 === 0) {
        console.log("Iteration", i, "completed");
    }
}
console.timeEnd('learning');
console.log("Completed " + iterationCount + " iterations");
for (var _i = 0, bots_1 = bots; _i < bots_1.length; _i++) {
    var bot = bots_1[_i];
    bot.destructor();
}
