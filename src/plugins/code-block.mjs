// Rehype plugin — adds Mac-style data-lang to code blocks
export function codeBlockPlugin() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;

      // Search for language class on both pre and child code
      const allClasses = [
        ...(node.properties?.className || []),
        ...(node.children.find((c) => c.type === 'element' && c.tagName === 'code')
          ?.properties?.className || []),
      ];

      const lang = allClasses
        .find((c) => c.startsWith('language-'))
        ?.replace('language-', '')
        ?.toUpperCase() || 'CODE';

      node.properties = node.properties || {};
      node.properties.className = [
        ...(node.properties.className || []),
        'mac-code-block',
      ];
      node.properties.dataLang = lang;
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
