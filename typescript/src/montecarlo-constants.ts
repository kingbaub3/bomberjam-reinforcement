import { ActionCode, IGameState } from "bomberjam-backend";

export interface MonteCarloGameState {
    movePerformed: ActionCode;
    stateBeforeAction: string;
    hasResultedToWin?: boolean;
}

export interface SerializedMonteCarloHistory {
    [state: string]: SerializedMonteCarloState;
}

export interface SerializedMonteCarloState {
    totalSimulationCount: number;
    moves: { [movePerformed: string]: SerializedMonteCarloMove };
}

export interface SerializedMonteCarloMove {
    winCount: number;
    tryCount: number;
}

export interface IDisposable {
    saveLearningIteration(gameState: IGameState, isLastIteration: boolean): void;
    destructor(gameState: IGameState): void;
}