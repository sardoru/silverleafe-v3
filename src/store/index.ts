import { create } from 'zustand';
import { User, UserRole, CottonBatch, DashboardMetrics, Alert, Report, Notification } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const mockUser: User = {
      id: '1',
      name: 'John Smith',
      email: email,
      role: email.includes('brand') ? UserRole.BRAND : 
            email.includes('auditor') ? UserRole.AUDITOR : 
            email.includes('farmer') ? UserRole.FARMER : UserRole.ADMIN,
      organization: 'Cotton Innovations Inc.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
    
    await new Promise(resolve => setTimeout(resolve, 100));
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false })
}));

export interface VerificationRequest {
  id: string;
  submissionDate: string;
  companyName: string;
  documentType: string;
  status: 'Pending' | 'In Review' | 'Verified' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  assignedAuditor: string;
  timeInQueue: number;
}

const mockVerificationQueue: VerificationRequest[] = [
  {
    id: 'VR-2024-0001',
    submissionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Sunshine Organic Farms',
    documentType: 'Compliance Report',
    status: 'In Review',
    priority: 'High',
    assignedAuditor: 'Sarah Johnson',
    timeInQueue: 25
  },
  {
    id: 'VR-2024-0002',
    submissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Green Valley Cotton',
    documentType: 'FibreTrace Verification',
    status: 'Pending',
    priority: 'Medium',
    assignedAuditor: 'Michael Chen',
    timeInQueue: 20
  },
  {
    id: 'VR-2024-0003',
    submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Delta Cotton Cooperative',
    documentType: 'Module to Bale Verification',
    status: 'Verified',
    priority: 'Low',
    assignedAuditor: 'Emily Rodriguez',
    timeInQueue: 15
  },
  {
    id: 'VR-2024-0004',
    submissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Western Cotton Growers',
    documentType: 'Labor Practices Audit',
    status: 'Rejected',
    priority: 'High',
    assignedAuditor: 'James Wilson',
    timeInQueue: 12
  },
  {
    id: 'VR-2024-0005',
    submissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Heartland Farms',
    documentType: 'Environmental Impact Report',
    status: 'Pending',
    priority: 'High',
    assignedAuditor: 'Sarah Johnson',
    timeInQueue: 10
  },
  {
    id: 'VR-2024-0006',
    submissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Blue Sky Organics',
    documentType: 'Certification Renewal',
    status: 'In Review',
    priority: 'Medium',
    assignedAuditor: 'Michael Chen',
    timeInQueue: 8
  },
  {
    id: 'VR-2024-0007',
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Golden State Cotton',
    documentType: 'Uster HVI 1000 Verification',
    status: 'Pending',
    priority: 'Low',
    assignedAuditor: 'Emily Rodriguez',
    timeInQueue: 5
  },
  {
    id: 'VR-2024-0008',
    submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Southern Harvest Co-op',
    documentType: 'Supply Chain Audit',
    status: 'In Review',
    priority: 'High',
    assignedAuditor: 'James Wilson',
    timeInQueue: 3
  },
  {
    id: 'VR-2024-0009',
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    companyName: 'Prairie Cotton Fields',
    documentType: 'Sustainability Report',
    status: 'Pending',
    priority: 'Medium',
    assignedAuditor: 'Sarah Johnson',
    timeInQueue: 1
  }
];

interface VerificationQueueState {
  verificationQueue: VerificationRequest[];
  isLoading: boolean;
  error: string | null;
  fetchVerificationQueue: () => Promise<void>;
}

export const useVerificationQueueStore = create<VerificationQueueState>((set) => ({
  verificationQueue: [],
  isLoading: false,
  error: null,
  fetchVerificationQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ verificationQueue: mockVerificationQueue, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch verification queue', isLoading: false });
    }
  }
}));

