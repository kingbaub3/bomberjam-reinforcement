import { MonteCarloGameState, SerializedMonteCarloHistory, SerializedMonteCarloState } from "../montecarlo-constants";
import { FileSystem } from "./file-system";

const defaultState = {};

export class MoveHistory {
    private saveFileName: string;
    private moveHistory: MonteCarloGameState[] = [];
    private moveHistoryFromFile: SerializedMonteCarloHistory;

    constructor(saveFileName: string) {
        /* Fetching the previous state from the file */
        this.saveFileName = saveFileName;
        const data = FileSystem.readFileSync(this.saveFileName, JSON.stringify(defaultState));
        this.moveHistoryFromFile = JSON.parse(data);
    }

    add(move: MonteCarloGameState): void {
        this.moveHistory.push(move);
    }

    get(serializedState: string): SerializedMonteCarloState {
        const value = this.moveHistoryFromFile[serializedState];
        return value ? value : { totalSimulationCount: 0, moves: {} };
    }

    propagateWinner(hasWon: boolean): void {
        for (const move of this.moveHistory) {
            move.hasResultedToWin = hasWon;
        }
    }

    async saveToFile(): Promise<void> {
        const stateToSerialize = this.prepareStateForSave();
        this.moveHistory = [];

        await FileSystem.writeFile(this.saveFileName, stateToSerialize)
            .then(() => console.log("Saved"))
            .catch(err => console.error(err));
    }

    save(): void {
        this.prepareStateForSave();
        this.moveHistory = [];
    }

    private prepareStateForSave(): SerializedMonteCarloHistory {
        const alreadyUpdatedMoves = new Set<string>();
        /* Adding new moves to our move history from file */
        for (const move of this.moveHistory) {
            const serializedState = this.serializeState(move);
            const { movePerformed, hasResultedToWin } = move;

            // Only add win/try count once for each move for a given state.
            if(alreadyUpdatedMoves.has(serializedState + movePerformed)) {
                continue;
            }
            else {
                alreadyUpdatedMoves.add(serializedState + movePerformed)
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
                    moves: {
                        [movePerformed]: {
                            winCount: hasResultedToWin ? 1 : 0,
                            tryCount: 1
                        }
                    }
                };
            }

            this.moveHistoryFromFile[serializedState].totalSimulationCount++;
        }

        return this.moveHistoryFromFile;
    }

    private serializeState(move: MonteCarloGameState): string {
        return move.stateBeforeAction;
    }
}