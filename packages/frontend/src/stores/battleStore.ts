// The store acts as the Frontend representation of our Core Domain's BattleSession.
// Keeping it thin ensures the business logic remains in the Core or Backend.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TurnScore } from '@riddle-master/core';

export const useBattleStore = defineStore('battle', () => {
    const sessionId = ref<string | null>(null);
    const currentRiddle = ref<string | null>(null);
    const playerHp = ref<number>(100);
    const opponentHp = ref<number>(100);
    const isVictory = ref<boolean>(false);
    const isDefeat = ref<boolean>(false);
    const lastTurnResult = ref<TurnScore | null>(null);
    const loading = ref<boolean>(false);
    const dialogStep = ref<'riddle' | 'reply' | 'gameOver'>('riddle');

    async function startBattle() {
        loading.value = true;
        try {
            const response = await fetch('/api/battle/start', { method: 'POST' });
            const data = await response.json();
            sessionId.value = data.sessionId;
            currentRiddle.value = data.riddle;
            playerHp.value = data.playerHp;
            opponentHp.value = data.opponentHp;
            isVictory.value = false;
            isDefeat.value = false;
            lastTurnResult.value = null;
            dialogStep.value = 'riddle';
        } catch (err) {
            console.error("Failed to start battle:", err);
        } finally {
            loading.value = false;
        }
    }

    async function submitAnswer(answer: string) {
        if (!sessionId.value) return;
        loading.value = true;
        try {
            const response = await fetch(`/api/battle/${sessionId.value}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });
            const data = await response.json();

            lastTurnResult.value = data.turnResult;
            currentRiddle.value = data.newRiddle;
            playerHp.value = data.playerHp;
            opponentHp.value = data.opponentHp;
            isVictory.value = data.isVictory;
            isDefeat.value = data.isDefeat;
            dialogStep.value = 'reply';
        } catch (err) {
            console.error("Failed to submit answer:", err);
        } finally {
            loading.value = false;
        }
    }

    function advanceDialog() {
        if (dialogStep.value === 'reply') {
            if (isVictory.value || isDefeat.value) {
                dialogStep.value = 'gameOver';
            } else {
                dialogStep.value = 'riddle';
            }
        }
    }

    return {
        sessionId,
        currentRiddle,
        playerHp,
        opponentHp,
        isVictory,
        isDefeat,
        lastTurnResult,
        loading,
        dialogStep,
        startBattle,
        submitAnswer,
        advanceDialog
    };
});
