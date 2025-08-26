import { memo } from 'react';
import { FileText, X as CloseIcon } from 'lucide-react';
import { useFileSystem } from './FileSystem';

export const EditorTabs = memo(function EditorTabs() {
  const { openFiles, activeFilePath, closeFile, isDirty } = useFileSystem();

  return (
    <div className="h-9 border-b border-border bg-card/50 flex items-stretch overflow-x-auto">
      {openFiles.map((path) => {
        const filename = path.split('/').filter(Boolean).pop() || path;
        const active = activeFilePath === path;
        const dirty = isDirty(path);
        return (
          <div key={path} className={`px-3 text-xs flex items-center gap-2 border-r border-border whitespace-nowrap ${active ? 'bg-background' : 'hover:bg-muted/50 text-muted-foreground'}`}>
            <FileText className="w-3.5 h-3.5" />
            <span>{filename}{dirty ? '*' : ''}</span>
            <button className="opacity-60 hover:opacity-100" onClick={() => closeFile(path)}>
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
});


