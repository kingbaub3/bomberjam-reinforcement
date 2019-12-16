"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var file_system_1 = require("./file-system");
var defaultState = {};
var MoveHistory = /** @class */ (function () {
    function MoveHistory(saveFileName) {
        this.moveHistory = [];
        /* Fetching the previous state from the file */
        this.saveFileName = saveFileName;
        var data = file_system_1.FileSystem.readFileSync(this.saveFileName, JSON.stringify(defaultState));
        this.moveHistoryFromFile = JSON.parse(data);
    }
    MoveHistory.prototype.add = function (move) {
        this.moveHistory.push(move);
    };
    MoveHistory.prototype.get = function (serializedState) {
        var value = this.moveHistoryFromFile[serializedState];
        return value ? value : { totalSimulationCount: 0, moves: {} };
    };
    MoveHistory.prototype.propagateWinner = function (hasWon) {
        for (var _i = 0, _a = this.moveHistory; _i < _a.length; _i++) {
            var move = _a[_i];
            move.hasResultedToWin = hasWon;
        }
    };
    MoveHistory.prototype.saveToFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateToSerialize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateToSerialize = this.prepareStateForSave();
                        this.moveHistory = [];
                        return [4 /*yield*/, file_system_1.FileSystem.writeFile(this.saveFileName, stateToSerialize)
                                .then(function () { return console.log("Saved"); })
                                .catch(function (err) { return console.error(err); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MoveHistory.prototype.save = function () {
        this.prepareStateForSave();
        this.moveHistory = [];
    };
    MoveHistory.prototype.prepareStateForSave = function () {
        var _a;
        var alreadyUpdatedMoves = new Set();
        /* Adding new moves to our move history from file */
        for (var _i = 0, _b = this.moveHistory; _i < _b.length; _i++) {
            var move = _b[_i];
            var serializedState = this.serializeState(move);
            var movePerformed = move.movePerformed, hasResultedToWin = move.hasResultedToWin;
            // Only add win/try count once for each move for a given state.
            if (alreadyUpdatedMoves.has(serializedState + movePerformed)) {
                continue;
            }
            else {
                alreadyUpdatedMoves.add(serializedState + movePerformed);
            }
            if (this.moveHistoryFromFile[serializedState]) {
                if (this.moveHistoryFromFile[serializedState].moves[movePerformed]) {
                    this.moveHistoryFromFile[serializedState].moves[movePerformed].winCount += hasResultedToWin ? 1 : 0;
                    this.moveHistoryFromFile[serializedState].moves[movePerformed].tryCount++;
                }
                else {
                    this.moveHistoryFromFile[serializedState].moves[movePerformed] = {
                        winCount: hasResultedToWin ? 1 : 0,
                        tryCount: 1
                    };
                }
            }
            else {
                this.moveHistoryFromFile[serializedState] = {
                    totalSimulationCount: 0,
                    moves: (_a = {},
                        _a[movePerformed] = {
                            winCount: hasResultedToWin ? 1 : 0,
                            tryCount: 1
                        },
                        _a)
                };
            }
            this.moveHistoryFromFile[serializedState].totalSimulationCount++;
        }
        return this.moveHistoryFromFile;
    };
    MoveHistory.prototype.serializeState = function (move) {
        return move.stateBeforeAction;
    };
    return MoveHistory;
}());
exports.MoveHistory = MoveHistory;
