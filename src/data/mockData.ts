export const mockUser = {
  name: "Kartik Ashok Jadhao",
  email: "kartik@example.com",
  avatar: "https://i.pravatar.cc/100?seed=kartik"
};

export const mockProjects = [
  {
    id: 1,
    name: "AI Self-Healing Tool",
    language: "Python",
    bugsFixed: 42,
    vulnerabilities: 3,
    status: "In Progress",
    lastScan: "2024-01-15T10:30:00Z",
    dependencies: 156,
    coverage: 87
  },
  {
    id: 2,
    name: "E-Commerce Platform",
    language: "Node.js",
    bugsFixed: 18,
    vulnerabilities: 1,
    status: "Completed",
    lastScan: "2024-01-14T15:45:00Z",
    dependencies: 89,
    coverage: 92
  },
  {
    id: 3,
    name: "Mobile Banking App",
    language: "React Native",
    bugsFixed: 31,
    vulnerabilities: 5,
    status: "Critical",
    lastScan: "2024-01-15T09:15:00Z",
    dependencies: 203,
    coverage: 78
  }
];

export const mockStats = {
  totalBugsFixed: 1847,
  securityPatchesApplied: 234,
  projectsAnalyzed: 67,
  reportsGenerated: 89,
  avgFixTime: "4.2 mins",
  successRate: 94.8
};

export const mockActivityFeed = [
  {
    id: 1,
    type: "bug_fix",
    message: "Bug fixed in userAuth.js",
    timestamp: "2 minutes ago",
    icon: "✅",
    project: "E-Commerce Platform"
  },
  {
    id: 2,
    type: "security",
    message: "Security patch applied to bcrypt v5.2.0",
    timestamp: "5 minutes ago",
    icon: "🔒",
    project: "AI Self-Healing Tool"
  },
  {
    id: 3,
    type: "devops",
    message: "DevOps suggestion added: Switch to Docker multi-stage build",
    timestamp: "12 minutes ago",
    icon: "🚀",
    project: "Mobile Banking App"
  },
  {
    id: 4,
    type: "scan",
    message: "Dependency scan completed for React project",
    timestamp: "18 minutes ago",
    icon: "🔍",
    project: "AI Self-Healing Tool"
  },
  {
    id: 5,
    type: "fix",
    message: "Auto-fixed memory leak in component lifecycle",
    timestamp: "25 minutes ago",
    icon: "🔧",
    project: "E-Commerce Platform"
  }
];

export const mockDependencies = [
  {
    id: 1,
    package: "express",
    currentVersion: "4.17.1",
    latestVersion: "4.18.2",
    vulnerabilities: { high: 1, medium: 2, low: 0 },
    status: "outdated",
    description: "Fast, unopinionated, minimalist web framework"
  },
  {
    id: 2,
    package: "lodash",
    currentVersion: "4.17.15",
    latestVersion: "4.17.21",
    vulnerabilities: { high: 0, medium: 0, low: 0 },
    status: "outdated",
    description: "A modern JavaScript utility library"
  },
  {
    id: 3,
    package: "react",
    currentVersion: "17.0.2",
    latestVersion: "18.2.0",
    vulnerabilities: { high: 0, medium: 1, low: 0 },
    status: "critical",
    description: "A JavaScript library for building user interfaces"
  },
  {
    id: 4,
    package: "axios",
    currentVersion: "0.24.0",
    latestVersion: "1.6.2",
    vulnerabilities: { high: 0, medium: 0, low: 0 },
    status: "updated",
    description: "Promise based HTTP client for the browser and node.js"
  }
];

