<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  level: number;
  hp: number;
  maxHp?: number;
  side: 'left' | 'right'; // Determines alignment and animation
  extraInfo?: string;     // e.g., "EXP: 0/1000"
}

const props = withDefaults(defineProps<Props>(), {
  maxHp: 100
});

const hpPercentage = computed(() => (props.hp / props.maxHp) * 100);

// Determine color based on health remaining
const hpColorClass = computed(() => {
  if (hpPercentage.value <= 20) return 'bg-red-500';
  if (hpPercentage.value <= 50) return 'bg-yellow-400';
  return 'bg-green-500';
});

// Determine layout classes based on which side the HUD is on
const containerClasses = computed(() => ({
  'absolute w-72 bg-white border-4 border-gray-700 p-4 shadow-xl': true,
  'top-20 left-10 rounded-bl-xl animate-slide-in-left': props.side === 'left',
  'bottom-20 right-10 rounded-tl-xl animate-slide-in-right': props.side === 'right',
}));
</script>

<template>
  <div :class="containerClasses">
    <div class="flex justify-between items-center mb-1">
      <span class="font-bold text-gray-800 uppercase tracking-widest text-lg">
        {{ name }}
      </span>
      <span class="text-sm font-bold text-gray-600">Lv{{ level }}</span>
    </div>

    <div v-if="side === 'right'" class="flex justify-end pr-2 text-sm font-bold text-gray-600 mb-1">
      HP: {{ hp }} / {{ maxHp }}
    </div>

    <div class="w-full bg-gray-300 h-4 rounded-full overflow-hidden border border-gray-400">
      <div 
        class="h-full transition-all duration-700 ease-out"
        :class="hpColorClass"
        :style="{ width: hpPercentage + '%' }"
      ></div>
    </div>

    <div v-if="extraInfo" class="flex justify-end mt-2">
      <span class="bg-gray-200 px-2 py-1 rounded text-xs font-bold font-mono tracking-widest border border-gray-400">
        {{ extraInfo }}
      </span>
    </div>
  </div>
</template>