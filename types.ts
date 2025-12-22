
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'START' | 'PRO' | 'ENTERPRISE';
  logoUrl?: string;
  primaryColor?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Platform owner
  AGENCY_ADMIN = 'AGENCY_ADMIN', // Tenant admin (formerly Super Admin)
  OFFICE_MANAGER = 'OFFICE_MANAGER',
  OWNER = 'OWNER',
  CLEANER = 'CLEANER',
  LAUNDRY = 'LAUNDRY',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  tenantId: string; // Multi-tenant link
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
}

export interface BrandSettings {
  agencyName: string;
  logoUrl?: string;
  primaryColor: string; // Hex code
}

export interface BedConfig {
  type: string;
  count: number;
}

export interface RoomConfig {
  type: string;
  count: number;
}

export interface CustomFee {
  id: string;
  type: string; 
  name: string; 
  amount: number;
  calculationType: 'flat' | 'percent'; 
  frequency: 'per_stay' | 'per_night' | 'per_person' | 'per_night_per_person';
  taxable: boolean;
  shortStayOnly?: boolean;
}

export interface LocalTax {
  id: string;
  type: string;
  name: string;
  amount: number;
  calculationType: 'flat' | 'percent';
  frequency: 'per_stay' | 'per_night' | 'per_person' | 'per_night_per_person';
}

export interface VatSetting {
  enabled: boolean;
  percentage: number;
  includedInPrice: boolean;
}

export interface LengthOfStayRule {
  id: string;
  type: 'weekly' | 'monthly' | 'custom';
  minNights: number;
  amount: number;
}

export interface Property {
  id: string;
  tenantId: string; // Multi-tenant link
  name: string; 
  internalName?: string; 
  address: string;
  ownerId: string;
  imageUrl: string; 
  photos?: string[]; 
  description?: string;
  status: 'active' | 'maintenance';
  
  propertyType?: 'apartment' | 'house' | 'villa' | 'chalet' | 'bnb';
  surface?: number; 
  surfaceUnit?: 'm2' | 'ft2'; 
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  
  roomsComposition?: RoomConfig[];
  bedsDistribution?: BedConfig[];

  wifiSsid?: string;
  wifiPwd?: string;
  accessCode?: string;
  
  amenities?: string[];
  
  pricing?: {
    basePrice: number;
    currency: string;
    weekendPrice?: number;
    minStay?: number;
    securityDeposit?: number;
    vatNumber?: string; 
    registrationNumber?: string; 
    vatSetting?: VatSetting;
    localTaxes?: LocalTax[];
    extraGuestFee?: number;
    extraGuestThreshold?: number; 
    shortStayFee?: number;
    shortStayDuration?: number; 
    fees?: CustomFee[];
    lengthOfStayRules?: LengthOfStayRule[];
    lengthOfStayDiscounts?: { duration: string; discount: string }[];
    taxes?: { name: string; percentage: number }[];
  };
}

export interface Reservation {
  id: string;
  tenantId: string; // Multi-tenant link
  propertyId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  platform: 'Airbnb' | 'Booking' | 'Direct';
  keyCodeSent?: boolean;
  guestLinkSent?: boolean;
}

export interface GuestProfile {
  id: string;
  tenantId: string; // Multi-tenant link
  fullName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  avatar?: string;
  tags: string[]; 
  notes?: string;
  totalSpent: number;
  stayCount: number;
  idCardVerified: boolean;
  depositSecured: boolean;
  lastStayDate?: string;
  source: 'Airbnb' | 'Booking' | 'Direct' | 'Vrbo';
}

export enum TaskType {
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  LAUNDRY_DELIVERY = 'LAUNDRY_DELIVERY',
  LAUNDRY_PICKUP = 'LAUNDRY_PICKUP',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
}

export interface Task {
  id: string;
  tenantId: string; // Multi-tenant link
  type: TaskType;
  propertyId: string;
  assigneeId?: string;
  dueDate: string;
  status: TaskStatus;
  description: string;
  laundryItems?: { item: string; quantity: number }[];
  proofPhotos?: string[]; 
}

export enum IncidentStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Incident {
  id: string;
  tenantId: string; // Multi-tenant link
  title: string;
  description: string;
  propertyId: string;
  reservationId?: string; 
  guestName?: string;
  reportedAt: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: 'WIFI' | 'PLUMBING' | 'ELECTRICITY' | 'CLEANING' | 'ACCESS' | 'OTHER';
  assignedTo?: string; 
  photos?: string[];
  messages?: { text: string, author: string, date: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model'; 
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  tenantId: string; // Multi-tenant link
  guestName: string;
  guestAvatar?: string;
  guestEmail?: string;
  guestPhone?: string;
  propertyId: string;
  reservationId?: string; 
  platform: 'Airbnb' | 'Booking' | 'Direct' | 'Vrbo';
  status: 'inquiry' | 'booked' | 'staying' | 'past';
  messages: ChatMessage[];
  unreadCount: number;
  notes?: string;
  tags?: string[];
}

export interface LaundryOrder {
  id: string;
  tenantId: string; // Multi-tenant link
  date: string;
  sender: string;
  receiver: string;
  items: { item: string; quantity: number }[];
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'DELIVERED';
}

export interface ProspectDocument {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'folder';
  date: string;
}

export interface Prospect {
  id: number;
  tenantId: string; // Multi-tenant link
  name: string;
  email: string;
  phone: string;
  property: string;
  address: string;
  status: 'NEW' | 'NEGOTIATION' | 'CONTRACT_SENT' | 'SIGNED';
  value: string;
  lastContact: string;
  auditDone: boolean;
  contractSent: boolean;
  signed: boolean;
  commissionRate?: number;
  contractStartDate?: string;
  documents?: ProspectDocument[];
}
