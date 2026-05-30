export function parseMarkdown(text) {
  if (!text) return "";
  
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Code blocks: ```lang\ncode\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<div class="md-cb"><div class="md-ch">${lang || 'text'}</div><pre><code>${code}</code></pre></div>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-ic">$1</code>');
  
  // Bold
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  
  // Lists
  html = html.replace(/^[\s]*-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g, '<ul>$1</ul>');

  // Paragraphs / Newlines
  // We need to ensure we don't break <pre> sections.
  const chunks = html.split(/(<div class="md-cb">[\s\S]*?<\/div>)/);
  const processed = chunks.map(chunk => {
    if (chunk.startsWith('<div class="md-cb">')) return chunk;
    return chunk.replace(/\n/g, '<br/>');
  });
  
  return processed.join('');
}
