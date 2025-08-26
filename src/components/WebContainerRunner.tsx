import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { type FileSystemTree } from '@webcontainer/api';
import { WebContainerManager } from '../lib/webcontainerManager';
import Terminal, { type TerminalHandle } from './Terminal';
import { terminalBus } from '../lib/terminalBus';

async function zipToFileTree(file: File): Promise<{ tree: FileSystemTree; rootDir: string | null; packageDir: string | null }> {
  const zip = await JSZip.loadAsync(file);
  const tree: FileSystemTree = {};

  const folders = new Set<string>();
  let topLevel: Set<string> = new Set();
  let packageJsonDirs: Set<string> = new Set();

  await Promise.all(
    Object.keys(zip.files).map(async (path) => {
      const entry = zip.files[path];
      if (entry.dir) {
        folders.add(path.replace(/\/$/, ''));
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 1) topLevel.add(parts[0]);
        return;
      }
      const content = await entry.async('uint8array');
      const parts = path.split('/');
      const fileName = parts.pop() as string;
      if (parts.length === 1) topLevel.add(parts[0]);
      if (fileName === 'package.json') {
        const dir = parts.join('/');
        packageJsonDirs.add(dir); // '' indicates root
      }
      let current: any = tree;
      for (const part of parts) {
        if (!current[part]) current[part] = { directory: {} };
        current = current[part].directory;
      }
      current[fileName] = { file: { contents: content } };
    })
  );

  // Ensure empty folders exist
  folders.forEach((folder) => {
    const parts = folder.split('/');
    let current: any = tree;
    for (const part of parts) {
      if (!current[part]) current[part] = { directory: {} };
      current = current[part].directory;
    }
  });

  // Determine rootDir if archive contains a single top-level folder
  const rootDir = topLevel.size === 1 ? Array.from(topLevel)[0] : null;
  // Prefer directory that actually contains package.json
  let packageDir: string | null = null;
  if (packageJsonDirs.size > 0) {
    // pick the shortest path (closest to root)
    packageDir = Array.from(packageJsonDirs).sort((a, b) => a.length - b.length)[0];
  }

  return { tree, rootDir, packageDir };
}

type Props = {
  className?: string;
  iframeStyle?: React.CSSProperties;
  installCommand?: string[];
  devCommand?: string[];
};

