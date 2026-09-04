/**
 * Replace `[Placeholder]` tokens in eNotes and email automations. Placeholders are dynamic fields
 * the system fills when the text is shown or sent, so administrators must not remove them.
 */
export function renderTemplate(text: string, context: Record<string, string | undefined>) {
  return text.replace(/\[([A-Za-z]+)\]/g, (token, key: string) => context[key] ?? token)
}

export function placeholdersIn(text: string) {
  return Array.from(new Set(Array.from(text.matchAll(/\[([A-Za-z]+)\]/g), (match) => match[1] ?? '')))
}
