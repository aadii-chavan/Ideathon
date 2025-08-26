import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Shield, 
  Bug, 
  TrendingUp, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    exact: true
  },
  { 
    name: 'Import Project', 
    href: '/import', 
    icon: Upload
  },
  { 
    name: 'Security Scan', 
    href: '/security', 
    icon: Shield
  },
  { 
    name: 'Bugs & Fixes', 
    href: '/bugs', 
    icon: Bug
  },
  { 
    name: 'DevOps Insights', 
    href: '/devops', 
    icon: TrendingUp
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: FileText
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "h-screen border-r border-border bg-card/30 backdrop-blur-sm transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-item",
                active && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-1">Pro Plan</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Unlimited projects and advanced features
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}