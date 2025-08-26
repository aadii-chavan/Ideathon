import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// Removed mock data usage; page now initializes with empty data until a real scan populates it

const scanStatus = ['Initializing', 'Scanning dependencies', 'Analyzing vulnerabilities', 'Generating report', 'Complete'];

export function SecurityScan() {
  const [currentScanStep, setCurrentScanStep] = useState(4);
  const [isScanning, setIsScanning] = useState(false);
  const [dependencies, setDependencies] = useState<Array<{
    id: number;
    package: string;
    currentVersion: string;
    latestVersion: string;
    vulnerabilities: { high: number; medium: number; low?: number };
    status: 'critical' | 'outdated' | 'updated' | string;
    description?: string;
  }>>([]);
  const [vulnerabilityData, setVulnerabilityData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  const startScan = () => {
    setIsScanning(true);
    setCurrentScanStep(0);
    
    const interval = setInterval(() => {
      setCurrentScanStep(prev => {
        if (prev >= scanStatus.length - 1) {
          clearInterval(interval);
          setIsScanning(false);
          return scanStatus.length - 1;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'outdated':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'updated':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Needs Fix</Badge>;
      case 'outdated':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Update Available</Badge>;
      case 'updated':
        return <Badge variant="default" className="bg-success/20 text-success">Up-to-date</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const totalVulnerabilities = vulnerabilityData.reduce((sum, item) => sum + item.value, 0);
  const totalDependencies = dependencies.length;
  const totalOutdated = dependencies.filter((d) => d.status === 'outdated').length;
  const totalCriticalIssues = dependencies.filter((d) => d.status === 'critical' || (d.vulnerabilities?.high ?? 0) > 0).length;
  const securityScore = totalDependencies === 0 ? 0 : Math.max(0, Math.round(((totalDependencies - totalCriticalIssues) / totalDependencies) * 100));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Security & Dependency Scan</h1>
          <p className="text-muted-foreground">
            Comprehensive security analysis and dependency vulnerability assessment
          </p>
        </div>
        <Button
          onClick={startScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          {isScanning ? 'Scanning...' : 'Run New Scan'}
        </Button>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-dark border-primary/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="font-medium">Security Scan in Progress</span>
                </div>
                <Progress value={(currentScanStep / (scanStatus.length - 1)) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {scanStatus[currentScanStep]}... {Math.round((currentScanStep / (scanStatus.length - 1)) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Vulnerability Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">{totalVulnerabilities}</div>
                  <p className="text-sm text-muted-foreground">Total Vulnerabilities</p>
                </div>
                
                {vulnerabilityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={vulnerabilityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {vulnerabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">No vulnerability data yet. Run a scan.</div>
                )}

                <div className="space-y-2">
                  {vulnerabilityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  {vulnerabilityData.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center">No vulnerabilities found</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scan Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="card-dark">
            <CardHeader>
              <CardTitle>Scan Statistics</CardTitle>
              <CardDescription>
                Latest security scan results and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-green-500">{totalDependencies}</div>
                  <p className="text-sm text-muted-foreground mt-1">Dependencies Scanned</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-500">{totalOutdated}</div>
                  <p className="text-sm text-muted-foreground mt-1">Outdated Packages</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-red-500">{totalCriticalIssues}</div>
                  <p className="text-sm text-muted-foreground mt-1">Critical Issues</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-2xl font-bold text-blue-500">{securityScore}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Security Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dependencies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-dark">
          <CardHeader>
            <CardTitle>Dependency Analysis</CardTitle>
            <CardDescription>
              Detailed analysis of project dependencies and their security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Current Version</TableHead>
                    <TableHead>Latest Version</TableHead>
                    <TableHead>Vulnerabilities</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dependencies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No dependencies to display. Run a scan to populate results.
                      </TableCell>
                    </TableRow>
                  )}
                  {dependencies.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(dep.status)}
                          <div>
                            <p className="font-medium">{dep.package}</p>
                            <p className="text-xs text-muted-foreground">{dep.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dep.currentVersion}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          {dep.latestVersion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {dep.vulnerabilities.high > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {dep.vulnerabilities.high} High
                            </Badge>
                          )}
                          {dep.vulnerabilities.medium > 0 && (
                            <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                              {dep.vulnerabilities.medium} Medium
                            </Badge>
                          )}
                          {dep.vulnerabilities.high === 0 && dep.vulnerabilities.medium === 0 && (
                            <Badge variant="default" className="text-xs bg-success/20 text-success">
                              None
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(dep.status)}
                      </TableCell>
                      <TableCell>
                        {dep.status !== 'updated' && (
                          <Button size="sm" variant="outline">
                            Update
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
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