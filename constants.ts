
import { Property, Reservation, Task, TaskStatus, TaskType, User, UserRole, LaundryOrder, Conversation, Prospect, GuestProfile, Incident, IncidentStatus, IncidentPriority, Tenant, GlobalPolicy } from './types';

// Helper to generate dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'HostFlow Pro',
    slug: 'hostflow',
    plan: 'ENTERPRISE',
    logoUrl: '',
    primaryColor: '#4f46e5',
    createdAt: '2023-01-01',
    status: 'active'
  },
  {
    id: 't2',
    name: 'Sunny Holidays',
    slug: 'sunny-holidays',
    plan: 'PRO',
    logoUrl: '',
    primaryColor: '#f59e0b',
    createdAt: '2023-05-15',
    status: 'active'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', tenantId: 't1', name: 'Virginie (Admin)', role: UserRole.AGENCY_ADMIN, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u2', tenantId: 't1', name: 'Sophie (Office)', role: UserRole.OFFICE_MANAGER, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u3', tenantId: 't1', name: 'Marc (Proprio)', role: UserRole.OWNER, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u4', tenantId: 't1', name: 'CleanTeam Paris', role: UserRole.CLEANER, avatar: 'https://ui-avatars.com/api/?name=Clean+Team&background=0D8ABC&color=fff' },
  { id: 'u5', tenantId: 't1', name: 'Lavage 83', role: UserRole.LAUNDRY, avatar: 'https://ui-avatars.com/api/?name=Lavage+83&background=10B981&color=fff' },
  // Tenant 2 Users
  { id: 'u6', tenantId: 't2', name: 'Admin Sunny', role: UserRole.AGENCY_ADMIN, avatar: 'https://ui-avatars.com/api/?name=Sunny+Admin&background=f59e0b&color=fff' },
];

export const MOCK_GLOBAL_POLICIES: GlobalPolicy[] = [
  {
    id: 'pol-1',
    name: 'Politique principale',
    paymentSchedule: '2_payments',
    payment1Percentage: 50,
    payment1Timing: 'at_booking',
    payment1DaysBefore: 0,
    cancellationPolicy: 'non_refundable',
    securityDepositType: 'none',
    quoteExpirationHours: 48
  },
  {
    id: 'pol-2',
    name: 'Politique flexible',
    paymentSchedule: '1_payment',
    payment1Percentage: 100,
    payment1Timing: 'before_arrival',
    payment1DaysBefore: 14,
    cancellationPolicy: 'flexible',
    securityDepositType: 'fixed',
    securityDepositAmount: 300,
    quoteExpirationHours: 24
  }
];

