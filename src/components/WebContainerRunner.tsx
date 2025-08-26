import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { type FileSystemTree } from '@webcontainer/api';
import { WebContainerManager } from '../lib/webcontainerManager';
import Terminal, { type TerminalHandle } from './Terminal';
import { terminalBus } from '../lib/terminalBus';

async function zipToFileTree(file: File): Promise<FileSystemTree> {
  const zip = await JSZip.loadAsync(file);
  const tree: FileSystemTree = {};

  const folders = new Set<string>();

  await Promise.all(
    Object.keys(zip.files).map(async (path) => {
      const entry = zip.files[path];
      if (entry.dir) {
        folders.add(path.replace(/\/$/, ''));
        return;
      }
      const content = await entry.async('uint8array');
      const parts = path.split('/');
      const fileName = parts.pop() as string;
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

  return tree;
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
  const terminalRef = useRef<TerminalHandle | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const shellRef = useRef<any | null>(null);

  const logToTerminal = useCallback((chunk: string) => {
    terminalRef.current?.write(chunk.replaceAll('\n', '\r\n'));
  }, []);

  useEffect(() => {
    (async () => {
      await manager.boot();
      // Auto-open a persistent shell on boot so terminal is always active
      if (!shellRef.current) {
        shellRef.current = await manager.openShell((chunk) => {
          logToTerminal(chunk.replaceAll('\n', '\r\n'));
        });
        terminalRef.current?.onData((data) => {
          manager.writeToProcess(shellRef.current!, data);
        });
        logToTerminal('Interactive shell opened.\r\n');
      }
    })();
    // Listen for external open-terminal events
    const off = terminalBus.on('open-terminal', async () => {
      // Ensure shell is open
      if (!shellRef.current) {
        shellRef.current = await manager.openShell((chunk) => {
          logToTerminal(chunk.replaceAll('\n', '\r\n'));
        });
        terminalRef.current?.onData((data) => manager.writeToProcess(shellRef.current!, data));
        logToTerminal('Interactive shell opened.\r\n');
      }
      const el = document.getElementById('webcontainer-terminal');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // Focus the terminal for immediate typing
      setTimeout(() => terminalRef.current?.fit(), 50);
    });
    return () => {
      off();
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
      tree = await zipToFileTree(file);
    } catch (e) {
      logToTerminal('Failed to parse ZIP.\r\n');
      return;
    }
    logToTerminal('Mounting files...\r\n');
    await manager.mountFiles(tree);
    logToTerminal('Files mounted.\r\n');

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
    const code = await manager.installDependencies({
      installCommand: props.installCommand,
      onInstallOutput: logToTerminal,
    });
    setIsInstalling(false);
    logToTerminal(`Install finished with code ${code}.\r\n`);
  }, [manager, props.installCommand, logToTerminal]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setAppUrl(null);
    logToTerminal('Starting dev server...\r\n');
    await manager.startDevServer({
      devCommand: props.devCommand,
      onDevOutput: logToTerminal,
      onServerReady: (_port, url) => {
        setAppUrl(url);
        logToTerminal(`Server ready at ${url}\r\n`);
      },
    });
  }, [manager, props.devCommand, logToTerminal]);

  return (
    <div className={props.className}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input ref={fileRef} type="file" accept=".zip" />
        <button onClick={handleUpload}>Mount ZIP</button>
        <button onClick={handleInstall} disabled={isInstalling}>Install</button>
        <button onClick={handleRun} disabled={isRunning}>Run Dev</button>
        <button onClick={async () => {
          if (!shellRef.current) {
            shellRef.current = await manager.openShell((chunk) => {
              logToTerminal(chunk.replaceAll('\n', '\r\n'));
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
      <div id="webcontainer-terminal" style={{ position: 'relative', width: '100%', border: '1px solid #333', borderRadius: 4, background: '#000', marginBottom: 8 }}>
        <Terminal ref={terminalRef} heightPx={termHeight} />
        <div
          onMouseDown={() => setIsResizing(true)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 6,
            cursor: 'ns-resize',
            background: 'rgba(255,255,255,0.06)'
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
            }
          }}
          onMouseUp={() => setIsResizing(false)}
          onMouseLeave={() => setIsResizing(false)}
          style={{ position: 'fixed', inset: 0, cursor: 'ns-resize' }}
        />
      )}
      <div style={{ marginTop: 8 }}>
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


