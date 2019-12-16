"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var FileSystem = /** @class */ (function () {
    function FileSystem() {
    }
    FileSystem.writeFile = function (fileName, json) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(fileName, JSON.stringify(json) + "\n", 'utf8', function (err) {
                err ? reject(err) : resolve();
            });
        });
    };
    FileSystem.readFileSync = function (filename, defaultState) {
        if (defaultState === void 0) { defaultState = "{}"; }
        try {
            return fs.readFileSync(filename, 'utf8');
        }
        catch (err) {
            console.error(err);
            return defaultState;
        }
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
