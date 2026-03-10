import { BattleSession } from "../domain/entities/BattleSession";

export interface IBattleRepository {
    findById(id: string): Promise<BattleSession | null>;
    save(session: BattleSession): Promise<void>;
}