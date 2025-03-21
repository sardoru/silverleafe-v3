import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import BatchList from './components/BatchList';
import BatchDetail from './components/BatchDetail';
import TraceabilityMap from './components/TraceabilityMap';
import ComplianceDashboard from './components/ComplianceDashboard';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import FibreTraceIntegration from './components/FibreTraceIntegration';
import { useAuthStore } from './store';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="batches" element={<BatchList />} />
          <Route path="batches/:id" element={<BatchDetail />} />
          <Route path="map" element={<TraceabilityMap />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="compliance" element={<ComplianceDashboard />} />
          <Route path="fibretrace" element={<FibreTraceIntegration />} />
          <Route path="users" element={<div className="p-4">User Management page (to be implemented)</div>} />
          <Route path="settings" element={<div className="p-4">Settings page (to be implemented)</div>} />
          <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;