Usage

1) Install deps (already added):

   - @webcontainer/api
   - xterm, xterm-addon-fit
   - jszip

2) Add components:

   - Import and render `WebContainerRunner` anywhere in your app.

Example

```tsx
import WebContainerRunner from './components/WebContainerRunner';

export default function Page() {
  return (
    <div>
      <h1>Run in WebContainer</h1>
      <WebContainerRunner />
    </div>
  );
}
```

Notes

- Upload a project ZIP that includes `package.json` and a `dev` script.
- You can override commands via props: `installCommand` and `devCommand`.
- Terminal streams the install and dev output. The iframe updates on `server-ready`.


