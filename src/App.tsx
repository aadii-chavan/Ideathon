import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Preview } from '@/pages/Preview';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ImportProject } from '@/pages/ImportProject';
import { SecurityScan } from '@/pages/SecurityScan';
import { BugsAndFixes } from '@/pages/BugsAndFixes';
import { DevOpsInsights } from '@/pages/DevOpsInsights';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Mock authentication state
const isAuthenticated = true; // In a real app, this would come from auth context

function App() {
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<ImportProject />} />
          <Route path="/security" element={<SecurityScan />} />
          <Route path="/bugs" element={<BugsAndFixes />} />
          <Route path="/devops" element={<DevOpsInsights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;