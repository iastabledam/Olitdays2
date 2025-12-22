
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Settings, Bell, CreditCard, Building, Link, 
  CheckCircle, AlertCircle, RefreshCw, Key, Save, Server, Calendar,
  Copy, Plus, Trash2, ExternalLink, Globe, ArrowRight, Loader, ChevronDown, ChevronUp, ChevronRight,
  Info, Home, Check, X, Zap, ArrowLeft, Upload, Palette, Workflow
} from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { BrandSettings } from '../types';

// --- COLOR UTILITIES ---
// Helper functions to handle HSV <-> HEX conversion for the advanced picker

const hexToHsv = (hex: string) => {
  let r = 0, g = 0, b = 0;
  // Handle standard cases
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
  let r, g, b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  const mod = i % 6;
  if (mod === 0) { r = v; g = t; b = p; }
  else if (mod === 1) { r = q; g = v; b = p; }
  else if (mod === 2) { r = p; g = v; b = t; }
  else if (mod === 3) { r = p; g = q; b = v; }
  else if (mod === 4) { r = t; g = p; b = v; }
  else { r = v; g = p; b = q; }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// --- COLOR PICKER COMPONENT ---
const AdvancedColorPicker = ({ color, onChange }: { color: string, onChange: (c: string) => void }) => {
  const [hsv, setHsv] = useState(hexToHsv(color));
  const [isDraggingSquare, setIsDraggingSquare] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Update HSV when external color prop changes (e.g. manual text input)
  useEffect(() => {
    // Only update if the color is significantly different to avoid loop
    const currentHex = hsvToHex(hsv.h, hsv.s / 100, hsv.v / 100);
    if (color.toLowerCase() !== currentHex.toLowerCase()) {
       setHsv(hexToHsv(color));
    }
  }, [color]);

  // Handle Square Drag (Saturation / Value)
  const handleSquareMove = useCallback((e: MouseEvent) => {
    if (!squareRef.current) return;
    const rect = squareRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    const newS = x * 100;
    const newV = 100 - (y * 100);
    
    setHsv(prev => {
      const newHsv = { ...prev, s: newS, v: newV };
      onChange(hsvToHex(newHsv.h, newHsv.s / 100, newHsv.v / 100));
      return newHsv;
    });
  }, [onChange]);

  // Handle Hue Drag
  const handleHueMove = useCallback((e: MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    const newH = x * 360;
    
    setHsv(prev => {
      const newHsv = { ...prev, h: newH };
      onChange(hsvToHex(newHsv.h, newHsv.s / 100, newHsv.v / 100));
      return newHsv;
    });
  }, [onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingSquare(false);
    setIsDraggingHue(false);
  }, []);

  useEffect(() => {
    if (isDraggingSquare) {
      window.addEventListener('mousemove', handleSquareMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    if (isDraggingHue) {
      window.addEventListener('mousemove', handleHueMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSquareMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleHueMove);
    };
  }, [isDraggingSquare, isDraggingHue, handleSquareMove, handleHueMove, handleMouseUp]);

  return (
    <div className="w-full max-w-xs select-none">
      {/* 1. Saturation/Value Square */}
      <div 
        ref={squareRef}
        className="w-full h-40 rounded-lg relative cursor-crosshair shadow-inner border border-gray-200 mb-4 overflow-hidden"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          backgroundImage: `
            linear-gradient(to top, #000, transparent), 
            linear-gradient(to right, #fff, transparent)
          `
        }}
        onMouseDown={(e) => { setIsDraggingSquare(true); handleSquareMove(e as any); }}
      >
        <div 
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -ml-2 -mt-2"
          style={{ 
            left: `${hsv.s}%`, 
            top: `${100 - hsv.v}%`,
            backgroundColor: color 
          }}
        />
      </div>

      {/* 2. Hue Slider */}
      <div 
        ref={hueRef}
        className="w-full h-4 rounded-full relative cursor-pointer shadow-inner border border-gray-200 mb-4"
        style={{
          background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
        }}
        onMouseDown={(e) => { setIsDraggingHue(true); handleHueMove(e as any); }}
      >
        <div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-md border border-gray-200 pointer-events-none -ml-2 top-0"
          style={{ left: `${(hsv.h / 360) * 100}%` }}
        />
      </div>
      
      {/* 3. Inputs */}
      <div className="flex gap-2">
         <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase">Hex</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-2 bg-white shadow-sm">
                <span className="text-gray-400 text-sm">#</span>
                <input 
                  type="text" 
                  value={color.replace(/^#/, '')} 
                  onChange={(e) => {
                    // Sanitize input: remove non-hex chars and any leading/trailing #, max 6 chars
                    const cleanValue = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    onChange(`#${cleanValue}`);
                  }}
                  className="w-full py-1.5 text-sm outline-none font-mono uppercase text-gray-900 bg-transparent"
                  maxLength={7}
                  placeholder="000000"
                />
            </div>
         </div>
         <div className="w-20">
             <label className="text-[10px] text-gray-500 font-bold uppercase">Preview</label>
             <div className="w-full h-[34px] rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: color }}></div>
         </div>
      </div>
    </div>
  );
};


interface SettingsViewProps {
  initialTab?: 'general' | 'connections' | 'billing' | 'notifications';
  brandSettings?: BrandSettings;
  onUpdateBrand?: (settings: BrandSettings) => void;
}

// Mock initial data for iCals per property
const MOCK_ICALS: Record<string, {id: number, name: string, url: string, lastSync: string}[]> = {
  'p1': [ // Villa Sunny Side
    { id: 1, name: 'Airbnb (Villa Sunny)', url: 'https://airbnb.com/calendar/ical/villa_sunny.ics', lastSync: '10 min' }
  ],
  'p2': [ // Loft Lyon
    { id: 3, name: 'Booking.com (Loft)', url: 'https://booking.com/calendar/ical/loft_lyon.ics', lastSync: '5 min' }
  ],
  'p3': [] // Chalet (Empty)
};

export const SettingsView: React.FC<SettingsViewProps> = ({ 
    initialTab = 'connections',
    brandSettings = { agencyName: 'HostFlow Pro', primaryColor: '#4f46e5', logoUrl: '' },
    onUpdateBrand
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connections' | 'billing' | 'notifications'>(initialTab);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // --- STATE: API CONNECTIONS (GLOBAL) ---
  const [apiConnections, setApiConnections] = useState({
    airbnb: { connected: false, listings: 0, isLoading: false },
    booking: { connected: false, listings: 0, isLoading: false }
  });

  // --- STATE: WEBHOOKS (N8N/MAKE) ---
  const [webhookUrls, setWebhookUrls] = useState({
      onboarding: 'https://n8n.hostflow.app/webhook/onboarding-start',
      contractSigned: 'https://n8n.hostflow.app/webhook/contract-signed'
  });

  // --- STATE: BOOKING WIZARD ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1=Auth, 2=Mapping, 3=Success
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  
  // Mock Data for Mapping Step
  const [foundBookingListings, setFoundBookingListings] = useState([
    { id: 'b1', name: 'Luxury Loft Lyon Center', address: '45 Rue de la République', status: 'unmapped' },
    { id: 'b2', name: 'Sunny Villa Nice', address: '12 Chemin des Oliviers', status: 'unmapped' },
    { id: 'b3', name: 'New Apartment Paris', address: '10 Rue de Rivoli', status: 'unmapped' }
  ]);
  
  // Mapping selections: Key = Booking ID, Value = HostFlow Property ID or 'NEW'
  const [mappingSelections, setMappingSelections] = useState<Record<string, string>>({});

  // --- STATE: ICAL (PER PROPERTY) ---
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [calendarsByProperty, setCalendarsByProperty] = useState(MOCK_ICALS);
  
  const [newIcalUrl, setNewIcalUrl] = useState('');
  const [newIcalName, setNewIcalName] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleConnectApi = (platform: 'airbnb' | 'booking') => {
    if (platform === 'booking') {
      // Open the Wizard for Booking.com
      setBookingStep(1);
      setBookingIdInput('');
      setIsBookingModalOpen(true);
    } else {
      // Simulate simple OAuth for Airbnb
      setApiConnections(prev => ({ ...prev, [platform]: { ...prev[platform], isLoading: true } }));
      setTimeout(() => {
        const confirmConnect = window.confirm(`Simulation OAuth : Autoriser HostFlow à gérer vos annonces Airbnb ?`);
        if (confirmConnect) {
          setApiConnections(prev => ({ ...prev, [platform]: { connected: true, listings: 12, isLoading: false } }));
        } else {
          setApiConnections(prev => ({ ...prev, [platform]: { ...prev[platform], isLoading: false } }));
        }
      }, 1500);
    }
  };

  const handleDisconnectApi = (platform: 'airbnb' | 'booking') => {
    if(window.confirm("Êtes-vous sûr de vouloir déconnecter ce canal ? Les mises à jour en temps réel cesseront.")){
       setApiConnections(prev => ({ ...prev, [platform]: { connected: false, listings: 0, isLoading: false } }));
    }
  };

  // Booking Wizard Logic
  const handleBookingVerify = () => {
    if (!bookingIdInput) return;
    setIsVerifyingId(true);
    // Simulate fetching listings from Booking.com XML API
    setTimeout(() => {
      setIsVerifyingId(false);
      setBookingStep(2); // Go to Mapping
      
      // Pre-select mappings if names match (smart matching)
      const initialMap: Record<string, string> = {};
      foundBookingListings.forEach(bl => {
         const match = MOCK_PROPERTIES.find(p => p.name.includes(bl.name) || p.address.includes(bl.address.split(' ')[0]));
         if (match) initialMap[bl.id] = match.id;
         else initialMap[bl.id] = 'import_new'; // Default to import if no match
      });
      setMappingSelections(initialMap);
    }, 1500);
  };

  const handleBookingFinish = () => {
    setIsBookingModalOpen(false);
    
    // Calculate how many are connected
    const mappedCount = Object.keys(mappingSelections).length;
    
    setApiConnections(prev => ({ ...prev, booking: { connected: true, listings: mappedCount, isLoading: false } }));
    alert(`${mappedCount} annonces connectées ! Les nouveaux logements importés apparaitront dans l'onglet "Logements".`);
  };

  // iCal Logic
  const handleAddIcal = (propertyId: string) => {
    if (newIcalUrl && newIcalName) {
      const newCal = { id: Date.now(), name: newIcalName, url: newIcalUrl, lastSync: 'À l\'instant' };
      setCalendarsByProperty(prev => ({
        ...prev,
        [propertyId]: [...(prev[propertyId] || []), newCal]
      }));
      setNewIcalName('');
      setNewIcalUrl('');
    }
  };

  const handleRemoveIcal = (propertyId: string, calId: number) => {
    setCalendarsByProperty(prev => ({
      ...prev,
      [propertyId]: prev[propertyId].filter(c => c.id !== calId)
    }));
  };

  const handleSyncNow = (propertyId: string) => {
    setIsSyncing(propertyId);
    setTimeout(() => {
      setIsSyncing(null);
      alert('Calendriers synchronisés avec succès !');
    }, 2000);
  };

  const getHostFlowIcalLink = (propertyId: string) => `https://api.hostflow.app/ical/export/${propertyId}/calendar.ics`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Lien copié dans le presse-papier !');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // --- GENERAL TAB ACTIONS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdateBrand) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onUpdateBrand({ ...brandSettings, logoUrl: event.target.result as string });
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color: string) => {
      if(onUpdateBrand) {
          onUpdateBrand({ ...brandSettings, primaryColor: color });
      }
  };

  const handleNameChange = (name: string) => {
      if(onUpdateBrand) {
          onUpdateBrand({ ...brandSettings, agencyName: name });
      }
  };

  const handleSaveSettings = () => {
      setIsSaving(true);
      // Simulate API saving
      setTimeout(() => {
          setIsSaving(false);
          setSaveSuccess(true);
          // Revert back to normal state after 3 seconds
          setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
  };

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1 flex-shrink-0">
           <button 
             onClick={() => setActiveTab('general')}
             className={`w-full flex items-center px-4 py-2 rounded-lg font-medium transition ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             <Building className="w-4 h-4 mr-3" /> Agence
           </button>
           <button 
             onClick={() => setActiveTab('connections')}
             className={`w-full flex items-center px-4 py-2 rounded-lg font-medium transition ${activeTab === 'connections' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             <Link className="w-4 h-4 mr-3" /> Connexions
           </button>
           <button 
             onClick={() => setActiveTab('notifications')}
             className={`w-full flex items-center px-4 py-2 rounded-lg font-medium transition ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             <Bell className="w-4 h-4 mr-3" /> Notifications
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
           
           {/* --- TAB: GENERAL --- */}
           {activeTab === 'general' && (
             <div className="animate-fade-in max-w-2xl space-y-8">
               <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                       <Building className="w-5 h-5 mr-2 text-indigo-600" />
                       Identité de l'Agence
                   </h2>
                   <p className="text-sm text-gray-500 mb-6">Personnalisez l'apparence de votre interface d'administration et du portail voyageur.</p>
                   
                   <div className="space-y-6">
                       
                       {/* Agency Name */}
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'agence</label>
                           <input 
                               type="text" 
                               value={brandSettings.agencyName}
                               onChange={(e) => handleNameChange(e.target.value)}
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                           />
                       </div>

                       {/* Logo Upload */}
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                           <div className="flex items-center gap-4">
                               <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                   {brandSettings.logoUrl ? (
                                       <img src={brandSettings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                   ) : (
                                       <Building className="w-8 h-8 text-gray-300" />
                                   )}
                               </div>
                               <div>
                                   <input 
                                     type="file" 
                                     ref={logoInputRef} 
                                     onChange={handleLogoUpload} 
                                     className="hidden" 
                                     accept="image/png, image/jpeg, image/svg+xml"
                                   />
                                   <button 
                                     onClick={() => logoInputRef.current?.click()}
                                     className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 text-gray-700 mb-1 block"
                                   >
                                       Télécharger un logo
                                   </button>
                                   <p className="text-xs text-gray-400">Recommandé : 200x200px, PNG transparent.</p>
                               </div>
                           </div>
                       </div>

                       {/* Primary Color Picker (New Advanced Implementation) */}
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                           <div className="flex flex-col md:flex-row gap-8 items-start">
                               <AdvancedColorPicker 
                                  color={brandSettings.primaryColor} 
                                  onChange={handleColorChange} 
                               />
                               
                               <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full">
                                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Aperçu du rendu</p>
                                  <div className="space-y-3">
                                     <button 
                                       className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
                                       style={{ backgroundColor: brandSettings.primaryColor }}
                                     >
                                       Bouton Principal
                                     </button>
                                     <div className="flex items-center">
                                       <CheckCircle className="w-5 h-5 mr-2" style={{ color: brandSettings.primaryColor }} />
                                       <span className="text-sm font-medium" style={{ color: brandSettings.primaryColor }}>
                                         Texte ou icône colorée
                                       </span>
                                     </div>
                                     <div className="w-full bg-white rounded-lg border border-gray-200 p-2 text-sm">
                                        Survol souris <span style={{ color: brandSettings.primaryColor, fontWeight: 'bold' }}>Lien Actif</span>
                                     </div>
                                  </div>
                               </div>
                           </div>
                           <p className="text-xs text-gray-500 mt-4">
                             Utilisez le sélecteur pour ajuster précisément la teinte, la saturation et la luminosité.
                           </p>
                       </div>

                   </div>

                   {/* Save Button Area */}
                   <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                       <button 
                           onClick={handleSaveSettings}
                           disabled={isSaving || saveSuccess}
                           className={`flex items-center px-6 py-2.5 rounded-lg font-bold transition shadow-sm ${
                               saveSuccess 
                               ? 'bg-green-600 text-white' 
                               : 'bg-indigo-600 text-white hover:bg-indigo-700'
                           }`}
                       >
                           {isSaving ? (
                               <>
                                   <Loader className="w-4 h-4 mr-2 animate-spin" />
                                   Enregistrement...
                               </>
                           ) : saveSuccess ? (
                               <>
                                   <Check className="w-4 h-4 mr-2" />
                                   Enregistré !
                               </>
                           ) : (
                               <>
                                   <Save className="w-4 h-4 mr-2" />
                                   Enregistrer les modifications
                               </>
                           )}
                       </button>
                   </div>
               </div>
             </div>
           )}

           {/* --- TAB: CONNECTIONS --- */}
           {activeTab === 'connections' && (
             <div className="animate-fade-in space-y-10">
               
               {/* --- SECTION 1: API DIRECTE (GLOBAL) --- */}
               <div>
                 <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                      1. Channel Manager (API Temps Réel)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Synchronisation complète (Prix, Dispo, Messages, Réservations). Requis pour une gestion professionnelle.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* AIRBNB CARD */}
                    <div className={`border rounded-xl p-4 transition-all ${apiConnections.airbnb.connected ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" className="h-6 w-6 mr-3" alt="Airbnb" />
                             <span className="font-bold text-gray-800 text-sm">Airbnb</span>
                          </div>
                          {apiConnections.airbnb.isLoading ? (
                            <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : apiConnections.airbnb.connected ? (
                             <button onClick={() => handleDisconnectApi('airbnb')} className="text-xs text-red-500 hover:underline">Déconnecter</button>
                          ) : (
                             <button onClick={() => handleConnectApi('airbnb')} className="text-xs font-bold text-white bg-[#FF5A5F] px-3 py-1.5 rounded-lg hover:bg-[#ff4449]">Connecter</button>
                          )}
                       </div>
                       {apiConnections.airbnb.connected && <p className="text-xs text-green-700 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> 12 annonces synchro</p>}
                    </div>

                    {/* BOOKING CARD */}
                    <div className={`border rounded-xl p-4 transition-all ${apiConnections.booking.connected ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" className="h-6 w-6 mr-3 object-contain" alt="Booking" />
                             <span className="font-bold text-[#003580] text-sm">Booking.com</span>
                          </div>
                          {apiConnections.booking.isLoading ? (
                            <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : apiConnections.booking.connected ? (
                             <button onClick={() => handleDisconnectApi('booking')} className="text-xs text-red-500 hover:underline">Déconnecter</button>
                          ) : (
                             <button onClick={() => handleConnectApi('booking')} className="text-xs font-bold text-white bg-[#003580] px-3 py-1.5 rounded-lg hover:bg-[#002860]">Connecter</button>
                          )}
                       </div>
                       {apiConnections.booking.connected ? (
                          <p className="text-xs text-green-700 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> {apiConnections.booking.listings} établissements synchro</p>
                       ) : (
                          <div className="mt-2 flex items-center text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded">
                            <Info className="w-3 h-3 mr-1" />
                            Requiert validation Extranet
                          </div>
                       )}
                    </div>
                 </div>
               </div>

               <div className="border-t border-gray-100"></div>

                {/* --- SECTION: WEBHOOKS (N8N/MAKE) --- */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <Workflow className="w-5 h-5 mr-2 text-pink-600" />
                            Automatisations (n8n / Make)
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Connectez vos workflows d'automatisation (Onboarding, Signature, Emails).
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Déclencheur Onboarding</label>
                            <p className="text-xs text-gray-500 mb-2">URL appelée lors de la génération du contrat (Webhook POST).</p>
                            <input 
                                type="text" 
                                value={webhookUrls.onboarding}
                                onChange={(e) => setWebhookUrls({...webhookUrls, onboarding: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-600 bg-white focus:ring-2 focus:ring-pink-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Callback Signature</label>
                            <p className="text-xs text-gray-500 mb-2">URL à fournir à DocuSign/YouSign pour la confirmation de signature.</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={webhookUrls.contractSigned}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-500 bg-gray-100"
                                />
                                <button onClick={() => copyToClipboard(webhookUrls.contractSigned)} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button onClick={() => handleSaveSettings()} className="text-sm text-pink-600 font-bold hover:text-pink-800 flex items-center">
                                <Save className="w-4 h-4 mr-1" /> Sauvegarder les webhooks
                            </button>
                        </div>
                    </div>
                </div>

               <div className="border-t border-gray-100"></div>

               {/* --- SECTION 2: ICAL (LIST VIEW) --- */}
               <div>
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                        2. Synchronisation iCal (Immédiat)
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 max-w-3xl">
                        Solution idéale pour démarrer sans validation technique. Synchronise les calendriers toutes les 2 heures.
                        <br/><span className="text-xs text-gray-400 italic">N'utilise pas l'API de connexion directe. Ne synchronise pas les prix ni les messages.</span>
                      </p>
                    </div>
                 </div>

                 {/* PROPERTIES LIST */}
                 <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-gray-50/50">
                    
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 px-4 py-3 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                       <div className="col-span-5">Logement</div>
                       <div className="col-span-4">Lien Export</div>
                       <div className="col-span-3 text-right">Action</div>
                    </div>

                    {MOCK_PROPERTIES.map(p => {
                       const isExpanded = expandedPropertyId === p.id;
                       const calendarCount = (calendarsByProperty[p.id] || []).length;
                       const exportLink = getHostFlowIcalLink(p.id);

                       return (
                         <div key={p.id} className="bg-white transition-colors hover:bg-gray-50">
                            {/* Summary Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 px-4 py-3 items-center gap-3">
                               
                               {/* Col 1: Name */}
                               <div className="md:col-span-5 flex items-center">
                                  <div onClick={() => setExpandedPropertyId(isExpanded ? null : p.id)} className="cursor-pointer mr-3 text-gray-400 hover:text-indigo-600">
                                     {isExpanded ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                                  </div>
                                  <div className="flex items-center">
                                     <img src={p.imageUrl} className="w-8 h-8 rounded object-cover mr-3 bg-gray-200" />
                                     <div>
                                        <p className="text-sm font-bold text-gray-800">{p.name}</p>
                                        <p className="text-xs text-gray-400 truncate w-32 md:w-auto">{p.address}</p>
                                     </div>
                                  </div>
                               </div>

                               {/* Col 2: Quick Export Link (Read only preview) */}
                               <div className="md:col-span-4 flex items-center">
                                  <span className="text-[10px] text-gray-400 font-mono truncate max-w-[200px] select-all cursor-text bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    {exportLink}
                                  </span>
                               </div>

                               {/* Col 3: Status & Action */}
                               <div className="md:col-span-3 flex items-center justify-end">
                                  {calendarCount > 0 ? (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mr-3 flex items-center">
                                       <RefreshCw className="w-3 h-3 mr-1"/> {calendarCount} sync
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 mr-3">Aucun import</span>
                                  )}
                                  <button 
                                    onClick={() => setExpandedPropertyId(isExpanded ? null : p.id)}
                                    className={`text-xs border px-3 py-1.5 rounded-lg transition ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600 font-medium' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                  >
                                    {isExpanded ? 'Fermer' : 'Configurer'}
                                  </button>
                               </div>
                            </div>

                            {/* EXPANDED DETAILS - LODGIFY STYLE */}
                            {isExpanded && (
                               <div className="px-4 pb-6 pt-2 bg-gray-50/50 border-t border-gray-100">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                     
                                     {/* Left: IMPORT */}
                                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                          <Calendar className="w-4 h-4 mr-2 text-indigo-600"/>
                                          Importer le calendrier
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                          Collez ici le lien iCal (format .ics) provenant d'Airbnb, Booking, ou Abritel. 
                                        </p>

                                        {/* List of imports */}
                                        <div className="space-y-2 mb-4">
                                           {(calendarsByProperty[p.id] || []).length === 0 ? (
                                              <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                Il n'y a aucun calendrier synchronisé pour le moment.
                                              </div>
                                           ) : (
                                              (calendarsByProperty[p.id] || []).map(cal => (
                                                <div key={cal.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200 text-sm group">
                                                   <div className="flex items-center overflow-hidden">
                                                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shrink-0"></div>
                                                      <span className="font-medium text-gray-700 mr-2 shrink-0">{cal.name}</span>
                                                      <span className="text-[10px] text-gray-400 truncate">{cal.url}</span>
                                                   </div>
                                                   <button onClick={() => handleRemoveIcal(p.id, cal.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                              ))
                                           )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3">
                                           {/* Add Form */}
                                           <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                              <div className="grid grid-cols-3 gap-2 mb-2">
                                                 <input 
                                                   type="text" 
                                                   placeholder="Nom (ex: Airbnb)" 
                                                   className="col-span-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900"
                                                   value={newIcalName}
                                                   onChange={(e) => setNewIcalName(e.target.value)}
                                                 />
                                                 <input 
                                                   type="text" 
                                                   placeholder="URL iCal (https://...)" 
                                                   className="col-span-2 text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900"
                                                   value={newIcalUrl}
                                                   onChange={(e) => setNewIcalUrl(e.target.value)}
                                                 />
                                              </div>
                                              <button 
                                                 onClick={() => handleAddIcal(p.id)}
                                                 disabled={!newIcalName || !newIcalUrl}
                                                 className="w-full bg-[#FF6B6B] text-white py-1.5 rounded text-xs font-bold hover:bg-[#ff5252] disabled:opacity-50 flex justify-center items-center"
                                              >
                                                <Plus className="w-3 h-3 mr-1" /> Ajouter un calendrier
                                              </button>
                                           </div>

                                           {/* Sync Button */}
                                           <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-green-600 flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1"/> Le calendrier se rafraîchit toutes les 2 heures
                                              </span>
                                              <button 
                                                onClick={() => handleSyncNow(p.id)}
                                                className="text-indigo-600 text-xs font-medium hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                                              >
                                                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing === p.id ? 'animate-spin' : ''}`} /> 
                                                {isSyncing === p.id ? 'Synchronisation...' : 'Synchroniser maintenant'}
                                              </button>
                                           </div>
                                        </div>
                                     </div>

                                     {/* Right: EXPORT */}
                                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                        <div>
                                          <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                            <ExternalLink className="w-4 h-4 mr-2 text-amber-500"/>
                                            Exporter le calendrier
                                          </h4>
                                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                            Copiez cette URL pour l'ajouter sur Airbnb ou Booking. Cela permet de bloquer les dates réservées sur HostFlow.
                                          </p>

                                          <div className="flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200 mb-4">
                                            <code className="text-[10px] text-gray-600 break-all flex-1 font-mono">
                                              {exportLink}
                                            </code>
                                            <button 
                                              onClick={() => copyToClipboard(exportLink)}
                                              className="ml-3 p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                     </div>

                                  </div>
                               </div>
                            )}
                         </div>
                       );
                    })}
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'notifications' && (
             <div className="text-center py-20 text-gray-500">
               <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
               <p>Configuration des alertes et emails.</p>
             </div>
           )}

        </div>
      </div>

      {/* --- BOOKING.COM WIZARD MODAL --- */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
             
             {/* Modal Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#003580] text-white">
                <div className="flex items-center">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" className="h-6 w-auto mr-3 brightness-0 invert" alt="Booking" />
                   <h2 className="text-lg font-bold">Assistant de Connexion</h2>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full"><X className="w-6 h-6"/></button>
             </div>

             {/* Modal Body */}
             <div className="p-8">
                
                {/* STEP 1: AUTH */}
                {bookingStep === 1 && (
                   <div className="space-y-6">
                      <div className="text-center mb-8">
                         <h3 className="text-xl font-bold text-gray-800">Étape 1 : Identifiant Établissement</h3>
                         <p className="text-gray-500 mt-2">
                           Sur l'extranet Booking.com, sélectionnez "HostFlow Connectivity" comme fournisseur, puis entrez votre ID Hôtel ci-dessous.
                         </p>
                      </div>

                      <div className="max-w-sm mx-auto">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Legal Entity ID (LEID) ou Hotel ID</label>
                        <input 
                           type="text" 
                           placeholder="ex: 1234567"
                           className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-[#003580] outline-none text-center tracking-widest text-gray-900"
                           value={bookingIdInput}
                           onChange={(e) => setBookingIdInput(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleBookingVerify}
                          disabled={!bookingIdInput || isVerifyingId}
                          className="w-full bg-[#003580] text-white font-bold py-3 rounded-xl hover:bg-[#002860] flex justify-center items-center disabled:opacity-70"
                        >
                          {isVerifyingId ? <Loader className="w-5 h-5 animate-spin" /> : 'Vérifier & Continuer'}
                        </button>
                      </div>
                   </div>
                )}

                {/* STEP 2: MAPPING */}
                {bookingStep === 2 && (
                   <div className="space-y-6">
                      <div className="mb-4">
                         <h3 className="text-lg font-bold text-gray-800">Étape 2 : Cartographie (Mapping)</h3>
                         <p className="text-sm text-gray-500">
                           Nous avons trouvé ces annonces sur Booking.com. <br/>
                           Associez-les à vos logements HostFlow existants <b>OU</b> importez-les pour en créer de nouveaux.
                         </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                         <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-500 font-semibold border-b border-gray-200">
                               <tr>
                                  <th className="p-3">Annonce Booking.com</th>
                                  <th className="p-3 text-center"><ArrowRight className="w-4 h-4 mx-auto"/></th>
                                  <th className="p-3">Action dans HostFlow</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                               {foundBookingListings.map(listing => (
                                  <tr key={listing.id}>
                                     <td className="p-3">
                                        <p className="font-bold text-[#003580]">{listing.name}</p>
                                        <p className="text-xs text-gray-400">{listing.address}</p>
                                     </td>
                                     <td className="p-3 text-center">
                                        <Link className="w-4 h-4 text-gray-300 mx-auto" />
                                     </td>
                                     <td className="p-3">
                                        <select 
                                           className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#003580] text-gray-700"
                                           value={mappingSelections[listing.id] || 'import_new'}
                                           onChange={(e) => setMappingSelections({...mappingSelections, [listing.id]: e.target.value})}
                                        >
                                           <option value="import_new" className="font-bold text-green-600">✨ Importer comme nouveau logement</option>
                                           <optgroup label="Lier à l'existant">
                                              {MOCK_PROPERTIES.map(p => (
                                                 <option key={p.id} value={p.id}>{p.name}</option>
                                              ))}
                                           </optgroup>
                                        </select>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-100">
                        <button onClick={() => setBookingStep(1)} className="text-gray-500 hover:text-gray-800 font-medium px-4">Retour</button>
                        <button 
                          onClick={handleBookingFinish}
                          className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 flex items-center shadow-md"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Confirmer la connexion
                        </button>
                      </div>
                   </div>
                )}

             </div>
          </div>
        </div>
      )}

    </div>
  );
};
