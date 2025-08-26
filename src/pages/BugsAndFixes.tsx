import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, CheckCircle, Clock, AlertTriangle, Zap, Code, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export function BugsAndFixes() {
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [fixingProgress, setFixingProgress] = useState(0);
  const [bugsState, setBugsState] = useState<any[]>([]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Medium':
        return <Bug className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <Code className="w-4 h-4 text-blue-500" />;
      default:
        return <Bug className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fixed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleFixAll = async () => {
    setIsFixingAll(true);
    setFixingProgress(0);

    const pendingBugs = bugsState.filter(bug => bug.status === 'Pending');
    
    for (let i = 0; i <= pendingBugs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFixingProgress((i / pendingBugs.length) * 100);
      
      if (i < pendingBugs.length) {
        setBugsState(prev => prev.map(bug => 
          bug.status === 'Pending' && bug.id === pendingBugs[i].id 
            ? { ...bug, status: 'Fixed', fixedAt: new Date().toISOString() }
            : bug
        ));
      }
    }

    setIsFixingAll(false);
  };

  const stats = {
    total: bugsState.length,
    fixed: bugsState.filter(bug => bug.status === 'Fixed').length,
    pending: bugsState.filter(bug => bug.status === 'Pending').length,
    inProgress: bugsState.filter(bug => bug.status === 'In Progress').length
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bugs & Auto-Fix</h1>
          <p className="text-muted-foreground">
            Automated bug detection and intelligent fixes for your codebase
          </p>
        </div>
        <Button
          onClick={handleFixAll}
          disabled={isFixingAll || stats.pending === 0}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isFixingAll ? 'Fixing...' : 'Fix All Issues'}
        </Button>
      </div>

      {/* Fix Progress */}
      {isFixingAll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-dark border-primary/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-medium">Auto-fixing issues in progress...</span>
                </div>
                <Progress value={fixingProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Applying automated fixes and validating solutions... {Math.round(fixingProgress)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <Bug className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fixed</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">{stats.fixed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-gray-400">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bugs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-dark">
          <CardHeader>
            <CardTitle>Detected Issues</CardTitle>
            <CardDescription>
              Comprehensive list of bugs and issues found in your codebase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugsState.map((bug) => (
                    <motion.tr
                      key={bug.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{bug.file}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm">{bug.issue}</p>
                          <p className="text-xs text-muted-foreground mt-1">{bug.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(bug.severity)}
                          <Badge variant={getSeverityColor(bug.severity) as any}>
                            {bug.severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(bug.status)}
                          <Badge 
                            variant={bug.status === 'Fixed' ? 'default' : 'secondary'}
                            className={bug.status === 'Fixed' ? 'bg-green-500/20 text-green-500' : ''}
                          >
                            {bug.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs">{bug.solution}</p>
                      </TableCell>
                      <TableCell>
                        {bug.status === 'Pending' && (
                          <Button size="sm" variant="outline" className="text-xs">
                            Fix Now
                          </Button>
                        )}
                        {bug.status === 'Fixed' && bug.fixedAt && (
                          <p className="text-xs text-muted-foreground">
                            Fixed {new Date(bug.fixedAt).toLocaleDateString()}
                          </p>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}