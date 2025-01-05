<script setup lang="ts">
import {cn}                                               from '@/lib/utils.ts';
import {CollapsibleContent, type CollapsibleContentProps} from 'radix-vue';
import type {HTMLAttributes}                              from 'vue';

const props = defineProps<CollapsibleContentProps & {
  class?: HTMLAttributes['class']
}>();
</script>

<template>
  <CollapsibleContent v-bind="props"
                      :class="cn('overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down', props.class)">
    <slot/>
  </CollapsibleContent>
</template>
