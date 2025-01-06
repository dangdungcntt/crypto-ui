<script setup lang="ts">
import EllipticSignatureDemo from '@/components/EllipticSignatureDemo.vue';
import {useUrlSearchParams}  from '@vueuse/core';

const params = useUrlSearchParams('history');

</script>
<template>
  <div class="min-h-screen bg-background p-8">
    <EllipticSignatureDemo v-if="params.algo == 'ecgdsa'" type="ecgdsa"/>
    <EllipticSignatureDemo v-else type="ecdsa"/>
  </div>
</template>
