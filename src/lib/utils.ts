import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// GitHub import helpers
export function normalizeGithubUrl(input: string): { owner: string; repo: string; ref?: string } | null {
  try {
    const url = new URL(input);
    if (url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    // Detect refs like /tree/<branch> or /blob/<branch> paths
    let ref: string | undefined;
    if (parts[2] === 'tree' && parts[3]) ref = parts.slice(3).join('/');
    if (parts[2] === 'blob' && parts[3]) ref = parts.slice(3).join('/');
    return { owner, repo, ref };
  } catch {
    return null;
  }
}

export function buildGithubArchiveUrl(input: string): string | null {
  const parsed = normalizeGithubUrl(input);
  if (!parsed) return null;
  const { owner, repo, ref } = parsed;
  const resolvedRef = ref && ref.length > 0 ? ref : 'HEAD';
  return `https://codeload.github.com/${owner}/${repo}/zip/${encodeURIComponent(resolvedRef)}`;
}

export async function fetchGithubZipAsFile(githubUrl: string): Promise<File> {
  const archiveUrl = buildGithubArchiveUrl(githubUrl);
  if (!archiveUrl) throw new Error('Invalid GitHub URL');
  // Use dev proxy if available to avoid CORS in local dev
  const useProxy = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const proxiedUrl = useProxy ? archiveUrl.replace('https://codeload.github.com/', '/gh/') : archiveUrl;
  const res = await fetch(proxiedUrl);
  if (!res.ok) {
    throw new Error(`Failed to download repo: ${res.status} ${res.statusText}`);
  }
  const blob = await res.blob();
  const nameFromUrl = (() => {
    try {
      const { owner, repo, ref } = normalizeGithubUrl(githubUrl)!;
      return `${owner}-${repo}-${ref ?? 'HEAD'}.zip`;
    } catch {
      return 'github-repo.zip';
    }
  })();
  return new File([blob], nameFromUrl, { type: 'application/zip' });
}
