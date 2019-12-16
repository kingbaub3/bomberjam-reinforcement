"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var move_history_1 = require("./save/move-history");
var file_system_1 = require("./save/file-system");
var allActions = Object.values(constants_1.ACTION);
var SmartBot = /** @class */ (function () {
    function SmartBot(saveFileName) {
        this.saveFileName = saveFileName;
        this.UPPER_CONFIDENCE_BOUND_CONSTANT = Math.sqrt(2);
        this.decisions = [];
        this.gameWonCount = 0;
        /* Initialisation here */
        this.moveHistory = new move_history_1.MoveHistory(saveFileName);
    }
    SmartBot.prototype.destructor = function () {
        console.log(this.playerId, "won", this.gameWonCount, "games");
        this.moveHistory.saveToFile();
    };
    SmartBot.prototype.saveLearningIteration = function (gameState, isLastIteration) {
        // Backtracking on our moves to save the result of each move.
        if (gameState) {
            this.propagateResultToMoves(gameState, this.playerId);
        }
        this.moveHistory.save();
        if (isLastIteration) {
            file_system_1.FileSystem.writeFile(this.saveFileName + "decision.json", this.decisions);
        }
        else {
            this.decisions = [];
        }
    };
    SmartBot.prototype.getAction = function (gameState, myPlayerId) {
        if (!this.playerId) {
            this.playerId = myPlayerId;
        }
        if (gameState.state === constants_1.GAME_STATE.started) {
            return this.getNextMove(gameState);
        }
        if (gameState.state === constants_1.GAME_STATE.ended) {
            return constants_1.ACTION.stay;
        }
    };
    // Selection phase for MCTS
    SmartBot.prototype.getNextMove = function (gameState) {
        // Computing the move
        var serializedState = this.extractKeyState(gameState);
        var previousMovesPerformed = this.moveHistory.get(serializedState);
        var maxValue = Number.MIN_SAFE_INTEGER;
        var bestActions = [];
        if (!previousMovesPerformed) {
            console.log("previousMovesPerformed is undefined");
        }
        var actionsStats = [];
        for (var _i = 0, allActions_1 = allActions; _i < allActions_1.length; _i++) {
            var action = allActions_1[_i];
            var score = this.upperConfidenceBoundAlgorithm(previousMovesPerformed.moves[action], previousMovesPerformed.totalSimulationCount);
            actionsStats.push({ totalSimulationCount: previousMovesPerformed.totalSimulationCount, stats: previousMovesPerformed.moves[action], score: score });
            if (score > maxValue) {
                bestActions = [action];
                maxValue = score;
            }
            else if (score === maxValue) {
                bestActions.push(action);
            }
        }
        this.decisions.push(actionsStats);
        var move = bestActions[Math.floor(Math.random() * bestActions.length)];
        // Persisting the move
        this.moveHistory.add({
            movePerformed: move,
            stateBeforeAction: serializedState
        });
        return move;
    };
    SmartBot.prototype.upperConfidenceBoundAlgorithm = function (moveStats, parentTotalSimulations) {
        if (!moveStats || moveStats.tryCount === 0 || parentTotalSimulations === 0) {
            return this.UPPER_CONFIDENCE_BOUND_CONSTANT;
        }
        var winCount = moveStats.winCount, tryCount = moveStats.tryCount;
        var winMean = winCount / tryCount;
        return winMean + this.UPPER_CONFIDENCE_BOUND_CONSTANT * Math.sqrt(Math.log(parentTotalSimulations) / tryCount);
    };
    /** Backpropagation Update the current move sequence with the simulation result. */
    SmartBot.prototype.propagateResultToMoves = function (gameState, myPlayerId) {
        // Compute the winner
        var playerArray = Object.values(gameState.players);
        var winner = playerArray[0];
        for (var i = 1; i < playerArray.length; ++i) {
            if (winner.score < playerArray[i].score) {
                winner = playerArray[i];
            }
        }
        // Propagate the winner
        var hasWon = myPlayerId === winner.id;
        this.moveHistory.propagateWinner(hasWon);
        if (hasWon) {
            this.gameWonCount++;
        }
    };
    SmartBot.prototype.extractKeyState = function (gameState) {
        var _this = this;
        var keyState = __assign({}, gameState);
        keyState.players = Object.values(keyState.players);
        keyState.players = keyState.players
            .map(function (x) {
            return { bombsLeft: x.bombsLeft, isPlayer: x.id === _this.playerId, x: x.x, y: x.y, bombRange: x.bombRange };
        })
            .filter(function (x) { return x.isPlayer; })
            .sort(function (a, b) { return a.isPlayer - b.isPlayer; });
        keyState.bombs = Object.values(keyState.bombs).map(function (x) {
            var playerId = x.playerId, others = __rest(x, ["playerId"]);
            return others;
        });
        keyState.bonuses = Object.values(keyState.bonuses);
        delete keyState.bonuses;
        delete keyState.height;
        delete keyState.isSimulationPaused;
        delete keyState.ownerId;
        delete keyState.roomId;
        delete keyState.state;
        delete keyState.suddenDeathCountdown;
        delete keyState.suddenDeathEnabled;
        delete keyState.tick;
        delete keyState.tickDuration;
        delete keyState.width;
        keyState.tiles = keyState.tiles.replace(/#*/g, "");
        return JSON.stringify(keyState);
    };
    return SmartBot;
}());
exports.SmartBot = SmartBot;
