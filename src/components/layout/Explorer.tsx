import { memo, useMemo, useRef, useState } from 'react';
import { FolderTree, FolderOpen, Folder, FileCode2, UploadCloud, Package } from 'lucide-react';
import { useFileSystem, type FileNode } from './FileSystem';

interface ExplorerProps {
  title?: string;
}

function Node({ node, depth }: { node: FileNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const { openFile } = useFileSystem();
  const paddingLeft = 8 + depth * 12;
  
  if (node.type === 'dir') {
    return (
      <div>
        <div 
          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/40 rounded px-1 transition-colors" 
          style={{ paddingLeft }} 
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />}
          <span className="text-sm text-foreground/90">{node.name}</span>
        </div>
        {expanded && node.children?.map((child) => (
          <Node key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }
  
  return (
    <div 
      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/40 rounded px-1 transition-colors" 
      style={{ paddingLeft }} 
      onClick={() => openFile(node.path)}
    >
      <FileCode2 className="w-4 h-4 text-foreground/70" />
      <span className="text-sm text-foreground/90">{node.name}</span>
    </div>
  );
}

export const Explorer = memo(function Explorer({ title = 'EXPLORER' }: ExplorerProps) {
  const { root, loadZip } = useFileSystem();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const topLevel = useMemo(() => root?.children ?? [], [root]);

  return (
    <div className="h-full w-64 border-r border-border bg-card/30">
      <div className="h-8 px-2 text-[10px] tracking-wider text-muted-foreground flex items-center justify-between border-b border-border">
        <span className="px-1">{title}</span>
        <button 
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors" 
          onClick={() => inputRef.current?.click()} 
          title="Import project ZIP"
        >
          <UploadCloud className="w-4 h-4" />
        </button>
        <input 
          ref={inputRef} 
          type="file" 
          accept=".zip,application/zip" 
          className="hidden" 
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await loadZip(file);
            e.currentTarget.value = '';
          }} 
        />
      </div>
      
      <div className="p-2 text-sm space-y-1 overflow-auto h-[calc(100%-2rem)] themed-scrollbar">
        {!root ? (
          <div className="text-xs text-muted-foreground px-1 space-y-3 py-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Package className="w-8 h-8 opacity-50" />
              <div>
                <p className="font-medium">No Project Loaded</p>
                <p className="text-xs mt-1">Upload a ZIP file to view project structure</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs">You can also:</p>
              <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                <li>• Go to Import Project page</li>
                <li>• Drag & drop ZIP here</li>
                <li>• Click upload icon above</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="px-1 py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FolderTree className="w-3 h-3" />
                Project Files
              </div>
            </div>
            {topLevel.map((node) => (
              <Node key={node.path} node={node} depth={0} />
            ))}
          </>
        )}
      </div>
    </div>
  );
});


