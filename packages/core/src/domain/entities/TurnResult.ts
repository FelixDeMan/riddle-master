import { Riddle } from "./Riddle";

export interface TurnResult {
    userReply: string;
    score: number;
    riddle: Riddle;
}