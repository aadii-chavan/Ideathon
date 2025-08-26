import { memo } from 'react';
import { useFileSystem } from './FileSystem';
import Editor from '@monaco-editor/react';

function inferLanguage(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  const lower = path.toLowerCase();
  if (lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js')) return 'javascript';
  if (lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.rs')) return 'rust';
  return 'typescript';
}

export const FileViewer = memo(function FileViewer() {
  const { activeFilePath, getContent, updateFileContent } = useFileSystem();
  const content = activeFilePath ? getContent(activeFilePath) : undefined;
  if (!content) return null;

  if (content.kind === 'image') {
    return (
      <div className="w-full h-full overflow-auto grid place-items-center p-6 bg-background">
        <img src={content.data} alt={activeFilePath!} className="max-w-full max-h-full object-contain rounded" />
      </div>
    );
  }

  const language = inferLanguage(activeFilePath);
  const code = content.data;

  return (
    <div className="w-full h-full">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          fontSize: 13,
          minimap: { enabled: true },
          smoothScrolling: true,
          wordWrap: 'on',
          scrollbar: { verticalScrollbarSize: 12, horizontalScrollbarSize: 12 },
          automaticLayout: true,
        }}
        onChange={(val) => updateFileContent(activeFilePath!, val ?? '')}
      />
    </div>
  );
});


