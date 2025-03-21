import axios from 'axios';

// FibreTrace API configuration
const FIBRETRACE_API_BASE_URL = import.meta.env.VITE_FIBRETRACE_API_URL || 'https://api.fibretrace.io';
const FIBRETRACE_API_KEY = import.meta.env.VITE_FIBRETRACE_API_KEY || 'your-api-key-here';

// Create axios instance with default config
const fibreTraceClient = axios.create({
  baseURL: FIBRETRACE_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${FIBRETRACE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Mock API responses for development
const mockResponses = {
  getBatchData: (batchId: string) => ({
    batchId,
    farmName: "Sample Farm",
    harvestDate: new Date().toISOString(),
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      region: "California",
      country: "USA"
    },
    quantity: 5000,
    quality: {
      grade: "A",
      fiberLength: 1.2,
      strength: 28.5,
      micronaire: 4.2,
      color: "White",
      trashContent: 0.8
    },
    lastUpdated: new Date().toISOString()
  }),
  
  getIsotopeData: (batchId: string) => ({
    id: `ISO-${batchId}`,
    isotopicValues: {
      deltaC13: -25.4,
      deltaN15: 5.2,
      deltaO18: 15.7,
      deltaH2: -105.3
    },
    regionalMatchConfidence: 92,
    sampleCollectionDate: new Date().toISOString(),
    testingFacility: {
      name: "FibreTrace Analytics Lab",
      location: "San Francisco, CA",
      certificationId: "FT-LAB-001"
    },
    verificationStatus: "verified",
    verificationNotes: "All isotope values match the expected range for the declared origin."
  }),
  
  verifyBatch: (batchId: string) => ({
    batchId,
    verified: true,
    timestamp: new Date().toISOString(),
    verificationMethod: "Isotope Analysis",
    confidence: 95
  })
};

// Error handler
const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('FibreTrace API Error:', error.response.status, error.response.data);
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred with the FibreTrace API',
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('FibreTrace API Error: No response received', error.request);
    return {
      success: false,
      message: 'No response received from FibreTrace API'
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('FibreTrace API Error:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

// API functions
export const fibreTraceApi = {
  /**
   * Get batch data from FibreTrace
   * @param batchId The batch ID to retrieve
   * @returns Promise with batch data
   */
  getBatchData: async (batchId: string) => {
    try {
      // For development, return mock data
      // In production, uncomment the API call
      // const response = await fibreTraceClient.get(`/batches/${batchId}`);
      
      // Mock response
      const mockData = mockResponses.getBatchData(batchId);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get isotope analysis data for a batch
   * @param batchId The batch ID to retrieve isotope data for
   * @returns Promise with isotope analysis data
   */
  getIsotopeData: async (batchId: string) => {
    try {
      // For development, return mock data
      // In production, uncomment the API call
      // const response = await fibreTraceClient.get(`/batches/${batchId}/isotope-analysis`);
      
      // Mock response
      const mockData = mockResponses.getIsotopeData(batchId);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Push batch data to FibreTrace
   * @param batchData The batch data to push
   * @returns Promise with response data
   */
  pushBatchData: async (batchData: any) => {
    try {
      // For development, simulate success
      // In production, uncomment the API call
      // const response = await fibreTraceClient.post('/batches', batchData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "Batch data successfully pushed to FibreTrace",
          batchId: batchData.batchId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update batch data in FibreTrace
   * @param batchId The batch ID to update
   * @param batchData The updated batch data
   * @returns Promise with response data
   */
  updateBatchData: async (batchId: string, batchData: any) => {
    try {
      // For development, simulate success
      // In production, uncomment the API call
      // const response = await fibreTraceClient.put(`/batches/${batchId}`, batchData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "Batch data successfully updated in FibreTrace",
          batchId: batchId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Push isotope analysis data to FibreTrace
   * @param batchId The batch ID to associate with the isotope data
   * @param isotopeData The isotope analysis data
   * @returns Promise with response data
   */
  pushIsotopeData: async (batchId: string, isotopeData: any) => {
    try {
      // For development, simulate success
      // In production, uncomment the API call
      // const response = await fibreTraceClient.post(`/batches/${batchId}/isotope-analysis`, isotopeData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "Isotope data successfully pushed to FibreTrace",
          batchId: batchId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify batch authenticity with FibreTrace
   * @param batchId The batch ID to verify
   * @returns Promise with verification result
   */
  verifyBatch: async (batchId: string) => {
    try {
      // For development, return mock data
      // In production, uncomment the API call
      // const response = await fibreTraceClient.get(`/verify/${batchId}`);
      
      // Mock response
      const mockData = mockResponses.verifyBatch(batchId);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all batches from FibreTrace with optional filtering
   * @param params Optional query parameters for filtering
   * @returns Promise with batches data
   */
  getAllBatches: async (params: { page?: number, limit?: number, region?: string, dateFrom?: string, dateTo?: string } = {}) => {
    try {
      // For development, simulate success with mock data
      // In production, uncomment the API call
      // const response = await fibreTraceClient.get('/batches', { params });
      
      // Mock response with a few batches
      const mockData = {
        batches: [
          mockResponses.getBatchData("BATCH-001"),
          mockResponses.getBatchData("BATCH-002"),
          mockResponses.getBatchData("BATCH-003")
        ],
        pagination: {
          total: 3,
          page: params.page || 1,
          limit: params.limit || 10
        }
      };
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};