<script setup lang="ts">

import {Button}      from '@/components/ui/button';
import {ChevronDown} from 'lucide-vue-next';

defineProps<{ isCollapsed: boolean }>();
</script>

<template>
  <Button variant="outline">
    <slot>
      More info
    </slot>
    <ChevronDown :class="{'rotate-180': isCollapsed}"/>
  </Button>
</template>
