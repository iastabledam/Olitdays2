
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
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  OFFICE_MANAGER = 'OFFICE_MANAGER',
  OWNER = 'OWNER',
  CLEANER = 'CLEANER',
  LAUNDRY = 'LAUNDRY',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
}

export interface BrandSettings {
  agencyName: string;
  logoUrl?: string;
  primaryColor: string;
  taxDisplay?: 'gross' | 'net'; // 'gross' = TTC (Europe), 'net' = HT (USA)
}

export interface GlobalPolicy {
  id: string;
  name: string;
  paymentSchedule: '1_payment' | '2_payments';
  payment1Percentage: number;
  payment1Timing: 'at_booking' | 'before_arrival';
  payment1DaysBefore?: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'non_refundable';
  securityDepositType: 'none' | 'fixed';
  securityDepositAmount?: number;
  quoteExpirationHours: number;
}

export interface ImportedCalendar {
  id: string;
  name: string; // "Airbnb", "Booking", etc.
  url: string;
  lastSynced?: string;
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

export interface RoomConfig {
  type: string;
  count: number;
}

export interface BedConfig {
  type: string;
  count: number;
}

export interface LengthOfStayRule {
  id: string;
  type: 'weekly' | 'monthly' | 'custom';
  minNights: number;
  amount: number;
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

export interface Property {
  id: string;
  tenantId: string;
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
  wifiSsid?: string;
  wifiPwd?: string;
  accessCode?: string;
  accessVideoUrl?: string; // NEW FIELD
  amenities?: string[];
  roomsComposition?: RoomConfig[];
  bedsDistribution?: BedConfig[];
  
  // Calendars (iCal)
  importedCalendars?: ImportedCalendar[];

  // Policies & Rules
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'non_refundable';
  houseRules?: string;
  minAge?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  eventsAllowed?: boolean;

  pricing?: {
    basePrice: number;
    currency: string;
    weekendPrice?: number;
    minStay?: number;
    securityDeposit?: number;
    fees?: CustomFee[];
    vatSetting?: VatSetting;
    localTaxes?: LocalTax[];
    lengthOfStayRules?: LengthOfStayRule[];
    extraGuestFee?: number;
    extraGuestThreshold?: number;
    shortStayFee?: number;
    shortStayDuration?: number;
    vatNumber?: string;
    registrationNumber?: string;
  };
}

export interface Reservation {
  id: string;
  tenantId: string;
  propertyId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  platform: 'Airbnb' | 'Booking' | 'Direct' | 'Vrbo';
  keyCodeSent?: boolean;
  guestLinkSent?: boolean;
}

export interface GuestProfile {
  id: string;
  tenantId: string;
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
  tenantId: string;
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
  tenantId: string;
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
  messages?: { text: string; author: string; date: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  tenantId: string;
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
  tenantId: string;
  date: string;
  sender: string;
  receiver: string;
  items: { item: string; quantity: number }[];
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'DELIVERED';
}

export interface Prospect {
  id: number;
  tenantId: string;
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
  documents?: { id: string; name: string; url: string; type: 'pdf' | 'doc' | 'image' | 'folder'; date: string }[];
}
