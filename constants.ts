
import { Property, Reservation, Task, TaskStatus, TaskType, User, UserRole, LaundryOrder, Conversation, Prospect, GuestProfile, Incident, IncidentStatus, IncidentPriority } from './types';

// Helper to generate dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Virginie (Admin)', role: UserRole.AGENCY_ADMIN, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u2', name: 'Sophie (Office)', role: UserRole.OFFICE_MANAGER, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u3', name: 'Marc (Proprio)', role: UserRole.OWNER, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'u4', name: 'CleanTeam Paris', role: UserRole.CLEANER, avatar: 'https://ui-avatars.com/api/?name=Clean+Team&background=0D8ABC&color=fff' },
  { id: 'u5', name: 'Lavage 83', role: UserRole.LAUNDRY, avatar: 'https://ui-avatars.com/api/?name=Lavage+83&background=10B981&color=fff' },
];

export const MOCK_PROPERTIES: Property[] = [
  { 
    id: 'p1', 
    name: 'Loft Montmartre', 
    address: '12 Rue des Abbesses, Paris', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active', 
    description: 'Magnifique loft au coeur de Montmartre.',
    maxGuests: 4, bedrooms: 2, bathrooms: 1, surface: 85,
    pricing: { basePrice: 250, currency: 'EUR', fees: [] }
  },
  { 
    id: 'p2', 
    name: 'Appartement Marais', 
    address: '45 Rue des Rosiers, Paris', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active',
    maxGuests: 2, bedrooms: 1, bathrooms: 1, surface: 45,
    pricing: { basePrice: 180, currency: 'EUR', fees: [] }
  },
  { 
    id: 'p3', 
    name: 'Villa Sunny Side', 
    address: '12 Chemin des Oliviers, Nice', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active', 
    description: 'Une magnifique villa niçoise avec piscine à débordement.',
    maxGuests: 8, bedrooms: 4, bathrooms: 3, surface: 200,
    amenities: ['Piscine', 'Climatisation', 'Vue Mer'],
    pricing: { basePrice: 350, currency: 'EUR', minStay: 3, fees: [] }
  },
  { 
    id: 'p4', 
    name: 'Villa Horizon', 
    address: 'Domaine des Parcs, Saint-Tropez', 
    ownerId: 'u3', 
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    status: 'active',
    maxGuests: 10, bedrooms: 5, bathrooms: 5, surface: 350,
    pricing: { basePrice: 1200, currency: 'EUR', fees: [] }
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', propertyId: 'p1', guestName: 'Alice Voyageur', startDate: addDays(-2), endDate: addDays(2), status: 'checked-in', totalAmount: 450, platform: 'Airbnb' },
  { id: 'r2', propertyId: 'p2', guestName: 'John Doe', startDate: addDays(1), endDate: addDays(5), status: 'confirmed', totalAmount: 800, platform: 'Booking' },
  { id: 'r3', propertyId: 'p3', guestName: 'Famille Martin', startDate: addDays(3), endDate: addDays(10), status: 'confirmed', totalAmount: 1200, platform: 'Direct' },
  { id: 'r4', propertyId: 'p4', guestName: 'Stars US', startDate: addDays(10), endDate: addDays(20), status: 'confirmed', totalAmount: 15000, platform: 'Direct' },
];

export const MOCK_GUESTS: GuestProfile[] = [
  { id: 'g1', fullName: 'Alice Voyageur', email: 'alice@test.com', totalSpent: 1350, stayCount: 2, tags: ['VIP'], idCardVerified: true, depositSecured: true, source: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'g2', fullName: 'John Doe', email: 'john@test.com', totalSpent: 800, stayCount: 1, tags: ['Business'], idCardVerified: false, depositSecured: false, source: 'Booking', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'g3', fullName: 'Famille Martin', email: 'famille@test.com', totalSpent: 2000, stayCount: 3, tags: ['Famille'], idCardVerified: true, depositSecured: true, source: 'Direct', avatar: '' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', type: TaskType.CLEANING, propertyId: 'p1', assigneeId: 'u4', dueDate: addDays(2), status: TaskStatus.PENDING, description: 'Ménage complet' },
  { id: 't2', type: TaskType.MAINTENANCE, propertyId: 'p3', assigneeId: 'u5', dueDate: addDays(0), status: TaskStatus.IN_PROGRESS, description: 'Réparer clim' },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
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
    title: 'Piscine verte',
    description: 'L\'eau a tourné.',
    propertyId: 'p3',
    guestName: 'Famille Martin',
    reportedAt: new Date(Date.now() - 86400000).toISOString(),
    status: IncidentStatus.IN_PROGRESS,
    priority: IncidentPriority.CRITICAL,
    category: 'OTHER',
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
  { id: 'lo1', date: addDays(-1), sender: 'HostFlow Paris', receiver: 'Lavage 83', items: [{ item: 'Drap Housse', quantity: 20 }], status: 'ACCEPTED' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    guestName: 'Alice Voyageur',
    guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    propertyId: 'p1',
    reservationId: 'r1',
    platform: 'Airbnb',
    status: 'staying',
    unreadCount: 1,
    messages: [{ id: 'm1', role: 'user', text: "Code porte ?", timestamp: Date.now() }]
  }
];

export const MOCK_PROSPECTS: Prospect[] = [
  { 
    id: 101,
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
  }
];
