const allActions = ['up', 'down', 'left', 'right', 'stay', 'bomb'];

/**
 * @param {IGameState} state
 * @param {string} myPlayerId
 * @returns {ActionCode}
 */
function yourBot(state, myPlayerId) {
    console.log("ACtion");
    return allActions[Math.floor(Math.random() * allActions.length)];
}

function dumbBot(state, myPlayerId) {
    return 'stay';
}

module.exports = [yourBot, dumbBot, dumbBot, dumbBot];
