/** Order of the post grid on screen, so the post modal can step to the previous/next post. */
let order: string[] = [];

export function setFeedOrder(ids: string[]): void {
  order = ids;
}

export function neighbors(id: string): { prev: string | null; next: string | null } {
  const i = order.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  return { prev: order[i - 1] ?? null, next: order[i + 1] ?? null };
}
