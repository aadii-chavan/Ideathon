import { memo } from 'react';
import { Minus, Square, X } from 'lucide-react';

export const TitleBar = memo(function TitleBar() {
  return (
    <div className="h-8 px-3 flex items-center justify-between border-b border-border bg-muted/40 select-none">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="ml-2 font-medium">SelfHeal EDI</span>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <Minus className="w-3 h-3" />
        <Square className="w-3 h-3" />
        <X className="w-3 h-3" />
      </div>
    </div>
  );
});


