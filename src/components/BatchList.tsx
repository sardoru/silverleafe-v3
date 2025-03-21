import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  BarChart2
} from 'lucide-react';
import { useBatchStore } from '../store';
import { CottonBatch, BatchFilter } from '../types';

const BatchList: React.FC = () => {
  const { batches, isLoading, error, fetchBatches } = useBatchStore();
  const [filteredBatches, setFilteredBatches] = useState<CottonBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BatchFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof CottonBatch>('harvestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const batchesPerPage = 10;

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Memoize filter and sort logic
  const applyFiltersAndSort = useCallback((batchList: CottonBatch[]) => {
    if (batchList.length === 0) return [];
    
    let result = [...batchList];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(batch => 
        batch.id.toLowerCase().includes(term) ||
        batch.farmName.toLowerCase().includes(term) ||
        batch.location.region.toLowerCase().includes(term) ||
        batch.location.country.toLowerCase().includes(term)
      );
    }
    
    // Apply region filter
    if (filters.region) {
      result = result.filter(batch => 
        batch.location.region.toLowerCase() === filters.region!.toLowerCase()
      );
    }
    
    // Apply harvest date filters
    if (filters.harvestDateStart) {
      const startDate = new Date(filters.harvestDateStart);
      result = result.filter(batch => 
        new Date(batch.harvestDate) >= startDate
      );
    }
    
    if (filters.harvestDateEnd) {
      const endDate = new Date(filters.harvestDateEnd);
      result = result.filter(batch => 
        new Date(batch.harvestDate) <= endDate
      );
    }
    
    // Apply certifications filter
    if (filters.certifications && filters.certifications.length > 0) {
      result = result.filter(batch => 
        batch.certifications.some(cert => 
          filters.certifications!.includes(cert.type)
        )
      );
    }
    
    // Apply compliance status filter
    if (filters.complianceStatus) {
      result = result.filter(batch => 
        batch.complianceStatus.forcedLaborVerification.status === filters.complianceStatus
      );
    }
    
    // Apply sustainability score filter
    if (filters.sustainabilityScoreMin !== undefined) {
      result = result.filter(batch => 
        batch.sustainabilityScore >= filters.sustainabilityScoreMin!
      );
    }
    
    // Apply quality grade filter
    if (filters.qualityGrade) {
      result = result.filter(batch => 
        batch.quality.grade === filters.qualityGrade
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle nested properties
      if (sortField === 'location') {
        aValue = a.location.region;
        bValue = b.location.region;
      } else if (sortField === 'quality') {
        aValue = a.quality.grade;
        bValue = b.quality.grade;
      } else if (sortField === 'complianceStatus') {
        aValue = a.complianceStatus.forcedLaborVerification.status;
        bValue = b.complianceStatus.forcedLaborVerification.status;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [searchTerm, filters, sortField, sortDirection]);

  useEffect(() => {
    if (batches.length > 0) {
      const result = applyFiltersAndSort(batches);
      setFilteredBatches(result);
    }
  }, [batches, applyFiltersAndSort]);

  const handleSort = useCallback((field: keyof CottonBatch) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleFilterChange = useCallback((key: keyof BatchFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const exportData = useCallback(() => {
    // In a real app, this would trigger a server-side export
    const dataStr = JSON.stringify(filteredBatches, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'cotton-batches.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [filteredBatches]);

  // Pagination
  const { indexOfFirstBatch, indexOfLastBatch, currentBatches, totalPages } = useMemo(() => {
    const indexOfLastBatch = currentPage * batchesPerPage;
    const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
    const currentBatches = filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
    const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);
    
    return { indexOfFirstBatch, indexOfLastBatch, currentBatches, totalPages };
  }, [filteredBatches, currentPage, batchesPerPage]);

  const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    const statusClasses = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    const statusIcons = {
      verified: <CheckCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />
    };
    
    const statusKey = status as keyof typeof statusClasses;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[statusKey]}`}>
        <span className="mr-1">
          {statusIcons[statusKey]}
        </span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Function to render sustainability score
  const renderSustainabilityScore = (score: number) => {
    const getColorClass = (score: number) => {
      if (score >= 90) return 'bg-green-500';
      if (score >= 70) return 'bg-green-400';
      if (score >= 50) return 'bg-yellow-400';
      return 'bg-red-500';
    };
    
    return (
      <div className="flex items-center">
        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className={`h-2.5 rounded-full ${getColorClass(score)}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span>{score}</span>
      </div>
    );
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
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading modules</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cotton Modules</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all cotton modules in the system
        </p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md touch-target"
              placeholder="Search modules..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-target"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-target"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  id="region"
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                >
                  <option value="">All Regions</option>
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="Mississippi">Mississippi</option>
                </select>
              </div>
              <div>
                <label htmlFor="harvestDateStart" className="block text-sm font-medium text-gray-700">
                  Harvest Date (From)
                </label>
                <input
                  type="date"
                  id="harvestDateStart"
                  value={filters.harvestDateStart || ''}
                  onChange={(e) => handleFilterChange('harvestDateStart', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                />
              </div>
              <div>
                <label htmlFor="harvestDateEnd" className="block text-sm font-medium text-gray-700">
                  Harvest Date (To)
                </label>
                <input
                  type="date"
                  id="harvestDateEnd"
                  value={filters.harvestDateEnd || ''}
                  onChange={(e) => handleFilterChange('harvestDateEnd', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                />
              </div>
              <div>
                <label htmlFor="complianceStatus" className="block text-sm font-medium text-gray-700">
                  Compliance Status
                </label>
                <select
                  id="complianceStatus"
                  value={filters.complianceStatus || ''}
                  onChange={(e) => handleFilterChange('complianceStatus', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label htmlFor="sustainabilityScoreMin" className="block text-sm font-medium text-gray-700">
                  Min Sustainability Score
                </label>
                <input
                  type="number"
                  id="sustainabilityScoreMin"
                  min="0"
                  max="100"
                  value={filters.sustainabilityScoreMin || ''}
                  onChange={(e) => handleFilterChange('sustainabilityScoreMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                />
              </div>
              <div>
                <label htmlFor="qualityGrade" className="block text-sm font-medium text-gray-700">
                  Quality Grade
                </label>
                <select
                  id="qualityGrade"
                  value={filters.qualityGrade || ''}
                  onChange={(e) => handleFilterChange('qualityGrade', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md touch-target"
                >
                  <option value="">All Grades</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-target"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-4 mb-6">
        {currentBatches.length > 0 ? (
          currentBatches.map((batch) => (
            <div key={batch.id} className="mobile-card">
              <div className="flex justify-between items-start mb-3">
                <Link to={`/batches/${batch.id}`} className="text-lg font-medium text-indigo-600">
                  {batch.id}
                </Link>
                {renderStatusBadge(batch.complianceStatus.forcedLaborVerification.status)}
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Farm</div>
                <div className="mobile-card-value">{batch.farmName}</div>
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Harvest Date</div>
                <div className="mobile-card-value flex items-center justify-end">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  {new Date(batch.harvestDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Location</div>
                <div className="mobile-card-value flex items-center justify-end">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  {batch.location.region}, {batch.location.country}
                </div>
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Quantity</div>
                <div className="mobile-card-value">
                  <Package className="h-4 w-4 text-gray-400 inline mr-1" />
                  {batch.quantity} kg
                </div>
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Quality</div>
                <div className="mobile-card-value">Grade {batch.quality.grade}</div>
              </div>
              
              <div className="mobile-card-row">
                <div className="mobile-card-label">Sustainability</div>
                <div className="mobile-card-value">
                  <div className="flex items-center justify-end">
                    <BarChart2 className="h-4 w-4 text-gray-400 mr-1" />
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-1">
                      <div 
                        className={`h-2 rounded-full ${
                          batch.sustainabilityScore >= 90 ? 'bg-green-500' :
                          batch.sustainabilityScore >= 70 ? 'bg-green-400' :
                          batch.sustainabilityScore >= 50 ? 'bg-yellow-400' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${batch.sustainabilityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{batch.sustainabilityScore}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  to={`/batches/${batch.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-target"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="mobile-card text-center py-8">
            <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No batches found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Module ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('farmName')}
                >
                  <div className="flex items-center">
                    Farm
                    {sortField === 'farmName' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('harvestDate')}
                >
                  <div className="flex items-center">
                    Harvest Date
                    {sortField === 'harvestDate' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    {sortField === 'location' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Quantity
                    {sortField === 'quantity' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quality')}
                >
                  <div className="flex items-center">
                    Quality
                    {sortField === 'quality' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('complianceStatus')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'complianceStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sustainabilityScore')}
                >
                  <div className="flex items-center">
                    Sustainability
                    {sortField === 'sustainabilityScore' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBatches.length > 0 ? (
                currentBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link to={`/batches/${batch.id}`}>{batch.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.farmName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(batch.harvestDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {batch.location.region}, {batch.location.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.quantity} lbs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Grade {batch.quality.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(batch.complianceStatus.forcedLaborVerification.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderSustainabilityScore(batch.sustainabilityScore)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No modules found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {filteredBatches.length > batchesPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstBatch + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastBatch, filteredBatches.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredBatches.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    let pageNumber;
                    
                    // Calculate which page numbers to show
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {filteredBatches.length > batchesPerPage && (
        <div className="sm:hidden mt-6 mb-8">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 touch-target disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 touch-target disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
            Showing {indexOfFirstBatch + 1} to {Math.min(indexOfLastBatch, filteredBatches.length)} of {filteredBatches.length} results
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchList;