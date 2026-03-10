export interface TurnScore {
    reply: string;
    score: number; // 0-100
    sentiment: 'hot' | 'cold';
}
