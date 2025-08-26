import { memo, useState } from 'react';

export const ChatPanel = memo(function ChatPanel() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Ask me anything about your project.' },
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">Chat</div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block rounded px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary/10 border border-primary/30' : 'bg-muted/40 border border-border'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = input.trim();
          if (!value) return;
          setMessages((prev) => [...prev, { role: 'user', text: value }]);
          setInput('');
        }}
        className="border-t border-border p-2 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
          placeholder="Type a message..."
        />
        <button className="rounded border border-border px-3 text-sm hover:bg-muted/60" type="submit">Send</button>
      </form>
    </div>
  );
});



