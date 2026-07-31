// Rehype plugin — wraps code blocks in Mac-style panels
export function codeBlockPlugin() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return;

      // Get language from child <code> class
      const codeEl = node.children.find((c) => c.tagName === 'code');
      const langClass = (codeEl?.properties?.className || [])
        .find((c) => c.startsWith('language-'))
        ?.replace('language-', '')
        ?.toUpperCase() || 'CODE';

      // Wrap pre in Mac-style container
      node.properties = node.properties || {};
      node.properties.className = [
        ...(node.properties.className || []),
        'mac-code-block',
      ];
      node.properties['dataLang'] = langClass;
    });
  };
}

// Simple tree walker
function visit(tree, type, fn) {
  if (!tree || typeof tree !== 'object') return;
  if (tree.type === type) fn(tree);
  if (tree.children) {
    for (const child of tree.children) visit(child, type, fn);
  }
}
