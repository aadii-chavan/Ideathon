import { memo } from 'react';
import { GitBranch, Wifi, Circle, TerminalSquare } from 'lucide-react';
import { terminalBus } from '@/lib/terminalBus';

export const StatusBar = memo(function StatusBar() {
  return (
    <div className="h-6 text-[11px] px-3 border-t border-border bg-muted/40 flex items-center justify-between text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> main</span>
        <span className="flex items-center gap-1"><Circle className="w-2 h-2 text-emerald-500" /> Ready</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Online</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>TypeScript React</span>
        <button
          onClick={() => terminalBus.emitToggle()}
          className="ml-2 inline-flex items-center gap-1 rounded border border-border px-2 py-[2px] text-xs hover:bg-muted/60"
          title="Open Terminal"
        >
          <TerminalSquare className="w-3 h-3" />
          Toggle Terminal
        </button>
      </div>
    </div>
  );
});


