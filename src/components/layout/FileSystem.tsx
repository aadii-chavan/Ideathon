import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
};

type LoadedContent = {
  kind: 'text' | 'image' | 'binary';
  mime?: string;
  data: string; // text or data URL (for images)
};

type FileSystemContextType = {
  root: FileNode | null;
  openFiles: string[];
  activeFilePath: string | null;
  loadZip: (file: File) => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  clearActiveFile: () => void;
  getContent: (path: string) => LoadedContent | undefined;
  updateFileContent: (path: string, data: string) => void;
  isDirty: (path: string) => boolean;
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

function buildTree(paths: string[]): FileNode {
  const root: FileNode = { name: 'root', path: '', type: 'dir', children: [] };
  for (const fullPath of paths) {
    const parts = fullPath.split('/').filter(Boolean);
    let current = root;
    let currentPath = '';
    parts.forEach((part, idx) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = idx === parts.length - 1;
      if (!current.children) current.children = [];
      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'dir',
          children: isLast ? undefined : []
        };
        current.children.push(child);
      }
      current = child;
    });
  }
  return root;
}

function inferMimeFromExtension(path: string): string | undefined {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.md')) return 'text/markdown';
  if (lower.endsWith('.txt')) return 'text/plain';
  if (lower.endsWith('.ts')) return 'text/plain';
  if (lower.endsWith('.tsx')) return 'text/plain';
  if (lower.endsWith('.js')) return 'text/plain';
  if (lower.endsWith('.jsx')) return 'text/plain';
  if (lower.endsWith('.css')) return 'text/css';
  if (lower.endsWith('.html')) return 'text/html';
  return undefined;
}

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [zip, setZip] = useState<JSZip | null>(null);
  const [root, setRoot] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, LoadedContent>>(new Map());
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const loadZip = useCallback(async (file: File) => {
    try {
      const nextZip = await JSZip.loadAsync(file);
      setZip(nextZip);
      const filePaths = Object.keys(nextZip.files).filter((p) => !nextZip.files[p].dir);
      const tree = buildTree(filePaths);
      setRoot(tree);
      setOpenFiles([]);
      setActiveFilePath(null);
      setCache(new Map());
      setDirty(new Set());
      
      toast({
        title: "Project Loaded Successfully",
        description: `${file.name} - ${filePaths.length} files extracted`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error loading zip:', error);
      toast({
        title: "Failed to Load Project",
        description: "Please ensure the file is a valid ZIP archive",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  }, [toast]);

  const openFile = useCallback(async (path: string) => {
    if (!zip) return;
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }
    setActiveFilePath(path);
    if (!cache.has(path)) {
      try {
        const entry = zip.file(path);
        if (!entry) return;
        const mime = inferMimeFromExtension(path);
        if (mime && mime.startsWith('image/')) {
          const blob = await entry.async('blob');
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const content: LoadedContent = { kind: 'image', mime, data: dataUrl };
          setCache((prev) => new Map(prev).set(path, content));
        } else {
          const text = await entry.async('string');
          const content: LoadedContent = { kind: 'text', mime: mime || 'text/plain', data: text };
          setCache((prev) => new Map(prev).set(path, content));
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        toast({
          title: "Failed to Open File",
          description: `Could not load ${path}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [zip, openFiles, cache, toast]);

  const closeFile = useCallback((path: string) => {
    setOpenFiles((prev) => prev.filter((p) => p !== path));
    setCache((prev) => {
      const next = new Map(prev);
      next.delete(path);
      return next;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
    setActiveFilePath((curr) => {
      if (curr !== path) return curr;
      const remaining = openFiles.filter((p) => p !== path);
      return remaining.length ? remaining[remaining.length - 1] : null;
    });
  }, [openFiles]);

  const clearActiveFile = useCallback(() => {
    setActiveFilePath(null);
  }, []);

  const updateFileContent = useCallback((path: string, data: string) => {
    setCache((prev) => {
      const next = new Map(prev);
      const existing = next.get(path);
      if (existing && existing.kind === 'text') {
        next.set(path, { ...existing, data });
      } else {
        next.set(path, { kind: 'text', mime: 'text/plain', data });
      }
      return next;
    });
    setDirty((prev) => new Set(prev).add(path));
  }, []);

  const isDirty = useCallback((path: string) => dirty.has(path), [dirty]);

  const getContent = useCallback((path: string) => cache.get(path), [cache]);

  const value = useMemo<FileSystemContextType>(() => ({
    root,
    openFiles,
    activeFilePath,
    loadZip,
    openFile,
    closeFile,
    clearActiveFile,
    getContent,
    updateFileContent,
    isDirty
  }), [root, openFiles, activeFilePath, loadZip, openFile, closeFile, clearActiveFile, getContent, updateFileContent, isDirty]);

  return (
    <FileSystemContext.Provider value={value}>{children}</FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const ctx = useContext(FileSystemContext);
  if (!ctx) throw new Error('useFileSystem must be used within FileSystemProvider');
  return ctx;
}


