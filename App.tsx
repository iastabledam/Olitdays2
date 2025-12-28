import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_PROPERTIES, MOCK_RESERVATIONS, MOCK_TASKS, MOCK_CONVERSATIONS, MOCK_LAUNDRY_ORDERS, MOCK_GUESTS, MOCK_INCIDENTS, MOCK_TENANTS } from './constants';
import { UserRole, Property, BrandSettings, User, Reservation, Task, Conversation, LaundryOrder, GuestProfile, Incident, IncidentStatus, IncidentPriority, Tenant } from './types';
import { Dashboard } from './components/Dashboard';
import { LaundryPortal } from './components/LaundryPortal';
import { GuestPortal } from './components/GuestPortal';
import { CleanerPortal } from './components/CleanerPortal';
import { PropertiesView } from './components/PropertiesView';
import { PlanningView } from './components/PlanningView';
import { CRMView } from './components/CRMView';
import { SettingsView } from './components/SettingsView';
import { PropertyDetailsView } from './components/PropertyDetailsView';
import { InboxView } from './components/InboxView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { GuestsView } from './components/GuestsView';
import { IncidentsView } from './components/IncidentsView';
import { PlatformDashboard } from './components/PlatformDashboard';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Home, 
  Shirt, 
  Menu,
  X,
  Eye,
  MessageSquare,
  Sparkles,
  Link,
  Rocket,
  User as UserIcon,
  LifeBuoy,
  LogOut,
  Building
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
      active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && badge !== '0' && (
      <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const hexToRgb = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` 
    : null;
};

export default function App() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(MOCK_TENANTS[0] || null);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>(MOCK_LAUNDRY_ORDERS);
  const [guests, setGuests] = useState<GuestProfile[]>(MOCK_GUESTS);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    agencyName: 'HostFlow Pro',
    primaryColor: '#4f46e5',
    logoUrl: ''
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [selectedGuestIdToView, setSelectedGuestIdToView] = useState<string | null>(null);
  const [selectedReservationIdForPortal, setSelectedReservationIdForPortal] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      setCurrentView('dashboard');
      
      const tenantUser = MOCK_USERS.find(
        (u) => u.tenantId === currentTenant.id && u.role === UserRole.AGENCY_ADMIN
      );
      if (tenantUser) {
        setCurrentUser(tenantUser);
      }

      setBrandSettings({
        agencyName: currentTenant.name,
        primaryColor: currentTenant.primaryColor || '#4f46e5',
        logoUrl: currentTenant.logoUrl || ''
      });
    }
  }, [currentTenant]);

  const getTenantProperties = (): Property[] => {
    return properties.filter((p) => p.tenantId === currentTenant?.id);
  };

  const getTenantReservations = (): Reservation[] => {
    return reservations.filter((r) => r.tenantId === currentTenant?.id);
  };

  const getTenantTasks = (): Task[] => {
    return tasks.filter((t) => t.tenantId === currentTenant?.id);
  };

  const getTenantConversations = (): Conversation[] => {
    return conversations.filter((c) => c.tenantId === currentTenant?.id);
  };

  const getTenantLaundryOrders = (): LaundryOrder[] => {
    return laundryOrders.filter((o) => o.tenantId === currentTenant?.id);
  };

  const getTenantGuests = (): GuestProfile[] => {
    return guests.filter((g) => g.tenantId === currentTenant?.id);
  };

  const getTenantIncidents = (): Incident[] => {
    return incidents.filter((i) => i.tenantId === currentTenant?.id);
  };

  const getTenantUsers = (): User[] => {
    return MOCK_USERS.filter((u) => u.tenantId === currentTenant?.id);
  };

  const handleSaveProperty = (updatedProperty: Property, stayOnPage: boolean = false): void => {
    const propertyWithTenant: Property = { 
      ...updatedProperty, 
      tenantId: currentTenant?.id || 't1' 
    };
    
    setProperties((prev) => {
      const exists = prev.find((p) => p.id === propertyWithTenant.id);
      if (exists) {
        return prev.map((p) => p.id === propertyWithTenant.id ? propertyWithTenant : p);
      }
      return [propertyWithTenant, ...prev];
    });

    if (stayOnPage) {
      setEditingPropertyId(updatedProperty.id);
    } else {
      setEditingPropertyId(null);
      setCurrentView('properties');
    }
  };

  const handleCreateIncident = (newIncident: Incident): void => {
    const incidentWithTenant: Incident = { 
      ...newIncident, 
      tenantId: currentTenant?.id || 't1' 
    };
    setIncidents((prev) => [incidentWithTenant, ...prev]);
  };

  const handleRoleChange = (userId: string): void => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === UserRole.LAUNDRY) {
        setCurrentView('laundry');
      } else if (user.role === UserRole.GUEST) {
        setCurrentView('guest');
      } else if (user.role === UserRole.CLEANER) {
        setCurrentView('cleaning');
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  const handleSidebarClick = (viewId: string): void => {
    setCurrentView(viewId);
    if (viewId === 'calendar') {
      setSelectedPropertyId(null);
    }
    if (viewId !== 'travelers') {
      setSelectedGuestIdToView(null);
    }
    if (viewId !== 'guest') {
      setSelectedReservationIdForPortal(null);
    }
    setEditingPropertyId(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const renderContent = (): React.ReactNode => {
    const tProperties = getTenantProperties();
    const tReservations = getTenantReservations();
    const tTasks = getTenantTasks();
    const tConversations = getTenantConversations();
    const tGuests = getTenantGuests();
    const tIncidents = getTenantIncidents();
    const tLaundryOrders = getTenantLaundryOrders();

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleSidebarClick} brandSettings={brandSettings} />;
      
      case 'onboarding':
        return (
          <OnboardingWizard 
            onComplete={() => setIsOnboardingComplete(true)} 
            onNavigate={handleSidebarClick} 
          />
        );
      
      case 'inbox':
        return (
          <InboxView 
            conversations={tConversations} 
            onUpdateConversations={setConversations} 
            properties={tProperties} 
            reservations={tReservations} 
            guests={tGuests}
            onNavigateToGuest={(id) => { 
              setSelectedGuestIdToView(id); 
              setCurrentView('travelers'); 
            }}
            onNavigateToGuestPortal={(id) => { 
              setSelectedReservationIdForPortal(id); 
              setCurrentView('guest'); 
            }}
            onNavigateToIncidents={() => setCurrentView('incidents')}
          />
        );
      
      case 'incidents':
        return (
          <IncidentsView 
            incidents={tIncidents} 
            onUpdateIncidents={setIncidents} 
          />
        );
      
      case 'laundry':
        return (
          <LaundryPortal 
            tasks={tTasks} 
            onUpdateTasks={setTasks} 
            orders={tLaundryOrders} 
            onUpdateOrders={setLaundryOrders} 
            properties={tProperties} 
          />
        );
      
      case 'cleaning':
        return (
          <CleanerPortal 
            tasks={tTasks} 
            onUpdateTasks={setTasks} 
            properties={tProperties} 
            userId={currentUser.id} 
          />
        );
      
      case 'guest':
        return (
          <GuestPortal 
            initialReservationId={selectedReservationIdForPortal} 
            onCreateIncident={handleCreateIncident}
            incidents={tIncidents}
          />
        );
      
      case 'connections':
        return (
          <SettingsView 
            initialTab="connections" 
            brandSettings={brandSettings} 
            onUpdateBrand={setBrandSettings} 
          />
        );
      
      case 'properties':
        return (
          <PropertiesView 
            properties={tProperties} 
            onAddProperty={(p) => handleSaveProperty(p, false)} 
            onNavigateToPlanning={(propId) => { 
              setSelectedPropertyId(propId); 
              setCurrentView('calendar'); 
            }}
            onEditProperty={(propId) => { 
              setEditingPropertyId(propId); 
              setCurrentView('property-edit'); 
            }}
            onNewProperty={() => setCurrentView('property-new')}
          />
        );
      
      case 'property-edit':
        const propToEdit = tProperties.find((p) => p.id === editingPropertyId);
        if (editingPropertyId && propToEdit) {
          return (
            <PropertyDetailsView 
              propertyId={editingPropertyId}
              initialData={propToEdit} 
              onBack={() => { 
                setEditingPropertyId(null); 
                setCurrentView('properties'); 
              }}
              onSave={handleSaveProperty}
            />
          );
        }
        return (
          <PropertiesView 
            properties={tProperties} 
            onAddProperty={(p) => handleSaveProperty(p, false)} 
            onNewProperty={() => setCurrentView('property-new')} 
          />
        );
      
      case 'property-new':
        return (
          <PropertyDetailsView 
            propertyId="new" 
            onBack={() => setCurrentView('properties')}
            onSave={handleSaveProperty}
          />
        );
      
      case 'calendar':
        return (
          <PlanningView 
            properties={tProperties}
            reservations={tReservations}
            selectedPropertyId={selectedPropertyId} 
            onSelectProperty={(id) => setSelectedPropertyId(id)}
            onClearFilter={() => setSelectedPropertyId(null)}
          />
        );
      
      case 'crm':
        return <CRMView />;
      
      case 'travelers':
        return (
          <GuestsView 
            initialGuestId={selectedGuestIdToView} 
            onNavigateToGuestPortal={(id) => { 
              setSelectedReservationIdForPortal(id); 
              setCurrentView('guest'); 
            }} 
          />
        );
      
      case 'settings':
        return (
          <SettingsView 
            initialTab="general" 
            brandSettings={brandSettings} 
            onUpdateBrand={setBrandSettings} 
          />
        );
      
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            Vue introuvable
          </div>
        );
    }
  };

  // MODE 1: Platform Dashboard (pas de tenant sélectionné)
  if (!currentTenant) {
    return (
      <PlatformDashboard 
        tenants={MOCK_TENANTS} 
        onSelectTenant={setCurrentTenant} 
      />
    );
  }

  // MODE 2: Application Tenant
  const rgb = hexToRgb(brandSettings.primaryColor);
  const dynamicStyle = rgb ? `
    :root { 
      --color-primary: ${brandSettings.primaryColor}; 
      --color-primary-rgb: ${rgb}; 
    }
    .text-indigo-500, .text-indigo-600, .text-indigo-700 { 
      color: var(--color-primary) !important; 
    }
    .bg-indigo-500, .bg-indigo-600, .bg-indigo-700 { 
      background-color: var(--color-primary) !important; 
    }
    .bg-indigo-50 { 
      background-color: rgba(var(--color-primary-rgb), 0.08) !important; 
    }
    .bg-indigo-100 { 
      background-color: rgba(var(--color-primary-rgb), 0.15) !important; 
    }
    .border-indigo-200 { 
      border-color: rgba(var(--color-primary-rgb), 0.2) !important; 
    }
  ` : '';

  // Layout Guest (sans sidebar)
  if (currentUser.role === UserRole.GUEST) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="w-full px-6 py-3 flex justify-between items-center">
            <div className="font-bold text-xl text-indigo-600 tracking-tight">
              {brandSettings.agencyName}
              <span className="text-gray-400">Guest</span>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src={currentUser.avatar} 
                alt="User" 
                className="w-8 h-8 rounded-full" 
              />
              <select 
                className="text-xs bg-gray-100 border-none rounded p-1"
                value={currentUser.id}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                {getTenantUsers().map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <GuestPortal 
            onCreateIncident={handleCreateIncident} 
            incidents={getTenantIncidents()} 
          />
        </main>
      </div>
    );
  }

  // Layout Admin/Autres rôles
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <style>{dynamicStyle}</style>
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                {brandSettings.agencyName.charAt(0)}
              </div>
              <span className="text-lg font-bold text-gray-800 tracking-tight line-clamp-1">
                {brandSettings.agencyName}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {currentUser.role !== UserRole.LAUNDRY && currentUser.role !== UserRole.CLEANER && (
              <>
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="Tableau de bord" 
                  active={currentView === 'dashboard'} 
                  onClick={() => handleSidebarClick('dashboard')} 
                />
                <SidebarItem 
                  icon={MessageSquare} 
                  label="Boîte de réception" 
                  active={currentView === 'inbox'} 
                  onClick={() => handleSidebarClick('inbox')} 
                />
                <SidebarItem 
                  icon={LifeBuoy} 
                  label="Support" 
                  badge={getTenantIncidents().filter((i) => i.status === 'NEW').length.toString()} 
                  active={currentView === 'incidents'} 
                  onClick={() => handleSidebarClick('incidents')} 
                />
                <SidebarItem 
                  icon={Calendar} 
                  label="Planning" 
                  active={currentView === 'calendar'} 
                  onClick={() => handleSidebarClick('calendar')} 
                />
                <SidebarItem 
                  icon={Home} 
                  label="Logements" 
                  active={currentView === 'properties' || currentView === 'property-edit'} 
                  onClick={() => handleSidebarClick('properties')} 
                />
                <SidebarItem 
                  icon={Link} 
                  label="Connexions (API)" 
                  active={currentView === 'connections'} 
                  onClick={() => handleSidebarClick('connections')} 
                />
                <SidebarItem 
                  icon={UserIcon} 
                  label="Voyageurs (CRM)" 
                  active={currentView === 'travelers'} 
                  onClick={() => handleSidebarClick('travelers')} 
                />
                <SidebarItem 
                  icon={Shirt} 
                  label="Blanchisserie" 
                  active={currentView === 'laundry'} 
                  onClick={() => handleSidebarClick('laundry')} 
                />
                <SidebarItem 
                  icon={Sparkles} 
                  label="Ménage" 
                  active={currentView === 'cleaning'} 
                  onClick={() => handleSidebarClick('cleaning')} 
                />
                <SidebarItem 
                  icon={Users} 
                  label="Propriétaires" 
                  active={currentView === 'crm'} 
                  onClick={() => handleSidebarClick('crm')} 
                />
                <SidebarItem 
                  icon={Eye} 
                  label="Aperçu Portail" 
                  active={currentView === 'guest'} 
                  onClick={() => handleSidebarClick('guest')} 
                />
                <SidebarItem 
                  icon={Settings} 
                  label="Paramètres" 
                  active={currentView === 'settings'} 
                  onClick={() => handleSidebarClick('settings')} 
                />
              </>
            )}
            {currentUser.role === UserRole.LAUNDRY && (
              <>
                <SidebarItem 
                  icon={Shirt} 
                  label="Missions & Stocks" 
                  active={currentView === 'laundry'} 
                  onClick={() => handleSidebarClick('laundry')} 
                />
                <SidebarItem 
                  icon={Calendar} 
                  label="Planning" 
                  active={currentView === 'calendar'} 
                  onClick={() => handleSidebarClick('calendar')} 
                />
              </>
            )}
            {currentUser.role === UserRole.CLEANER && (
              <>
                <SidebarItem 
                  icon={Sparkles} 
                  label="Mes Missions" 
                  active={currentView === 'cleaning'} 
                  onClick={() => handleSidebarClick('cleaning')} 
                />
                <SidebarItem 
                  icon={Calendar} 
                  label="Planning" 
                  active={currentView === 'calendar'} 
                  onClick={() => handleSidebarClick('calendar')} 
                />
              </>
            )}
          </nav>

          {/* Profil utilisateur */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={currentUser.avatar} 
                alt="User" 
                className="w-10 h-10 rounded-full border border-gray-200" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            
            <select 
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={currentUser.id}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {getTenantUsers().map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>

            <button 
              onClick={() => setCurrentTenant(null)}
              className="w-full flex items-center justify-center text-xs text-red-500 hover:text-red-700 font-medium mt-2"
            >
              <LogOut className="w-3 h-3 mr-1" /> 
              Changer d'organisation
            </button>
          </div>
        </div>
      </aside>

      {/* Zone de contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
              <Building className="w-3 h-3 mr-1.5" />
              {currentTenant.name}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isOnboardingComplete && currentUser.role === UserRole.AGENCY_ADMIN && (
              <button 
                onClick={() => handleSidebarClick('onboarding')} 
                className="hidden md:flex items-center text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Terminer la configuration
              </button>
            )}
            <div className="relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
              <button className="text-gray-400 hover:text-gray-600">
                <Users className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}