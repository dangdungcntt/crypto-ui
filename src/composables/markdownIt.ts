import mk         from '@traptitech/markdown-it-katex';
import markdownIt from 'markdown-it';

const md = markdownIt();
md.use(mk, {'blockClass': 'math-block', 'errorColor': ' #cc0000'});

export function useMarkdownIt() {
  return md;
}
