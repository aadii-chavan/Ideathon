type TerminalEvent = 'open-terminal';

class TerminalBus {
  private target = new EventTarget();

  on(event: TerminalEvent, handler: () => void): () => void {
    const wrapped = () => handler();
    this.target.addEventListener(event, wrapped as EventListener);
    return () => this.target.removeEventListener(event, wrapped as EventListener);
  }

  emitOpen(): void {
    this.target.dispatchEvent(new Event('open-terminal'));
  }
}

export const terminalBus = new TerminalBus();


