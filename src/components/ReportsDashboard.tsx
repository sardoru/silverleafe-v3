import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search,
  Calendar,
  BarChart2,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Tractor,
  User,
  Ruler,
  Scale,
  Microscope
} from 'lucide-react';
import { useReportStore } from '../store';

const ReportsDashboard: React.FC = () => {
  const { reports, isLoading, error, fetchReports } = useReportStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const mockData = [
    {
      moduleId: 'MODULE-23410387436',
      farmName: 'Sunshine Organic Farms',
      region: 'Mississippi',
      date: '2024-10-16',
      status: 'completed',
      type: 'compliance',
      details: {
        equipment: {
          harvester: 'John Deere CP690',
          operator: 'Joel Johnson',
          moduleBuilder: 'CNH Module Express 635',
        },
        quality: {
          grade: 'A',
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15,
          color: 'White',
          trashContent: 0.8
        },
        quantity: {
          weight: 5057.40,
          unit: 'lbs',
          baleCount: 4
        },
        field: {
          name: 'North Field A12',
          area: '512.7 acres',
          coordinates: '33.400444, -88.509750'
        }
      }
    },
    {
      moduleId: 'MODULE-23410387437',
      farmName: 'Green Valley Cotton',
      region: 'Mississippi',
      date: '2024-10-14',
      status: 'pending',
      type: 'sustainability',
      details: {
        equipment: {
          harvester: 'John Deere CP690',
          operator: 'Sarah Williams',
          moduleBuilder: 'CNH Module Express 635',
        },
        quality: {
          grade: 'A-',
          micronaire: 4.5,
          strength: 28.9,
          length: 1.14,
          color: 'White',
          trashContent: 0.9
        },
        quantity: {
          weight: 4987.20,
          unit: 'lbs',
          baleCount: 4
        },
        field: {
          name: 'South Field B8',
          area: '485.3 acres',
          coordinates: '33.395678, -88.512345'
        }
      }
    },
    {
      moduleId: 'MODULE-23410387438',
      farmName: 'Delta Cotton Cooperative',
      region: 'Mississippi',
      date: '2024-10-13',
      status: 'failed',
      type: 'traceability'
    },
    {
      moduleId: 'MODULE-23410387439',
      farmName: 'Southern Cotton Growers',
      region: 'Mississippi',
      date: '2024-09-12',
      status: 'completed',
      type: 'compliance'
    },
    {
      moduleId: 'MODULE-23410387440',
      farmName: 'Heartland Farms',
      region: 'Georgia',
      date: '2024-11-11',
      status: 'pending',
      type: 'sustainability'
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.moduleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || item.type === selectedType;
    
    const itemDate = new Date(item.date);
    const matchesDateRange = (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
                           (!dateRange.end || itemDate <= new Date(dateRange.end));
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <h3 className="text-sm font-medium text-red-800">Error loading reports</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="w-full sm:max-w-md relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search reports..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Report Type
                  </label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="compliance">Compliance</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="traceability">Traceability</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">
                    Date From
                  </label>
                  <input
                    type="date"
                    id="dateStart"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">
                    Date To
                  </label>
                  <input
                    type="date"
                    id="dateEnd"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {filteredData.map((item) => (
            <div key={item.moduleId} className="bg-white rounded-lg shadow">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleModuleExpansion(item.moduleId)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-indigo-600">{item.moduleId}</div>
                    {expandedModuleId === item.moduleId ? 
                      <ChevronUp className="h-4 w-4 ml-2 text-gray-500" /> :
                      <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                    }
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  </span>
                </div>
                <div className="text-sm text-gray-500">{item.farmName}</div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {item.region}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>

              {expandedModuleId === item.moduleId && item.details && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center text-sm">
                          <Tractor className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Harvester: {item.details.equipment.harvester}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Operator: {item.details.equipment.operator}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Quality Metrics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Grade:</span>
                          <span className="ml-2 text-gray-900">{item.details.quality.grade}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Length:</span>
                          <span className="ml-2 text-gray-900">{item.details.quality.length}"</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Strength:</span>
                          <span className="ml-2 text-gray-900">{item.details.quality.strength} g/tex</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Micronaire:</span>
                          <span className="ml-2 text-gray-900">{item.details.quality.micronaire}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Quantity</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Weight:</span>
                          <span className="ml-2 text-gray-900">{item.details.quantity.weight} {item.details.quantity.unit}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Bales:</span>
                          <span className="ml-2 text-gray-900">{item.details.quantity.baleCount}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Field Information</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 text-gray-900">{item.details.field.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Area:</span>
                          <span className="ml-2 text-gray-900">{item.details.field.area}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-8 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farm
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <React.Fragment key={item.moduleId}>
                      <tr className={`hover:bg-gray-50 ${expandedModuleId === item.moduleId ? 'bg-gray-50' : ''}`}>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleModuleExpansion(item.moduleId)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            {expandedModuleId === item.moduleId ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {item.moduleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.farmName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            {item.region}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <BarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedModuleId === item.moduleId && item.details && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-4 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Equipment</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Tractor className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.equipment.harvester}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.equipment.operator}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Quality Metrics</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Microscope className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">Grade {item.details.quality.grade}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.quality.length}" Length</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Scale className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.quality.strength} g/tex Strength</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Quantity</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Scale className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.quantity.weight} {item.details.quantity.unit}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.quantity.baleCount} Bales</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Field Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.field.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{item.details.field.area}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;