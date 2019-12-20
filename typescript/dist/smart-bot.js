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
        this.isGoingRandomly = false;
        /* Initialisation here */
        this.moveHistory = new move_history_1.MoveHistory(saveFileName);
    }
    SmartBot.prototype.destructor = function () {
        console.log(this.playerId, "won", this.gameWonCount, "games");
        this.moveHistory.saveToFile();
    };
    SmartBot.prototype.saveLearningIteration = function (gameState, isLastIteration) {
        this.isGoingRandomly = false;
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
        if (this.isGoingRandomly) {
            return allActions[Math.floor(Math.random() * allActions.length)];
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
        if (maxValue === this.UPPER_CONFIDENCE_BOUND_CONSTANT) {
            this.isGoingRandomly = true;
        }
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
        var tiles = this.simulateBombExplosion(keyState.tiles, Object.values(keyState.bombs), keyState.width);
        // keyState.bonuses = Object.values(keyState.bonuses);
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
        delete keyState.bombs;
        delete keyState.bonuses;
        keyState.tiles = tiles.replace(/#*/g, "");
        return JSON.stringify(keyState);
    };
    SmartBot.prototype.simulateBombExplosion = function (tiles, bombs, width) {
        var gameMap = [];
        for (var i = 0; i < tiles.length; i += width) {
            gameMap.push(tiles.substr(i, width).split(''));
        }
        for (var _i = 0, bombs_1 = bombs; _i < bombs_1.length; _i++) {
            var bomb = bombs_1[_i];
            for (var _a = 0, DIRECTIONS_1 = constants_1.DIRECTIONS; _a < DIRECTIONS_1.length; _a++) {
                var direction = DIRECTIONS_1[_a];
                for (var j = 0; j < bomb.range; ++j) {
                    var x = bomb.x + direction[0] * j;
                    var y = bomb.y + direction[1] * j;
                    if (x < 0 || y < 0 || x >= width || y >= gameMap.length) {
                        break;
                    }
                    if (gameMap[y][x] === constants_1.TILE_TYPE.walkable) {
                        gameMap[y][x] = constants_1.TILE_TYPE.explosionIncoming;
                    }
                    else if (gameMap[y][x] !== constants_1.TILE_TYPE.explosion && gameMap[y][x] !== constants_1.TILE_TYPE.explosionIncoming) {
                        break;
                    }
                }
            }
        }
        return gameMap.reduce(function (acc, current) { return acc + current.join(""); }, "");
    };
    return SmartBot;
}());
exports.SmartBot = SmartBot;
