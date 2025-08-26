import { ReactNode } from 'react';
import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { Explorer } from './Explorer';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileSystemProvider } from './FileSystem';
import { FileViewer } from './FileViewer';
import { useFileSystem } from './FileSystem';
import WebContainerRunner from '@/components/WebContainerRunner';

interface LayoutProps {
  children: ReactNode;
}

function EditorContent({ children }: { children: ReactNode }) {
  const { activeFilePath } = useFileSystem();
  
  if (activeFilePath) {
    return <FileViewer />;
  }
  
  return (
    <div className="w-full h-full p-4">
      {children}
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TitleBar />
      <FileSystemProvider>
        <div className="h-[calc(100vh-2rem)] flex flex-col">
          <div className="flex flex-1 min-h-0">
            <ActivityBar />
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel minSize={15} defaultSize={18}>
                <Explorer />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={40} defaultSize={82}>
                <div className="flex flex-col h-full min-w-0 editor-surface">
                  <EditorTabs />
                  <div className="flex-1 overflow-hidden">
                    <EditorContent>
                      {children}
                    </EditorContent>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          {/* Global persistent WebContainer terminal */}
          <div className="border-t border-border">
            <WebContainerRunner />
          </div>
          <StatusBar />
        </div>
      </FileSystemProvider>
    </div>
  );
}