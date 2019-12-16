import { IGameState, ActionCode, IPlayer, ISimpleBomb, IBot } from "bomberjam-backend";
import { GAME_STATE, ACTION } from "./constants";
import { MoveHistory } from "./save/move-history";
import { SerializedMonteCarloMove, IDisposable } from "./montecarlo-constants";
import { FileSystem } from "./save/file-system";

const allActions: ActionCode[] = Object.values(ACTION);

export class SmartBot implements IBot, IDisposable {
    private readonly UPPER_CONFIDENCE_BOUND_CONSTANT = Math.sqrt(2);
    private moveHistory: MoveHistory;
    private playerId: string;
    private decisions = [];
    private gameWonCount = 0;

    constructor(private saveFileName: string) {
        /* Initialisation here */
        this.moveHistory = new MoveHistory(saveFileName);
    }

    destructor() {
        console.log(this.playerId, "won", this.gameWonCount, "games");
        this.moveHistory.saveToFile();
    }

    saveLearningIteration(gameState: IGameState, isLastIteration: boolean) {
        // Backtracking on our moves to save the result of each move.
        if (gameState) {
            this.propagateResultToMoves(gameState, this.playerId);
        }

        this.moveHistory.save();

        if(isLastIteration) {
            FileSystem.writeFile(this.saveFileName + "decision.json", this.decisions);
        }
        else {
            this.decisions = [];
        }
    }

    public getAction(gameState: IGameState, myPlayerId: string): ActionCode {
        if (!this.playerId) {
            this.playerId = myPlayerId;
        }

        if (gameState.state === GAME_STATE.started) {
            return this.getNextMove(gameState);
        }

        if (gameState.state === GAME_STATE.ended) {
            return ACTION.stay;
        }
    }

    // Selection phase for MCTS
    private getNextMove(gameState: IGameState): ActionCode {
        // Computing the move
        const serializedState = this.extractKeyState(gameState);
        const previousMovesPerformed = this.moveHistory.get(serializedState)

        let maxValue = Number.MIN_SAFE_INTEGER;
        let bestActions: ActionCode[] = [];

        if (!previousMovesPerformed) {
            console.log("previousMovesPerformed is undefined");
        }

        const actionsStats = [];
        for (const action of allActions) {
            const score = this.upperConfidenceBoundAlgorithm(previousMovesPerformed.moves[action], previousMovesPerformed.totalSimulationCount);
            actionsStats.push({ totalSimulationCount: previousMovesPerformed.totalSimulationCount, stats: previousMovesPerformed.moves[action], score });
            if (score > maxValue) {
                bestActions = [action];
                maxValue = score;
            }
            else if (score === maxValue) {
                bestActions.push(action);
            }
        }
        this.decisions.push(actionsStats);
        const move = bestActions[Math.floor(Math.random() * bestActions.length)];

        // Persisting the move
        this.moveHistory.add({
            movePerformed: move,
            stateBeforeAction: serializedState
        });

        return move;
    }

    private upperConfidenceBoundAlgorithm(moveStats: SerializedMonteCarloMove, parentTotalSimulations: number) {
        if (!moveStats || moveStats.tryCount === 0 || parentTotalSimulations === 0) {
            return this.UPPER_CONFIDENCE_BOUND_CONSTANT;
        }

        const { winCount, tryCount } = moveStats;

        const winMean = winCount / tryCount;
        return winMean + this.UPPER_CONFIDENCE_BOUND_CONSTANT * Math.sqrt(
            Math.log(parentTotalSimulations) / tryCount
        );
    }

    /** Backpropagation Update the current move sequence with the simulation result. */
    private propagateResultToMoves(gameState: IGameState, myPlayerId: string) {
        // Compute the winner
        const playerArray = Object.values(gameState.players);
        let winner = playerArray[0];

        for (let i = 1; i < playerArray.length; ++i) {
            if (winner.score < playerArray[i].score) {
                winner = playerArray[i];
            }
        }

        // Propagate the winner
        const hasWon = myPlayerId === winner.id;
        this.moveHistory.propagateWinner(hasWon)

        if(hasWon) {
            this.gameWonCount++;
        }
    }

    private extractKeyState(gameState: IGameState): string {
        const keyState: any = {
            ...gameState
        };

        keyState.players = Object.values(keyState.players);

        keyState.players = keyState.players
            .map((x: IPlayer) => {
                return { bombsLeft: x.bombsLeft, isPlayer: x.id === this.playerId, x: x.x, y: x.y, bombRange: x.bombRange }
            })
            .filter(x => x.isPlayer)
            .sort((a, b) => a.isPlayer - b.isPlayer);

        keyState.bombs = Object.values(keyState.bombs).map((x: ISimpleBomb) => {
            const { playerId, ...others } = x;
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
    }

    // MonteCarlo
    // Selection
    /* Expansion: If L is a not a terminal node (i.e. it does not end the game), then create one or more child nodes and select one (C).
    Simulation (rollout) Run a simulated playout from C until a result is achieved. */
}