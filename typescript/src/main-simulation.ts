import { startSimulation } from "bomberjam-backend";
import { SmartBot } from "./smart-bot";
import { RandomBot } from "./random-bot";

const myBot = new SmartBot("saves/myBot.json");
// const bot1 = new SmartBot("saves/bot1.json");
const bot1 = new RandomBot();
const bot2 = new SmartBot("saves/bot2.json");
const bot3 = new RandomBot(); // new SmartBot("saves/bot3.json");

const bots = [myBot, bot1, bot2, bot3];

function simulateGame(isLastIteration: boolean) {
    const saveGamelog = true;
    const simulation = startSimulation(bots, saveGamelog);

    while (!simulation.isFinished) {
        simulation.executeNextTick();
    }

    for(const bot of bots) {
        bot.saveLearningIteration(simulation.currentState, isLastIteration);
    }
}

const iterationCount = 1000;
console.time('learning');
for(let i = 1; i <= iterationCount; ++i) {
    simulateGame(i === iterationCount);

    if(i % 100 === 0) {
        console.log("Iteration", i, "completed");
    }
}
console.timeEnd('learning');
console.log(`Completed ${iterationCount} iterations`);

for(const bot of bots) {
    bot.destructor();
}