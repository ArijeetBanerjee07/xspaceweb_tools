export function matchesHelpSearch(query: string, ...content: string[]) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const searchableText = content.join(" ").toLocaleLowerCase();
  return terms.every((term) => searchableText.includes(term));
}
