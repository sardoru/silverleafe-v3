import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RefreshCw, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Info,
  Microscope,
  FileText
} from 'lucide-react';
import { fibreTraceApi } from '../api/fibreTraceApi';
import { useBatchStore } from '../store';
import { CottonBatch } from '../types';

interface FibreTraceStatus {
  batchId: string;
  status: 'synced' | 'not_synced' | 'error' | 'syncing';
  lastSynced?: string;
  message?: string;
}

const FibreTraceIntegration: React.FC = () => {
  const { batches, fetchBatches } = useBatchStore();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, FibreTraceStatus>>({});
  const [isotopeData, setIsotopeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch initial sync statuses
  useEffect(() => {
    if (batches.length > 0) {
      const initialStatuses: Record<string, FibreTraceStatus> = {};
      batches.forEach(batch => {
        initialStatuses[batch.id] = {
          batchId: batch.id,
          status: 'not_synced'
        };
      });
      setSyncStatuses(initialStatuses);
    }
  }, [batches]);

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatch(batchId === selectedBatch ? null : batchId);
    setIsotopeData(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleFetchIsotopeData = async (batchId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fibreTraceApi.getIsotopeData(batchId);
      
      if (response.success) {
        setIsotopeData(response.data);
        setSuccessMessage('Successfully retrieved isotope data from FibreTrace');
      } else {
        setError(response.message || 'Failed to fetch isotope data');
        setIsotopeData(null);
      }
    } catch (error: any) {
      setError('An unexpected error occurred while fetching isotope data: ' + (error.message || ''));
      setIsotopeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePushBatchData = async (batch: CottonBatch) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // Update status to syncing
    setSyncStatuses(prev => ({
      ...prev,
      [batch.id]: {
        ...prev[batch.id],
        status: 'syncing'
      }
    }));
    
    try {
      // Transform batch data to FibreTrace format
      const fibreTraceBatchData = {
        batchId: batch.id,
        farmName: batch.farmName,
        harvestDate: batch.harvestDate,
        location: {
          latitude: batch.location.latitude,
          longitude: batch.location.longitude,
          region: batch.location.region,
          country: batch.location.country
        },
        quantity: batch.quantity,
        quality: {
          grade: batch.quality.grade,
          fiberLength: batch.quality.fiberLength,
          strength: batch.quality.strength,
          micronaire: batch.quality.micronaire,
          color: batch.quality.color,
          trashContent: batch.quality.trashContent
        },
        certifications: batch.certifications.map(cert => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          status: cert.status,
          type: cert.type
        })),
        sustainabilityScore: batch.sustainabilityScore
      };
      
      const response = await fibreTraceApi.pushBatchData(fibreTraceBatchData);
      
      if (response.success) {
        setSyncStatuses(prev => ({
          ...prev,
          [batch.id]: {
            batchId: batch.id,
            status: 'synced',
            lastSynced: new Date().toISOString(),
            message: 'Successfully synced with FibreTrace'
          }
        }));
        setSuccessMessage(`Successfully pushed batch ${batch.id} to FibreTrace`);
      } else {
        setSyncStatuses(prev => ({
          ...prev,
          [batch.id]: {
            batchId: batch.id,
            status: 'error',
            message: response.message || 'Failed to sync with FibreTrace'
          }
        }));
        setError(response.message || 'Failed to push batch data');
      }
    } catch (error: any) {
      setSyncStatuses(prev => ({
        ...prev,
        [batch.id]: {
          batchId: batch.id,
          status: 'error',
          message: 'An unexpected error occurred'
        }
      }));
      setError('An unexpected error occurred while pushing batch data: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePullBatchData = async (batchId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fibreTraceApi.getBatchData(batchId);
      
      if (response.success) {
        // In a real implementation, you would update your local store with the fetched data
        setSyncStatuses(prev => ({
          ...prev,
          [batchId]: {
            batchId: batchId,
            status: 'synced',
            lastSynced: new Date().toISOString(),
            message: 'Successfully pulled data from FibreTrace'
          }
        }));
        setSuccessMessage(`Successfully pulled batch ${batchId} data from FibreTrace`);
      } else {
        setSyncStatuses(prev => ({
          ...prev,
          [batchId]: {
            batchId: batchId,
            status: 'error',
            message: response.message || 'Failed to pull data from FibreTrace'
          }
        }));
        setError(response.message || 'Failed to pull batch data');
      }
    } catch (error: any) {
      setSyncStatuses(prev => ({
        ...prev,
        [batchId]: {
          batchId: batchId,
          status: 'error',
          message: 'An unexpected error occurred'
        }
      }));
      setError('An unexpected error occurred while pulling batch data: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBatch = async (batchId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fibreTraceApi.verifyBatch(batchId);
      
      if (response.success) {
        setSuccessMessage(`Batch ${batchId} successfully verified with FibreTrace`);
      } else {
        setError(response.message || 'Failed to verify batch');
      }
    } catch (error: any) {
      setError('An unexpected error occurred while verifying batch: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'not_synced':
        return <Info className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Integration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Synchronize batch data with partner systems for enhanced traceability and verification
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Partner Connectivity</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {batches.map(batch => (
                <div
                  key={batch.id}
                  className={`p-4 rounded-md transition-colors ${
                    selectedBatch === batch.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => handleBatchSelect(batch.id)}
                      className="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {batch.id}
                    </button>
                    <div className="flex items-center">
                      {getStatusIcon(syncStatuses[batch.id]?.status || 'not_synced')}
                      <span className="ml-2 text-xs text-gray-500">
                        {syncStatuses[batch.id]?.status === 'synced' ? 'Synced' : 
                         syncStatuses[batch.id]?.status === 'syncing' ? 'Syncing...' :
                         syncStatuses[batch.id]?.status === 'error' ? 'Error' : 'Not Synced'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{batch.farmName}</div>
                  <div className="text-xs text-gray-400 mb-3">
                    {new Date(batch.harvestDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePushBatchData(batch)}
                      disabled={loading || syncStatuses[batch.id]?.status === 'syncing'}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Push
                    </button>
                    <button
                      onClick={() => handlePullBatchData(batch.id)}
                      disabled={loading || syncStatuses[batch.id]?.status === 'syncing'}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Pull
                    </button>
                    <button
                      onClick={() => handleVerifyBatch(batch.id)}
                      disabled={loading || syncStatuses[batch.id]?.status === 'syncing'}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verify
                    </button>
                  </div>
                  {syncStatuses[batch.id]?.message && (
                    <div className="mt-2 text-xs text-gray-500">
                      {syncStatuses[batch.id].message}
                    </div>
                  )}
                  {syncStatuses[batch.id]?.lastSynced && (
                    <div className="mt-1 text-xs text-gray-400">
                      Last synced: {new Date(syncStatuses[batch.id].lastSynced!).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedBatch ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  FibreTrace Data for Batch {selectedBatch}
                </h2>
                <button
                  onClick={() => handleFetchIsotopeData(selectedBatch)}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Microscope className="h-4 w-4 mr-2" />
                  Fetch Isotope Data
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : isotopeData ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Isotope Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Isotopic Values</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-indigo-50 p-2 rounded">
                            <div className="text-xs text-gray-500">δ13C</div>
                            <div className="text-sm font-medium text-gray-900">
                              {isotopeData.isotopicValues?.deltaC13?.toFixed(2) || 'N/A'}‰
                            </div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-xs text-gray-500">δ15N</div>
                            <div className="text-sm font-medium text-gray-900">
                              {isotopeData.isotopicValues?.deltaN15?.toFixed(2) || 'N/A'}‰
                            </div>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <div className="text-xs text-gray-500">δ18O</div>
                            <div className="text-sm font-medium text-gray-900">
                              {isotopeData.isotopicValues?.deltaO18?.toFixed(2) || 'N/A'}‰
                            </div>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <div className="text-xs text-gray-500">δ2H</div>
                            <div className="text-sm font-medium text-gray-900">
                              {isotopeData.isotopicValues?.deltaH2?.toFixed(2) || 'N/A'}‰
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Regional Match:</span>
                            <span className="font-medium text-gray-900">
                              {isotopeData.regionalMatchConfidence || 'N/A'}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Sample Date:</span>
                            <span className="font-medium text-gray-900">
                              {isotopeData.sampleCollectionDate ? 
                                new Date(isotopeData.sampleCollectionDate).toLocaleDateString() : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Testing Facility:</span>
                            <span className="font-medium text-gray-900">
                              {isotopeData.testingFacility?.name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Verification Status:</span>
                            <span className={`font-medium ${
                              isotopeData.verificationStatus === 'verified' ? 'text-green-600' :
                              isotopeData.verificationStatus === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {isotopeData.verificationStatus ? 
                                isotopeData.verificationStatus.charAt(0).toUpperCase() + 
                                isotopeData.verificationStatus.slice(1) : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 mb-3">FibreTrace Verification</h3>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {isotopeData.verificationStatus === 'verified' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isotopeData.verificationStatus === 'pending' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {isotopeData.verificationStatus === 'verified' ? 
                              'Batch Verified by FibreTrace' : 
                              isotopeData.verificationStatus === 'pending' ? 
                              'Verification Pending' : 
                              'Verification Failed'}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {isotopeData.verificationStatus === 'verified' ? 
                              'This batch has been verified by FibreTrace using isotope analysis. The isotopic signature matches the expected values for the declared origin.' : 
                              isotopeData.verificationStatus === 'pending' ? 
                              'This batch is currently pending verification by FibreTrace. The isotope analysis has been completed, but final verification is still in progress.' : 
                              'This batch failed verification by FibreTrace. The isotopic signature does not match the expected values for the declared origin.'}
                          </p>
                          {isotopeData.verificationNotes && (
                            <p className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Notes:</span> {isotopeData.verificationNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => window.open(`https://fibretrace.io/verify/${selectedBatch}`, '_blank')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Report on FibreTrace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center">
                  <Microscope className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Isotope Data Available</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Click the "Fetch Isotope Data" button to retrieve isotope analysis data from FibreTrace for this batch.
                  </p>
                  <button
                    onClick={() => handleFetchIsotopeData(selectedBatch)}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Fetch Data
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
              <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">FibreTrace Integration</h3>
              <p className="text-gray-500 text-center mb-4 max-w-md">
                Select a batch from the list to view its FibreTrace data or to push/pull data between Silverleafe and FibreTrace.
              </p>
              <p className="text-sm text-gray-400 text-center max-w-md">
                FibreTrace provides isotope analysis and blockchain verification to ensure the authenticity and traceability of your cotton batches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FibreTraceIntegration;