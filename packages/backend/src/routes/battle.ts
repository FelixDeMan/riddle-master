import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { BattleSession, IRiddleService, IBattleRepository } from "@riddle-master/core";
import { randomUUID } from "crypto";

export default async function battleRoutes(
    fastify: FastifyInstance,
    options: { aiService: IRiddleService; repository: IBattleRepository }
) {
    const { aiService, repository } = options;

    fastify.post("/api/battle/start", async (request: FastifyRequest, reply: FastifyReply) => {
        // Generate a fresh session
        const sessionId = randomUUID();
        const session = new BattleSession(sessionId);

        // Have the AI generate the first riddle
        const riddleData = await aiService.generateRiddle();
        session.assignRiddle({ id: randomUUID(), question: riddleData.question, answer: riddleData.answer });

        // Persist the state
        await repository.save(session);

        return {
            sessionId: session.id,
            riddle: session.currentRiddle?.question,
            playerHp: session.playerHp.value,
            opponentHp: session.opponentHp.value
        };
    });

    fastify.post("/api/battle/:id/answer", async (request: FastifyRequest<{ Params: { id: string }, Body: { answer: string } }>, reply: FastifyReply) => {

        const session = await repository.findById(request.params.id);
        if (!session) {
            return reply.code(404).send({ error: "Battle session not found" });
        }

        if (!session.currentRiddle) {
            return reply.code(400).send({ error: "No active riddle in this session" });
        }

        const { answer } = request.body;

        // Core interaction with the AI Service to score the result
        const result = await aiService.evaluateAnswer(session.currentRiddle, answer);

        // Enforcing Core Domain rule: register score
        session.recordTurn({ userReply: answer, score: result.score, riddle: session.currentRiddle });

        // Generate next riddle, passing all previously asked riddles to avoid repetition
        const newRiddleData = await aiService.generateRiddle(session.askedRiddles);
        session.assignRiddle({ id: randomUUID(), question: newRiddleData.question, answer: newRiddleData.answer });

        // Save updated aggregate back to repository
        await repository.save(session);

        return {
            turnResult: result,
            newRiddle: session.currentRiddle?.question,
            playerHp: session.playerHp.value,
            opponentHp: session.opponentHp.value,
            isVictory: session.isVictory(),
            isDefeat: session.isDefeat()
        };
    });
}
