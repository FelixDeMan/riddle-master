import { TurnScore } from '../domain/entities/TurnScore';
import { Riddle } from '../domain/entities/Riddle';

export interface IRiddleService {
    /**
     * Generates a new riddle and its intended solution.
     */
    generateRiddle(previousRiddles?: string[]): Promise<{ question: string; answer: string }>;

    /**
     * Explores the user's answer and calculates their score, given the riddle and its intended solution.
     */
    evaluateAnswer(riddle: Riddle, answer: string): Promise<TurnScore>;
}
