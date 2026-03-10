import Fastify from "fastify";
import dotenv from "dotenv";
import battleRoutes from "./routes/battle";
import { OpenRouterRiddleService } from "./services/OpenRouterRiddleService";
import { BattleSession, IBattleRepository } from "@riddle-master/core";

dotenv.config();

const fastify = Fastify({ logger: true });

// --- Infrastructure: In-Memory DB Adapter ---
export class InMemoryBattleRepository implements IBattleRepository {
    private store = new Map<string, BattleSession>();

    async findById(id: string): Promise<BattleSession | null> {
        const session = this.store.get(id);
        return session ? session : null; // In a real app we'd map data layer structs to Domain entities here.
    }
    async save(session: BattleSession): Promise<void> {
        this.store.set(session.id, session);
    }
}



// --- Composition Root ---
const repository = new InMemoryBattleRepository();
const openRouterKey = process.env.OPENROUTER_API_KEY;

if (!openRouterKey) {
    fastify.log.error("OPENROUTER_API_KEY is missing. Exiting.");
    process.exit(1);
}

// Dependency Injection decision point
const aiService = new OpenRouterRiddleService(openRouterKey)



fastify.register(async (instance) => {
    battleRoutes(instance, { aiService, repository });
});

fastify.get("/health", async () => {
    return { status: "ok" };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        fastify.log.info("Riddle Master API running at http://localhost:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
