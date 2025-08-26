import { useMemo } from 'react';

export function Preview() {
  const src = useMemo(() => {
    const url = new URL(window.location.href);
    const target = url.searchParams.get('url');
    return target ?? '';
  }, []);

  return (
    <div style={{ padding: 12 }}>
      {src ? (
        <iframe
          src={src}
          title="Dev Server Preview"
          style={{ width: '100%', height: 'calc(100vh - 24px)', border: '1px solid var(--border)' }}
        />
      ) : (
        <div style={{ color: 'hsl(var(--muted-foreground))' }}>No preview URL provided.</div>
      )}
    </div>
  );
}


