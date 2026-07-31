// Rehype plugin — adds Mac-style data-lang to code blocks
export function codeBlockPlugin() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;

      const props = node.properties || {};

      // Try Shiki's data-language attr first, then class-based fallback
      let lang = props.dataLanguage || props['data-language'] || '';

      if (!lang) {
        const allClasses = [
          ...(props.className || []),
          ...(node.children.find(
            (c) => c.type === 'element' && c.tagName === 'code'
          )?.properties?.className || []),
        ];
        lang = allClasses
          .find((c) => c.startsWith('language-'))
          ?.replace('language-', '') || '';
      }

      node.properties = {
        ...props,
        className: [...(props.className || []), 'mac-code-block'],
        dataLang: lang ? lang.toUpperCase() : 'CODE',
      };
    });
  };
}

function visit(tree, type, fn) {
  if (!tree || typeof tree !== 'object') return;
  if (tree.type === type) fn(tree);
  if (tree.children) {
    for (const child of tree.children) visit(child, type, fn);
  }
}
