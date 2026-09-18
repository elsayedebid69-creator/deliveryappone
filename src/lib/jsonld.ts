// Safely serialize structured data for inline <script type="application/ld+json">.
// JSON.stringify does not escape "<", so untrusted values could otherwise close
// the script tag and inject markup. Escaping "<" (and the JS line separators)
// keeps the payload inert while staying valid JSON.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
