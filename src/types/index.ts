// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  BRAND = 'brand',
  FARMER = 'farmer',
  PROCESSOR = 'processor',
  MANUFACTURER = 'manufacturer',
  AUDITOR = 'auditor'
}

// Cotton Batch Types
export interface CottonBatch {
  id: string;
  harvestId: string;
  farmerId: string;
  farmName: string;
  harvestDate: string;
  location: GeoLocation;
  fieldBoundaries: GeoPoint[];
  quantity: number;
  quality: QualityMetrics;
  certifications: Certification[];
  blockchainTokenId?: string;
  isotopeMarking?: IsotopeMarking;
  equipmentData: EquipmentData;
  ginData: GinData;
  complianceStatus: ComplianceStatus;
  currentCustodian: string;
  custodyChain: CustodyEvent[];
  sustainabilityScore: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
  region: string;
  country: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface QualityMetrics {
  grade: string;
  fiberLength: number;
  strength: number;
  micronaire: number;
  color: string;
  trashContent: number;
}

export interface GinData {
  ginId: string;
  facilityName: string;
  entryDate: string;
  exitDate: string;
  productionDetails: {
    fiberBaleProductionDate: string;
    fiberBaleId: string;
    baleWeight: number;
    moduleWeight: number;
    fieldTotalCotton: number;
  };
  qualityMetrics: {
    moistureContent: number;
    trashContent: number;
    usdaClassification: string;
    usdaSortCategory: string;
  };
  comments?: string;
  moisturePercentage: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  documentUrl?: string;
  type: 'organic' | 'sustainable' | 'fair-trade' | 'labor-compliant' | 'other';
}

export interface IsotopeMarking {
  id: string;
  markingDate: string;
  markingType: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  lastVerificationDate?: string;
}

export interface BaleData {
  baleNo: string;
  weight: number;
  micronaire: number;
  strength: number;
  length: number;
}

export interface EquipmentData {
  clientName: string;
  farmName: string;
  fieldName: string;
  harvesterId: string;
  harvesterModel: string;
  operatorId: string;
  operatorName: string;
  cottonVariety: CottonVariety;
  location: {
    latitude: number;
    longitude: number;
  };
  gmtDateTime: string;
  fieldArea: {
    value: number;
    unit: string;
  };
  moduleId: string;
  bales: BaleData[];
}

export type CottonVariety = 
  | 'DP 2211 B3TXF TR'
  | 'DP 2328 B3TXF'
  | 'DP 2333 B3XF TR'
  | 'DP 2127 B3XF TR'
  | 'DG 4530 B3TXF'
  | 'Armor 9371 B3XF'
  | 'ST 6000 AXTP';

export interface YieldMeasurement {
  timestamp: string;
  quantity: number;
  unit: string;
  fieldSection?: string;
}

export interface ComplianceStatus {
  forcedLaborVerification: {
    status: 'verified' | 'pending' | 'failed';
    verificationDate?: string;
    verifier?: string;
    documents?: string[];
  };
  organicStatus: {
    status: 'verified' | 'pending' | 'failed';
    certificationId?: string;
  };
  regionalCompliance: {
    region: string;
    status: 'compliant' | 'non-compliant' | 'pending';
    requirements: string[];
  }[];
}

export interface CustodyEvent {
  timestamp: string;
  fromEntity: string;
  toEntity: string;
  location: GeoLocation;
  transportMethod?: string;
  verificationMethod: string;
  documents?: string[];
  blockchainTransactionId?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalBatches: number;
  compliantBatches: number;
  pendingVerification: number;
  nonCompliantBatches: number;
  averageSustainabilityScore: number;
  topSuppliers: {name: string, score: number}[];
  recentAlerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'compliance' | 'quality' | 'custody' | 'certification';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  batchId?: string;
  resolved: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'custody' | 'compliance' | 'certification' | 'system';
  title: string;
  message: string;
  timestamp: string;
  batchId?: string;
  read: boolean;
  icon?: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Filter Types
export interface BatchFilter {
  farmerId?: string;
  region?: string;
  harvestDateStart?: string;
  harvestDateEnd?: string;
  certifications?: string[];
  complianceStatus?: string;
  sustainabilityScoreMin?: number;
  qualityGrade?: string;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  type: 'compliance' | 'sustainability' | 'traceability' | 'custom';
  filters: BatchFilter;
  format: 'pdf' | 'csv' | 'json';
  url?: string;
  status: 'generating' | 'completed' | 'failed';
}

// Verification Request Types
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