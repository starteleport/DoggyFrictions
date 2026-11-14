export {};

declare global {
  interface Window {
    /** Interface texts in the language of the request (key → text), embedded by Views/Shared/_Layout.cshtml. */
    AppTexts: Record<string, string>;
  }
}
