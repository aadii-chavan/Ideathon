import { WebContainer, FileSystemTree, WebContainerProcess } from '@webcontainer/api';

export type InstallAndRunOptions = {
  installCommand?: string[];
  devCommand?: string[];
  env?: Record<string, string>;
  cwd?: string;
  onServerReady?: (port: number, url: string) => void;
  onInstallOutput?: (chunk: string) => void;
  onDevOutput?: (chunk: string) => void;
};

export class WebContainerManager {
  private static instance: WebContainerManager | null = null;
  private container: WebContainer | null = null;
  private bootPromise: Promise<WebContainer> | null = null;
  private devProcess: WebContainerProcess | null = null;
  private fsUnsubscribe: (() => void) | null = null;

  static getInstance(): WebContainerManager {
    if (!WebContainerManager.instance) {
      WebContainerManager.instance = new WebContainerManager();
    }
    return WebContainerManager.instance;
  }

  async boot(): Promise<WebContainer> {
    if (this.container) return this.container;
    if (this.bootPromise) return this.bootPromise;
    this.bootPromise = WebContainer.boot().then((wc) => {
      this.container = wc;
      return wc;
    }).finally(() => {
      // Keep bootPromise for concurrent callers but allow future boots only if container cleared
    });
    return this.bootPromise;
  }

  async mountFiles(tree: FileSystemTree): Promise<void> {
    const container = await this.boot();
    await container.mount(tree);
  }

  async readFile(path: string, encoding: 'utf8' | 'binary' = 'utf8'): Promise<string | Uint8Array> {
    const container = await this.boot();
    const data = await container.fs.readFile(path);
    if (encoding === 'utf8') {
      return new TextDecoder().decode(data);
    }
    return data;
  }

  async writeFile(path: string, data: string | Uint8Array): Promise<void> {
    const container = await this.boot();
    const toWrite = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    await container.fs.writeFile(path, toWrite);
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const container = await this.boot();
    await container.fs.mkdir(path, { recursive: options?.recursive ?? true });
  }

  async rm(path: string, options?: { recursive?: boolean }): Promise<void> {
    const container = await this.boot();
    await container.fs.rm(path, { recursive: options?.recursive ?? true });
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const container = await this.boot();
    await container.fs.rename(oldPath, newPath);
  }

  async listDir(path: string): Promise<{ name: string; isDirectory: boolean }[]> {
    const container = await this.boot();
    const entries = await container.fs.readdir(path, { withFileTypes: true } as any);
    // When withFileTypes not supported, fallback to stat
    if (Array.isArray(entries) && entries.length && typeof entries[0] === 'object' && 'isDirectory' in entries[0]) {
      return (entries as any[]).map((e) => ({ name: e.name, isDirectory: e.isDirectory() }));
    }
    const names: string[] = Array.isArray(entries) ? (entries as any) : [];
    const result: { name: string; isDirectory: boolean }[] = [];
    for (const name of names) {
      const stat = await (container.fs as any).stat(`${path === '/' ? '' : path}/${name}`);
      result.push({ name, isDirectory: !!stat?.isDirectory?.() });
    }
    return result;
  }

