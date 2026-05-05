const bannedWords = ["badword1", "badword2", "spamlink", "violation"];

export function checkMessageContent(text: string) {
  if (!text || typeof text !== 'string') return { allowed: false, reason: 'empty' };
  const lower = text.toLowerCase();
  for (const w of bannedWords) {
    if (lower.includes(w)) return { allowed: false, reason: `contains banned word: ${w}` };
  }
  // simple length/format checks
  if (text.length > 1000) return { allowed: false, reason: 'too_long' };
  if (/http:\/\/|https:\/\//i.test(text) && text.length < 10) return { allowed: false, reason: 'suspicious_url' };
  return { allowed: true };
}
