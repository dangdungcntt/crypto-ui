<script setup lang="ts">
import {useMarkdownIt}       from '@/composables/markdownIt.ts';
import {cn}                  from '@/lib/utils.ts';
import type {HTMLAttributes} from 'vue';

const props = defineProps<{ content: string, class?: HTMLAttributes['class'] }>();
const md = useMarkdownIt();
</script>

<template>
  <div :class="cn('overflow-auto markdown border border-gray-400 rounded p-4', props.class)" v-html="md.render(content)"></div>
</template>
<style scoped>
.markdown p {
  margin-bottom: 8px;
}
</style>
