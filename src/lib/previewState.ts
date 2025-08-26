type Listener = (url: string | null) => void;

class PreviewState {
  private url: string | null = null;
  private listeners: Set<Listener> = new Set();

  getUrl(): string | null {
    return this.url;
  }

  setUrl(next: string | null): void {
    this.url = next;
    for (const l of this.listeners) {
      try { l(this.url); } catch {}
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const previewState = new PreviewState();



