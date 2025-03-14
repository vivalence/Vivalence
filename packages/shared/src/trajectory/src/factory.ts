export function createFactory<T>() {
  const parsers: Record<string, (input: string) => T[]> = {};

  return {
    registerParser(type: string, parser: (input: string) => T[]): void {
      parsers[type] = parser;
    },

    parse(input: string): T[] | null {
      for (const [type, parser] of Object.entries(parsers)) {
        const results = parser(input);
        if (results && results.length > 0) {
          return results;
        }
      }
      return null;
    },
  };
}