export default function WebContainerRunner(props: Props) {
  const manager = useMemo(() => WebContainerManager.getInstance(), []);
  const [appUrl, setAppUrl] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [termHeight, setTermHeight] = useState<number>(260);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const terminalRef = useRef<TerminalHandle | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const shellRef = useRef<any | null>(null);
  const projectCwdRef = useRef<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const logToTerminal = useCallback((chunk: string) => {
    terminalRef.current?.write(chunk.split('\n').join('\r\n'));
  }, []);

  useEffect(() => {
    (async () => {
      await manager.boot();
      // Auto-open a persistent shell on boot so terminal is always active
      if (!shellRef.current) {
        shellRef.current = await manager.openShell((chunk) => {
          logToTerminal(chunk.split('\n').join('\r\n'));
        });
        terminalRef.current?.onData((data) => {
          manager.writeToProcess(shellRef.current!, data);
        });
        logToTerminal('Interactive shell opened.\r\n');
      }
    })();
    // Listen for external open-terminal events
    const offOpen = terminalBus.on('open-terminal', async () => {
      // Ensure shell is open
      if (!shellRef.current) {
        shellRef.current = await manager.openShell((chunk) => {
          logToTerminal(chunk.split('\n').join('\r\n'));
        });
        terminalRef.current?.onData((data) => manager.writeToProcess(shellRef.current!, data));
        logToTerminal('Interactive shell opened.\r\n');
      }
      const el = document.getElementById('webcontainer-terminal');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // Focus the terminal for immediate typing
      setTimeout(() => terminalRef.current?.fit(), 50);
    });
    const offToggle = terminalBus.on('toggle-terminal', async () => {
      if (isCollapsed) {
        setIsCollapsed(false);
        setTimeout(() => terminalRef.current?.fit(), 100);
      } else {
        setIsCollapsed(true);
      }
      // Also ensure shell exists when expanding
      if (!isCollapsed && !shellRef.current) {
        shellRef.current = await manager.openShell((chunk) => {
          logToTerminal(chunk.split('\n').join('\r\n'));
        });
        terminalRef.current?.onData((data) => manager.writeToProcess(shellRef.current!, data));
      }
    });
    return () => {
      offOpen();
      offToggle();
    };
  }, [manager, logToTerminal]);

  const handleUpload = useCallback(async () => {
    const input = fileRef.current;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    terminalRef.current?.clear();
    logToTerminal(`Reading ${file.name}...\r\n`);
    let tree: FileSystemTree;
    try {
      const parsed = await zipToFileTree(file);
      tree = parsed.tree;
      const cwdPath = parsed.packageDir !== null ? parsed.packageDir : (parsed.rootDir ?? '');
      projectCwdRef.current = `/${cwdPath}`.replace(/\/+/g, '/');
    } catch (e) {
      logToTerminal('Failed to parse ZIP.\r\n');
      return;
    }
    logToTerminal('Mounting files...\r\n');
    await manager.mountFiles(tree);
    if (!projectCwdRef.current || projectCwdRef.current === '//') projectCwdRef.current = '/';
    logToTerminal(`Files mounted. Working dir: ${projectCwdRef.current}\r\n`);
    if (projectCwdRef.current === '/') {
      logToTerminal('Note: package.json not found in a subfolder; using root.\r\n');
    }

    // Auto open persistent shell if not opened yet
    if (!shellRef.current) {
      shellRef.current = await manager.openShell((chunk) => {
        logToTerminal(chunk);
      });
      terminalRef.current?.onData((data) => {
        manager.writeToProcess(shellRef.current, data);
      });
      logToTerminal('Interactive shell opened.\r\n');
    }
  }, [manager, logToTerminal]);

  const handleInstall = useCallback(async () => {
    setIsInstalling(true);
    logToTerminal('Running npm install...\r\n');
    // Auto-detect working directory if not set
    if (!projectCwdRef.current) {
      try {
        const detected = await manager.findPackageDir();
        projectCwdRef.current = detected;
        logToTerminal(`Detected package directory: ${detected}\r\n`);
      } catch {}
    }
    const code = await manager.installDependencies({
      installCommand: props.installCommand,
      onInstallOutput: logToTerminal,
      cwd: projectCwdRef.current ?? undefined,
    });
    setIsInstalling(false);
    logToTerminal(`Install finished with code ${code}.\r\n`);
  }, [manager, props.installCommand, logToTerminal]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setAppUrl(null);
    logToTerminal('Starting dev server...\r\n');
    // Auto-detect working directory if not set
    if (!projectCwdRef.current) {
      try {
        const detected = await manager.findPackageDir();
        projectCwdRef.current = detected;
        logToTerminal(`Detected package directory: ${detected}\r\n`);
      } catch {}
    }
    await manager.startDevServer({
      devCommand: props.devCommand,
      onDevOutput: logToTerminal,
      onServerReady: (_port, url) => {
        setAppUrl(url);
        logToTerminal(`Server ready at ${url}\r\n`);
        try {
          const previewUrl = `/preview?url=${encodeURIComponent(url)}`;
          window.open(previewUrl, '_blank');
        } catch {}
      },
      cwd: projectCwdRef.current ?? undefined,
    });
  }, [manager, props.devCommand, logToTerminal]);

  return (
    <div className={props.className}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          onChange={(e) => {
            const f = e.currentTarget.files && e.currentTarget.files[0];
            setSelectedFileName(f ? f.name : null);
          }}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            fontSize: 13,
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid hsl(var(--border))',
            background: 'linear-gradient(90deg, rgba(124,58,237,0.18), rgba(59,130,246,0.18))',
            color: 'hsl(var(--foreground))',
            boxShadow: '0 1px 0 rgba(0,0,0,0.25) inset, 0 0 0 1px rgba(124,58,237,0.12) inset',
          }}
        >
          Choose ZIP
        </button>
        <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
          {selectedFileName ?? 'No file chosen'}
        </span>
        <button onClick={handleUpload}>Mount ZIP</button>
        <button onClick={handleInstall} disabled={isInstalling}>Install</button>
        <button onClick={handleRun} disabled={isRunning}>Run Dev</button>
        <button onClick={async () => {
          if (!shellRef.current) {
            shellRef.current = await manager.openShell((chunk) => {
              logToTerminal(chunk.split('\n').join('\r\n'));
            });
            terminalRef.current?.onData((data) => {
              manager.writeToProcess(shellRef.current!, data);
            });
            logToTerminal('Interactive shell opened.\r\n');
          } else {
            logToTerminal('Shell is already open.\r\n');
          }
        }}>Open Shell</button>
      </div>
      <div id="webcontainer-terminal" style={{ position: 'relative', width: '100%', border: '1px solid hsl(var(--border))', borderRadius: 12, background: 'hsl(var(--card))', marginBottom: 8, overflow: 'hidden', boxShadow: '0 1px 0 rgba(124, 58, 237, 0.12) inset, 0 0 0 1px rgba(124, 58, 237, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'linear-gradient(180deg, rgba(124,58,237,0.08), rgba(59,130,246,0.06))', borderBottom: '1px solid hsl(var(--border))' }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Terminal</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIsCollapsed((c) => !c)} style={{ fontSize: 12 }}> {isCollapsed ? 'Expand' : 'Collapse'} </button>
          </div>
        </div>
        {!isCollapsed && <Terminal ref={terminalRef} heightPx={termHeight} />}
        <div
          onMouseDown={() => setIsResizing(true)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            cursor: 'ns-resize',
            background: 'linear-gradient(to bottom, rgba(124,58,237,0.15), rgba(59,130,246,0.2))'
          }}
        />
      </div>
      {isResizing && (
        <div
          onMouseMove={(e) => {
            const container = (e.currentTarget as HTMLDivElement).previousElementSibling as HTMLDivElement | null;
            // Use window coordinates to compute height
            const rect = container?.getBoundingClientRect();
            if (rect) {
              const newHeight = Math.max(160, Math.min(800, e.clientY - rect.top));
              setTermHeight(newHeight);
              terminalRef.current?.fit();
              try { localStorage.setItem('wc_term_height', String(newHeight)); } catch {}
            }
          }}
          onMouseUp={() => setIsResizing(false)}
          onMouseLeave={() => setIsResizing(false)}
          style={{ position: 'fixed', inset: 0, cursor: 'ns-resize' }}
        />
      )}
      <div style={{ marginTop: 8 }}>
        {appUrl && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button
              onClick={() => {
                try {
                  const previewUrl = `/preview?url=${encodeURIComponent(appUrl)}`;
                  window.open(previewUrl, '_blank');
                } catch {}
              }}
              style={{ fontSize: 12 }}
            >
              Open Preview in New Window
            </button>
          </div>
        )}
        {appUrl ? (
          <iframe
            src={appUrl}
            title="App Preview"
            style={{ width: '100%', height: 480, border: '1px solid #ccc', ...(props.iframeStyle || {}) }}
          />
        ) : (
          <div style={{ color: '#666' }}>App preview will appear here when the server is ready.</div>
        )}
      </div>
    </div>
  );
}


