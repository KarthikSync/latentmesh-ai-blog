export function getReadingTime(text: string): number {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '')        // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links → text
    .replace(/#{1,6}\s/g, '')       // headings
    .replace(/[*_~>{}\[\]|`-]/g, '') // markdown syntax
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ').filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 238));
}
