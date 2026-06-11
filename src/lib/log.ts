/** URL for a single log entry, mirroring the Obsidian Log/YYYY/MM/ layout. */
export function logPostPath(date: string): string {
  const [year, month] = date.split('-');
  return `/log/${year}/${month}/${date}`;
}

/** Plain-text excerpt from markdown, for meta descriptions. */
export function logExcerpt(markdown: string, max = 160): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#>*_`~-]/g, ' ') // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