const mockBatches: CottonBatch[] = [
  {
    id: 'MODULE-23410387436',
    harvestId: 'HARV-2024-001',
    farmerId: 'FARM-001',
    farmName: 'Sunshine Organic Farms',
    harvestDate: '2024-10-16T08:30:00Z',
    location: {
      latitude: 33.400444,
      longitude: -88.509750,
      elevation: 305,
      region: 'Mississippi',
      country: 'USA'
    },
    fieldBoundaries: [
      { latitude: 34.0522, longitude: -118.2437 },
      { latitude: 34.0523, longitude: -118.2438 },
      { latitude: 34.0524, longitude: -118.2439 },
      { latitude: 34.0525, longitude: -118.2440 }
    ],
    quantity: 5057.40,
    quality: {
      grade: 'A',
      fiberLength: 1.15,
      strength: 29.8,
      micronaire: 4.7,
      color: 'White',
      trashContent: 0.8
    },
    ginData: {
      ginId: 'GIN-001-2024',
      facilityName: 'Delta Valley Gin Co.',
      entryDate: '2024-10-17T09:00:00Z',
      exitDate: '2024-10-18T16:30:00Z',
      productionDetails: {
        fiberBaleProductionDate: '2024-10-18T14:15:00Z',
        fiberBaleId: 'FB-2024-1844',
        baleWeight: 480,
        moduleWeight: 5057.40,
        fieldTotalCotton: 4
      },
      qualityMetrics: {
        moistureContent: 6.5,
        trashContent: 2.3,
        usdaClassification: 'Strict Middling',
        usdaSortCategory: 'Color Grade 31'
      },
      comments: 'High-quality cotton module processed with optimal conditions',
      moisturePercentage: 6.5
    },
    certifications: [
      {
        id: 'CERT-001',
        name: 'Organic Cotton Certification',
        issuer: 'Global Organic Textile Standard',
        issueDate: '2024-11-15T00:00:00Z',
        expiryDate: '2026-11-15T00:00:00Z',
        status: 'active',
        documentUrl: 'https://example.com/certificates/CERT-001.pdf',
        type: 'organic'
      }
    ],
    blockchainTokenId: '0x6589fe1271A0F29346796C6bAf0cdF619e25e58e',
    isotopeMarking: {
      id: 'ISO-001',
      markingDate: '2024-11-16T10:15:00Z',
      markingType: 'Stable Isotope',
      verificationStatus: 'verified',
      lastVerificationDate: '2024-11-20T14:30:00Z'
    },
    equipmentData: {
      clientName: 'Cotton Industries LLC',
      farmName: 'Sunshine Organic Farms',
      fieldName: 'North Field A12',
      harvesterId: '1N0C690PLK4075382',
      harvesterModel: 'John Deere CP690',
      operatorId: 'OP-001',
      operatorName: 'Joel Johnson',
      cottonVariety: 'DP 2211 B3TXF TR',
      location: {
        latitude: 33.400444,
        longitude: -88.509750,
      },
      gmtDateTime: '2024-10-16T15:30:00Z',
      fieldArea: {
        value: 512.7,
        unit: 'acres'
      },
      moduleId: '23410387436',
      bales: [
        {
          baleNo: '1112844',
          weight: 471,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112845',
          weight: 483,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112842',
          weight: 471,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112843',
          weight: 487,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        }
      ],
      yieldMeasurements: [
        {
          timestamp: '2023-09-15T08:45:00Z',
          quantity: 1200,
          unit: 'kg',
          fieldSection: 'North'
        },
        {
          timestamp: '2023-09-15T10:30:00Z',
          quantity: 1350,
          unit: 'kg',
          fieldSection: 'Central'
        },
        {
          timestamp: '2023-09-15T13:15:00Z',
          quantity: 1450,
          unit: 'kg',
          fieldSection: 'South'
        }
      ]
    },
    complianceStatus: {
      forcedLaborVerification: {
        status: 'verified',
        verificationDate: '2024-10-15T00:00:00Z',
        verifier: 'Labor Standards International',
        documents: ['https://example.com/documents/labor-verification-001.pdf']
      },
      organicStatus: {
        status: 'verified',
        certificationId: 'CERT-001'
      },
      regionalCompliance: [
        {
          region: 'Mississippi',
          status: 'compliant',
          requirements: ['Water Conservation', 'Pesticide Regulations']
        },
        {
          region: 'USA',
          status: 'compliant',
          requirements: ['USDA Organic Standards', 'Fair Labor Standards Act']
        }
      ]
    },
    currentCustodian: 'Sunshine Organic Farms',
    custodyChain: [
      {
        timestamp: '2024-10-16T17:00:00Z',
        fromEntity: 'Sunshine Organic Farms',
        toEntity: 'Sunshine Cotton Gin',
        location: {
          latitude: 33.400444,
          longitude: -88.509750,
          region: 'Mississippi',
          country: 'USA'
        },
        verificationMethod: 'Digital Signature',
        blockchainTransactionId: '0xca006124b5235f1c2776922c4907f46320027567620d9d32c12497e7358589e3'
      }
    ],
    sustainabilityScore: 92
  }
];

interface BatchState {
  batches: CottonBatch[];
  selectedBatch: CottonBatch | null;
  isLoading: boolean;
  error: string | null;
  fetchBatches: () => Promise<void>;
  selectBatch: (id: string) => void;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  selectedBatch: null,
  isLoading: false,
  error: null,
  fetchBatches: async () => {
    if (get().batches.length > 0 && !get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ batches: mockBatches, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch batches', isLoading: false });
    }
  },
  selectBatch: (id: string) => {
    const { batches } = get();
    const batch = batches.find(b => b.id === id) || null;
    set({ selectedBatch: batch });
  }
}));

const mockMetrics: DashboardMetrics = {
  totalBatches: 156,
  compliantBatches: 142,
  pendingVerification: 9,
  nonCompliantBatches: 6,
  averageSustainabilityScore: 85,
  topSuppliers: [
    { name: 'Sunshine Organic Farms', score: 92 },
    { name: 'Green Valley Cotton', score: 88 },
    { name: 'Delta Cotton Cooperative', score: 85 },
    { name: 'Western Cotton Growers', score: 83 },
    { name: 'Heartland Farms', score: 80 }
  ],
  recentAlerts: [
    {
      id: 'ALERT-001',
      type: 'compliance',
      severity: 'low',
      message: 'Harvest MODULE-23410387436 verified forced labor free',
      timestamp: '2024-10-16T10:15:00Z',
      batchId: 'MODULE-23410387436',
      resolved: true
    },
    {
      id: 'ALERT-002',
      type: 'quality',
      severity: 'high',
      message: 'Harvest MODULE-23406076393 below quality threshold for grade A',
      timestamp: '2024-10-16T14:30:00Z',
      batchId: 'MODULE-23406076393',
      resolved: true
    },
    {
      id: 'ALERT-003',
      type: 'custody',
      severity: 'medium',
      message: 'Custody transfer delay for Harvest MODULE-23414054788',
      timestamp: '2024-10-23T16:45:00Z',
      batchId: 'MODULE-23414054788',
      resolved: false
    },
    {
      id: 'ALERT-004',
      type: 'certification',
      severity: 'low',
      message: 'Certification CERT-007 approaching expiration',
      timestamp: '2025-04-22T09:20:00Z',
      resolved: false
    }
  ]
};

interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: null,
  isLoading: false,
  error: null,
  fetchMetrics: async () => {
    if (get().metrics && !get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set({ metrics: mockMetrics, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard metrics', isLoading: false });
    }
  }
}));

const generateMockNotifications = (): Notification[] => {
  const mockNotifications: Notification[] = [
    {
      id: 'NOTIF-1',
      type: 'custody',
      title: 'Custody Transfer Verified',
      message: 'Sunshine Organic Farms → Regional Distribution Center for batch BATCH-001',
      timestamp: '2023-09-25T10:15:00Z',
      batchId: 'BATCH-001',
      read: false,
      icon: 'truck'
    },
    {
      id: 'NOTIF-2',
      type: 'custody',
      title: 'Custody Transfer Verified',
      message: 'Green Valley Cotton → Texas Processing Center for batch BATCH-002',
      timestamp: '2023-09-24T14:30:00Z',
      batchId: 'BATCH-002',
      read: false,
      icon: 'truck'
    },
    {
      id: 'NOTIF-3',
      type: 'custody',
      title: 'Custody Transfer Verified',
      message: 'Delta Cotton Cooperative → Regional Distribution Center for batch BATCH-003',
      timestamp: '2023-09-23T16:45:00Z',
      batchId: 'BATCH-003',
      read: true,
      icon: 'truck'
    },
    {
      id: 'NOTIF-SYSTEM-1',
      type: 'system',
      title: 'System Update',
      message: 'Silverleafe platform has been updated to version 2.4.0',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      icon: 'refresh'
    }
  ];
  
  return mockNotifications;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    if (get().notifications.length > 0 && !get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const mockNotifications = generateMockNotifications();
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      set({ notifications: mockNotifications, unreadCount, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },
  markAsRead: (id: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    set({ notifications: updatedNotifications, unreadCount });
  },
  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    set({ notifications: updatedNotifications, unreadCount: 0 });
  }
}));

const mockReports: Report[] = [
  {
    id: 'REP-001',
    name: 'Q3 Compliance Report',
    createdAt: '2023-09-01T10:30:00Z',
    createdBy: 'John Smith',
    type: 'compliance',
    filters: {
      harvestDateStart: '2023-07-01',
      harvestDateEnd: '2023-09-30'
    },
    format: 'pdf',
    url: 'https://example.com/reports/REP-001.pdf',
    status: 'completed'
  },
  {
    id: 'REP-002',
    name: 'Sustainability Metrics 2023',
    createdAt: '2023-09-15T14:45:00Z',
    createdBy: 'John Smith',
    type: 'sustainability',
    filters: {
      sustainabilityScoreMin: 80
    },
    format: 'csv',
    url: 'https://example.com/reports/REP-002.csv',
    status: 'completed'
  },
  {
    id: 'REP-003',
    name: 'California Region Traceability',
    createdAt: '2023-09-20T09:15:00Z',
    createdBy: 'John Smith',
    type: 'traceability',
    filters: {
      region: 'California'
    },
    format: 'pdf',
    status: 'generating'
  }
];

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  generateReport: (reportData: Omit<Report, 'id' | 'createdAt' | 'status' | 'url'>) => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  isLoading: false,
  error: null,
  fetchReports: async () => {
    if (get().reports.length > 0 && !get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      set({ reports: mockReports, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch reports', isLoading: false });
    }
  },
  generateReport: async (reportData) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newReport: Report = {
        id: `REP-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        status: 'generating',
        ...reportData
      };
      const { reports } = get();
      set({ reports: [...reports, newReport], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to generate report', isLoading: false });
    }
  }
}));