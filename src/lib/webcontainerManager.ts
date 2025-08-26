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

  async installDependencies(options?: Pick<InstallAndRunOptions, 'installCommand' | 'onInstallOutput' | 'env' | 'cwd'>): Promise<number> {
    const container = await this.boot();
    const installCmd = options?.installCommand ?? ['npm', 'install'];
    const process = await container.spawn(installCmd[0], installCmd.slice(1), { env: options?.env, cwd: options?.cwd });
    const exitCode = await this.pipeProcessOutput(process, options?.onInstallOutput);
    return exitCode;
  }

  async startDevServer(options?: InstallAndRunOptions): Promise<WebContainerProcess> {
    const container = await this.boot();
    const devCmd = options?.devCommand ?? ['npm', 'run', 'dev'];

    // Forward server ready events
    const off = container.on('server-ready', (port, url) => {
      options?.onServerReady?.(port, url);
    });

    this.devProcess = await container.spawn(devCmd[0], devCmd.slice(1), { env: options?.env, cwd: options?.cwd });

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


