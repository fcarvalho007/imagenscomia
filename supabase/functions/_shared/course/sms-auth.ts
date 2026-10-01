// Normalises the existing SMSOnline credential before building the Basic header.
// The same secret powers the legacy webinar sender; accepted shapes are
// "user:pass", a pre-encoded Base64 string, or either one prefixed with "Basic ".
// Stray whitespace or newlines introduced when the secret was saved produce a
// malformed header and the provider answers 401.
export function smsBasicAuth(raw: string): string | null {
  const value = raw.trim().replace(/^Basic\s+/i, "").trim();
  if (!value) return null;
  if (value.includes(":")) return btoa(value);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  return value;
}