export const MOCK_PROPERTIES: Property[] = [
  // --- EXISTING ---
  { 
    id: 'p1', 
    tenantId: 't1',
    name: 'Loft Montmartre', 
    address: '12 Rue des Abbesses, Paris', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active', 
    description: 'Magnifique loft au coeur de Montmartre.',
    maxGuests: 4, bedrooms: 2, bathrooms: 1, surface: 85,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate',
    houseRules: 'Pas de fêtes. Non fumeur.',
    pricing: { basePrice: 250, currency: 'EUR', securityDeposit: 500, fees: [] },
    importedCalendars: [
      { id: 'cal-1', name: 'Airbnb', url: 'https://www.airbnb.com/calendar/ical/12345.ics?s=5dfg', lastSynced: 'Il y a 15 min' }
    ],
    accessCode: '4589',
    accessVideoUrl: 'https://videos.pexels.com/video-files/3196058/3196058-uhd_2560_1440_25fps.mp4' // Mock direct video for demo
  },
  { 
    id: 'p2', 
    tenantId: 't1',
    name: 'Appartement Marais', 
    address: '45 Rue des Rosiers, Paris', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active',
    maxGuests: 2, bedrooms: 1, bathrooms: 1, surface: 45,
    checkInTime: '16:00',
    checkOutTime: '10:00',
    cancellationPolicy: 'strict',
    pricing: { basePrice: 180, currency: 'EUR', fees: [] }
  },
  { 
    id: 'p3', 
    tenantId: 't1',
    name: 'Villa Sunny Side', 
    address: '12 Chemin des Oliviers, Nice', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active', 
    description: 'Une magnifique villa niçoise avec piscine à débordement.',
    maxGuests: 8, bedrooms: 4, bathrooms: 3, surface: 200,
    amenities: ['Piscine', 'Climatisation', 'Vue Mer'],
    checkInTime: '17:00',
    checkOutTime: '10:00',
    cancellationPolicy: 'strict',
    pricing: { basePrice: 350, currency: 'EUR', minStay: 3, securityDeposit: 2000, fees: [] }
  },
  { 
    id: 'p4', 
    tenantId: 't1',
    name: 'Villa Horizon', 
    address: 'Domaine des Parcs, Saint-Tropez', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active',
    maxGuests: 10, bedrooms: 5, bathrooms: 5, surface: 350,
    checkInTime: '16:00',
    checkOutTime: '11:00',
    pricing: { basePrice: 1200, currency: 'EUR', fees: [] }
  },
  // --- NEW LUXURY PROPERTIES ---
  {
    id: 'p5',
    tenantId: 't1',
    name: 'Penthouse Champs-Élysées',
    address: '144 Avenue des Champs-Élysées, Paris',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-22b8c36ec800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    description: 'Vue imprenable sur l\'Arc de Triomphe.',
    maxGuests: 6, bedrooms: 3, bathrooms: 3, surface: 180,
    checkInTime: '15:00', checkOutTime: '12:00',
    pricing: { basePrice: 1500, currency: 'EUR', securityDeposit: 3000, fees: [] }
  },
  {
    id: 'p6',
    tenantId: 't1',
    name: 'Chalet Luxe Megève',
    address: 'Route du Mont d\'Arbois, Megève',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    propertyType: 'chalet',
    maxGuests: 12, bedrooms: 6, bathrooms: 5, surface: 400,
    amenities: ['Jacuzzi', 'Sauna', 'Ski-in/Ski-out'],
    pricing: { basePrice: 2800, currency: 'EUR', minStay: 5, securityDeposit: 5000, fees: [] }
  },
  {
    id: 'p7',
    tenantId: 't1',
    name: 'Mas des Lavandes',
    address: 'Chemin de Gordes, Gordes',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1599809275372-b40c7e9293c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 10, bedrooms: 5, bathrooms: 4, surface: 300,
    pricing: { basePrice: 950, currency: 'EUR', fees: [] }
  },
  {
    id: 'p8',
    tenantId: 't1',
    name: 'Loft Industriel Canal',
    address: 'Quai de Jemmapes, Paris',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 4, bedrooms: 1, bathrooms: 1, surface: 110,
    pricing: { basePrice: 320, currency: 'EUR', fees: [] }
  },
  {
    id: 'p9',
    tenantId: 't1',
    name: 'Villa Zen Bali-Style',
    address: 'Avenue du Roi Albert, Cannes',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b00cc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 8, bedrooms: 4, bathrooms: 4, surface: 250,
    pricing: { basePrice: 1800, currency: 'EUR', fees: [] }
  },
  {
    id: 'p10',
    tenantId: 't1',
    name: 'Appartement Vue Tour Eiffel',
    address: 'Avenue de la Bourdonnais, Paris',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 2, bedrooms: 1, bathrooms: 1, surface: 60,
    pricing: { basePrice: 450, currency: 'EUR', fees: [] }
  },
  {
    id: 'p11',
    tenantId: 't1',
    name: 'Manoir Historique Normandie',
    address: 'Route de la Côte, Deauville',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'maintenance',
    maxGuests: 14, bedrooms: 7, bathrooms: 5, surface: 550,
    pricing: { basePrice: 1200, currency: 'EUR', fees: [] }
  },
  {
    id: 'p12',
    tenantId: 't1',
    name: 'Duplex Design Vieux-Port',
    address: 'Quai de Rive Neuve, Marseille',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1502005229766-939cb934d60b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 4, bedrooms: 2, bathrooms: 2, surface: 95,
    pricing: { basePrice: 210, currency: 'EUR', fees: [] }
  },
  {
    id: 'p13',
    tenantId: 't1',
    name: 'Eco-Lodge Forêt',
    address: 'Domaine des Pins, Fontainebleau',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 2, bedrooms: 1, bathrooms: 1, surface: 40,
    pricing: { basePrice: 150, currency: 'EUR', fees: [] }
  },
  {
    id: 'p14',
    tenantId: 't1',
    name: 'Château Vignoble',
    address: 'Route des Châteaux, Bordeaux',
    ownerId: 'u3',
    imageUrl: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    maxGuests: 16, bedrooms: 8, bathrooms: 8, surface: 800,
    pricing: { basePrice: 3500, currency: 'EUR', fees: [] }
  }
];

