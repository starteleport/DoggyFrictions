// Interface texts. The server picks the language (settings cookie, else the browser's) and embeds
// its texts in the page as window.AppTexts; the catalog lives in Localization/*.json.

/**
 * t('key') returns the text; t('key', a, b) also fills its {0}, {1}… placeholders.
 * A placeholder without an argument stays as it is (see textParts). A missing key shows as the key.
 */
export function t(key: string, ...args: (string | number)[]): string {
  const text = window.AppTexts?.[key];
  if (text === undefined) {
    return key;
  }
  return text.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
    const value = args[Number(index)];
    return value === undefined ? placeholder : String(value);
  });
}

/** A piece of a message: plain text, or a link when `href` is set. */
export interface TextPart {
  text: string;
  href?: string;
}

/**
 * Splits a text at its {0}, {1}… placeholders and puts the given parts in their place,
 * so that a message can carry a link without being assembled as HTML.
 */
export function textParts(text: string, ...args: TextPart[]): TextPart[] {
  return text.split(/(\{\d+\})/)
    .filter(piece => piece !== '')
    .map(piece => {
      const match = /^\{(\d+)\}$/.exec(piece);
      return (match && args[Number(match[1])]) || { text: piece };
    });
}

/** The settings menu: the choice is kept in a cookie, which the server reads to pick the texts. */
export function chooseLanguage(code: string) {
  document.cookie = `lang=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}
