export function pascalToSnakeCase(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }
  