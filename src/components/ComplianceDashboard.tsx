import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Info, 
  FileText, 
  ChevronRight,
  Calendar,
  MapPin,
  BarChart2,
  History,
  HelpCircle
} from 'lucide-react';
import { useBatchStore } from '../store';
import { CottonBatch } from '../types';

// Define types for compliance data
interface ComplianceBatch {
  id: string;
  batchId: string;
  origin: {
    location: string;
    country: string;
    coordinates: [number, number];
  };
  processingDate: string;
  sustainabilityScore: number;
  certificationStatus: 'verified' | 'pending' | 'failed';
  qualityParameters: {
    grade: string;
    fiberLength: number;
    strength: number;
    micronaire: number;
    color: string;
    trashContent: number;
  };
  complianceNotes: string;
  actionStatus: 'approved' | 'hold';
  lastUpdated: string;
  updatedBy: string;
  statusHistory: {
    timestamp: string;
    status: 'approved' | 'hold';
    updatedBy: string;
    notes?: string;
  }[];
  pendingIssues?: string[];
}

// Define filter type
interface ComplianceFilter {
  search?: string;
  origin?: string;
  certificationStatus?: 'verified' | 'pending' | 'failed';
  actionStatus?: 'approved' | 'hold';
  minSustainabilityScore?: number;
  processingDateStart?: string;
  processingDateEnd?: string;
}

