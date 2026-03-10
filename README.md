# 🧙‍♂️ Riddle Master

Welcome to **Riddle Master**, a small, creative AI-native application built as an RPG-style battle game. Instead of a standard text-based chat interface, this app pits you against an ancient AI "Riddle Master" in a battle of wits, reminiscent of classic turn-based games like Pokémon.

The Riddle Master generates unique riddles and evaluates your answers. Depending on how clever or accurate your answer is, the AI scores your response (0-100), dealing damage to either the Master (if you are right/clever) or to you (if you are wrong).

## 🚀 How to Run Locally

You'll need Node.js (v18+) and npm installed.

1. **Clone or navigate** to the project folder:
   ```bash
   cd riddle-master
   ```

2. **Install dependencies** across the monorepo:
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in `packages/backend/` and add your OpenRouter API key:
   ```bash
   OPENROUTER_API_KEY=your_key_here
   ```

4. **Start the development servers:**
   From the root of the monorepo, run:
   ```bash
   npm run dev
   ```
   This will build the core package, start the Fastify backend on `http://localhost:3000`, and launch the Vue frontend development server. Open the local Vite URL provided in your terminal.

## 🤖 LLM & Model Used

I used **Google's `gemini-3-flash-preview`** via **OpenRouter**, orchestrated by the **Vercel AI SDK**. 

I chose this model for its extremely fast inference speed and cost-effectiveness, which is critical for maintaining an engaging, conversational game loop without making the player wait too long during battles.

## 🏗️ Key Design Decisions

- **Domain-Driven Design (DDD) & Clean Architecture:** 
  The project is structured as a monorepo using npm workspaces (`core`, `backend`, `frontend`). The `core` package holds pure Domain Entities (`Riddle`, `TurnScore`, `BattleSession`) and interface ports (`IBattleRepository`, `IRiddleService`). This isolation ensures the domain logic remains entirely agnostic of frameworks or infrastructure.
- **Ports & Adapters (Hexagonal Architecture):**
  The AI integrations and storage mechanics are abstracted behind interfaces. `OpenRouterRiddleService` simply implements `IRiddleService`. This makes testing easier and future-proofs the app: swapping the LLM provider or adding a real database requires zero changes to the core logic.
- **AI-Driven Game Mechanics via Structured Outputs:**
  Using `zod` and the Vercel AI SDK's `generateObject` capabilities, we force the LLM to output strongly typed JSON (a witty response, a sentiment, and a score). We bridge the gap between non-deterministic AI text generation and deterministic game health/damage math.
- **Reactive UI & Dynamic Aesthetics:**
  The Vue 3 frontend uses dynamic CSS backgrounds that intelligently react to the LLM's evaluation state—flashing red on damage, or transitioning into a victorious blue gradient based on the exact evaluation score.

## ⚖️ Trade-offs Made

- **In-Memory Database:** For the sake of the time constraint and keeping the setup simple, I used an `InMemoryBattleRepository`. Player attributes and battle sessions reset if the backend server restarts.
- **No Streaming:** The Vercel AI SDK is currently being used to generate structured objects in one go. Because we need the final "score" to calculate UI logic before the dialogue starts, we wait for the complete response rather than streaming it token-by-token. 
- **Error Handling:** Minimal robust retry logic or rate-limit handling was implemented for the LLM service to keep the 5-hour constraint manageable.

## 🔮 What I Would Build Next (With More Time)

- **Persistent Storage:** Swap the in-memory repository for PostgreSQL / Prisma to save high scores, allow users to resume battles, and maintain leaderboards.
- **Streaming UI:** Stream the LLM's response text token-by-token into the dialogue box *while* holding the score calculation until the end, to make the experience feel significantly more responsive.
- **Items & Abilities:** Expand the RPG mechanics by allowing the player to use "hints" (items) or giving the Riddle Master different personalities and "elemental" riddle themes.
- **Audio & Animations:** Add 8-bit sound effects, screen shakes on taking damage, and better CSS sprite sheet animations to polish the RPG nostalgia factor.
