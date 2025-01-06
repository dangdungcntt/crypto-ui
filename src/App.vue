<script setup lang="ts">
import EllipticSignatureDemo from '@/components/EllipticSignatureDemo.vue';
import {Button}              from '@/components/ui/button';
import {useUrlSearchParams}  from '@vueuse/core';
import {computed}            from 'vue';

const params = useUrlSearchParams('history');
const isECDSA = computed(() => params.algo !== 'ecgdsa');

</script>
<template>
  <div class="min-h-screen bg-background p-4 md:p8 space-y-2">
    <div class="flex gap-2 max-w-6xl mx-auto">
      <Button @click="params.algo = ''" class="w-full" :variant="isECDSA ? 'default' : 'outline'">ECDSA</Button>
      <Button @click="params.algo = 'ecgdsa'" class="w-full" :variant="!isECDSA ? 'default' : 'outline'">ECGDSA</Button>
    </div>
    <EllipticSignatureDemo v-if="isECDSA" type="ecgdsa"/>
    <EllipticSignatureDemo v-else type="ecdsa"/>
  </div>
</template>