export const MOCK_GUESTS: GuestProfile[] = [
  { id: 'g1', tenantId: 't1', fullName: 'Alice Voyageur', email: 'alice@test.com', totalSpent: 1350, stayCount: 2, tags: ['VIP'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'g2', tenantId: 't1', fullName: 'John Doe', email: 'john@test.com', totalSpent: 800, stayCount: 1, tags: ['Business'], idCardVerified: false, depositSecured: false, source: 'Booking', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'g3', tenantId: 't1', fullName: 'Famille Martin', email: 'famille@test.com', totalSpent: 2000, stayCount: 3, tags: ['Famille'], idCardVerified: true, depositSecured: true, source: 'Direct', avatar: '' },
  // --- NEW GUESTS ---
  { id: 'g4', tenantId: 't1', fullName: 'Lucas Bernard', email: 'lucas.b@gmail.com', totalSpent: 4500, stayCount: 5, tags: ['VIP', 'Habitué'], idCardVerified: true, depositSecured: true, source: 'Direct', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256' },
  { id: 'g5', tenantId: 't1', fullName: 'Sarah Levy', email: 's.levy@test.com', totalSpent: 320, stayCount: 1, tags: ['Last Minute'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256' },
  { id: 'g6', tenantId: 't1', fullName: 'Pierre Durand', email: 'pierre.d@test.fr', totalSpent: 12000, stayCount: 2, tags: ['VIP', 'Luxe'], idCardVerified: true, depositSecured: true, source: 'Direct', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256' },
  { id: 'g7', tenantId: 't1', fullName: 'Emma Smith', email: 'emma@uk.co', totalSpent: 8500, stayCount: 1, tags: ['International'], idCardVerified: false, depositSecured: false, source: 'Booking', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256' },
  { id: 'g8', tenantId: 't1', fullName: 'Julie Moreau', email: 'julie.m@test.fr', totalSpent: 1500, stayCount: 3, tags: ['Sympa'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256' },
  { id: 'g9', tenantId: 't1', fullName: 'Clara Petit', email: 'clara@test.fr', totalSpent: 2200, stayCount: 1, tags: [], idCardVerified: true, depositSecured: true, source: 'Vrbo', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=256' },
  { id: 'g10', tenantId: 't1', fullName: 'Thomas Leroy', email: 'thomas@test.space', totalSpent: 500, stayCount: 1, tags: ['Rapide'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256' },
  { id: 'g11', tenantId: 't1', fullName: 'Hans Müller', email: 'hans@de.de', totalSpent: 5000, stayCount: 10, tags: ['VIP', 'Famille'], idCardVerified: true, depositSecured: true, source: 'Direct', avatar: 'https://images.unsplash.com/photo-1522075469751-3a3694c2dd77?w=256' },
  { id: 'g12', tenantId: 't1', fullName: 'Marion Cotillard', email: 'marion@test.fr', totalSpent: 3000, stayCount: 2, tags: ['Calme'], idCardVerified: true, depositSecured: false, source: 'Booking', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=256' },
  { id: 'g13', tenantId: 't1', fullName: 'Nicolas Robert', email: 'nico@test.fr', totalSpent: 4000, stayCount: 4, tags: ['VIP', 'Famille'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488058?w=256' },
  { id: 'g14', tenantId: 't1', fullName: 'Camille Andre', email: 'camille@test.fr', totalSpent: 1800, stayCount: 2, tags: [], idCardVerified: true, depositSecured: true, source: 'Booking', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256' },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  // Existing
  { id: 'r1', tenantId: 't1', propertyId: 'p1', guestName: 'Alice Voyageur', startDate: addDays(-2), endDate: addDays(2), status: 'checked-in', totalAmount: 450, platform: 'Airbnb' },
  { id: 'r2', tenantId: 't1', propertyId: 'p2', guestName: 'John Doe', startDate: addDays(1), endDate: addDays(5), status: 'confirmed', totalAmount: 800, platform: 'Booking' },
  { id: 'r3', tenantId: 't1', propertyId: 'p3', guestName: 'Famille Martin', startDate: addDays(3), endDate: addDays(10), status: 'confirmed', totalAmount: 1200, platform: 'Direct' },
  { id: 'r4', tenantId: 't1', propertyId: 'p4', guestName: 'Emma Smith', startDate: addDays(10), endDate: addDays(20), status: 'confirmed', totalAmount: 15000, platform: 'Direct' },
  
  // --- NEW RESERVATIONS (Filling the calendar) ---
  { id: 'r5', tenantId: 't1', propertyId: 'p5', guestName: 'Lucas Bernard', startDate: addDays(-1), endDate: addDays(4), status: 'checked-in', totalAmount: 7500, platform: 'Direct' },
  { id: 'r6', tenantId: 't1', propertyId: 'p6', guestName: 'Emma Smith', startDate: addDays(5), endDate: addDays(12), status: 'confirmed', totalAmount: 19600, platform: 'Booking' },
  { id: 'r7', tenantId: 't1', propertyId: 'p5', guestName: 'Pierre Durand', startDate: addDays(6), endDate: addDays(10), status: 'confirmed', totalAmount: 6000, platform: 'Direct' },
  { id: 'r8', tenantId: 't1', propertyId: 'p7', guestName: 'Sarah Levy', startDate: addDays(-3), endDate: addDays(0), status: 'checked-out', totalAmount: 2850, platform: 'Airbnb' },
  { id: 'r9', tenantId: 't1', propertyId: 'p8', guestName: 'Julie Moreau', startDate: addDays(0), endDate: addDays(3), status: 'checked-in', totalAmount: 960, platform: 'Airbnb' },
  { id: 'r10', tenantId: 't1', propertyId: 'p9', guestName: 'Clara Petit', startDate: addDays(2), endDate: addDays(9), status: 'confirmed', totalAmount: 12600, platform: 'Vrbo' },
  { id: 'r11', tenantId: 't1', propertyId: 'p10', guestName: 'Thomas Leroy', startDate: addDays(-5), endDate: addDays(-1), status: 'checked-out', totalAmount: 1800, platform: 'Airbnb' },
  { id: 'r12', tenantId: 't1', propertyId: 'p12', guestName: 'Hans Müller', startDate: addDays(4), endDate: addDays(8), status: 'confirmed', totalAmount: 840, platform: 'Direct' },
  { id: 'r13', tenantId: 't1', propertyId: 'p14', guestName: 'Marion Cotillard', startDate: addDays(1), endDate: addDays(3), status: 'confirmed', totalAmount: 7000, platform: 'Booking' },
  { id: 'r14', tenantId: 't1', propertyId: 'p1', guestName: 'Nicolas Robert', startDate: addDays(5), endDate: addDays(9), status: 'confirmed', totalAmount: 1000, platform: 'Airbnb' },
  { id: 'r15', tenantId: 't1', propertyId: 'p2', guestName: 'Sarah Levy', startDate: addDays(8), endDate: addDays(12), status: 'confirmed', totalAmount: 720, platform: 'Airbnb' },
  { id: 'r16', tenantId: 't1', propertyId: 'p3', guestName: 'Lucas Bernard', startDate: addDays(-10), endDate: addDays(-5), status: 'checked-out', totalAmount: 1750, platform: 'Direct' },
  { id: 'r17', tenantId: 't1', propertyId: 'p6', guestName: 'Famille Martin', startDate: addDays(15), endDate: addDays(22), status: 'confirmed', totalAmount: 19600, platform: 'Direct' },
  { id: 'r18', tenantId: 't1', propertyId: 'p13', guestName: 'Emma Smith', startDate: addDays(0), endDate: addDays(2), status: 'checked-in', totalAmount: 300, platform: 'Booking' },
  { id: 'r19', tenantId: 't1', propertyId: 'p7', guestName: 'Julie Moreau', startDate: addDays(5), endDate: addDays(15), status: 'confirmed', totalAmount: 9500, platform: 'Airbnb' },
  { id: 'r20', tenantId: 't1', propertyId: 'p9', guestName: 'Pierre Durand', startDate: addDays(-4), endDate: addDays(-1), status: 'checked-out', totalAmount: 5400, platform: 'Direct' },
  { id: 'r21', tenantId: 't1', propertyId: 'p11', guestName: 'Camille Andre', startDate: addDays(2), endDate: addDays(5), status: 'confirmed', totalAmount: 4000, platform: 'Booking' }
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', tenantId: 't1', type: TaskType.CLEANING, propertyId: 'p1', assigneeId: 'u4', dueDate: addDays(2), status: TaskStatus.PENDING, description: 'Ménage complet' },
  { id: 't2', tenantId: 't1', type: TaskType.MAINTENANCE, propertyId: 'p3', assigneeId: 'u5', dueDate: addDays(0), status: TaskStatus.IN_PROGRESS, description: 'Réparer clim' },
  { id: 't3', tenantId: 't1', type: TaskType.CLEANING, propertyId: 'p5', assigneeId: 'u4', dueDate: addDays(4), status: TaskStatus.PENDING, description: 'Ménage de sortie (Grand)' },
  { id: 't4', tenantId: 't1', type: TaskType.LAUNDRY_DELIVERY, propertyId: 'p6', assigneeId: 'u5', dueDate: addDays(5), status: TaskStatus.PENDING, description: 'Livraison 12 kits draps' },
  { id: 't5', tenantId: 't1', type: TaskType.MAINTENANCE, propertyId: 'p14', assigneeId: 'u5', dueDate: addDays(1), status: TaskStatus.PENDING, description: 'Vérifier alarme incendie' },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    tenantId: 't1',
    title: 'Code porte entrée ne fonctionne pas',
    description: 'Le code ne marche plus.',
    propertyId: 'p1',
    guestName: 'Alice Voyageur',
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    status: IncidentStatus.NEW,
    priority: IncidentPriority.HIGH,
    category: 'ACCESS',
    messages: []
  },
  {
    id: 'inc-2',
    tenantId: 't1',
    title: 'Piscine verte',
    description: 'L\'eau a tourné.',
    propertyId: 'p3',
    guestName: 'Famille Martin',
    reportedAt: new Date(Date.now() - 86400000).toISOString(),
    status: IncidentStatus.IN_PROGRESS,
    priority: IncidentPriority.CRITICAL,
    category: 'OTHER',
    messages: []
  },
  {
    id: 'inc-3',
    tenantId: 't1',
    title: 'Fuite robinet cuisine',
    description: 'Goutte à goutte incessant.',
    propertyId: 'p5',
    guestName: 'Lucas Bernard',
    reportedAt: new Date(Date.now() - 1200000).toISOString(),
    status: IncidentStatus.NEW,
    priority: IncidentPriority.MEDIUM,
    category: 'PLUMBING',
    messages: []
  }
];

export const MOCK_REVENUE_DATA = [
  { name: 'Jan', revenue: 12000, margin: 2400 },
  { name: 'Feb', revenue: 15000, margin: 3000 },
  { name: 'Mar', revenue: 18000, margin: 3600 },
  { name: 'Apr', revenue: 22000, margin: 4400 },
  { name: 'May', revenue: 28000, margin: 5600 },
  { name: 'Jun', revenue: 35000, margin: 7000 },
];

export const LAUNDRY_STOCK = [
  { item: 'Drap Housse 160x200', total: 500, available: 120, clean: 120, dirty: 40, inUse: 340 },
  { item: 'Housse Couette 240x260', total: 500, available: 110, clean: 110, dirty: 50, inUse: 340 },
];

export const MOCK_LAUNDRY_ORDERS: LaundryOrder[] = [
  { id: 'lo1', tenantId: 't1', date: addDays(-1), sender: 'HostFlow Paris', receiver: 'Lavage 83', items: [{ item: 'Drap Housse', quantity: 20 }], status: 'ACCEPTED' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    tenantId: 't1',
    guestName: 'Alice Voyageur',
    guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    propertyId: 'p1',
    reservationId: 'r1',
    platform: 'Airbnb',
    status: 'staying',
    unreadCount: 1,
    messages: [{ id: 'm1', role: 'user', text: "Le code de la porte ne fonctionne pas, pouvez-vous m'aider ?", timestamp: Date.now() }]
  },
  {
    id: 'c2',
    tenantId: 't1',
    guestName: 'Lucas Bernard',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256',
    propertyId: 'p5',
    reservationId: 'r5',
    platform: 'Direct',
    status: 'staying',
    unreadCount: 0,
    messages: [
        { id: 'm2a', role: 'user', text: "Bonjour, est-il possible d'avoir un late check-out ?", timestamp: Date.now() - 100000 },
        { id: 'm2b', role: 'model', text: "Bonjour Lucas, oui c'est possible jusqu'à 14h moyennant un supplément de 50€. Cela vous convient-il ?", timestamp: Date.now() - 50000 },
        { id: 'm2c', role: 'user', text: "Parfait, je prends !", timestamp: Date.now() }
    ]
  },
  {
    id: 'c3',
    tenantId: 't1',
    guestName: 'Julie Moreau',
    guestAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256',
    propertyId: 'p8',
    reservationId: 'r9',
    platform: 'Airbnb',
    status: 'staying',
    unreadCount: 2,
    messages: [{ id: 'm3', role: 'user', text: "Salut ! Y a-t-il une machine Nespresso ?", timestamp: Date.now() }]
  },
  {
    id: 'c4',
    tenantId: 't1',
    guestName: 'Emma Smith',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256',
    propertyId: 'p6',
    reservationId: 'r6',
    platform: 'Booking',
    status: 'booked',
    unreadCount: 0,
    messages: [{ id: 'm4', role: 'user', text: "Looking forward to our stay! Is the jacuzzi heated all year round?", timestamp: Date.now() - 86400000 }]
  },
  {
    id: 'c5',
    tenantId: 't1',
    guestName: 'Clara Petit',
    guestAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=256',
    propertyId: 'p9',
    reservationId: 'r10',
    platform: 'Vrbo',
    status: 'booked',
    unreadCount: 1,
    messages: [{ id: 'm5', role: 'user', text: "Bonjour, on arrivera un peu tard, vers 22h. C'est bon pour l'accès ?", timestamp: Date.now() - 3600000 }]
  },
  {
    id: 'c6',
    tenantId: 't1',
    guestName: 'Hans Müller',
    guestAvatar: 'https://images.unsplash.com/photo-1522075469751-3a3694c2dd77?w=256',
    propertyId: 'p12',
    reservationId: 'r12',
    platform: 'Direct',
    status: 'booked',
    unreadCount: 0,
    messages: [{ id: 'm6', role: 'user', text: "Merci pour la confirmation.", timestamp: Date.now() - 200000000 }]
  },
  {
    id: 'c7',
    tenantId: 't1',
    guestName: 'Marion Cotillard',
    guestAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=256',
    propertyId: 'p14',
    reservationId: 'r13',
    platform: 'Booking',
    status: 'booked',
    unreadCount: 3,
    messages: [{ id: 'm7', role: 'user', text: "Est-ce que le petit déjeuner est inclus ?", timestamp: Date.now() }]
  },
  {
    id: 'c8',
    tenantId: 't1',
    guestName: 'Pierre Durand',
    guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256',
    propertyId: 'p5',
    reservationId: 'r7',
    platform: 'Direct',
    status: 'booked',
    unreadCount: 0,
    messages: [{ id: 'm8', role: 'model', text: "Bonjour Pierre, tout est prêt pour votre arrivée.", timestamp: Date.now() - 400000 }]
  },
  {
    id: 'c9',
    tenantId: 't1',
    guestName: 'Nicolas Robert',
    guestAvatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488058?w=256',
    propertyId: 'p1',
    reservationId: 'r14',
    platform: 'Airbnb',
    status: 'booked',
    unreadCount: 0,
    messages: [{ id: 'm9', role: 'user', text: "C'est bon pour moi, merci !", timestamp: Date.now() - 500000 }]
  },
  {
    id: 'c10',
    tenantId: 't1',
    guestName: 'Sarah Levy',
    guestAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256',
    propertyId: 'p7',
    reservationId: 'r8',
    platform: 'Airbnb',
    status: 'past',
    unreadCount: 0,
    messages: [{ id: 'm10', role: 'user', text: "J'ai oublié un chargeur je crois...", timestamp: Date.now() }]
  },
  {
    id: 'c11',
    tenantId: 't1',
    guestName: 'Camille Andre',
    guestAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256',
    propertyId: 'p11',
    reservationId: 'r21',
    platform: 'Booking',
    status: 'booked',
    unreadCount: 1,
    messages: [{ id: 'm11', role: 'user', text: "Bonjour, le linge de maison est-il fourni ?", timestamp: Date.now() - 100000 }]
  }
];

export const MOCK_PROSPECTS: Prospect[] = [
  { 
    id: 101,
    tenantId: 't1',
    name: 'Jean Dupont', 
    email: 'jean@email.com',
    phone: '+33 6 12 34 56 78',
    property: 'Villa Marine', 
    address: '12 Avenue des Pins',
    status: 'NEGOTIATION', 
    value: '45k€/an', 
    lastContact: '2j',
    auditDone: true,
    contractSent: false,
    signed: false
  },
  // --- NEW OWNERS (Signed/Active) ---
  { id: 102, tenantId: 't1', name: 'Michel Drucker', email: 'm.drucker@tv.fr', phone: '0601020304', property: 'Penthouse Champs-Élysées', address: 'Paris', status: 'SIGNED', value: '120k€/an', lastContact: '5j', auditDone: true, contractSent: true, signed: true },
  { id: 103, tenantId: 't1', name: 'Sophie Marceau', email: 'sophie@cinema.fr', phone: '0611223344', property: 'Chalet Luxe Megève', address: 'Megève', status: 'SIGNED', value: '80k€/an', lastContact: '1j', auditDone: true, contractSent: true, signed: true },
  { id: 104, tenantId: 't1', name: 'Alain Delon', email: 'alain@legend.fr', phone: '0655667788', property: 'Mas des Lavandes', address: 'Gordes', status: 'SIGNED', value: '60k€/an', lastContact: '10j', auditDone: true, contractSent: true, signed: true },
  { id: 105, tenantId: 't1', name: 'Charlotte Gainsbourg', email: 'charlotte@music.fr', phone: '0699887766', property: 'Loft Industriel Canal', address: 'Paris', status: 'SIGNED', value: '55k€/an', lastContact: '3j', auditDone: true, contractSent: true, signed: true },
  { id: 106, tenantId: 't1', name: 'David Guetta', email: 'david@dj.com', phone: '0644332211', property: 'Villa Zen Bali-Style', address: 'Cannes', status: 'SIGNED', value: '200k€/an', lastContact: '2j', auditDone: true, contractSent: true, signed: true },
  { id: 107, tenantId: 't1', name: 'Vanessa Paradis', email: 'vanessa@divine.fr', phone: '0677889900', property: 'Appartement Vue Tour Eiffel', address: 'Paris', status: 'SIGNED', value: '75k€/an', lastContact: '7j', auditDone: true, contractSent: true, signed: true },
  { id: 108, tenantId: 't1', name: 'Gérard Depardieu', email: 'gerard@vigne.fr', phone: '0612345678', property: 'Manoir Historique Normandie', address: 'Deauville', status: 'SIGNED', value: '90k€/an', lastContact: '1mois', auditDone: true, contractSent: true, signed: true },
  { id: 109, tenantId: 't1', name: 'Jul', email: 'jul@ovni.fr', phone: '0613131313', property: 'Duplex Design Vieux-Port', address: 'Marseille', status: 'SIGNED', value: '40k€/an', lastContact: '4j', auditDone: true, contractSent: true, signed: true },
  { id: 110, tenantId: 't1', name: 'Nicolas Hulot', email: 'nico@nature.fr', phone: '0698765432', property: 'Eco-Lodge Forêt', address: 'Fontainebleau', status: 'SIGNED', value: '30k€/an', lastContact: '15j', auditDone: true, contractSent: true, signed: true },
  { id: 111, tenantId: 't1', name: 'Francis Ford Coppola', email: 'francis@movie.com', phone: '0654321098', property: 'Château Vignoble', address: 'Bordeaux', status: 'SIGNED', value: '300k€/an', lastContact: '2j', auditDone: true, contractSent: true, signed: true }
];
