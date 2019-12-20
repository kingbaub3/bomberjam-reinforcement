"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GAME_STATE;
(function (GAME_STATE) {
    GAME_STATE[GAME_STATE["notStarted"] = -1] = "notStarted";
    GAME_STATE[GAME_STATE["started"] = 0] = "started";
    GAME_STATE[GAME_STATE["ended"] = 1] = "ended";
})(GAME_STATE = exports.GAME_STATE || (exports.GAME_STATE = {}));
var ACTION;
(function (ACTION) {
    ACTION["up"] = "up";
    ACTION["down"] = "down";
    ACTION["left"] = "left";
    ACTION["right"] = "right";
    ACTION["stay"] = "stay";
    ACTION["bomb"] = "bomb";
})(ACTION = exports.ACTION || (exports.ACTION = {}));
exports.DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];
var TILE_TYPE;
(function (TILE_TYPE) {
    TILE_TYPE["walkable"] = ".";
    TILE_TYPE["breakable"] = "+";
    TILE_TYPE["wall"] = "#";
    TILE_TYPE["explosion"] = "*";
    TILE_TYPE["explosionIncoming"] = "!";
})(TILE_TYPE = exports.TILE_TYPE || (exports.TILE_TYPE = {}));