const ComplianceDashboard: React.FC = () => {
  const { batches, fetchBatches } = useBatchStore();
  const [complianceBatches, setComplianceBatches] = useState<ComplianceBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<ComplianceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ComplianceFilter>({});
  const [sortField, setSortField] = useState<keyof ComplianceBatch>('processingDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [batchToUpdate, setBatchToUpdate] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'approved' | 'hold' | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [showStatusHistory, setShowStatusHistory] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Convert regular batches to compliance batches with mock data
  useEffect(() => {
    if (batches.length > 0) {
      const mockComplianceBatches: ComplianceBatch[] = batches.map(batch => {
        // Generate random status history
        const statusHistory = [];
        const startDate = new Date(batch.harvestDate);
        const numberOfEntries = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < numberOfEntries; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i * 3);
          
          statusHistory.push({
            timestamp: date.toISOString(),
            status: Math.random() > 0.5 ? 'approved' : 'hold',
            updatedBy: ['John Smith', 'Sarah Johnson', 'Michael Brown'][Math.floor(Math.random() * 3)],
            notes: Math.random() > 0.7 ? 'Routine verification completed' : undefined
          });
        }

        // Sort history by date (newest first)
        statusHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Current status is the most recent one
        const currentStatus = statusHistory[0]?.status || 'hold';

        // Generate random pending issues for some batches
        const pendingIssues = currentStatus === 'hold' ? 
          [
            'Documentation incomplete',
            'Isotope verification pending',
            'Labor standards verification needed'
          ].filter(() => Math.random() > 0.5) : 
          undefined;

        return {
          id: `comp-${batch.id}`,
          batchId: batch.id,
          origin: {
            location: batch.location.region,
            country: batch.location.country,
            coordinates: [batch.location.latitude, batch.location.longitude]
          },
          processingDate: new Date(new Date(batch.harvestDate).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          sustainabilityScore: batch.sustainabilityScore,
          certificationStatus: batch.complianceStatus.forcedLaborVerification.status,
          qualityParameters: batch.quality,
          complianceNotes: `Batch ${batch.id} from ${batch.farmName} has been processed according to standard protocols. ${pendingIssues ? 'There are pending verification issues.' : 'All verifications complete.'}`,
          actionStatus: currentStatus,
          lastUpdated: statusHistory[0]?.timestamp || batch.harvestDate,
          updatedBy: statusHistory[0]?.updatedBy || 'System',
          statusHistory,
          pendingIssues
        };
      });

      setComplianceBatches(mockComplianceBatches);
      setLoading(false);
    }
  }, [batches]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...complianceBatches];
    
    // Apply search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(batch => 
        batch.batchId.toLowerCase().includes(searchTerm) ||
        batch.origin.location.toLowerCase().includes(searchTerm) ||
        batch.origin.country.toLowerCase().includes(searchTerm) ||
        batch.complianceNotes.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply origin filter
    if (filters.origin) {
      result = result.filter(batch => 
        batch.origin.location.toLowerCase() === filters.origin!.toLowerCase() ||
        batch.origin.country.toLowerCase() === filters.origin!.toLowerCase()
      );
    }
    
    // Apply certification status filter
    if (filters.certificationStatus) {
      result = result.filter(batch => 
        batch.certificationStatus === filters.certificationStatus
      );
    }
    
    // Apply action status filter
    if (filters.actionStatus) {
      result = result.filter(batch => 
        batch.actionStatus === filters.actionStatus
      );
    }
    
    // Apply sustainability score filter
    if (filters.minSustainabilityScore !== undefined) {
      result = result.filter(batch => 
        batch.sustainabilityScore >= filters.minSustainabilityScore!
      );
    }
    
    // Apply processing date filters
    if (filters.processingDateStart) {
      const startDate = new Date(filters.processingDateStart);
      result = result.filter(batch => 
        new Date(batch.processingDate) >= startDate
      );
    }
    
    if (filters.processingDateEnd) {
      const endDate = new Date(filters.processingDateEnd);
      result = result.filter(batch => 
        new Date(batch.processingDate) <= endDate
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle nested properties
      if (sortField === 'origin') {
        aValue = a.origin.location;
        bValue = b.origin.location;
      } else if (sortField === 'qualityParameters') {
        aValue = a.qualityParameters.grade;
        bValue = b.qualityParameters.grade;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredBatches(result);
  }, [complianceBatches, filters, sortField, sortDirection]);

  const handleSort = (field: keyof ComplianceBatch) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: keyof ComplianceFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const toggleExpandBatch = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredBatches, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'compliance-batches.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleStatusChange = (batchId: string, newStatus: 'approved' | 'hold') => {
    setBatchToUpdate(batchId);
    setNewStatus(newStatus);
    setStatusNote('');
    setShowConfirmModal(true);
  };

  const confirmStatusChange = () => {
    if (!batchToUpdate || !newStatus) return;

    setComplianceBatches(prev => prev.map(batch => {
      if (batch.id === batchToUpdate) {
        const newHistory = [
          {
            timestamp: new Date().toISOString(),
            status: newStatus,
            updatedBy: 'John Smith', // In a real app, this would be the current user
            notes: statusNote || undefined
          },
          ...batch.statusHistory
        ];

        return {
          ...batch,
          actionStatus: newStatus,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'John Smith',
          statusHistory: newHistory,
          // Clear pending issues if approved
          pendingIssues: newStatus === 'approved' ? undefined : batch.pendingIssues
        };
      }
      return batch;
    }));

    setShowConfirmModal(false);
    setBatchToUpdate(null);
    setNewStatus(null);
  };

  const toggleStatusHistory = (batchId: string) => {
    setShowStatusHistory(showStatusHistory === batchId ? null : batchId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Verification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verify and manage compliance status for cotton batches
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
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search batches..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                  Origin
                </label>
                <select
                  id="origin"
                  value={filters.origin || ''}
                  onChange={(e) => handleFilterChange('origin', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Origins</option>
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="Mississippi">Mississippi</option>
                  <option value="USA">USA</option>
                </select>
              </div>
              <div>
                <label htmlFor="certificationStatus" className="block text-sm font-medium text-gray-700">
                  Certification Status
                </label>
                <select
                  id="certificationStatus"
                  value={filters.certificationStatus || ''}
                  onChange={(e) => handleFilterChange('certificationStatus', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label htmlFor="actionStatus" className="block text-sm font-medium text-gray-700">
                  Action Status
                </label>
                <select
                  id="actionStatus"
                  value={filters.actionStatus || ''}
                  onChange={(e) => handleFilterChange('actionStatus', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Actions</option>
                  <option value="approved">Approved</option>
                  <option value="hold">Hold</option>
                </select>
              </div>
              <div>
                <label htmlFor="minSustainabilityScore" className="block text-sm font-medium text-gray-700">
                  Min Sustainability Score
                </label>
                <input
                  type="number"
                  id="minSustainabilityScore"
                  min="0"
                  max="100"
                  value={filters.minSustainabilityScore || ''}
                  onChange={(e) => handleFilterChange('minSustainabilityScore', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="processingDateStart" className="block text-sm font-medium text-gray-700">
                  Processing Date (From)
                </label>
                <input
                  type="date"
                  id="processingDateStart"
                  value={filters.processingDateStart || ''}
                  onChange={(e) => handleFilterChange('processingDateStart', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="processingDateEnd" className="block text-sm font-medium text-gray-700">
                  Processing Date (To)
                </label>
                <input
                  type="date"
                  id="processingDateEnd"
                  value={filters.processingDateEnd || ''}
                  onChange={(e) => handleFilterChange('processingDateEnd', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('batchId')}
                >
                  <div className="flex items-center">
                    Batch ID
                    {sortField === 'batchId' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('origin')}
                >
                  <div className="flex items-center">
                    Origin Location
                    {sortField === 'origin' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('processingDate')}
                >
                  <div className="flex items-center">
                    Processing Date
                    {sortField === 'processingDate' && (
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
                    Sustainability Score
                    {sortField === 'sustainabilityScore' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('certificationStatus')}
                >
                  <div className="flex items-center">
                    Certification Status
                    {sortField === 'certificationStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('qualityParameters')}
                >
                  <div className="flex items-center">
                    Quality Parameters
                    {sortField === 'qualityParameters' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                    <div className="ml-1 group relative">
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                        Shows the quality grade and key parameters
                      </div>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    Compliance Notes
                    <div className="ml-1 group relative">
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                        Important notes about compliance status
                      </div>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('actionStatus')}
                >
                  <div className="flex items-center">
                    Action Status
                    {sortField === 'actionStatus' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <React.Fragment key={batch.id}>
                    <tr className={`hover:bg-gray-50 ${expandedBatch === batch.id ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => toggleExpandBatch(batch.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <ChevronRight className={`h-5 w-5 transform transition-transform ${expandedBatch === batch.id ? 'rotate-90' : ''}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {batch.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {batch.origin.location}, {batch.origin.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(batch.processingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                batch.sustainabilityScore >= 90 ? 'bg-green-500' :
                                batch.sustainabilityScore >= 70 ? 'bg-green-400' :
                                batch.sustainabilityScore >= 50 ? 'bg-yellow-400' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${batch.sustainabilityScore}%` }}
                            ></div>
                          </div>
                          <span>{batch.sustainabilityScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          batch.certificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : batch.certificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className="mr-1">
                            {batch.certificationStatus === 'verified' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : batch.certificationStatus === 'pending' ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                          </span>
                          {batch.certificationStatus.charAt(0).toUpperCase() + 
                           batch.certificationStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <BarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">Grade {batch.qualityParameters.grade}</span>
                          <button className="ml-1 text-indigo-600 hover:text-indigo-900 group relative">
                            <Info className="h-4 w-4" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-white shadow-lg rounded p-3 z-10 text-xs border border-gray-200">
                              <p className="font-medium text-gray-900 mb-1">Quality Parameters</p>
                              <ul className="space-y-1 text-gray-600">
                                <li>Fiber Length: {batch.qualityParameters.fiberLength} inches</li>
                                <li>Strength: {batch.qualityParameters.strength} g/tex</li>
                                <li>Micronaire: {batch.qualityParameters.micronaire}</li>
                                <li>Color: {batch.qualityParameters.color}</li>
                                <li>Trash Content: {batch.qualityParameters.trashContent}%</li>
                              </ul>
                            </div>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {batch.pendingIssues && batch.pendingIssues.length > 0 ? (
                          <div className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-1 flex-shrink-0" />
                            <span>{batch.complianceNotes}</span>
                          </div>
                        ) : (
                          batch.complianceNotes
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                            <label 
                              htmlFor={`toggle-${batch.id}`}
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                batch.actionStatus === 'approved' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            >
                              <span 
                                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
                                  batch.actionStatus === 'approved' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                              ></span>
                              <input 
                                type="checkbox" 
                                id={`toggle-${batch.id}`} 
                                name={`toggle-${batch.id}`} 
                                className="sr-only"
                                checked={batch.actionStatus === 'approved'}
                                onChange={() => handleStatusChange(
                                  batch.id, 
                                  batch.actionStatus === 'approved' ? 'hold' : 'approved'
                                )}
                              />
                            </label>
                          </div>
                          <span className={`text-xs font-medium ${
                            batch.actionStatus === 'approved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {batch.actionStatus === 'approved' ? 'Approved' : 'Hold'}
                          </span>
                          <button 
                            onClick={() => toggleStatusHistory(batch.id)}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            title="View status history"
                          >
                            <History className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedBatch === batch.id && (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 mb-2">Batch Details</h3>
                              <div className="bg-white p-4 rounded-md shadow-sm">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{new Date(batch.lastUpdated).toLocaleString()}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Updated By</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.updatedBy}</dd>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Compliance Notes</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.complianceNotes}</dd>
                                  </div>
                                  {batch.pendingIssues && batch.pendingIssues.length > 0 && (
                                    <div className="sm:col-span-2">
                                      <dt className="text-sm font-medium text-gray-500">Pending Issues</dt>
                                      <dd className="mt-1 text-sm text-gray-900">
                                        <ul className="list-disc pl-5 space-y-1">
                                          {batch.pendingIssues.map((issue, index) => (
                                            <li key={index} className="text-yellow-700">{issue}</li>
                                          ))}
                                        </ul>
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-medium text-gray-900">Quality Parameters</h3>
                                <button className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Full Report
                                </button>
                              </div>
                              <div className="bg-white p-4 rounded-md shadow-sm">
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Grade</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.grade}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Fiber Length</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.fiberLength} inches</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Strength</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.strength} g/tex</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Micronaire</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.micronaire}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.color}</dd>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Trash Content</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{batch.qualityParameters.trashContent}%</dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {showStatusHistory === batch.id && (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Status Change History</h3>
                            <div className="bg-white rounded-md shadow-sm overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {batch.statusHistory.map((history, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(history.timestamp).toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          history.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {history.status === 'approved' ? 'Approved' : 'Hold'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {history.updatedBy}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-500">
                                        {history.notes || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                    No batches found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Info className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Status Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to change the status to{' '}
                        <span className={`font-medium ${newStatus === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                          {newStatus === 'approved' ? 'Approved' : 'Hold'}
                        </span>?
                        This action will be logged for audit purposes.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700">
                          Add a note (optional)
                        </label>
                        <textarea
                          id="statusNote"
                          name="statusNote"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter reason for status change..."
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    newStatus === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                  onClick={confirmStatusChange}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard