import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart2, 
  Calendar, 
  Download, 
  Filter, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Droplet,
  Leaf,
  Microscope,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Search
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Define types for isotope data
interface IsotopeData {
  id: string;
  batchId: string;
  farmName: string;
  harvestDate: string;
  location: {
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  isotopes: {
    carbon: number;    // δ13C
    nitrogen: number;  // δ15N
    oxygen: number;    // δ18O
    hydrogen: number;  // δ2H
  };
  referenceValues: {
    carbon: {min: number, max: number};
    nitrogen: {min: number, max: number};
    oxygen: {min: number, max: number};
    hydrogen: {min: number, max: number};
  };
  verificationStatus: 'verified' | 'pending' | 'failed';
  confidenceScore: number;
  testingFacility: string;
  testDate: string;
  lastUpdated: string;
}

// Define filter type
interface IsotopeFilter {
  search?: string;
  region?: string;
  verificationStatus?: 'verified' | 'pending' | 'failed';
  dateStart?: string;
  dateEnd?: string;
  confidenceMin?: number;
}

// Gauge component for isotope values
interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  referenceMin?: number;
  referenceMax?: number;
}

const IsotopeGauge: React.FC<GaugeProps> = ({ 
  value, 
  min, 
  max, 
  label, 
  unit, 
  color,
  size = 'md',
  referenceMin,
  referenceMax
}) => {
  // Calculate percentage for gauge
  const range = max - min;
  const adjustedValue = Math.max(min, Math.min(max, value));
  const percentage = ((adjustedValue - min) / range) * 100;
  
  // Determine if value is within reference range
  const isWithinRange = referenceMin !== undefined && 
                       referenceMax !== undefined && 
                       value >= referenceMin && 
                       value <= referenceMax;
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: "w-24 h-24",
      text: "text-xs",
      value: "text-lg",
      label: "text-xs"
    },
    md: {
      container: "w-32 h-32",
      text: "text-sm",
      value: "text-xl",
      label: "text-sm"
    },
    lg: {
      container: "w-40 h-40",
      text: "text-base",
      value: "text-2xl",
      label: "text-base"
    }
  };
  
  const classes = sizeClasses[size];
  
  // Calculate the angle for the gauge needle
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  // Get color based on whether value is within range
  const gaugeColor = isWithinRange ? 'green' : 'yellow';
  const colorClasses = {
    green: {
      arc: "bg-green-500",
      reference: "bg-green-100",
      needle: "bg-green-700"
    },
    yellow: {
      arc: "bg-yellow-500",
      reference: "bg-yellow-100",
      needle: "bg-yellow-700"
    },
    blue: {
      arc: "bg-blue-500",
      reference: "bg-blue-100",
      needle: "bg-blue-700"
    }
  };
  
  const colorClass = colorClasses[gaugeColor as keyof typeof colorClasses];
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${classes.container} flex items-center justify-center`}>
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-200"></div>
        
        {/* Reference range arc if provided */}
        {referenceMin !== undefined && referenceMax !== undefined && (
          <div 
            className={`absolute inset-0 rounded-full ${colorClass.reference}`}
            style={{
              clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos(Math.PI * (referenceMin - min) / range)}% ${50 - 45 * Math.sin(Math.PI * (referenceMin - min) / range)}%, ${50 + 45 * Math.cos(Math.PI * (referenceMax - min) / range)}% ${50 - 45 * Math.sin(Math.PI * (referenceMax - min) / range)}%)`
            }}
          ></div>
        )}
        
        {/* Gauge scale markers */}
        <div className="absolute inset-0">
          {/* Min marker */}
          <div className="absolute top-[50%] left-[10%] w-2 h-1 bg-gray-600 transform -translate-y-1/2"></div>
          {/* Mid marker */}
          <div className="absolute top-[10%] left-[50%] w-1 h-2 bg-gray-600 transform -translate-x-1/2"></div>
          {/* Max marker */}
          <div className="absolute top-[50%] right-[10%] w-2 h-1 bg-gray-600 transform -translate-y-1/2"></div>
        </div>
        
        {/* Gauge needle */}
        <div 
          className={`absolute h-[2px] w-[45%] ${colorClass.needle} rounded-full origin-left`}
          style={{
            top: '50%',
            left: '50%',
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'left center',
            boxShadow: '0 0 4px rgba(0,0,0,0.3)'
          }}
        >
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-current"></div>
        </div>
        
        {/* Center circle */}
        <div className="absolute inset-[15%] rounded-full bg-white shadow-md flex flex-col items-center justify-center">
          <div className={`${classes.value} font-bold text-gray-800`}>{value.toFixed(1)}</div>
          <div className={`${classes.text} text-gray-500`}>{unit}</div>
        </div>
      </div>
      <div className={`mt-2 ${classes.label} font-medium text-gray-700`}>{label}</div>
    </div>
  );
};

