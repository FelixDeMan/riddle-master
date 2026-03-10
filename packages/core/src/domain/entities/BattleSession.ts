import { Health } from "../value-objects/Health";
import { Riddle } from "./Riddle";
import { TurnResult } from "./TurnResult";

export class BattleSession {
    public id: string;
    public playerHp: Health;
    public opponentHp: Health;
    public currentRiddle: Riddle | null = null;
    public askedRiddles: string[] = [];
    public history: Array<TurnResult> = [];

    constructor(id: string, initialPlayerHp: number = 100, initialOpponentHp: number = 100) {
        this.id = id;
        this.playerHp = Health.create(initialPlayerHp);
        this.opponentHp = Health.create(initialOpponentHp);
    }

    public assignRiddle(riddle: Riddle) {
        this.currentRiddle = riddle;
        this.askedRiddles.push(riddle.question);
    }

    public recordTurn(turnResult: TurnResult) {
        this.history.push(turnResult);

        // Domain rule: If score is < 50, the player takes damage (50 - score).
        // If score is > 50, the opponent takes damage (score - 50).
        if (turnResult.score < 50) {
            const damage = 50 - turnResult.score;
            const newHp = Math.max(0, this.playerHp.value - damage);
            this.playerHp = Health.create(newHp);
        } else if (turnResult.score > 50) {
            const damage = turnResult.score - 50;
            const newHp = Math.max(0, this.opponentHp.value - damage);
            this.opponentHp = Health.create(newHp);
        }
    }

    public isVictory(): boolean {
        return this.opponentHp.value <= 0;
    }

    public isDefeat(): boolean {
        return this.playerHp.value <= 0;
    }
}
