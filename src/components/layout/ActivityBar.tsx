import { memo } from 'react';
import { LayoutDashboard, Upload, Shield, Bug, TrendingUp, FileText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useFileSystem } from './FileSystem';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/import', icon: Upload, label: 'Import' },
  { to: '/security', icon: Shield, label: 'Security' },
  { to: '/bugs', icon: Bug, label: 'Bugs' },
  { to: '/devops', icon: TrendingUp, label: 'DevOps' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export const ActivityBar = memo(function ActivityBar() {
  const { clearActiveFile } = useFileSystem();
  return (
    <div className="w-12 h-full border-r border-border bg-card/50 flex flex-col items-center py-2 gap-1">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} onClick={() => clearActiveFile()} className={({ isActive }) =>
          `w-9 h-9 grid place-items-center rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`
        } title={label}>
          <Icon className="w-4 h-4" />
        </NavLink>
      ))}
    </div>
  );
});