// Progress bar component
interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  label,
  color = 'bg-green-500'
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeLabel,
  positive = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
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
      {change !== undefined && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? (
              <ChevronUp className="h-4 w-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
            )}
            <span className="font-medium">{change}% {changeLabel || 'from last month'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Analytics: React.FC = () => {
  const [isotopeData, setIsotopeData] = useState<IsotopeData[]>([]);
  const [filteredData, setFilteredData] = useState<IsotopeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IsotopeFilter>({});
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  
  // Generate mock data
  useEffect(() => {
    const generateMockData = (): IsotopeData[] => {
      const regions = ['California', 'Texas', 'Mississippi', 'Arizona', 'Georgia'];
      const countries = ['USA'];
      const farmNames = [
        'Sunshine Organic Farms', 
        'Green Valley Cotton', 
        'Delta Cotton Cooperative', 
        'Western Cotton Growers',
        'Heartland Farms',
        'Blue Sky Organics',
        'Golden State Cotton',
        'Southern Harvest Co-op',
        'Prairie Cotton Fields',
        'Mountain View Farms'
      ];
      const testingFacilities = [
        'FibreTrace Analytics Lab', 
        'Global Cotton Testing Center', 
        'Isotope Research Institute'
      ];
      const verificationStatuses: ('verified' | 'pending' | 'failed')[] = ['verified', 'pending', 'failed'];
      
      // Limit to 20 items to prevent performance issues
      return Array.from({ length: 20 }, (_, i) => {
        const id = `ISOTOPE-${String(i + 1).padStart(3, '0')}`;
        const batchId = `BATCH-${String(i + 1).padStart(3, '0')}`;
        const harvestDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString();
        const region = regions[Math.floor(Math.random() * regions.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const verificationStatus = verificationStatuses[Math.floor(Math.random() * (i < 15 ? 2 : 3))]; // Make most verified or pending
        const confidenceScore = Math.floor(Math.random() * 30) + 70; // 70-100%
        
        // Generate random isotopic values within realistic ranges
        const carbon = -28 + Math.random() * 6; // δ13C: -28 to -22‰
        const nitrogen = 2 + Math.random() * 6;  // δ15N: 2 to 8‰
        const oxygen = 10 + Math.random() * 10;  // δ18O: 10 to 20‰
        const hydrogen = -120 + Math.random() * 40; // δ2H: -120 to -80‰
        
        // Reference ranges (slightly wider than the actual values)
        const carbonRef = { min: -29, max: -21 };
        const nitrogenRef = { min: 1, max: 9 };
        const oxygenRef = { min: 8, max: 22 };
        const hydrogenRef = { min: -125, max: -75 };
        
        return {
          id,
          batchId,
          farmName: farmNames[Math.floor(Math.random() * farmNames.length)],
          harvestDate,
          location: {
            region,
            country,
            latitude: 30 + Math.random() * 10,
            longitude: -120 + Math.random() * 30,
          },
          isotopes: {
            carbon,
            nitrogen,
            oxygen,
            hydrogen
          },
          referenceValues: {
            carbon: carbonRef,
            nitrogen: nitrogenRef,
            oxygen: oxygenRef,
            hydrogen: hydrogenRef
          },
          verificationStatus,
          confidenceScore,
          testingFacility: testingFacilities[Math.floor(Math.random() * testingFacilities.length)],
          testDate: new Date(Date.parse(harvestDate) + 86400000 * 5).toISOString(), // 5 days after harvest
          lastUpdated: new Date(Date.now() - Math.random() * 10 * 86400000).toISOString() // Random date in last 10 days
        };
      });
    };

    // Use setTimeout to prevent UI blocking during initial load
    const timer = setTimeout(() => {
      const mockData = generateMockData();
      setIsotopeData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Apply filters - memoized to improve performance
  const applyFilters = useCallback((data: IsotopeData[], currentFilters: IsotopeFilter) => {
    if (data.length === 0) return [];
    
    let result = [...data];
    
    // Apply search
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      result = result.filter(item => 
        item.batchId.toLowerCase().includes(searchTerm) ||
        item.farmName.toLowerCase().includes(searchTerm) ||
        item.location.region.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply region filter
    if (currentFilters.region) {
      result = result.filter(item => 
        item.location.region.toLowerCase() === currentFilters.region!.toLowerCase()
      );
    }
    
    // Apply verification status filter
    if (currentFilters.verificationStatus) {
      result = result.filter(item => 
        item.verificationStatus === currentFilters.verificationStatus
      );
    }
    
    // Apply date filters
    if (currentFilters.dateStart) {
      const startDate = new Date(currentFilters.dateStart);
      result = result.filter(item => 
        new Date(item.testDate) >= startDate
      );
    }
    
    if (currentFilters.dateEnd) {
      const endDate = new Date(currentFilters.dateEnd);
      result = result.filter(item => 
        new Date(item.testDate) <= endDate
      );
    }
    
    // Apply confidence score filter
    if (currentFilters.confidenceMin !== undefined) {
      result = result.filter(item => 
        item.confidenceScore >= currentFilters.confidenceMin!
      );
    }
    
    return result;
  }, []);

  // Use useEffect with debounce to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isotopeData.length > 0) {
        const result = applyFilters(isotopeData, filters);
        setFilteredData(result);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isotopeData, filters, applyFilters]);

  const handleFilterChange = useCallback((key: keyof IsotopeFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const exportData = useCallback(() => {
    // Limit export to prevent performance issues
    const dataToExport = filteredData.slice(0, 100);
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'isotope-analysis.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [filteredData]);

  // Calculate summary statistics - memoized to improve performance
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const verified = filteredData.filter(item => item.verificationStatus === 'verified').length;
    const pending = filteredData.filter(item => item.verificationStatus === 'pending').length;
    const failed = filteredData.filter(item => item.verificationStatus === 'failed').length;
    
    const avgConfidence = filteredData.reduce((sum, item) => sum + item.confidenceScore, 0) / filteredData.length;
    
    // Calculate average isotope values
    const avgCarbon = filteredData.reduce((sum, item) => sum + item.isotopes.carbon, 0) / filteredData.length;
    const avgNitrogen = filteredData.reduce((sum, item) => sum + item.isotopes.nitrogen, 0) / filteredData.length;
    const avgOxygen = filteredData.reduce((sum, item) => sum + item.isotopes.oxygen, 0) / filteredData.length;
    const avgHydrogen = filteredData.reduce((sum, item) => sum + item.isotopes.hydrogen, 0) / filteredData.length;
    
    // Group by region
    const regionData: Record<string, { count: number, avgConfidence: number }> = {};
    filteredData.forEach(item => {
      if (!regionData[item.location.region]) {
        regionData[item.location.region] = { count: 0, avgConfidence: 0 };
      }
      regionData[item.location.region].count++;
      regionData[item.location.region].avgConfidence += item.confidenceScore;
    });
    
    // Calculate average confidence by region
    Object.keys(regionData).forEach(region => {
      regionData[region].avgConfidence /= regionData[region].count;
    });
    
    return {
      total: filteredData.length,
      verified,
      pending,
      failed,
      avgConfidence,
      avgIsotopes: {
        carbon: avgCarbon,
        nitrogen: avgNitrogen,
        oxygen: avgOxygen,
        hydrogen: avgHydrogen
      },
      regionData
    };
  }, [filteredData]);

  // Prepare chart data - memoized to improve performance
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    // Sort data by test date
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
    );
    
    // Group by month for the line chart - limit to 12 months max
    const months: Record<string, { 
      carbon: number[], 
      nitrogen: number[], 
      oxygen: number[], 
      hydrogen: number[],
      count: number
    }> = {};
    
    // Only process the last 12 months of data to improve performance
    const limitedData = sortedData.slice(-100);
    
    limitedData.forEach(item => {
      const month = item.testDate.substring(0, 7); // YYYY-MM format
      if (!months[month]) {
        months[month] = { 
          carbon: [], 
          nitrogen: [], 
          oxygen: [], 
          hydrogen: [],
          count: 0
        };
      }
      months[month].carbon.push(item.isotopes.carbon);
      months[month].nitrogen.push(item.isotopes.nitrogen);
      months[month].oxygen.push(item.isotopes.oxygen);
      months[month].hydrogen.push(item.isotopes.hydrogen);
      months[month].count++;
    });
    
    // Calculate monthly averages
    const labels = Object.keys(months).sort();
    const carbonData = labels.map(month => 
      months[month].carbon.reduce((sum, val) => sum + val, 0) / months[month].count
    );
    const nitrogenData = labels.map(month => 
      months[month].nitrogen.reduce((sum, val) => sum + val, 0) / months[month].count
    );
    const oxygenData = labels.map(month => 
      months[month].oxygen.reduce((sum, val) => sum + val, 0) / months[month].count
    );
    const hydrogenData = labels.map(month => 
      months[month].hydrogen.reduce((sum, val) => sum + val, 0) / months[month].count
    );
    
    // Format month labels
    const formattedLabels = labels.map(month => {
      const [year, monthNum] = month.split('-');
      return `${monthNum}/${year.substring(2)}`;
    });
    
    // Verification status data for doughnut chart
    const verificationData = {
      labels: ['Verified', 'Pending', 'Failed'],
      datasets: [
        {
          data: [
            stats?.verified || 0,
            stats?.pending || 0,
            stats?.failed || 0
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
    
    // Region data for bar chart
    const regionLabels = Object.keys(stats?.regionData || {});
    const regionCounts = regionLabels.map(region => stats?.regionData[region].count || 0);
    const regionConfidence = regionLabels.map(region => stats?.regionData[region].avgConfidence || 0);
    
    return {
      isotopeTrends: {
        labels: formattedLabels,
        datasets: [
          {
            label: 'δ13C',
            data: carbonData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'δ15N',
            data: nitrogenData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'δ18O',
            data: oxygenData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'δ2H',
            data: hydrogenData,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      verificationStatus: verificationData,
      regionData: {
        labels: regionLabels,
        datasets: [
          {
            label: 'Sample Count',
            data: regionCounts,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Avg. Confidence (%)',
            data: regionConfidence,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          }
        ]
      }
    };
  }, [filteredData, stats]);

  // Selected batch data - memoized to improve performance
  const selectedBatchData = useMemo(() => {
    if (!selectedBatch) return null;
    return filteredData.find(item => item.batchId === selectedBatch);
  }, [selectedBatch, filteredData]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tracing Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive Isotope Ratio Mass Spectrometry (IRMS) data analysis and visualization
        </p>
      </div>

      {/* Filters */}
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
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search batches..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  id="region"
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">All Regions</option>
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="Mississippi">Mississippi</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
              <div>
                <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700">
                  Verification Status
                </label>
                <select
                  id="verificationStatus"
                  value={filters.verificationStatus || ''}
                  onChange={(e) => handleFilterChange('verificationStatus', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label htmlFor="confidenceMin" className="block text-sm font-medium text-gray-700">
                  Min Confidence Score (%)
                </label>
                <input
                  type="number"
                  id="confidenceMin"
                  min="0"
                  max="100"
                  value={filters.confidenceMin || ''}
                  onChange={(e) => handleFilterChange('confidenceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">
                  Test Date (From)
                </label>
                <input
                  type="date"
                  id="dateStart"
                  value={filters.dateStart || ''}
                  onChange={(e) => handleFilterChange('dateStart', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">
                  Test Date (To)
                </label>
                <input
                  type="date"
                  id="dateEnd"
                  value={filters.dateEnd || ''}
                  onChange={(e) => handleFilterChange('dateEnd', e.target.value || undefined)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Samples" 
          value={stats?.total || 0} 
          icon={<Microscope className="h-6 w-6 text-green-600" />}
          change={3.2}
          positive={true}
        />
        <StatCard 
          title="Authentication Rate" 
          value={`${Math.round((stats?.verified || 0) / (stats?.total || 1) * 100)}%`} 
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          change={1.5}
          positive={true}
        />
        <StatCard 
          title="Avg. Confidence Score" 
          value={`${Math.round(stats?.avgConfidence || 0)}%`} 
          icon={<Leaf className="h-6 w-6 text-green-600" />}
          change={0.8}
          positive={true}
        />
        <StatCard 
          title="Pending Verification" 
          value={stats?.pending || 0} 
          icon={<Clock className="h-6 w-6 text-yellow-500" />}
          change={-2.3}
          positive={true}
          changeLabel="from last week"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Isotope Gauges */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            Isotope Measurements
            <div className="ml-2 group relative">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded p-2 z-10">
                Isotope ratios are measured in parts per thousand (‰) relative to a standard. The gauges show the average values across all samples.
              </div>
            </div>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            <IsotopeGauge 
              value={stats?.avgIsotopes.carbon || 0}
              min={-30}
              max={-20}
              label="Carbon (δ13C)"
              unit="‰"
              color="blue"
              referenceMin={-29}
              referenceMax={-21}
            />
            <IsotopeGauge 
              value={stats?.avgIsotopes.nitrogen || 0}
              min={0}
              max={10}
              label="Nitrogen (δ15N)"
              unit="‰"
              color="green"
              referenceMin={1}
              referenceMax={9}
            />
            <IsotopeGauge 
              value={stats?.avgIsotopes.oxygen || 0}
              min={5}
              max={25}
              label="Oxygen (δ18O)"
              unit="‰"
              color="yellow"
              referenceMin={8}
              referenceMax={22}
            />
            <IsotopeGauge 
              value={stats?.avgIsotopes.hydrogen || 0}
              min={-130}
              max={-70}
              label="Hydrogen (δ2H)"
              unit="‰"
              color="purple"
              referenceMin={-125}
              referenceMax={-75}
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Compliance Thresholds</h3>
            <ProgressBar 
              value={stats?.verified || 0} 
              max={stats?.total || 0} 
              label="Authentication Success" 
              color="bg-green-500"
            />
            <ProgressBar 
              value={stats?.pending || 0} 
              max={stats?.total || 0} 
              label="Pending Verification" 
              color="bg-yellow-500"
            />
            <ProgressBar 
              value={stats?.failed || 0} 
              max={stats?.total || 0} 
              label="Failed Authentication" 
              color="bg-red-500"
            />
          </div>
        </div>
        
        {/* Isotope Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Isotope Trends Over Time</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="text-xs border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="text-xs border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
          
          <div className="h-80">
            {chartData && (
              <Line 
                data={chartData.isotopeTrends} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Isotope Ratio (‰)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Month/Year'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `${context.dataset.label}: ${value.toFixed(2)}‰`;
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h2>
          <div className="h-64 flex items-center justify-center">
            {chartData && (
              <Doughnut 
                data={chartData.verificationStatus}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          const total = (chartData.verificationStatus.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${context.label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-500">Verified</div>
                <div className="text-lg font-medium text-green-700">{stats?.verified || 0}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-lg font-medium text-yellow-700">{stats?.pending || 0}</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-xs text-gray-500">Failed</div>
                <div className="text-lg font-medium text-red-700">{stats?.failed || 0}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Regional Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Regional Isotope Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Regional Sample Count</h3>
              <div className="space-y-2">
                {Object.entries(stats?.regionData || {}).map(([region, data]) => (
                  <div key={region} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{region}</span>
                    <span className="text-sm font-medium text-gray-900">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Regional Confidence</h3>
              <div className="space-y-2">
                {Object.entries(stats?.regionData || {}).map(([region, data]) => (
                  <div key={region} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{region}</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(data.avgConfidence)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Regional Isotope Variations</h3>
              <div className="text-xs text-gray-500 mb-2">
                Select a batch to view detailed isotope data for a specific region
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(e.target.value || null)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md"
                >
                  <option value="">Select a batch</option>
                  {filteredData.map(item => (
                    <option key={item.batchId} value={item.batchId}>
                      {item.batchId} - {item.farmName}
                    </option>
                  ))}
                </select>
                
                {selectedBatchData && (
                  <div className="col-span-2 mt-2">
                    <div className="bg-white p-3 rounded-md shadow-sm"> 
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{selectedBatchData.batchId}</span>
                          <div className="text-xs text-gray-500">{selectedBatchData.farmName}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBatchData.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : selectedBatchData.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedBatchData.verificationStatus.charAt(0).toUpperCase() + 
                           selectedBatchData.verificationStatus.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Region:</span>
                          <span className="ml-1 text-gray-900">{selectedBatchData.location.region}, {selectedBatchData.location.country}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Test Date:</span>
                          <span className="ml-1 text-gray-900">{format(new Date(selectedBatchData.testDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Confidence:</span>
                          <span className="ml-1 text-gray-900">{selectedBatchData.confidenceScore}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Testing Facility:</span>
                          <span className="ml-1 text-gray-900">{selectedBatchData.testingFacility}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        <div className="bg-blue-50 p-1 rounded text-center">
                          <div className="text-xs text-gray-500">δ13C</div>
                          <div className="text-sm font-medium text-gray-900">{selectedBatchData.isotopes.carbon.toFixed(2)}‰</div>
                        </div>
                        <div className="bg-green-50 p-1 rounded text-center">
                          <div className="text-xs text-gray-500">δ15N</div>
                          <div className="text-sm font-medium text-gray-900">{selectedBatchData.isotopes.nitrogen.toFixed(2)}‰</div>
                        </div>
                        <div className="bg-yellow-50 p-1 rounded text-center">
                          <div className="text-xs text-gray-500">δ18O</div>
                          <div className="text-sm font-medium text-gray-900">{selectedBatchData.isotopes.oxygen.toFixed(2)}‰</div>
                        </div>
                        <div className="bg-purple-50 p-1 rounded text-center">
                          <div className="text-xs text-gray-500">δ2H</div>
                          <div className="text-sm font-medium text-gray-900">{selectedBatchData.isotopes.hydrogen.toFixed(2)}‰</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Isotope Analysis Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbon (δ13C)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nitrogen (δ15N)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {item.batchId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.farmName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {item.location.region}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {format(new Date(item.testDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.isotopes.carbon.toFixed(2)}‰
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.isotopes.nitrogen.toFixed(2)}‰
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            item.confidenceScore >= 90 ? 'bg-green-500' :
                            item.confidenceScore >= 70 ? 'bg-green-400' :
                            item.confidenceScore >= 50 ? 'bg-yellow-400' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.confidenceScore}%` }}
                        ></div>
                      </div>
                      <span>{item.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(item.verificationStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;