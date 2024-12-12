<template>
  <div class="p-5 h-screen items-center justify-center container mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center">Natwise</h1>
      <p class="text-center">Your banking app!</p>
    </div>
    <div class="card mx-auto">
        <MeterGroup :value="value" />
    </div>
  </div>
</template>

<script setup>
import MeterGroup from 'primevue/metergroup';
import { ref } from "vue";

const value = ref([{ label: 'Space used', value: 15, color: 'var(--p-primary-color)' }]);
</script>
