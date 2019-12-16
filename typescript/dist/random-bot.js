"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var allActions = Object.values(constants_1.ACTION);
var RandomBot = /** @class */ (function () {
    function RandomBot() {
    }
    RandomBot.prototype.destructor = function () {
    };
    RandomBot.prototype.saveLearningIteration = function (gameState, isLastIteration) {
    };
    RandomBot.prototype.getAction = function (gameState, myPlayerId) {
        return allActions[Math.floor(Math.random() * allActions.length)];
    };
    return RandomBot;
}());
exports.RandomBot = RandomBot;
