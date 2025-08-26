import { motion } from 'framer-motion';
import { TrendingUp, Shield, Bug, FileText, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const statCards = [
  {
    title: 'Total Bugs Fixed',
    value: 0,
    icon: Bug,
    change: '0%',
    changeType: 'positive' as const,
    description: 'from last month'
  },
  {
    title: 'Security Patches',
    value: 0,
    icon: Shield,
    change: '0%',
    changeType: 'positive' as const,
    description: 'applied this month'
  },
  {
    title: 'Projects Analyzed',
    value: 0,
    icon: Activity,
    change: '0%',
    changeType: 'positive' as const,
    description: 'total projects'
  },
  {
    title: 'Reports Generated',
    value: 0,
    icon: FileText,
    change: '0%',
    changeType: 'positive' as const,
    description: 'this quarter'
  }
];

export function Dashboard() {
  const activityFeed: Array<{ id: string; message: string; project: string; timestamp: string; icon: any }> = [];
  const projects: Array<{ id: string; name: string; language: string; status: string; coverage: number; bugsFixed: number; vulnerabilities: number }> = [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your self-healing platform performance and recent activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="card-dark hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">{stat.description}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>
                Real-time updates from your self-healing processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityFeed.length === 0 && (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="card-dark">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                Current status of your analyzed projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="card-dark">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for your self-healing platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">--</div>
                <p className="text-sm text-muted-foreground mt-1">Average Fix Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">--</div>
                <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <p className="text-sm text-muted-foreground mt-1">Monitoring Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}