  async listTreeAsPaths(start: string = '/'): Promise<string[]> {
    const paths: string[] = [];
    const walk = async (dir: string) => {
      const items = await this.listDir(dir);
      for (const item of items) {
        const full = `${dir === '/' ? '' : dir}/${item.name}`;
        if (item.isDirectory) {
          await walk(full);
        } else {
          paths.push(full.replace(/^\//, ''));
        }
      }
    };
    await walk(start);
    return paths;
  }

  async findPackageDir(): Promise<string> {
    const paths = await this.listTreeAsPaths('/');
    const pkgPaths = paths.filter((p) => p.endsWith('/package.json') || p === 'package.json');
    if (pkgPaths.length === 0) return '/';
    // Choose the shortest path (closest to root)
    const chosen = pkgPaths.sort((a, b) => a.length - b.length)[0];
    const dir = chosen.replace(/\/package\.json$/, '');
    return dir === '' ? '/' : `/${dir}`;
  }

  watchFs(onChange: () => void): () => void {
    if (!this.container) return () => {};
    // @ts-expect-error watch is available at runtime
    const unwatch = (this.container.fs as any).watch?.(() => {
      onChange();
    });
    this.fsUnsubscribe = typeof unwatch === 'function' ? unwatch : null;
    return () => {
      try { this.fsUnsubscribe?.(); } catch (_) {}
      this.fsUnsubscribe = null;
    };
  }

  async installDependencies(options?: Pick<InstallAndRunOptions, 'installCommand' | 'onInstallOutput' | 'env' | 'cwd'>): Promise<number> {
    const container = await this.boot();
    const installCmd = options?.installCommand ?? ['npm', 'install'];
    const process = await container.spawn(installCmd[0], installCmd.slice(1), { env: options?.env, cwd: options?.cwd });
    const exitCode = await this.pipeProcessOutput(process, options?.onInstallOutput);
    return exitCode;
  }

  async startDevServer(options?: InstallAndRunOptions): Promise<WebContainerProcess> {
    const container = await this.boot();
    let devCmd = [...(options?.devCommand ?? ['npm', 'run', 'dev'])];

    // Force port 8080 across common CLIs
    const lower0 = (devCmd[0] || '').toLowerCase();
    const isNpmRun = lower0 === 'npm' && (devCmd[1] || '').toLowerCase() === 'run';
    const isPnpmRun = lower0 === 'pnpm' && (devCmd[1] || '').toLowerCase() === 'run';
    const isYarnRun = lower0 === 'yarn' && (devCmd[1] || '').toLowerCase() === 'run';
    const looksLikeVite = devCmd.join(' ').toLowerCase().includes('vite');
    const alreadyHasPort = devCmd.some((a) => /^(--port|-(p))$/i.test(a)) || devCmd.some((a) => /--port=\d+/.test(a));

    if (!alreadyHasPort) {
      if (isNpmRun || isPnpmRun || isYarnRun) {
        // Pass through to the underlying script: npm run dev -- --port 8080
        devCmd = [...devCmd, '--', '--port', '8080'];
      } else if (looksLikeVite || lower0 === 'vite') {
        devCmd = [...devCmd, '--port', '8080'];
      } else if (lower0 === 'next' || devCmd.join(' ').toLowerCase().includes('next')) {
        devCmd = [...devCmd, '-p', '8080'];
      } else if (lower0 === 'nuxt' || devCmd.join(' ').toLowerCase().includes('nuxt')) {
        devCmd = [...devCmd, '-p', '8080'];
      } else if (lower0 === 'react-scripts' || devCmd.join(' ').toLowerCase().includes('react-scripts')) {
        // CRA respects PORT env; keep env below
      } else if (lower0 === 'astro' || devCmd.join(' ').toLowerCase().includes('astro')) {
        devCmd = [...devCmd, '--port', '8080'];
      }
    }

    // Forward server ready events
    const off = container.on('server-ready', (port, url) => {
      options?.onServerReady?.(port, url);
    });

    const env = { ...(options?.env ?? {}), PORT: '8080', VITE_PORT: '8080' } as Record<string, string>;
    this.devProcess = await container.spawn(devCmd[0], devCmd.slice(1), { env, cwd: options?.cwd });

    // Stream dev output
    this.pipeProcessOutput(this.devProcess, options?.onDevOutput).finally(() => {
      off();
    });

    return this.devProcess;
  }

  async openShell(onOutput?: (chunk: string) => void): Promise<WebContainerProcess> {
    const container = await this.boot();
    const shell = await container.spawn('jsh');
    this.pipeProcessOutput(shell, onOutput);
    return shell;
  }

  async writeToProcess(process: WebContainerProcess, data: string): Promise<void> {
    await process.input?.getWriter().write(data);
  }

  async killDevServer(): Promise<void> {
    if (this.devProcess) {
      try {
        await this.devProcess.kill();
      } catch (_) {
        // ignore
      }
      this.devProcess = null;
    }
  }

  private async pipeProcessOutput(process: WebContainerProcess, onOutput?: (chunk: string) => void): Promise<number> {
    if (!process.output) {
      return 0;
    }
    const reader = process.output.getReader();
    let resultCode = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          onOutput?.(value);
        }
      }
    } finally {
      reader.releaseLock();
      resultCode = await process.exit;
    }
    return resultCode;
  }
}


