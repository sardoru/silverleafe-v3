import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Droplet,
  Leaf,
  FileCheck,
  Users,
  Truck,
  FileText,
  AlertOctagon,
  Flag,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';
import { 
  useDashboardStore, 
  useBatchStore, 
  useAuthStore,
  useVerificationQueueStore 
} from '../store';
import { UserRole, Alert as AlertType, VerificationRequest } from '../types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// StatCard component definition
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change: number;
  positive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, positive }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
        {icon}
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd>
            <div className="text-lg font-medium text-gray-900">{value}</div>
          </dd>
        </dl>
      </div>
    </div>
    {change !== 0 && (
      <div className="mt-4">
        <div className={`flex items-center text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? (
            <ArrowUpRight className="h-4 w-4 mr-1 flex-shrink-0" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1 flex-shrink-0" />
          )}
          <span className="font-medium">{change}% from last month</span>
        </div>
      </div>
    )}
  </div>
);

// AlertItem component definition
interface AlertItemProps {
  alert: AlertType;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => (
  <li className="py-3">
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        {alert.severity === 'high' ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : alert.severity === 'medium' ? (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-blue-500" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-medium text-gray-900">
          {alert.message}
        </div>
        <div className="mt-1 text-sm text-gray-500 flex justify-between">
          <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            alert.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {alert.resolved ? 'Resolved' : 'Open'}
          </span>
        </div>
      </div>
    </div>
  </li>
);

const Dashboard: React.FC = () => {
  const { metrics, isLoading, error, fetchMetrics } = useDashboardStore();
  const { batches, fetchBatches } = useBatchStore();
  const { user } = useAuthStore();
  const { verificationQueue, fetchVerificationQueue } = useVerificationQueueStore();
  const [showAllVerifications, setShowAllVerifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  
  useEffect(() => {
    // Use Promise.all to fetch data in parallel
    const fetchData = async () => {
      await Promise.all([fetchMetrics(), fetchBatches(), fetchVerificationQueue()]);
    };
    
    fetchData();
  }, [fetchMetrics, fetchBatches, fetchVerificationQueue]);

  // Filter verification requests
  const filteredVerificationQueue = useMemo(() => {
    return verificationQueue.filter(request => {
      const matchesSearch = searchTerm === '' || 
        request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.documentType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || request.status === statusFilter;
      const matchesPriority = priorityFilter === '' || request.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [verificationQueue, searchTerm, statusFilter, priorityFilter]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!metrics) return null;
    
    return {
      labels: ['Compliant', 'Pending', 'Non-Compliant'],
      datasets: [
        {
          label: 'Batch Compliance Status',
          data: [
            metrics.compliantBatches,
            metrics.pendingVerification,
            metrics.nonCompliantBatches
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)',
            'rgba(234, 179, 8, 0.6)',
            'rgba(239, 68, 68, 0.6)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(234, 179, 8)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [metrics]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Batch Compliance Overview'
      }
    }
  }), []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertOctagon className="h-4 w-4" />;
      case 'Medium':
        return <Flag className="h-4 w-4" />;
      case 'Low':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const VerificationQueueList: React.FC<{ requests: VerificationRequest[] }> = ({ requests }) => (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{request.companyName}</h3>
              <p className="text-xs text-gray-500">{request.id}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{request.documentType}</span>
            <div className={`flex items-center ${getPriorityColor(request.priority)}`}>
              {getPriorityIcon(request.priority)}
              <span className="text-xs ml-1">{request.priority} Priority</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Assigned to: {request.assignedAuditor}</span>
            <span>{request.timeInQueue} days in queue</span>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-sm text-indigo-600 hover:text-indigo-900">
              Review Request
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Determine which dashboard view to show based on user role
  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case UserRole.BRAND:
        return renderBrandDashboard();
      case UserRole.AUDITOR:
        return renderAuditorDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  const renderBrandDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Batches" 
          value={metrics.totalBatches} 
          icon={<Droplet className="h-6 w-6 text-blue-500" />}
          change={3.2}
          positive={true}
        />
        <StatCard 
          title="Sustainability Score" 
          value={`${metrics.averageSustainabilityScore}/100`} 
          icon={<Leaf className="h-6 w-6 text-green-500" />}
          change={1.8}
          positive={true}
        />
        <StatCard 
          title="Certified Organic" 
          value={`${Math.round((metrics.compliantBatches / metrics.totalBatches) * 100)}%`} 
          icon={<FileCheck className="h-6 w-6 text-indigo-500" />}
          change={0.5}
          positive={true}
        />
        <StatCard 
          title="Active Suppliers" 
          value={metrics.topSuppliers.length} 
          icon={<Users className="h-6 w-6 text-purple-500" />}
          change={0}
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Supply Chain Overview</h2>
          </div>
          <div className="p-4" style={{ height: '300px' }}>
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Top Suppliers</h2>
            <Link to="/suppliers" className="text-sm text-indigo-600 hover:text-indigo-900">View all</Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {metrics.topSuppliers.map((supplier, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">{supplier.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900">{supplier.score}</span>
                    <span className="ml-1 text-xs text-gray-500">/100</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Modules</h2>
            <Link to="/batches" className="text-sm text-indigo-600 hover:text-indigo-900">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.slice(0, 5).map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link to={`/batches/${batch.id}`}>{batch.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.farmName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(batch.harvestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        batch.complianceStatus.forcedLaborVerification.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : batch.complianceStatus.forcedLaborVerification.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {batch.complianceStatus.forcedLaborVerification.status.charAt(0).toUpperCase() + 
                         batch.complianceStatus.forcedLaborVerification.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Alerts</h2>
            <Link to="/alerts" className="text-sm text-indigo-600 hover:text-indigo-900">View all</Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {metrics.recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );

  const renderAuditorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Compliant Modules" 
          value={metrics.compliantBatches} 
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          change={2.5}
          positive={true}
        />
        <StatCard 
          title="Pending Verification" 
          value={metrics.pendingVerification} 
          icon={<Clock className="h-6 w-6 text-yellow-500" />}
          change={-1.2}
          positive={true}
        />
        <StatCard 
          title="Non-Compliant" 
          value={metrics.nonCompliantBatches} 
          icon={<XCircle className="h-6 w-6 text-red-500" />}
          change={0.8}
          positive={false}
        />
        <StatCard 
          title="Custody Transfers" 
          value={batches.reduce((sum, batch) => sum + batch.custodyChain.length, 0)} 
          icon={<Truck className="h-6 w-6 text-blue-500" />}
          change={4.3}
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Compliance Overview</h2>
          </div>
          <div className="p-4" style={{ height: '300px' }}>
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Verification Queue</h2>
          </div>
          <div className="p-4">
            {showAllVerifications ? (
              <>
                <div className="mb-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search requests..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAllVerifications(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Show Less
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Priorities</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <VerificationQueueList requests={filteredVerificationQueue} />
                </div>
              </>
            ) : (
              <>
                <VerificationQueueList requests={verificationQueue.slice(0, 3)} />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllVerifications(true)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View All ({verificationQueue.length}) Requests
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderDefaultDashboard = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to Silverleafe</h2>
      <p className="text-gray-600 mb-4">
        Select an option from the sidebar to get started with the cotton traceability platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link 
          to="/batches"
          className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <h3 className="text-md font-medium text-indigo-700 mb-2">View Cotton Batches</h3>
          <p className="text-sm text-gray-600">Browse and manage all cotton batches in the system</p>
        </Link>
        <Link 
          to="/map"
          className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="text-md font-medium text-green-700 mb-2">Traceability Map</h3>
          <p className="text-sm text-gray-600">Visualize the journey of cotton from field to factory</p>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      {renderRoleSpecificDashboard()}
    </div>
  );
};

export default Dashboard;