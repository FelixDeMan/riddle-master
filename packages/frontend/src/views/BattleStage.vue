<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useBattleStore } from '../stores/battleStore';
import Hud from '../components/Hud.vue';

const store = useBattleStore();
const answerInput = ref('');
const isFlashingRed = ref(false);

watch(() => store.lastTurnResult, (newResult) => {
  if (newResult && newResult.score < 50) {
    isFlashingRed.value = true;
    setTimeout(() => {
      isFlashingRed.value = false;
    }, 400); // flash for 400ms
  }
});

const backgroundStyle = computed(() => {
  if (isFlashingRed.value) {
    return {
      background: '#ef4444', // Tailwind red-500
      transition: 'background 0.1s ease-in-out'
    };
  }
  if (store.lastTurnResult && store.lastTurnResult.score >= 50) {
    const score = store.lastTurnResult.score;
    // Map score 50-100 to lightness 90-40 for a nice blue gradient
    const intensity = (score - 50) / 50; 
    const lightness = 95 - (intensity * 40); 
    return {
      background: `linear-gradient(to top, hsl(220, 100%, ${lightness}%), #f8f8d8)`,
      transition: 'background 1s ease-in-out'
    };
  }
  return {
    background: '#f8f8d8',
    transition: 'background 1s ease-in-out'
  };
});

onMounted(() => {
  store.startBattle();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (store.dialogStep === 'reply' && (e.key === 'Enter' || e.key === ' ')) {
    store.advanceDialog();
  }
}

function handleAdvance() {
  if (store.dialogStep === 'reply' || store.dialogStep === 'gameOver') {
    if (store.dialogStep === 'gameOver') {
       store.startBattle();
    } else {
       store.advanceDialog();
    }
  }
}

function submit() {
  if (answerInput.value.trim() && store.dialogStep === 'riddle' && !store.loading) {
    store.submitAnswer(answerInput.value.trim());
    answerInput.value = '';
  }
}
</script>

<template>
  <div :style="backgroundStyle" class="h-screen w-full flex flex-col relative overflow-hidden font-sans select-none text-black">
    
    <!-- Battle Area -->
    <div class="flex-1 relative w-full max-w-5xl mx-auto mt-10">
      
      <!-- Opponent (Top Right) -->
      <div class="absolute top-10 right-10 flex flex-col items-center">
        <!-- Opponent Sprite -->
        <img src="../assets/opponent.png" class="w-64 h-64 object-contain z-10 mix-blend-multiply" />
        <!-- Shadow base -->
        <div class="w-48 h-12 bg-black/20 rounded-[100%] absolute bottom-[-10px] z-0 blur-sm"></div>
      </div>

      <!-- Opponent HUD (Top Left) -->
      <Hud 
        name="RIDDLE MASTER"
        :level="100"
        :hp="store.opponentHp"
        side="left"
      />

      <!-- Player (Bottom Left) -->
      <div class="absolute bottom-10 left-10 flex flex-col items-center">
        <!-- Player Sprite -->
        <img src="../assets/player.png" class="w-64 h-64 object-contain z-10 mix-blend-multiply drop-shadow-lg" />
        <div class="w-56 h-14 bg-black/20 rounded-[100%] absolute bottom-[-10px] z-0 blur-sm"></div>
      </div>

      <!-- Player HUD (Bottom Right) -->
     <Hud 
        name="YOU"
        :level="1"
        :hp="store.playerHp"
        side="right"
        :extra-info="'EXP: 0/1000'"
      />

    </div>

    <!-- Dialog / UI Box -->
    <div class="h-56 w-full border-t-[12px] border-gray-700 bg-white p-6 relative cursor-pointer" @click="handleAdvance">
      <div class="border-[6px] border-double border-gray-400 h-full rounded-2xl p-6 flex flex-col justify-between bg-gray-100/50 pointer-events-none">
        
        <template v-if="store.loading">
          <p class="text-3xl font-serif text-gray-700 animate-pulse">Riddle Master is thinking...</p>
        </template>
        
        <template v-else-if="store.dialogStep === 'reply' && store.lastTurnResult">
          <div>
            <p class="text-3xl font-serif text-gray-800 leading-relaxed font-bold">
              "{{ store.lastTurnResult.reply }}"
            </p>
            <p class="mt-4 text-sm text-gray-500 font-bold uppercase tracking-widest px-4 py-2 bg-white/80 inline-block rounded border">
              Score: {{ store.lastTurnResult.score }} | Damage dealt: {{ store.lastTurnResult.score > 50 ? store.lastTurnResult.score - 50 : 0 }} to Master, {{ store.lastTurnResult.score < 50 ? 50 - store.lastTurnResult.score : 0 }} to You
            </p>
          </div>
          <p class="text-gray-400 animate-pulse text-right font-bold tracking-widest">Click or Press Enter to continue ▼</p>
        </template>
        
        <template v-else-if="store.dialogStep === 'riddle' && store.currentRiddle">
          <div>
            <p class="text-3xl font-serif text-gray-800 leading-relaxed font-bold">
              "{{ store.currentRiddle }}"
            </p>
          </div>
          <div class="mt-4 pointer-events-auto">
             <form @submit.prevent="submit" class="flex gap-4">
                <input 
                  v-model="answerInput" 
                  type="text" 
                  placeholder="What is your answer?" 
                  class="flex-1 border-b-4 border-gray-400 bg-transparent text-2xl font-bold px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
                  autofocus
                />
                <button type="submit" class="bg-red-500 text-white px-10 text-xl font-bold uppercase tracking-widest rounded shadow-md border-b-4 border-red-700 hover:bg-red-600 hover:border-red-800 active:translate-y-1 active:border-b-0 transition-all">
                  FIGHT
                </button>
             </form>
          </div>
        </template>

        <template v-else-if="store.dialogStep === 'gameOver'">
          <div v-if="store.isVictory">
            <p class="text-4xl font-bold text-green-600 uppercase tracking-widest">VICTORY!</p>
            <p class="text-2xl mt-2 text-gray-700 font-serif">The Riddle Master fainted!</p>
          </div>
          <div v-else-if="store.isDefeat">
            <p class="text-4xl font-bold text-red-600 uppercase tracking-widest">DEFEAT!</p>
            <p class="text-2xl mt-2 text-gray-700 font-serif">You blacked out...</p>
          </div>
          <p class="text-gray-400 animate-pulse text-right mt-4 pointer-events-auto">
             <button @click="store.startBattle()" class="px-6 py-3 border-4 border-gray-500 bg-gray-200 text-black hover:bg-white rounded-lg font-bold uppercase tracking-widest text-lg shadow-sm">Play Again</button>
          </p>
        </template>

      </div>
    </div>
    
  </div>
</template>