export const mockBugs = [
  {
    id: 1,
    file: "login.js",
    issue: "Null pointer exception in authentication handler",
    severity: "High",
    status: "Fixed",
    fixedAt: "2024-01-15T10:30:00Z",
    description: "Potential null reference when user object is undefined",
    solution: "Added null checks and default values"
  },
  {
    id: 2,
    file: "auth.py",
    issue: "Deprecated API usage for password hashing",
    severity: "Medium",
    status: "Pending",
    description: "Using deprecated bcrypt functions",
    solution: "Update to latest bcrypt API methods"
  },
  {
    id: 3,
    file: "App.tsx",
    issue: "Memory leak warning in useEffect hook",
    severity: "Low",
    status: "Fixed",
    fixedAt: "2024-01-15T09:15:00Z",
    description: "Missing cleanup in component unmount",
    solution: "Added cleanup function to prevent memory leaks"
  },
  {
    id: 4,
    file: "database.js",
    issue: "SQL injection vulnerability",
    severity: "Critical",
    status: "In Progress",
    description: "Unsafe query construction with user input",
    solution: "Implement parameterized queries"
  }
];

export const mockDevOpsInsights = [
  {
    id: 1,
    title: "Docker Multi-Stage Builds",
    description: "Switch to Docker multi-stage builds to reduce image size by 60%",
    impact: "High",
    effort: "Low",
    category: "Performance",
    estimatedSavings: "$200/month"
  },
  {
    id: 2,
    title: "Nginx Caching Optimization",
    description: "Enable browser caching and gzip compression for static assets",
    impact: "Medium",
    effort: "Low",
    category: "Performance",
    estimatedSavings: "$80/month"
  },
  {
    id: 3,
    title: "GitHub Dependabot Integration",
    description: "Enable automated dependency updates and security patches",
    impact: "High",
    effort: "Medium",
    category: "Security",
    estimatedSavings: "$150/month"
  },
  {
    id: 4,
    title: "CI/CD Pipeline Optimization",
    description: "Optimize build pipeline to reduce deployment time by 40%",
    impact: "Medium",
    effort: "High",
    category: "DevOps",
    estimatedSavings: "$300/month"
  }
];

export const mockReports = [
  {
    id: 1,
    title: "Security Vulnerability Report",
    type: "Security",
    generatedAt: "2024-01-15T10:30:00Z",
    status: "Recent",
    findings: 12,
    severity: "High"
  },
  {
    id: 2,
    title: "Code Quality Assessment",
    type: "Quality",
    generatedAt: "2024-01-14T15:45:00Z",
    status: "Recent",
    findings: 8,
    severity: "Medium"
  },
  {
    id: 3,
    title: "Dependency Analysis Report",
    type: "Dependencies",
    generatedAt: "2024-01-13T09:20:00Z",
    status: "Archived",
    findings: 23,
    severity: "Low"
  },
  {
    id: 4,
    title: "Performance Optimization Report",
    type: "Performance",
    generatedAt: "2024-01-12T14:10:00Z",
    status: "Archived",
    findings: 5,
    severity: "Medium"
  }
];

export const vulnerabilityChartData = [
  { name: "Critical", value: 3, color: "#EF4444" },
  { name: "High", value: 8, color: "#F59E0B" },
  { name: "Medium", value: 15, color: "#3B82F6" },
  { name: "Low", value: 24, color: "#10B981" }
];

export const buildFailureHeatmapData = [
  { day: 'Mon', hour: '08', failures: 2, fixes: 8 },
  { day: 'Mon', hour: '12', failures: 1, fixes: 12 },
  { day: 'Mon', hour: '16', failures: 0, fixes: 15 },
  { day: 'Tue', hour: '08', failures: 3, fixes: 6 },
  { day: 'Tue', hour: '12', failures: 1, fixes: 14 },
  { day: 'Tue', hour: '16', failures: 2, fixes: 10 },
  { day: 'Wed', hour: '08', failures: 1, fixes: 11 },
  { day: 'Wed', hour: '12', failures: 0, fixes: 16 },
  { day: 'Wed', hour: '16', failures: 1, fixes: 13 },
  { day: 'Thu', hour: '08', failures: 2, fixes: 9 },
  { day: 'Thu', hour: '12', failures: 1, fixes: 12 },
  { day: 'Thu', hour: '16', failures: 0, fixes: 15 },
  { day: 'Fri', hour: '08', failures: 1, fixes: 10 },
  { day: 'Fri', hour: '12', failures: 2, fixes: 8 },
  { day: 'Fri', hour: '16', failures: 1, fixes: 11 }
];