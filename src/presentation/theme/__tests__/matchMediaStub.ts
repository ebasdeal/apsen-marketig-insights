type Listener = () => void;

export interface MatchMediaController {
  setMatches: (matches: boolean) => void;
  listenerCount: () => number;
}

export function stubMatchMedia(initial: boolean): MatchMediaController {
  let matches = initial;
  const listeners = new Set<Listener>();
  window.matchMedia = (query: string) =>
    ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  return {
    setMatches: (next) => {
      matches = next;
      listeners.forEach((listener) => listener());
    },
    listenerCount: () => listeners.size,
  };
}
