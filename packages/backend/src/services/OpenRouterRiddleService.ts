// Implementation of the IRiddleService using Vercel AI SDK and OpenRouter.
// OpenRouter offers a unified API over models. We explicitly specify the "google/gemini-2.5-flash" model.
// Structured output is mapped safely back into the pure TurnResult domain model.

import { IRiddleService, TurnScore, Riddle } from "@riddle-master/core";
import { generateText, Output, LanguageModel } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const riddleSchema = z.object({
    question: z.string().describe("A short, clever riddle on any topic."),
    answer: z.string().describe("The exact intended answer or solution to the riddle.")
});

const evaluateSchema = z.object({
    reply: z.string().describe("A witty reply from the Riddle Master evaluating their answer (1-2 sentences)."),
    score: z.number().min(0).max(100).describe("The score out of 100 based on how clever or correct the answer is."),
    sentiment: z.enum(["hot", "cold"]).describe("Sentiment indicator: 'hot' if high score (>50) or 'cold' if low score.")
});

export class OpenRouterRiddleService implements IRiddleService {
    private openRouter;

    constructor(apiKey: string) {
        this.openRouter = createOpenRouter({
            apiKey: apiKey,
        });
    }

    public async generateRiddle(previousRiddles: string[] = []): Promise<{ question: string; answer: string }> {
        let prompt = "You are the Riddle Master, an ancient AI. Output a short, clever riddle and its intended answer. Make it unique and different every time.";
        if (previousRiddles.length > 0) {
            prompt += `\n\nDO NOT repeat any of these previous riddles:\n${previousRiddles.map(r => "- " + r).join("\n")}`;
        } else {
            prompt += `\n\nNEVER use this riddle: I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?`;
        }

        const { output } = await generateText({
            model: this.openRouter("google/gemini-3-flash-preview") as LanguageModel,
            temperature: 0.9,
            output: Output.object<{ question: string; answer: string }>({
                schema: riddleSchema as any,
            }),
            prompt: prompt
        });
        console.log("Riddle generated", output.answer);
        return output;
    }

    public async evaluateAnswer(riddle: Riddle, answer: string): Promise<TurnScore> {
        const { output } = await generateText({
            model: this.openRouter("google/gemini-3-flash-preview") as LanguageModel,
            output: Output.object<TurnScore>({
                schema: evaluateSchema as any,
            }),
            prompt: `
        You are the Riddle Master. A mortal attempts to answer your riddle.
        Riddle Question: "${riddle.question}"
        Intended Correct Answer: "${riddle.answer}"
        Mortal's Answer: "${answer}"
        
        Evaluate the answer. Give a witty reply in character. Provide a score from 0-100 where 100 means a perfect, genius answer. Give a sentiment of 'hot' if close/scorching and 'cold' if they are missing the mark.
      `,
        });

        return output;
    }
}
