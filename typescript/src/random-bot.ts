import { IBot, IGameState, ActionCode } from "bomberjam-backend";
import { IDisposable } from "./montecarlo-constants";
import { ACTION } from "./constants";

const allActions: ActionCode[] = Object.values(ACTION);

export class RandomBot implements IBot, IDisposable {
    destructor() {
    }

    saveLearningIteration(gameState: IGameState, isLastIteration: boolean): void {
        
    }

    public getAction(gameState: IGameState, myPlayerId: string): ActionCode {
        return allActions[Math.floor(Math.random() * allActions.length)];
    }
}