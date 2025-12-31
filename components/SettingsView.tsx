
import React, { useState, useEffect } from 'react';
import { BrandSettings, GlobalPolicy, Property, CustomFee } from '../types';
import { MOCK_GLOBAL_POLICIES, MOCK_PROPERTIES } from '../constants';
import { 
  Settings, 
  Palette, 
  Link, 
  Save, 
  CheckCircle,
  ExternalLink,
  Zap,
  ScrollText,
  Plus,
  Star,
  MoreHorizontal,
  X,
  Trash2,
  CalendarDays,
  RefreshCw,
  Copy,
  Upload,
  Download,
  Mail,
  MessageSquare,
  Percent,
  Coins,
  Globe,
  Info,
  Pencil
} from 'lucide-react';

interface SettingsViewProps {
  initialTab?: 'general' | 'connections' | 'policies' | 'calendars' | 'inbox' | 'taxes' | 'fees';
  brandSettings: BrandSettings;
  onUpdateBrand: (settings: BrandSettings) => void;
  properties?: Property[];
  onUpdateProperties?: (properties: Property[]) => void;
}

const FEE_TYPES_LIST = [
  "Air conditionné", "Association de l'hébergement", "Assurance voyage",
  "Blanchisserie", "Bois", "Caution", "Chaise haute",
  "Chauffage", "Chauffage de piscine", "Concierge", "Eau", "Électricité", "Équipement",
  "Frais de ménage", "Frais de gestion", "Frais de service", "Frais divers", 
  "Frais pour animaux de compagnie", "Gaz", "Internet", "Jacuzzi", "Jardinage", 
  "Linge", "Linge (bain)", "Linge (lit)", "Lit bébé", "Lit supplémentaire",
  "Parking", "Piscine", "Produits de toilette", "Spa", "Taxe de séjour", "Téléphone", 
  "Transport"
];

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  initialTab = 'general', 
  brandSettings, 
  onUpdateBrand,
  properties = [],
  onUpdateProperties
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connections' | 'policies' | 'calendars' | 'inbox' | 'taxes' | 'fees'>(initialTab);
  const [localBrand, setLocalBrand] = useState<BrandSettings>(brandSettings);
  const [saved, setSaved] = useState(false);
  
  // Policies State - Init with sort
  const [policies, setPolicies] = useState<GlobalPolicy[]>(() => {
      // Sort initially so the main policy is first if possible
      const initial = [...MOCK_GLOBAL_POLICIES];
      const mainId = initial.length > 0 ? initial[0].id : 'pol-1';
      return initial.sort((a, b) => (a.id === mainId ? -1 : 1));
  });
  const [isPolicySidebarOpen, setIsPolicySidebarOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<GlobalPolicy | null>(null);
  const [activePolicyDropdown, setActivePolicyDropdown] = useState<string | null>(null);
  const [mainPolicyId, setMainPolicyId] = useState<string>(MOCK_GLOBAL_POLICIES[0]?.id || 'pol-1');

  // Fees State
  const [isFeeSidebarOpen, setIsFeeSidebarOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CustomFee | null>(null);
  const [selectedFeeProperties, setSelectedFeeProperties] = useState<string[]>([]);
  const [globalFees, setGlobalFees] = useState<CustomFee[]>([]);

  useEffect(() => {
      const allFees: CustomFee[] = [];
      const seenIds = new Set();
      properties.forEach(p => {
          (p.pricing?.fees || []).forEach(f => {
              if (!seenIds.has(f.id)) {
                  seenIds.add(f.id);
                  allFees.push(f);
              }
          });
      });
      setGlobalFees(allFees);
  }, [properties]);

  // Calendar State
  // Synchronize local state with props to ensure new properties appear immediately
  const [propertiesWithCalendars, setPropertiesWithCalendars] = useState<Property[]>(properties);
  const [selectedImportPropertyId, setSelectedImportPropertyId] = useState<string>('');
  const [importUrl, setImportUrl] = useState('');
  const [importName, setImportName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync effect: When 'properties' prop changes (new property added), update local state
  useEffect(() => {
      setPropertiesWithCalendars(properties);
      // If no property is selected yet and we have properties, select the first one
      if (!selectedImportPropertyId && properties.length > 0) {
          setSelectedImportPropertyId(properties[0].id);
      }
  }, [properties]);

  // Inbox Settings State
  const [emailSignature, setEmailSignature] = useState(`Cordialement,\nL'équipe ${brandSettings.agencyName}`);
  const inboxEmailAlias = "5a01e40c-fead-47c1-87e7@inbox.olitdays.com";

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSave = () => {
    onUpdateBrand(localBrand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // --- POLICY HANDLERS ---
  const handleOpenPolicySidebar = (policy?: GlobalPolicy) => {
      if (policy) {
          setEditingPolicy({ ...policy });
      } else {
          setEditingPolicy({
              id: `pol-${Date.now()}`,
              name: '',
              paymentSchedule: '1_payment',
              payment1Percentage: 100,
              payment1Timing: 'at_booking',
              cancellationPolicy: 'non_refundable',
              securityDepositType: 'none',
              quoteExpirationHours: 48
          });
      }
      setIsPolicySidebarOpen(true);
  };

  const handleSavePolicy = () => {
      if (!editingPolicy || !editingPolicy.name) {
          alert("Le nom de la politique est obligatoire");
          return;
      }
      
      setPolicies(prev => {
          const index = prev.findIndex(p => p.id === editingPolicy.id);
          if (index >= 0) {
              const newPolicies = [...prev];
              newPolicies[index] = editingPolicy;
              return newPolicies;
          } else {
              return [...prev, editingPolicy];
          }
      });
      setIsPolicySidebarOpen(false);
      setEditingPolicy(null);
  };

  const handleDeletePolicy = (id: string) => {
      if(window.confirm("Êtes-vous sûr de vouloir supprimer cette politique ? Cette action est irréversible.")) {
          setPolicies(prev => prev.filter(p => p.id !== id));
          if (mainPolicyId === id) {
              const remaining = policies.filter(p => p.id !== id);
              if (remaining.length > 0) setMainPolicyId(remaining[0].id);
          }
      }
  };

  const handleSetMainPolicy = (id: string) => {
      setMainPolicyId(id);
      setActivePolicyDropdown(null);
      
      // Reorder policies: Move the main policy to the top of the list
      setPolicies(prev => {
          const target = prev.find(p => p.id === id);
          if (!target) return prev;
          
          const others = prev.filter(p => p.id !== id);
          return [target, ...others];
      });
  };

  // --- FEE HANDLERS ---
  const handleOpenFeeSidebar = (fee?: CustomFee) => {
      if (fee) {
          setEditingFee({ ...fee });
          const propsWithThisFee = properties.filter(p => p.pricing?.fees?.some(f => f.id === fee.id)).map(p => p.id);
          setSelectedFeeProperties(propsWithThisFee);
      } else {
          setEditingFee({
              id: `fee-glob-${Date.now()}`,
              name: '',
              type: 'Frais de ménage',
              amount: 0,
              calculationType: 'flat',
              frequency: 'per_stay',
              taxable: false,
              shortStayOnly: false
          });
          setSelectedFeeProperties([]);
      }
      setIsFeeSidebarOpen(true);
  };

  const handleSaveFee = () => {
      if (!editingFee || !editingFee.name || !onUpdateProperties) {
          alert("Le nom du frais est obligatoire");
          return;
      }

      const updatedProperties = properties.map(p => {
          const shouldHaveFee = selectedFeeProperties.includes(p.id);
          const currentFees = p.pricing?.fees || [];
          const feeIndex = currentFees.findIndex(f => f.id === editingFee.id);
          
          let newFees = [...currentFees];

          if (shouldHaveFee) {
              if (feeIndex >= 0) {
                  newFees[feeIndex] = editingFee;
              } else {
                  newFees.push(editingFee);
              }
          } else {
              if (feeIndex >= 0) {
                  newFees = newFees.filter(f => f.id !== editingFee.id);
              }
          }

          return {
              ...p,
              pricing: {
                  ...p.pricing!,
                  fees: newFees
              }
          };
      });

      onUpdateProperties(updatedProperties);
      setIsFeeSidebarOpen(false);
      setEditingFee(null);
  };

  // --- CALENDAR ACTIONS ---
  const handleAddCalendar = () => {
      if (!importUrl || !importName || !selectedImportPropertyId) return;
      
      const updatedProperties = propertiesWithCalendars.map(p => {
          if (p.id === selectedImportPropertyId) {
              const newCalendar = {
                  id: `cal-${Date.now()}`,
                  name: importName,
                  url: importUrl,
                  lastSynced: 'À l\'instant'
              };
              return {
                  ...p,
                  importedCalendars: [...(p.importedCalendars || []), newCalendar]
              };
          }
          return p;
      });

      setPropertiesWithCalendars(updatedProperties);
      if (onUpdateProperties) onUpdateProperties(updatedProperties); // Sync to global state
      setImportUrl('');
      setImportName('');
  };

  const handleDeleteCalendar = (propertyId: string, calendarId: string) => {
      if(!window.confirm("Arrêter la synchronisation de ce calendrier ?")) return;
      
      const updatedProperties = propertiesWithCalendars.map(p => {
          if (p.id === propertyId) {
              return {
                  ...p,
                  importedCalendars: p.importedCalendars?.filter(c => c.id !== calendarId) || []
              };
          }
          return p;
      });

      setPropertiesWithCalendars(updatedProperties);
      if (onUpdateProperties) onUpdateProperties(updatedProperties);
  };

  const handleSyncNow = (propertyId: string, calendarId: string) => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          const updatedProperties = propertiesWithCalendars.map(p => {
            if (p.id === propertyId) {
                return {
                    ...p,
                    importedCalendars: p.importedCalendars?.map(c => c.id === calendarId ? {...c, lastSynced: 'À l\'instant'} : c)
                };
            }
            return p;
          });
          setPropertiesWithCalendars(updatedProperties);
          if (onUpdateProperties) onUpdateProperties(updatedProperties);
      }, 1500);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copié !");
  };

  const selectedImportProperty = propertiesWithCalendars.find(p => p.id === selectedImportPropertyId);

  const connections = [
    {
      id: 'airbnb',
      name: 'Airbnb',
      description: 'Synchronisez vos réservations et calendriers',
      icon: '🏠',
      color: '#FF5A5F',
      connected: false
    },
    {
      id: 'booking',
      name: 'Booking.com',
      description: 'Importez automatiquement vos réservations',
      icon: '🅱️',
      color: '#003580',
      connected: false
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Gérez les paiements et les cautions',
      icon: '💳',
      color: '#635BFF',
      connected: true
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in relative pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-indigo-600" />
            Paramètres
          </h1>
          <p className="text-gray-500">Configurez votre espace de gestion</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mx-4">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Général
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'policies'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ScrollText className="w-4 h-4 inline mr-2" />
            Politiques
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'fees'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-2" />
            Frais
          </button>
          <button
            onClick={() => setActiveTab('taxes')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'taxes'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Percent className="w-4 h-4 inline mr-2" />
            Taxes
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Boîte de réception
          </button>
          <button
            onClick={() => setActiveTab('calendars')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'calendars'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Calendriers (iCal)
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'connections'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            Canaux API
          </button>
        </div>

        <div className="p-6 min-h-[400px]">
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'agence
                </label>
                <input
                  type="text"
                  value={localBrand.agencyName}
                  onChange={(e) => setLocalBrand({ ...localBrand, agencyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Mon Agence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-inner cursor-pointer overflow-hidden"
                    style={{ backgroundColor: localBrand.primaryColor }}
                  >
                    <input
                      type="color"
                      value={localBrand.primaryColor}
                      onChange={(e) => setLocalBrand({ ...localBrand, primaryColor: e.target.value })}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={localBrand.primaryColor}
                      onChange={(e) => setLocalBrand({ ...localBrand, primaryColor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="#4f46e5"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Cette couleur sera utilisée dans toute l'interface
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium text-sm transition ${
                    saved
                      ? 'bg-green-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sauvegardé !
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Fees */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Frais</h2>
                        <p className="text-sm text-gray-500">Créez et gérez vos frais et attribuez-les à vos hébergements.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenFeeSidebar()}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-600 transition flex items-center shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Créer un frais
                    </button>
                </div>

                {globalFees.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                            <Coins className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Créez des frais</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                            Définissez des frais de ménage, de service ou autres, et appliquez-les facilement à plusieurs logements en une seule fois.
                        </p>
                        <button 
                            onClick={() => handleOpenFeeSidebar()}
                            className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition"
                        >
                            Créer un frais
                        </button>
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                                    <th className="px-6 py-3">Nom</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Montant</th>
                                    <th className="px-6 py-3">Fréquence</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {globalFees.map(fee => (
                                    <tr key={fee.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 font-bold text-gray-900">{fee.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fee.type}</td>
                                        <td className="px-6 py-4 text-sm font-mono font-medium text-gray-800">
                                            {fee.calculationType === 'flat' ? `€${fee.amount}` : `${fee.amount}%`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {fee.frequency === 'per_stay' ? 'Par séjour' : 
                                             fee.frequency === 'per_night' ? 'Par nuit' : 
                                             fee.frequency === 'per_person' ? 'Par personne' : 'Par nuit/pers'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenFeeSidebar(fee)} className="text-gray-400 hover:text-indigo-600 p-2 rounded hover:bg-gray-100 transition">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          )}

          {/* Tab: Policies */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Politiques</h2>
                    <button 
                        onClick={() => handleOpenPolicySidebar()}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-600 transition flex items-center shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Créer une politique
                    </button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                                <th className="px-6 py-3">Nom</th>
                                <th className="px-6 py-3">Paiement</th>
                                <th className="px-6 py-3">Politique d'annulation</th>
                                <th className="px-6 py-3">Caution</th>
                                <th className="px-6 py-3">Expiration du devis</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {policies.map(policy => (
                                <tr key={policy.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {policy.id === mainPolicyId ? (
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-2" />
                                            ) : (
                                                <div className="w-6"></div>
                                            )}
                                            <span className={`font-medium ${policy.id === mainPolicyId ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>{policy.name}</span>
                                            {policy.id === mainPolicyId && <span className="ml-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase font-bold tracking-wider">Principale</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{policy.payment1Percentage}% dû {policy.payment1Timing === 'at_booking' ? 'au moment de la réservation' : `${policy.payment1DaysBefore}j avant l'arrivée`}.</span>
                                            {policy.paymentSchedule === '2_payments' && (
                                                <span className="text-xs text-gray-400">Montant résiduel dû à l'arrivée.</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {policy.cancellationPolicy === 'flexible' && 'Flexible (24h)'}
                                        {policy.cancellationPolicy === 'moderate' && 'Modérée (5j)'}
                                        {policy.cancellationPolicy === 'strict' && 'Stricte (14j)'}
                                        {policy.cancellationPolicy === 'non_refundable' && 'Tous les règlements pré-payés ne sont pas remboursables'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {policy.securityDepositType === 'none' ? 'Aucune caution n\'est due.' : `${policy.securityDepositAmount}€`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {policy.quoteExpirationHours} hs
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="relative inline-block text-left">
                                            <button 
                                                onClick={() => setActivePolicyDropdown(activePolicyDropdown === policy.id ? null : policy.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            
                                            {activePolicyDropdown === policy.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActivePolicyDropdown(null)}></div>
                                                    <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => { handleOpenPolicySidebar(policy); setActivePolicyDropdown(null); }}
                                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4 mr-3 text-gray-400" />
                                                                Modifier la politique
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDeletePolicy(policy.id); setActivePolicyDropdown(null); }}
                                                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-3 text-red-500" />
                                                                Supprimer la politique
                                                            </button>
                                                            {policy.id !== mainPolicyId && (
                                                                <button
                                                                    onClick={() => handleSetMainPolicy(policy.id)}
                                                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                                                                >
                                                                    <Star className="w-4 h-4 mr-3 text-gray-400" />
                                                                    Marquer comme politique principale
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* Tab: Taxes (Lodgify Style) */}
          {activeTab === 'taxes' && (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Taxes</h2>
                    <p className="text-sm text-gray-500">Configurez l'affichage et les taxes applicables.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Taxes de vente / TVA</h3>
                    <div className="mb-6">
                        <h4 className="font-bold text-sm text-gray-800 mb-4">Paramètres d'affichage</h4>
                        
                        <div className="space-y-4">
                            {/* Option 1: Gross */}
                            <label className="flex items-start cursor-pointer group">
                                <div className="flex items-center h-5 mt-1">
                                    <input 
                                        type="radio" 
                                        name="taxDisplay" 
                                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        checked={localBrand.taxDisplay !== 'net'} // Default
                                        onChange={() => setLocalBrand({...localBrand, taxDisplay: 'gross'})}
                                    />
                                </div>
                                <div className="ml-3">
                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-indigo-700">Toujours afficher mes prix en brut, y compris les taxes de vente / TVA</span>
                                    <span className="block text-sm text-gray-500 mt-1 leading-relaxed">
                                        Ce paramètre permet d'afficher vos prix bruts, y compris la taxe de vente / TVA. C'est la manière la plus courante d'afficher les prix en Europe.
                                    </span>
                                </div>
                            </label>

                            {/* Option 2: Net */}
                            <label className="flex items-start cursor-pointer group">
                                <div className="flex items-center h-5 mt-1">
                                    <input 
                                        type="radio" 
                                        name="taxDisplay" 
                                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        checked={localBrand.taxDisplay === 'net'}
                                        onChange={() => setLocalBrand({...localBrand, taxDisplay: 'net'})}
                                    />
                                </div>
                                <div className="ml-3">
                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-indigo-700">Toujours afficher mes prix en net, sans les taxes de vente / TVA</span>
                                    <span className="block text-sm text-gray-500 mt-1 leading-relaxed">
                                        Ce paramètre affichera vos prix toujours nets et affichera la taxe de vente dans une rubrique distincte. C'est le moyen généralement utilisé pour afficher la taxe de vente / TVA aux États-Unis.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-8">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Taxes locales / de séjour</h3>
                        <button className="text-sm text-indigo-600 font-bold hover:underline flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Ajouter une taxe
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Nom</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Montant</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">Taxe de séjour</td>
                                <td className="px-6 py-4 text-sm text-gray-500">Par nuit / pers</td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-800">2.30 €</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-indigo-600"><Settings className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* Tab: Inbox */}
          {activeTab === 'inbox' && (
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Boîte de réception</h2>
                    <p className="text-sm text-gray-500">Personnalisez vos communications et votre signature.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800">Signature Email</h3>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-gray-900 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={emailSignature}
                        onChange={(e) => setEmailSignature(e.target.value)}
                    />
                    <button className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">Enregistrer</button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-2">Alias Email</h3>
                    <p className="text-sm text-gray-500 mb-4">Utilisez cette adresse pour rediriger les emails vers votre boîte de réception unifiée.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            readOnly 
                            value={inboxEmailAlias}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono"
                        />
                        <button onClick={() => copyToClipboard(inboxEmailAlias)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Tab: Calendars (Restored Logic) */}
          {activeTab === 'calendars' && (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Calendriers (iCal)</h2>
                    <p className="text-sm text-gray-500">Synchronisez vos disponibilités avec des plateformes externes via iCal.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
                        <h3 className="font-bold text-gray-800 mb-4">Sélectionner un logement</h3>
                        <div className="space-y-1">
                            {propertiesWithCalendars.map(prop => (
                                <button 
                                    key={prop.id}
                                    onClick={() => setSelectedImportPropertyId(prop.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${selectedImportPropertyId === prop.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {prop.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        {/* Import Section */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Download className="w-5 h-5 mr-2 text-indigo-600" /> Importer un calendrier
                            </h3>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Nom (ex: Airbnb)" 
                                    className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                    value={importName}
                                    onChange={(e) => setImportName(e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="URL du calendrier (https://...)" 
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                    value={importUrl}
                                    onChange={(e) => setImportUrl(e.target.value)}
                                />
                                <button 
                                    onClick={handleAddCalendar}
                                    disabled={!importUrl || !importName}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Ajouter
                                </button>
                            </div>

                            <div className="space-y-2">
                                {selectedImportProperty?.importedCalendars?.map(cal => (
                                    <div key={cal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{cal.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{cal.url}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 mr-2">Sync: {cal.lastSynced}</span>
                                            <button onClick={() => handleSyncNow(selectedImportProperty.id, cal.id)} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500" title="Synchroniser maintenant">
                                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button onClick={() => handleDeleteCalendar(selectedImportProperty.id, cal.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedImportProperty?.importedCalendars || selectedImportProperty.importedCalendars.length === 0) && (
                                    <p className="text-sm text-gray-400 italic text-center py-4">Aucun calendrier importé pour ce logement.</p>
                                )}
                            </div>
                        </div>

                        {/* Export Section */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Upload className="w-5 h-5 mr-2 text-indigo-600" /> Exporter le calendrier
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">Copiez ce lien pour exporter vos réservations vers Airbnb, Booking, etc.</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={`https://api.hostflow.app/ical/export/${selectedImportPropertyId || 'xxx'}/calendar.ics`}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono"
                                />
                                <button onClick={() => copyToClipboard(`https://api.hostflow.app/ical/export/${selectedImportPropertyId}/calendar.ics`)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Copier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* Tab: Connections */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Canaux & Intégrations</h2>
                    <p className="text-sm text-gray-500">Connectez vos comptes pour synchroniser les données.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connections.map(conn => (
                        <div key={conn.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full hover:border-indigo-300 transition-colors">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gray-50 border border-gray-100" style={{ color: conn.color }}>
                                        {conn.icon}
                                    </div>
                                    {conn.connected ? (
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Connecté
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
                                            Déconnecté
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{conn.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">{conn.description}</p>
                            </div>
                            <button className={`w-full py-2 rounded-lg font-bold text-sm transition ${conn.connected ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                {conn.connected ? 'Configurer' : 'Connecter'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>
      </div>

      {/* --- RIGHT SIDEBAR FOR POLICY EDITING --- */}
      {isPolicySidebarOpen && editingPolicy && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsPolicySidebarOpen(false)}></div>
            <div className="fixed top-0 right-0 bottom-0 w-[550px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 border-l border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-800">{editingPolicy.id.startsWith('pol-') && !policies.find(p => p.id === editingPolicy.id) ? 'Ajouter une politique' : 'Modifier la politique'}</h2>
                    <button onClick={() => setIsPolicySidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                    
                    {/* Nom */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nom interne *</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                            placeholder="ex. : Pré-paiement partiel- non remboursable"
                            value={editingPolicy.name}
                            onChange={(e) => setEditingPolicy({...editingPolicy, name: e.target.value})}
                        />
                    </div>

                    {/* Planification du paiement */}
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2">Planification du paiement</h3>
                        
                        <div className="mb-4">
                            <select 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                value={editingPolicy.paymentSchedule}
                                onChange={(e) => setEditingPolicy({...editingPolicy, paymentSchedule: e.target.value as any})}
                            >
                                <option value="1_payment">1 paiement</option>
                                <option value="2_payments">2 paiements</option>
                            </select>
                        </div>

                        {/* Payment 1 Row */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Paiement 1</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-20 shrink-0">
                                    <input 
                                        type="number" 
                                        className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white text-gray-900 pr-6"
                                        value={editingPolicy.payment1Percentage}
                                        onChange={(e) => setEditingPolicy({...editingPolicy, payment1Percentage: parseInt(e.target.value)})}
                                    />
                                    <span className="absolute right-2 top-2 text-gray-500 text-sm">%</span>
                                </div>
                                <div className="bg-gray-100 text-gray-600 px-3 py-2 text-sm rounded border border-gray-200 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                    % du montant de la réservation
                                </div>
                                <select 
                                    className="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={editingPolicy.payment1Timing}
                                    onChange={(e) => setEditingPolicy({...editingPolicy, payment1Timing: e.target.value as any})}
                                >
                                    <option value="at_booking">au moment de la réservation</option>
                                    <option value="before_arrival">avant l'arrivée</option>
                                </select>
                            </div>
                            {editingPolicy.payment1Timing === 'before_arrival' && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 ml-1">
                                    <span className="text-xs">Dû</span>
                                    <input 
                                        type="number" 
                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900" 
                                        value={editingPolicy.payment1DaysBefore || 0}
                                        onChange={(e) => setEditingPolicy({...editingPolicy, payment1DaysBefore: parseInt(e.target.value)})}
                                    />
                                    <span className="text-xs">jours avant l'arrivée</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Annulation de l'invité */}
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2">Annulation de l'invité</h3>
                        <div className="space-y-2">
                            <select 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                value={editingPolicy.cancellationPolicy}
                                onChange={(e) => setEditingPolicy({...editingPolicy, cancellationPolicy: e.target.value as any})}
                            >
                                <option value="non_refundable">Non-remboursable</option>
                                <option value="strict">Stricte</option>
                                <option value="moderate">Modérée</option>
                                <option value="flexible">Flexible</option>
                            </select>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {editingPolicy.cancellationPolicy === 'non_refundable' && "Tout montant déjà payé n'est pas remboursable. Les soldes restants impayés ne seront pas facturés."}
                                {editingPolicy.cancellationPolicy === 'strict' && "Remboursement intégral jusqu'à 14 jours avant l'arrivée."}
                                {editingPolicy.cancellationPolicy === 'moderate' && "Remboursement intégral jusqu'à 5 jours avant l'arrivée."}
                                {editingPolicy.cancellationPolicy === 'flexible' && "Remboursement intégral jusqu'à 24 heures avant l'arrivée."}
                            </p>
                        </div>
                    </div>

                    {/* Caution */}
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2">Caution</h3>
                        <select 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-emerald-500"
                            value={editingPolicy.securityDepositType}
                            onChange={(e) => setEditingPolicy({...editingPolicy, securityDepositType: e.target.value as any})}
                        >
                            <option value="none">Une caution n'est pas requise</option>
                            <option value="fixed">Caution fixe</option>
                        </select>
                        {editingPolicy.securityDepositType === 'fixed' && (
                            <div className="mt-2">
                                <label className="block text-xs text-gray-500 mb-1">Montant</label>
                                <div className="relative w-32">
                                    <input 
                                        type="number" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 pr-6"
                                        value={editingPolicy.securityDepositAmount || 0}
                                        onChange={(e) => setEditingPolicy({...editingPolicy, securityDepositAmount: parseInt(e.target.value)})}
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Expiration du devis */}
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2">Expiration du devis</h3>
                        <div className="relative w-24 mb-2">
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 pr-8"
                                value={editingPolicy.quoteExpirationHours}
                                onChange={(e) => setEditingPolicy({...editingPolicy, quoteExpirationHours: parseInt(e.target.value)})}
                            />
                            <span className="absolute right-3 top-2 text-gray-500 text-sm">hs</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Le devis est valable pour {editingPolicy.quoteExpirationHours} heures maximum lorsqu'un devis a le statut "En attente de l'invité" ou "En attente de paiement".
                        </p>
                    </div>

                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <button onClick={() => setIsPolicySidebarOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-sm transition">
                        Annuler
                    </button>
                    <button onClick={handleSavePolicy} className="px-6 py-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded font-bold text-sm shadow-sm transition">
                        Ajouter
                    </button>
                </div>
            </div>
          </>
      )}

      {/* --- RIGHT SIDEBAR FOR FEE EDITING --- */}
      {isFeeSidebarOpen && editingFee && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsFeeSidebarOpen(false)}></div>
            <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 border-l border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Créer un frais</h2>
                    <button onClick={() => setIsFeeSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                    {/* Name */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-bold text-gray-700">Nom</label>
                            <span className="text-xs text-gray-400 flex items-center"><Globe className="w-3 h-3 mr-1"/> FR (Français)</span>
                        </div>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                            placeholder="ex: Frais de ménage"
                            value={editingFee.name}
                            onChange={(e) => setEditingFee({...editingFee, name: e.target.value})}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type de frais</label>
                        <select 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                            value={editingFee.type}
                            onChange={(e) => setEditingFee({...editingFee, type: e.target.value})}
                        >
                            {FEE_TYPES_LIST.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Calculation Model - Radio Buttons */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Modèle de calcul</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="calcType" 
                                    checked={editingFee.calculationType === 'flat'} 
                                    onChange={() => setEditingFee({...editingFee, calculationType: 'flat'})}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 bg-white"
                                />
                                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Frais fixe</span>
                            </label>
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="calcType" 
                                    checked={editingFee.calculationType === 'percent'} 
                                    onChange={() => setEditingFee({...editingFee, calculationType: 'percent'})}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 bg-white"
                                />
                                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Pourcentage</span>
                            </label>
                        </div>
                    </div>

                    {/* Amount & Frequency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 pr-8 focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={editingFee.amount}
                                onChange={(e) => setEditingFee({...editingFee, amount: parseFloat(e.target.value)})}
                            />
                            <span className="absolute right-3 top-2 text-gray-500 text-sm">
                                {editingFee.calculationType === 'flat' ? '€' : '%'}
                            </span>
                        </div>
                        <div>
                            <select 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={editingFee.frequency}
                                onChange={(e) => setEditingFee({...editingFee, frequency: e.target.value as any})}
                            >
                                <option value="per_stay">Par séjour</option>
                                <option value="per_night">Par nuit</option>
                                <option value="per_person">Par personne</option>
                                <option value="per_night_per_person">Par nuit / pers</option>
                            </select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Restriction séjour court</p>
                                <p className="text-xs text-gray-500">Appliquez ce frais uniquement lorsque le séjour est trop court.</p>
                            </div>
                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggleShort" 
                                    id="toggleShort" 
                                    className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-emerald-500"
                                    checked={editingFee.shortStayOnly}
                                    onChange={(e) => setEditingFee({...editingFee, shortStayOnly: e.target.checked})}
                                />
                                <label htmlFor="toggleShort" className={`block overflow-hidden h-5 rounded-full cursor-pointer ${editingFee.shortStayOnly ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-800">TVA</p>
                                <p className="text-xs text-gray-500">Définissez la taxe de vente / TVA de ce frais.</p>
                            </div>
                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggleTax" 
                                    id="toggleTax" 
                                    className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-emerald-500"
                                    checked={editingFee.taxable}
                                    onChange={(e) => setEditingFee({...editingFee, taxable: e.target.checked})}
                                />
                                <label htmlFor="toggleTax" className={`block overflow-hidden h-5 rounded-full cursor-pointer ${editingFee.taxable ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                    </div>

                    {/* Property Selection - White Checkboxes */}
                    <div className="pt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Sélectionner les hébergements</label>
                        <p className="text-xs text-gray-500 mb-3">Attribuer ce frais à un ou plusieurs hébergements</p>
                        
                        <div className="bg-white border border-gray-300 rounded max-h-48 overflow-y-auto">
                            <div className="p-2 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <input type="text" placeholder="Rechercher" className="text-xs bg-transparent outline-none w-full" />
                            </div>
                            <div className="p-2 space-y-1">
                                <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-emerald-500 checked:bg-emerald-500 transition-all mr-3"
                                            checked={selectedFeeProperties.length === properties.length && properties.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedFeeProperties(properties.map(p => p.id));
                                                else setSelectedFeeProperties([]);
                                            }}
                                        />
                                        <CheckCircle className="absolute left-0 top-0 h-4 w-4 hidden text-white peer-checked:block pointer-events-none mr-3" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Tous les hébergements ({properties.length})</span>
                                </label>
                                
                                {properties.map(prop => (
                                    <label key={prop.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer pl-6">
                                        <div className="relative flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:border-emerald-500 checked:bg-emerald-500 transition-all mr-3"
                                                checked={selectedFeeProperties.includes(prop.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedFeeProperties([...selectedFeeProperties, prop.id]);
                                                    else setSelectedFeeProperties(selectedFeeProperties.filter(id => id !== prop.id));
                                                }}
                                            />
                                            <CheckCircle className="absolute left-0 top-0 h-4 w-4 hidden text-white peer-checked:block pointer-events-none mr-3" />
                                        </div>
                                        <span className="text-sm text-gray-600 truncate">{prop.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <button onClick={() => setIsFeeSidebarOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-sm transition">
                        Annuler
                    </button>
                    <button onClick={handleSaveFee} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-sm shadow-sm transition">
                        Enregistrer
                    </button>
                </div>
            </div>
          </>
      )}

    </div>
  );
};
