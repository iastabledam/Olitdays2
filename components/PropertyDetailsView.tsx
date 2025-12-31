
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { Property, RoomConfig, BedConfig, CustomFee, LengthOfStayRule, LocalTax } from '../types';
import { 
  ArrowLeft, Save, Image as ImageIcon, Trash2, Plus, 
  MapPin, Wifi, Key, PenTool, CheckSquare, Upload, DollarSign, Calendar,
  Layout, Edit3, X, Minus, Search, ChevronDown, ChevronUp, Check,
  Lightbulb, AlertTriangle, Globe, MoreHorizontal, Video, Navigation, 
  Train, Plane, Car, ShoppingBag, Building, Tag, Percent, Settings2, Landmark,
  ExternalLink, Clock, Shield, FileText, Ban, PlayCircle, Film
} from 'lucide-react';

interface PropertyDetailsViewProps {
  propertyId: string;
  initialData?: Property;
  onBack: () => void;
  onSave: (property: Property, stayOnPage?: boolean) => void;
}

// --- STATIC DATA FOR CONFIGURATION ---

const ROOM_TYPES = [
  "Privé", "Balcon", "Salle de bain", "Chambre", "Salle à manger", 
  "Cuisine", "Salon", "Salle de jeux", "Terrasse", "WC", "Salle de travail"
];

const BED_TYPES = [
  "Lit de bébé", "Lit d'enfant", "Lit double", "Lit escamotable", 
  "Lit king-size", "Lit mezzanine", "Lit queen-size", "Canapé lit", "Lit simple"
];

const FEE_TYPES = [
  "Air conditionné", "Association de l'hébergement", "Assurance voyage",
  "Bateau", "Bateau (amarrage)", "Blanchisserie", "Bois", "Caution", "Chaise haute",
  "Chauffage", "Chauffage de piscine", "Classe", "Complexe Hôtelier",
  "Concierge", "Eau", "Eau potable", "Électricité", "Équipement",
  "Essence", "Frais communautaires", "Frais de gestion", "Frais de ménage",
  "Frais de service", "Frais divers", "Frais pour animaux de compagnie",
  "Gaz", "Inconnu", "Internet", "Jacuzzi", "Jardinage", "La main d'œuvre",
  "Linge", "Linge (bain)", "Linge (lit)", "Lit bébé", "Lit supplémentaire",
  "Loyer", "Méthode de paiement sur place", "Nourriture", "Parking",
  "Piscine", "Produits de toilette", "Spa", "Téléphone", "Tour",
  "Transport", "Ustensiles (nettoyage)", "Ustensiles de cuisine", "Véhicule"
].sort();

const LOCAL_TAX_TYPES = [
  "Taxe de séjour",
  "Taxe d'hébergement",
  "Taxe municipale",
  "Taxe gouvernementale",
  "Autre"
];

const AMENITY_CATEGORIES = {
  "Les plus populaires": ["Essentiels", "Machine à laver", "Air conditionné", "Chauffage général", "Internet sans fil", "Cuisinière", "Parking", "Animaux acceptés"],
  "Salle de bain et blanchisserie": ["Salle de bain et buanderie", "Draps de lit", "Bidet", "Sèche-cheveux", "Sèche-linge", "Fer et table à repasser", "Douche", "Serviettes de bain", "Baignoire", "Lavabo"],
  "Divertissement": ["Lecteur DVD", "Piano", "Système stéréo", "Antenne de télévision", "Télévision par câble", "Télévision par satellite", "Chaises de plage", "Vélos", "Bateau", "Canoë/Kayak", "Baby-foot", "Voiturette de golf", "Clubs de golf", "Bateau à moteur", "Table de ping-pong", "Billard", "Salle de fitness privée", "Voilier", "Salle de fitness partagée"],
  "Chauffage et climatisation": ["Air conditionné", "Ventilateurs de plafond", "Chauffage central", "Chauffage électrique", "Cheminée", "Chauffage au sol", "Chauffage général", "Poêle à bois carrelé"],
  "Sécurité à la maison": ["Sonnette", "Détecteur de monoxyde de carbone", "Concierge", "Extincteur d'incendie", "Trousse de premiers secours", "Coffre-fort", "Carte de sécurité", "Système de sécurité", "Détecteur de fumée"],
  "Internet et bureautique": ["Ordinateur", "Fax", "Internet haut débit", "Internet", "Internet sans fil", "Téléphone"],
  "Cuisine et salle à manger": ["Mixeur", "Chaise haute bébé", "Cafetière", "Ustensiles de cuisine", "Lave-vaisselle", "Grill", "Cuisinière", "Kitchenette", "Micro-ondes", "Four", "Réfrigérateur", "Cuiseur à riz", "Épices", "Grille-pain", "Aspirateur", "Refroidisseur d'eau", "Purificateur d'eau", "Barbecue au charbon de bois", "Barbecue électrique", "Barbecue à gaz"],
  "Caractéristiques de l'emplacement": ["Front de mer", "Centre ville", "Vue sur le golf", "Lac", "Montagne", "Près de l'océan", "Vue sur l'océan", "Complexe Hôtelier", "Rivière", "Rural", "Départ de ski", "Ville", "Village", "Bord de l'eau"],
  "Parking et installations": ["Garage", "Propriété clôturée", "Parking", "Place de parking", "Parking sur la rue", "Parking inclus", "Parking en option", "Abri de parking couvert", "Jardin privé"],
  "Politiques": ["Carte de crédit acceptée", "Accessible 24/7", "Enfants autorisés", "Ascenseur dans l'immeuble", "Environnement peu allergène", "Adapté aux événements", "Animaux acceptés", "Animaux acceptés uniquement après accord", "Animaux non autorisés", "Fumeurs autorisés", "Fumeurs non autorisés", "Convient aux personnes âgées ou à mobilité réduite", "Ne convient pas aux personnes âgées ou à mobilité réduite", "Accessible aux fauteuils roulants"],
  "Piscine et spa": ["Jacuzzi intérieur", "Jacuzzi extérieur", "Sauna sec privé", "Piscine privée intérieure et chauffée", "Piscine extérieure privée et chauffée", "Sauna à vapeur privé", "Piscine intérieure privée non chauffée", "Piscine extérieure privée non chauffée", "Sauna sec partagé", "Piscine intérieure partagée et chauffée", "Piscine extérieure partagée et chauffée", "Sauna à vapeur partagé", "Piscine intérieure partagée non chauffée", "Piscine extérieure partagée non chauffée", "Piscine"],
  "Services": ["Tout Compris", "Pension complète", "Demi-pension", "Petit-déjeuner inclus", "Femme de ménage incluse", "Femme de ménage en option", "Service de blanchisserie inclus", "Service de blanchisserie en option"]
};

// Helper Components
const SummaryCard = ({ title, children, onEdit, editIcon = Edit3 }: { title: string, children?: React.ReactNode, onEdit?: () => void, editIcon?: React.ElementType }) => {
  const Icon = editIcon;
  return (
    <div 
      onClick={onEdit} 
      className={`bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-all group relative ${onEdit ? 'cursor-pointer hover:border-indigo-300' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{title}</h3>
        {onEdit && (
          <button className="text-gray-400 group-hover:text-indigo-600 transition p-1 hover:bg-gray-50 rounded-full">
            <Icon className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

const ListSectionHeader = ({ title, description, onAdd, dropdown }: { title: string, description: string, onAdd?: () => void, dropdown?: React.ReactNode }) => (
  <div className="mb-6 mt-12 border-t border-gray-100 pt-8">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <div className="relative">
        {dropdown ? dropdown : (
            onAdd && (
                <button onClick={onAdd} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-4 py-2 rounded-lg transition hover:bg-indigo-100">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                </button>
            )
        )}
      </div>
    </div>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const EditModal = ({ title, onClose, onSave, children }: { title: string, onClose: () => void, onSave: () => void, children?: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-end md:items-center md:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-[600px] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {children}
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
        <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900">Annuler</button>
        <button onClick={onSave} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-sm transition">
          Enregistrer
        </button>
      </div>
    </div>
  </div>
);

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ propertyId, initialData, onBack, onSave }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'photos' | 'access' | 'policies' | 'availability'>('general');
  const [isLoading, setIsLoading] = useState(false);
  
  // Controls specific modals/sections for editing
  const [editingSection, setEditingSection] = useState<'none' | 'name' | 'info' | 'rooms' | 'beds' | 'amenities' | 'address' | 'access_video' | 'pricing_base' | 'fee_modal' | 'vat_modal' | 'local_tax_modal' | 'los_modal' | 'tax_info' | 'policies_schedule' | 'policies_rules' | 'policies_deposit' | 'policies_cancellation'>('none');
  
  const [searchAmenity, setSearchAmenity] = useState('');
  
  const [currentFee, setCurrentFee] = useState<CustomFee | null>(null);
  const [taxDropdownOpen, setTaxDropdownOpen] = useState(false);
  const [currentLocalTax, setCurrentLocalTax] = useState<LocalTax | null>(null);
  const [currentLOSRule, setCurrentLOSRule] = useState<LengthOfStayRule | null>(null);
  const [losDropdownOpen, setLosDropdownOpen] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [tempProperty, setTempProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (propertyId === 'new') {
      const newProp: Property = {
        id: `p-${Date.now()}`,
        tenantId: 't1', 
        name: 'Nouvel hébergement',
        internalName: '',
        address: '',
        ownerId: 'u1',
        imageUrl: '', 
        photos: [],
        status: 'maintenance',
        propertyType: 'apartment',
        surface: 0,
        surfaceUnit: 'm2',
        maxGuests: 2,
        roomsComposition: [],
        bedsDistribution: [],
        amenities: [],
        description: '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellationPolicy: 'moderate',
        pricing: {
            basePrice: 100,
            currency: 'EUR',
            minStay: 1,
            securityDeposit: 0,
            fees: []
        }
      };
      setProperty(newProp);
      setTempProperty(newProp);
    } else if (initialData) {
      const safeP = {
          ...initialData,
          roomsComposition: initialData.roomsComposition || [],
          bedsDistribution: initialData.bedsDistribution || [],
          amenities: initialData.amenities || [],
          photos: initialData.photos || (initialData.imageUrl ? [initialData.imageUrl] : []),
          surfaceUnit: initialData.surfaceUnit || 'm2',
          checkInTime: initialData.checkInTime || '15:00',
          checkOutTime: initialData.checkOutTime || '11:00',
          cancellationPolicy: initialData.cancellationPolicy || 'moderate',
          houseRules: initialData.houseRules || '',
          pricing: {
             basePrice: 0, 
             currency: 'EUR', 
             minStay: 1, 
             fees: [], 
             lengthOfStayRules: [],
             vatNumber: '',
             registrationNumber: '',
             vatSetting: { enabled: false, percentage: 0, includedInPrice: true },
             localTaxes: [],
             ...initialData.pricing 
          }
      };
      setProperty(JSON.parse(JSON.stringify(safeP)));
      setTempProperty(JSON.parse(JSON.stringify(safeP)));
    }
  }, [propertyId, initialData]);

  if (!property) return <div className="p-8 text-center text-gray-500">Chargement des données...</div>;

  const openEdit = (section: typeof editingSection) => {
    setTempProperty(JSON.parse(JSON.stringify(property)));
    setEditingSection(section);
  };

  const closeEdit = () => {
    setEditingSection('none');
    setTempProperty(null);
    setCurrentFee(null);
    setCurrentLOSRule(null);
    setCurrentLocalTax(null);
    setLosDropdownOpen(false);
    setTaxDropdownOpen(false);
  };

  const saveEdit = () => {
    if (tempProperty) {
      setProperty(tempProperty);
    }
    closeEdit();
  };

  const handleOpenFeeModal = (fee?: CustomFee) => {
      if (fee) {
          setCurrentFee({ ...fee });
      } else {
          setCurrentFee({
              id: `fee-${Date.now()}`,
              type: '',
              name: '',
              amount: 0,
              calculationType: 'flat',
              frequency: 'per_stay',
              taxable: false
          });
      }
      openEdit('fee_modal');
  };

  const handleSaveFee = () => {
      if (!currentFee || !tempProperty) return;
      const updatedFees = tempProperty.pricing?.fees ? [...tempProperty.pricing.fees] : [];
      const existingIndex = updatedFees.findIndex(f => f.id === currentFee.id);
      if (existingIndex >= 0) updatedFees[existingIndex] = currentFee;
      else updatedFees.push(currentFee);
      
      const newPricing = { ...tempProperty.pricing, fees: updatedFees } as any;
      const updatedFullProperty = { ...tempProperty, pricing: newPricing };
      setTempProperty(updatedFullProperty);
      setProperty(updatedFullProperty);
      closeEdit();
  };

  const handleDeleteFee = (feeId: string) => {
      if(!window.confirm("Supprimer ce frais ?")) return;
      const updatedFees = property.pricing?.fees?.filter(f => f.id !== feeId) || [];
      const updatedProperty = { ...property, pricing: { ...property.pricing, fees: updatedFees } as any };
      setProperty(updatedProperty);
  };

  const handleOpenVatModal = () => {
      setTaxDropdownOpen(false);
      setTempProperty(JSON.parse(JSON.stringify(property)));
      setEditingSection('vat_modal');
  };

  const handleSaveVat = () => {
      if (!tempProperty) return;
      if (tempProperty.pricing?.vatSetting) tempProperty.pricing.vatSetting.enabled = true;
      setProperty(tempProperty);
      closeEdit();
  };

  const handleOpenLocalTaxModal = (tax?: LocalTax) => {
      setTaxDropdownOpen(false);
      setTempProperty(JSON.parse(JSON.stringify(property)));
      if (tax) setCurrentLocalTax({ ...tax });
      else setCurrentLocalTax({ id: `tax-${Date.now()}`, type: '', name: '', amount: 0, calculationType: 'flat', frequency: 'per_stay' });
      setEditingSection('local_tax_modal');
  };

  const handleSaveLocalTax = () => {
      if (!currentLocalTax || !tempProperty) return;
      const updatedTaxes = tempProperty.pricing?.localTaxes ? [...tempProperty.pricing.localTaxes] : [];
      const existingIndex = updatedTaxes.findIndex(t => t.id === currentLocalTax.id);
      if (existingIndex >= 0) updatedTaxes[existingIndex] = currentLocalTax;
      else updatedTaxes.push(currentLocalTax);
      
      const newPricing = { ...tempProperty.pricing, localTaxes: updatedTaxes } as any;
      const updatedFullProperty = { ...tempProperty, pricing: newPricing };
      setTempProperty(updatedFullProperty);
      setProperty(updatedFullProperty);
      closeEdit();
  };

  const handleDeleteLocalTax = (taxId: string) => {
      if(!window.confirm("Supprimer cette taxe ?")) return;
      const updatedTaxes = property.pricing?.localTaxes?.filter(t => t.id !== taxId) || [];
      const updatedProperty = { ...property, pricing: { ...property.pricing, localTaxes: updatedTaxes } as any };
      setProperty(updatedProperty);
  };

  const handleDeleteVat = () => {
      if(!window.confirm("Supprimer la configuration TVA ?")) return;
      const updatedProperty = JSON.parse(JSON.stringify(property));
      if (updatedProperty.pricing?.vatSetting) updatedProperty.pricing.vatSetting = { enabled: false, percentage: 0, includedInPrice: true };
      setProperty(updatedProperty);
  };

  const handleOpenLOSModal = (type: 'weekly' | 'monthly' | 'custom', existingRule?: LengthOfStayRule) => {
      setLosDropdownOpen(false);
      setTempProperty(JSON.parse(JSON.stringify(property)));
      if (existingRule) setCurrentLOSRule({ ...existingRule });
      else setCurrentLOSRule({ id: `los-${Date.now()}`, type, minNights: type === 'weekly' ? 7 : type === 'monthly' ? 30 : 3, amount: 0 });
      setEditingSection('los_modal');
  };

  const handleSaveLOSRule = () => {
      if (!currentLOSRule || !tempProperty) return;
      const updatedRules = tempProperty.pricing?.lengthOfStayRules ? [...tempProperty.pricing.lengthOfStayRules] : [];
      const existingIndex = updatedRules.findIndex(r => r.id === currentLOSRule.id);
      if (existingIndex >= 0) updatedRules[existingIndex] = currentLOSRule;
      else updatedRules.push(currentLOSRule);
      
      const newPricing = { ...tempProperty.pricing, lengthOfStayRules: updatedRules } as any;
      const updatedFullProperty = { ...tempProperty, pricing: newPricing };
      setTempProperty(updatedFullProperty);
      setProperty(updatedFullProperty);
      closeEdit();
  };

  const handleDeleteLOSRule = (ruleId: string) => {
      if(!window.confirm("Supprimer cette règle de prix ?")) return;
      const updatedRules = property.pricing?.lengthOfStayRules?.filter(r => r.id !== ruleId) || [];
      const updatedProperty = { ...property, pricing: { ...property.pricing, lengthOfStayRules: updatedRules } as any };
      setProperty(updatedProperty);
  };

  const handleGlobalSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (property) onSave(property, true);
      alert('Toutes les modifications sont enregistrées ! Vous pouvez continuer l\'édition.');
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const url = event.target.result as string;
            setProperty(prev => {
               if(!prev) return null;
               const currentPhotos = prev.photos || [];
               const newImageUrl = (!prev.imageUrl && currentPhotos.length === 0) ? url : prev.imageUrl;
               return { ...prev, photos: [...currentPhotos, url], imageUrl: newImageUrl };
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAccessVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Create local URL for preview
          const url = URL.createObjectURL(file);
          updateTempField('accessVideoUrl', url);
      }
  };

  const handleDeletePhoto = (photoUrl: string) => {
    setProperty(prev => {
        if(!prev) return null;
        const newPhotos = (prev.photos || []).filter(p => p !== photoUrl);
        let newCover = prev.imageUrl;
        if (prev.imageUrl === photoUrl) newCover = newPhotos.length > 0 ? newPhotos[0] : '';
        return { ...prev, photos: newPhotos, imageUrl: newCover };
    });
  };

  const updateTempField = (field: keyof Property, value: any) => {
    setTempProperty(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const updateTempPricing = (field: keyof NonNullable<Property['pricing']>, value: any) => {
    setTempProperty(prev => {
      if(!prev) return null;
      const newPricing = { ...prev.pricing, [field]: value };
      return { ...prev, pricing: newPricing as any };
    });
  };

  const updateTempRoom = (type: string, delta: number) => {
    setTempProperty(prev => {
        if (!prev) return null;
        const current = prev.roomsComposition || [];
        const idx = current.findIndex(r => r.type === type);
        let newArr = [...current];
        if (idx >= 0) {
            const newVal = Math.max(0, newArr[idx].count + delta);
            if (newVal === 0) newArr.splice(idx, 1);
            else newArr[idx].count = newVal;
        } else if (delta > 0) newArr.push({ type, count: delta });
        return { ...prev, roomsComposition: newArr };
    });
  };

  const updateTempBed = (type: string, delta: number) => {
    setTempProperty(prev => {
        if (!prev) return null;
        const current = prev.bedsDistribution || [];
        const idx = current.findIndex(b => b.type === type);
        let newArr = [...current];
        if (idx >= 0) {
            const newVal = Math.max(0, newArr[idx].count + delta);
            if (newVal === 0) newArr.splice(idx, 1);
            else newArr[idx].count = newVal;
        } else if (delta > 0) newArr.push({ type, count: delta });
        return { ...prev, bedsDistribution: newArr };
    });
  };

  const toggleTempAmenity = (amenity: string) => {
    setTempProperty(prev => {
        if (!prev) return null;
        const current = prev.amenities || [];
        if (current.includes(amenity)) return { ...prev, amenities: current.filter(a => a !== amenity) };
        else return { ...prev, amenities: [...current, amenity] };
    });
  };

  const toggleTempRule = (rule: 'petsAllowed' | 'smokingAllowed' | 'eventsAllowed') => {
      setTempProperty(prev => prev ? ({ ...prev, [rule]: !prev[rule] }) : null);
  };

  return (
    <div className="space-y-6 pb-20 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex items-center justify-between sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
             <h1 className="text-xl font-bold text-gray-800">{property.name}</h1>
             <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                {property.status === 'active' ? 'En ligne' : 'Brouillon'}
             </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <button className="text-red-500 text-sm font-medium hover:underline px-3 border border-red-100 rounded-lg py-2 hover:bg-red-50">Supprimer l'hébergement</button>
            <button 
            onClick={handleGlobalSave}
            disabled={isLoading}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-emerald-600 transition disabled:opacity-50 shadow-sm font-bold text-sm"
            >
            {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
        </div>
      </div>

      <div className="flex w-full max-w-[1800px] mx-auto px-6 gap-8 pt-6">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="space-y-2 sticky top-24">
                <p className="px-3 text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">Détails de l'hébergement</p>
                {[
                    { id: 'general', label: "Aperçu", icon: Layout },
                    { id: 'photos', label: 'Photos', icon: ImageIcon },
                    { id: 'access', label: 'Accès & Emplacement', icon: MapPin },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                            activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}

                <p className="px-3 text-sm font-bold text-gray-400 uppercase mt-8 mb-3 tracking-wider">Paramètres réservation</p>
                {[
                    { id: 'pricing', label: 'Tarifs & Taxes', icon: DollarSign },
                    { id: 'policies', label: 'Politiques', icon: FileText },
                    { id: 'availability', label: 'Disponibilités', icon: Calendar },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                            activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
            
            {/* ... [General, Pricing, Photos tabs remain unchanged] ... */}
            {activeTab === 'general' && (
                <div className="animate-fade-in space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Vue d'ensemble</h2>

                    {/* 1. NOM ET DESCRIPTION */}
                    <SummaryCard title="Nom et description" onEdit={() => openEdit('name')}>
                        <p className="text-sm text-gray-500 mb-3">Fournissez un nom, un nom interne et une description pour votre hébergement.</p>
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-800">{property.name}</p>
                            {property.description && (
                                <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {property.description}
                                </p>
                            )}
                        </div>
                    </SummaryCard>

                    {/* 2. INFORMATIONS */}
                    <SummaryCard title="Informations sur l'hébergement" onEdit={() => openEdit('info')}>
                        <p className="text-sm text-gray-500 mb-3">Ajoutez des informations clés à propos de votre hébergement.</p>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-800 font-medium capitalize">{property.propertyType === 'bnb' ? 'Bed & Breakfast' : property.propertyType === 'apartment' ? 'Appartement' : property.propertyType === 'house' ? 'Maison' : property.propertyType}</p>
                            <p className="text-sm text-gray-600">
                                {property.surface || 0} {property.surfaceUnit === 'ft2' ? 'pi²' : 'm²'} • {property.maxGuests || 0} invités
                            </p>
                        </div>
                    </SummaryCard>

                    {/* 3. PIÈCES */}
                    <SummaryCard title="Pièces" onEdit={() => openEdit('rooms')}>
                        <p className="text-sm text-gray-500 mb-3">Listez toutes les pièces disponibles dans votre hébergement.</p>
                        <div className="flex flex-wrap gap-2">
                            {(!property.roomsComposition || property.roomsComposition.length === 0) && (
                                <span className="text-sm text-gray-400 italic">Aucune pièce configurée</span>
                            )}
                            {property.roomsComposition?.map((room, idx) => (
                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                    <span className="font-bold mr-1">{room.count}</span> {room.type}
                                </span>
                            ))}
                        </div>
                    </SummaryCard>

                    {/* 4. COUCHAGES */}
                    <SummaryCard title="Couchages" onEdit={() => openEdit('beds')}>
                        <p className="text-sm text-gray-500 mb-3">Montrez à vos invités quels sont les couchages de votre hébergement.</p>
                        <div className="space-y-2">
                            {(!property.bedsDistribution || property.bedsDistribution.length === 0) && (
                                <span className="text-sm text-gray-400 italic">Aucun lit configuré</span>
                            )}
                            {property.bedsDistribution?.map((bed, idx) => (
                                <div key={idx} className="flex items-center text-sm text-gray-700">
                                    <span className="font-bold mr-2">{bed.count}x</span> {bed.type}
                                </div>
                            ))}
                        </div>
                    </SummaryCard>

                    {/* 5. ÉQUIPEMENTS */}
                    <SummaryCard title="Équipements de l'hébergement" onEdit={() => openEdit('amenities')}>
                        {(!property.amenities || property.amenities.length === 0) ? (
                            <span className="text-sm text-gray-400 italic">Aucun équipement sélectionné</span>
                        ) : (
                            <div className="space-y-1">
                                {property.amenities.slice(0, 5).map((am, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 flex items-center">
                                        <Check className="w-3 h-3 text-green-500 mr-2" /> {am}
                                    </p>
                                ))}
                                {property.amenities.length > 5 && (
                                    <p className="text-sm text-indigo-600 font-medium mt-2">+ {property.amenities.length - 5} plus</p>
                                )}
                            </div>
                        )}
                    </SummaryCard>
                </div>
            )}

            {/* TAB: PRICING (Updated with clearer Taxes section) */}
            {activeTab === 'pricing' && (
                <div className="animate-fade-in space-y-10 max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Tarifs & Taxes</h2>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Prix par nuit</h3>
                        <p className="text-sm text-gray-500 mb-4">Définissez votre prix de base par nuit en ajoutant le prix de base et la majoration.</p>

                        <SummaryCard title="Prix de base" onEdit={() => openEdit('pricing_base')}>
                           <p className="text-sm text-gray-500 mb-3">Définissez votre prix de base par nuit et devise. Personnalisez le prix en fonction du jour de la semaine si besoin.</p>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded text-base flex items-center">
                                 {property.pricing?.currency === 'EUR' ? '€' : property.pricing?.currency} {property.pricing?.basePrice} 
                                 <span className="ml-2 w-4 h-3 bg-red-500/20 rounded-sm"></span>
                              </span>
                           </div>
                        </SummaryCard>

                        <SummaryCard title="Frais par invité supplémentaire" onEdit={() => openEdit('pricing_base')} editIcon={MoreHorizontal}>
                           <p className="text-sm text-gray-500 mb-3">Activez un supplément par nuit pour chaque invité supplémentaire.</p>
                           {property.pricing?.extraGuestFee ? (
                               <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <span className="font-bold">€ {property.pricing.extraGuestFee}</span> par invité, après <span className="font-bold">{property.pricing.extraGuestThreshold || 1}</span> invités
                                  <span className="ml-1 w-4 h-3 bg-red-500/20 rounded-sm"></span>
                               </div>
                           ) : (
                               <span className="text-sm text-gray-400 italic">Désactivé</span>
                           )}
                        </SummaryCard>

                        <SummaryCard title="Prix pour un court séjour" onEdit={() => openEdit('pricing_base')} editIcon={MoreHorizontal}>
                           <p className="text-sm text-gray-500 mb-3">Augmentez le prix par nuit si un client ne reste que pour une courte durée.</p>
                           {property.pricing?.shortStayFee ? (
                               <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <span className="font-bold">€ {property.pricing.shortStayFee}</span> supplémentaires si le séjour dure <span className="font-bold">{property.pricing.shortStayDuration || 1}</span> nuits
                                  <span className="ml-1 w-4 h-3 bg-red-500/20 rounded-sm"></span>
                               </div>
                           ) : (
                               <span className="text-sm text-gray-400 italic">Désactivé</span>
                           )}
                        </SummaryCard>
                    </div>

                    <div className="space-y-12">
                        <ListSectionHeader 
                            title="Prix par durée du séjour" 
                            description="Réduire les prix pour les séjours prolongés."
                            dropdown={
                                <div className="relative">
                                    <button 
                                        onClick={() => setLosDropdownOpen(!losDropdownOpen)}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-4 py-2 rounded-lg transition hover:bg-indigo-100"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter
                                    </button>
                                    {losDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="py-1">
                                                <button onClick={() => handleOpenLOSModal('weekly')} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Hebdomadaire</button>
                                                <button onClick={() => handleOpenLOSModal('monthly')} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Mensuel</button>
                                                <button onClick={() => handleOpenLOSModal('custom')} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Personnalisé</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                        <div className="space-y-4 mt-4">
                            {(property.pricing?.lengthOfStayRules || []).map(rule => (
                                <div key={rule.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm group hover:border-indigo-300 transition-colors">
                                    <span className="font-medium text-gray-800">{rule.type === 'weekly' ? 'Semaine' : rule.type === 'monthly' ? 'Mois' : 'Custom'} ({rule.minNights}+ nuits)</span>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">€ {rule.amount}</span>
                                        <button onClick={() => handleDeleteLOSRule(rule.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <ListSectionHeader title="Frais" description="Frais de ménage, animaux, linge, etc." onAdd={() => handleOpenFeeModal()} />
                            <div className="space-y-4 mt-4">
                                {(property.pricing?.fees || []).map(fee => (
                                    <div key={fee.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm group hover:border-indigo-300 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-900">{fee.name}</p>
                                            <p className="text-xs text-gray-500">{fee.type}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold">{fee.calculationType === 'flat' ? `€ ${fee.amount}` : `${fee.amount}%`}</span>
                                            <button onClick={() => handleDeleteFee(fee.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <ListSectionHeader 
                                title="Taxes & Impôts" 
                                description="Taxe de séjour, TVA, taxes locales." 
                                dropdown={
                                    <div className="relative">
                                        <button 
                                            onClick={() => setTaxDropdownOpen(!taxDropdownOpen)}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-4 py-2 rounded-lg transition hover:bg-indigo-100"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Ajouter
                                        </button>
                                        {taxDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                                <div className="py-1">
                                                    <button onClick={handleOpenVatModal} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">TVA / Taxe Vente</button>
                                                    <button onClick={() => handleOpenLocalTaxModal()} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Taxe de séjour / locale</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                            
                            <div className="space-y-4 mt-4">
                                {property.pricing?.vatSetting?.enabled && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-gray-900">TVA</p>
                                            <p className="text-xs text-gray-500">{property.pricing.vatSetting.includedInPrice ? 'Incluse' : 'Non incluse'}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold">{property.pricing.vatSetting.percentage}%</span>
                                            <button onClick={handleDeleteVat} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                                {(property.pricing?.localTaxes || []).map(tax => (
                                    <div key={tax.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-gray-900">{tax.name}</p>
                                            <p className="text-xs text-gray-500">{tax.type}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold">{tax.calculationType === 'flat' ? `€ ${tax.amount}` : `${tax.amount}%`}</span>
                                            <button onClick={() => handleDeleteLocalTax(tax.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'policies' && (
                <div className="animate-fade-in space-y-6 max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Politiques de l'hébergement</h2>

                    <SummaryCard title="Horaires d'arrivée et de départ" onEdit={() => openEdit('policies_schedule')} editIcon={Clock}>
                        <div className="flex gap-12">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Arrivée après</p>
                                <p className="text-lg font-bold text-gray-900">{property.checkInTime || '15:00'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Départ avant</p>
                                <p className="text-lg font-bold text-gray-900">{property.checkOutTime || '11:00'}</p>
                            </div>
                        </div>
                    </SummaryCard>

                    <SummaryCard title="Dépôt de garantie (Caution)" onEdit={() => openEdit('policies_deposit')} editIcon={Shield}>
                        <p className="text-sm text-gray-500 mb-3">Montant retenu ou pré-autorisé pour couvrir les éventuels dommages.</p>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900 mr-2">
                                € {property.pricing?.securityDeposit || 0}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Par séjour</span>
                        </div>
                    </SummaryCard>

                    <SummaryCard title="Politique d'annulation" onEdit={() => openEdit('policies_cancellation')} editIcon={FileText}>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                                property.cancellationPolicy === 'strict' ? 'bg-red-100 text-red-700' :
                                property.cancellationPolicy === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {property.cancellationPolicy === 'flexible' ? 'Flexible' : 
                                 property.cancellationPolicy === 'moderate' ? 'Modérée' : 
                                 property.cancellationPolicy === 'strict' ? 'Stricte' : 'Non remboursable'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 italic">
                            {property.cancellationPolicy === 'flexible' && "Remboursement intégral jusqu'à 24h avant l'arrivée."}
                            {property.cancellationPolicy === 'moderate' && "Remboursement intégral jusqu'à 5 jours avant l'arrivée."}
                            {property.cancellationPolicy === 'strict' && "Remboursement intégral jusqu'à 14 jours avant l'arrivée."}
                        </p>
                    </SummaryCard>

                    <SummaryCard title="Règlement intérieur" onEdit={() => openEdit('policies_rules')} editIcon={Ban}>
                        <div className="flex gap-4 mb-4">
                            <div className={`flex items-center px-3 py-2 rounded-lg border ${property.smokingAllowed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {property.smokingAllowed ? <Check className="w-4 h-4 mr-2"/> : <Ban className="w-4 h-4 mr-2"/>}
                                <span className="text-sm font-medium">Fumeurs</span>
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg border ${property.petsAllowed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {property.petsAllowed ? <Check className="w-4 h-4 mr-2"/> : <Ban className="w-4 h-4 mr-2"/>}
                                <span className="text-sm font-medium">Animaux</span>
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg border ${property.eventsAllowed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {property.eventsAllowed ? <Check className="w-4 h-4 mr-2"/> : <Ban className="w-4 h-4 mr-2"/>}
                                <span className="text-sm font-medium">Fêtes</span>
                            </div>
                        </div>
                        {property.houseRules && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                                {property.houseRules}
                            </div>
                        )}
                    </SummaryCard>
                </div>
            )}

            {activeTab === 'photos' && (
                <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Photos</h2>
                            <p className="text-gray-500 text-sm">Attirez des invités potentiels des photos de haute qualité.</p>
                        </div>
                        <div 
                            onClick={() => photoInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition group bg-white"
                        >
                            <input type="file" multiple accept="image/png, image/jpeg" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload} />
                            <div className="p-3 bg-gray-100 rounded-lg text-gray-500 mb-3 group-hover:bg-white group-hover:text-indigo-600 transition">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Téléchargez ou glissez-déposez vos photos</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {property.photos?.map((photoUrl, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group relative">
                                    <div className="relative aspect-video">
                                        <img src={photoUrl} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeletePhoto(photoUrl)} className="bg-white p-1.5 rounded-lg shadow-sm hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'access' && (
                <div className="animate-fade-in space-y-8">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="h-64 bg-gray-100 relative group cursor-pointer" onClick={() => openEdit('address')}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-gray-800 shadow-md flex items-center border border-gray-200">
                                    <MapPin className="w-4 h-4 mr-2 text-red-500" fill="currentColor" />
                                    {property.address || "Définir l'emplacement"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <SummaryCard title="Guide Vidéo d'Accès" onEdit={() => openEdit('access_video')} editIcon={Video}>
                        <p className="text-sm text-gray-500 mb-3">Une vidéo explicative pour aider vos voyageurs à trouver l'entrée ou la boîte à clés.</p>
                        {property.accessVideoUrl ? (
                            <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Film className="w-6 h-6 text-indigo-600" />
                                <div className="overflow-hidden flex-1">
                                    <p className="text-sm font-bold text-indigo-900 truncate">Vidéo chargée</p>
                                    <span className="text-xs text-indigo-600 block">Fichier prêt pour le portail</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">Aucune vidéo configurée. Téléchargez un fichier depuis votre ordinateur.</div>
                        )}
                    </SummaryCard>
                </div>
            )}

            {(activeTab === 'availability') && (
                <div className="p-12 text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl">Module Calendrier Avancé à venir</div>
            )}

        </div>
      </div>

      {/* --- EDIT MODALS --- */}

      {editingSection === 'name' && tempProperty && (
        <EditModal title="Nom et description" onClose={closeEdit} onSave={saveEdit}>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nom *</label>
                    <input 
                        type="text" 
                        value={tempProperty.name} 
                        onChange={(e) => updateTempField('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description *</label>
                    <textarea 
                        rows={8}
                        value={tempProperty.description || ''} 
                        onChange={(e) => updateTempField('description', e.target.value)}
                        className="w-full px-3 py-2 text-sm outline-none resize-none border border-gray-300 rounded-lg bg-white text-gray-900"
                    />
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'access_video' && tempProperty && (
          <EditModal title="Vidéo guide d'accès" onClose={closeEdit} onSave={saveEdit}>
              <div className="space-y-6">
                  <p className="text-sm text-gray-600">Téléchargez une vidéo depuis votre ordinateur pour montrer l'accès au logement (Max 50Mo recommandé).</p>
                  
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition group bg-white"
                  >
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        ref={videoInputRef} 
                        onChange={handleAccessVideoUpload} 
                      />
                      <div className="p-3 bg-gray-100 rounded-lg text-gray-500 mb-3 group-hover:bg-white group-hover:text-indigo-600 transition">
                          <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Cliquez pour choisir une vidéo</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM</p>
                  </div>

                  {tempProperty.accessVideoUrl && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-700">Aperçu</span>
                              <button onClick={() => updateTempField('accessVideoUrl', undefined)} className="text-red-500 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                          <video controls className="w-full rounded-lg bg-black aspect-video">
                              <source src={tempProperty.accessVideoUrl} type="video/mp4" />
                              Votre navigateur ne supporte pas la lecture de vidéos.
                          </video>
                      </div>
                  )}
              </div>
          </EditModal>
      )}

      {/* RESTORED MODALS START HERE */}

      {editingSection === 'info' && tempProperty && (
        <EditModal title="Informations de l'hébergement" onClose={closeEdit} onSave={saveEdit}>
            <div className="space-y-6">
                <p className="text-sm text-gray-600">Précisez le type de logement, la taille, la capacité d'invités et les unités disponibles.</p>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Type d'hébergement</label>
                    <select 
                        value={tempProperty.propertyType || 'apartment'}
                        onChange={(e) => updateTempField('propertyType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    >
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="villa">Villa</option>
                        <option value="bnb">Bed & Breakfast</option>
                        <option value="chalet">Chalet</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Unité de mesure</label>
                    <select 
                        value={tempProperty.surfaceUnit || 'm2'}
                        onChange={(e) => updateTempField('surfaceUnit', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    >
                        <option value="m2">m²</option>
                        <option value="ft2">pi²</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Taille *</label>
                    <input 
                        type="number" 
                        value={tempProperty.surface ?? ''}
                        onChange={(e) => updateTempField('surface', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Combien d'invités votre lieu peut-il accueillir ?</label>
                    <div className="flex items-center">
                        <button 
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 bg-white"
                            onClick={() => updateTempField('maxGuests', Math.max(1, (tempProperty.maxGuests || 1) - 1))}
                        >
                            <Minus className="w-4 h-4 text-gray-600"/>
                        </button>
                        <span className="mx-4 font-bold text-gray-900 w-6 text-center text-lg">{tempProperty.maxGuests || 1}</span>
                        <button 
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 bg-white"
                            onClick={() => updateTempField('maxGuests', (tempProperty.maxGuests || 1) + 1)}
                        >
                            <Plus className="w-4 h-4 text-gray-600"/>
                        </button>
                    </div>
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'rooms' && tempProperty && (
        <EditModal title="Pièces" onClose={closeEdit} onSave={saveEdit}>
            <p className="text-sm text-gray-600 mb-4">Quelles pièces comporte votre hébergement? Les pièces que vous sélectionnez ici seront affichées sur votre site web.</p>
            <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {ROOM_TYPES.map(type => {
                    const count = tempProperty.roomsComposition?.find(r => r.type === type)?.count || 0;
                    return (
                        <div key={type} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50">
                            <span className="text-sm text-gray-700">{type}</span>
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => updateTempRoom(type, -1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border bg-white ${count > 0 ? 'border-gray-300 text-gray-600' : 'border-gray-100 text-gray-300'}`}
                                    disabled={count === 0}
                                >
                                    <Minus className="w-3 h-3"/>
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900">{count}</span>
                                <button 
                                    onClick={() => updateTempRoom(type, 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-white bg-white"
                                >
                                    <Plus className="w-3 h-3"/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </EditModal>
      )}

      {editingSection === 'beds' && tempProperty && (
        <EditModal title="Dispositions des lits" onClose={closeEdit} onSave={saveEdit}>
            <p className="text-sm text-gray-600 mb-4">Informez vos invités des conditions de couchage.</p>
            <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {BED_TYPES.map(type => {
                    const count = tempProperty.bedsDistribution?.find(b => b.type === type)?.count || 0;
                    return (
                        <div key={type} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50">
                            <div className="flex items-center">
                                <Layout className="w-4 h-4 mr-3 text-gray-400"/>
                                <span className="text-sm text-gray-700">{type}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => updateTempBed(type, -1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border bg-white ${count > 0 ? 'border-gray-300 text-gray-600' : 'border-gray-100 text-gray-300'}`}
                                    disabled={count === 0}
                                >
                                    <Minus className="w-3 h-3"/>
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900">{count}</span>
                                <button 
                                    onClick={() => updateTempBed(type, 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-white bg-white"
                                >
                                    <Plus className="w-3 h-3"/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </EditModal>
      )}

      {editingSection === 'amenities' && tempProperty && (
        <EditModal title="Équipements de l'hébergement" onClose={closeEdit} onSave={saveEdit}>
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher des équipements..." 
                    value={searchAmenity}
                    onChange={(e) => setSearchAmenity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white"
                />
            </div>
            
            <div className="space-y-6">
                {Object.entries(AMENITY_CATEGORIES).map(([category, items]) => {
                    const filteredItems = items.filter(item => item.toLowerCase().includes(searchAmenity.toLowerCase()));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={category}>
                            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center">
                                {category === "Les plus populaires" && <span className="mr-2">💡</span>}
                                {category}
                            </h4>
                            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                {filteredItems.map(item => {
                                    const isChecked = tempProperty.amenities?.includes(item);
                                    return (
                                        <div 
                                            key={item} 
                                            onClick={() => toggleTempAmenity(item)}
                                            className="flex items-center px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                                {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </EditModal>
      )}

      {editingSection === 'address' && tempProperty && (
        <EditModal title="Modifier l'adresse" onClose={closeEdit} onSave={saveEdit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pays *</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900">
                        <option>France</option>
                        <option>Belgique</option>
                        <option>Suisse</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Adresse complète *</label>
                    <input 
                        type="text" 
                        value={tempProperty.address || ''} 
                        onChange={(e) => updateTempField('address', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                        placeholder="13 Rue Jules Gévelot"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Code Postal</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900" placeholder="61100" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ville</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900" placeholder="Flers" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Position sur la carte</label>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border border-gray-300 relative overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-red-500 drop-shadow-md -mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'pricing_base' && tempProperty && (
        <EditModal title="Configuration Prix par Nuit" onClose={closeEdit} onSave={saveEdit}>
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Prix de base</label>
                    <div className="flex gap-2">
                        <select 
                            value={tempProperty.pricing?.currency} 
                            onChange={(e) => updateTempPricing('currency', e.target.value)}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white text-gray-900"
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                        <input 
                            type="number" 
                            value={tempProperty.pricing?.basePrice || ''}
                            onChange={(e) => updateTempPricing('basePrice', parseFloat(e.target.value))}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 bg-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-800">Frais par invité supplémentaire</label>
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-emerald-600"
                            checked={!!tempProperty.pricing?.extraGuestFee}
                            onChange={(e) => {
                                if(!e.target.checked) updateTempPricing('extraGuestFee', 0);
                                else updateTempPricing('extraGuestFee', 20); 
                            }}
                        />
                    </div>
                    {!!tempProperty.pricing?.extraGuestFee && (
                        <div className="flex gap-4 items-end pl-2 border-l-2 border-gray-200">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Montant par nuit</label>
                                <input 
                                    type="number" 
                                    value={tempProperty.pricing?.extraGuestFee}
                                    onChange={(e) => updateTempPricing('extraGuestFee', parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Après X invités</label>
                                <input 
                                    type="number" 
                                    value={tempProperty.pricing?.extraGuestThreshold || 1}
                                    onChange={(e) => updateTempPricing('extraGuestThreshold', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-800">Prix pour un court séjour</label>
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-emerald-600"
                            checked={!!tempProperty.pricing?.shortStayFee}
                            onChange={(e) => {
                                if(!e.target.checked) updateTempPricing('shortStayFee', 0);
                                else updateTempPricing('shortStayFee', 10);
                            }}
                        />
                    </div>
                    {!!tempProperty.pricing?.shortStayFee && (
                        <div className="flex gap-4 items-end pl-2 border-l-2 border-gray-200">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Supplément par nuit</label>
                                <input 
                                    type="number" 
                                    value={tempProperty.pricing?.shortStayFee}
                                    onChange={(e) => updateTempPricing('shortStayFee', parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Si moins de X nuits</label>
                                <input 
                                    type="number" 
                                    value={tempProperty.pricing?.shortStayDuration || 1}
                                    onChange={(e) => updateTempPricing('shortStayDuration', parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </EditModal>
      )}

      {/* POLICY MODALS */}
      {editingSection === 'policies_schedule' && tempProperty && (
          <EditModal title="Horaires d'arrivée et de départ" onClose={closeEdit} onSave={saveEdit}>
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Arrivée après (Check-in)</label>
                      <input 
                        type="time" 
                        value={tempProperty.checkInTime || '15:00'} 
                        onChange={(e) => updateTempField('checkInTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Départ avant (Check-out)</label>
                      <input 
                        type="time" 
                        value={tempProperty.checkOutTime || '11:00'} 
                        onChange={(e) => updateTempField('checkOutTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                      />
                  </div>
              </div>
          </EditModal>
      )}

      {editingSection === 'policies_deposit' && tempProperty && (
          <EditModal title="Dépôt de garantie" onClose={closeEdit} onSave={saveEdit}>
              <div className="space-y-4">
                  <p className="text-sm text-gray-600">Le montant de la caution sera bloqué ou pré-autorisé sur la carte du client.</p>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Montant (€)</label>
                      <input 
                        type="number" 
                        value={tempProperty.pricing?.securityDeposit || 0}
                        onChange={(e) => updateTempPricing('securityDeposit', parseFloat(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                      />
                  </div>
              </div>
          </EditModal>
      )}

      {editingSection === 'policies_cancellation' && tempProperty && (
          <EditModal title="Politique d'annulation" onClose={closeEdit} onSave={saveEdit}>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Choisir une politique</label>
                      <select 
                        value={tempProperty.cancellationPolicy}
                        onChange={(e) => updateTempField('cancellationPolicy', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 mb-4"
                      >
                          <option value="flexible">Flexible (Remboursable 24h avant)</option>
                          <option value="moderate">Modérée (Remboursable 5 jours avant)</option>
                          <option value="strict">Stricte (Remboursable 14 jours avant)</option>
                          <option value="non_refundable">Non Remboursable</option>
                      </select>
                  </div>
              </div>
          </EditModal>
      )}

      {editingSection === 'policies_rules' && tempProperty && (
          <EditModal title="Règlement intérieur" onClose={closeEdit} onSave={saveEdit}>
              <div className="space-y-6">
                  <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                          <span className="text-sm font-medium text-gray-700">Fumeurs autorisés</span>
                          <input type="checkbox" checked={!!tempProperty.smokingAllowed} onChange={() => toggleTempRule('smokingAllowed')} className="w-5 h-5 accent-indigo-600"/>
                      </label>
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                          <span className="text-sm font-medium text-gray-700">Animaux acceptés</span>
                          <input type="checkbox" checked={!!tempProperty.petsAllowed} onChange={() => toggleTempRule('petsAllowed')} className="w-5 h-5 accent-indigo-600"/>
                      </label>
                      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                          <span className="text-sm font-medium text-gray-700">Événements/Fêtes autorisés</span>
                          <input type="checkbox" checked={!!tempProperty.eventsAllowed} onChange={() => toggleTempRule('eventsAllowed')} className="w-5 h-5 accent-indigo-600"/>
                      </label>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Règles supplémentaires</label>
                      <textarea 
                        rows={6}
                        value={tempProperty.houseRules || ''}
                        onChange={(e) => updateTempField('houseRules', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm"
                        placeholder="Ex: Merci de sortir les poubelles avant le départ..."
                      />
                  </div>
              </div>
          </EditModal>
      )}

      {/* FEES, VAT, TAXES, LOS MODALS */}

      {editingSection === 'fee_modal' && currentFee && (
        <EditModal title="Frais" onClose={closeEdit} onSave={handleSaveFee}>
            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700">Type</label>
                <select value={currentFee.type} onChange={(e) => setCurrentFee({...currentFee, type: e.target.value, name: e.target.value})} className="w-full border p-2 rounded bg-white text-gray-900">
                    <option value="">Sélectionner</option>
                    {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="block text-xs font-bold text-gray-700">Montant</label>
                <input type="number" value={currentFee.amount} onChange={(e) => setCurrentFee({...currentFee, amount: parseFloat(e.target.value)})} className="w-full border p-2 rounded bg-white text-gray-900" />
                <div className="flex gap-2">
                    <button onClick={() => setCurrentFee({...currentFee, calculationType: 'flat'})} className={`flex-1 p-2 rounded border ${currentFee.calculationType === 'flat' ? 'bg-indigo-50 border-indigo-500' : 'bg-white'}`}>Fixe</button>
                    <button onClick={() => setCurrentFee({...currentFee, calculationType: 'percent'})} className={`flex-1 p-2 rounded border ${currentFee.calculationType === 'percent' ? 'bg-indigo-50 border-indigo-500' : 'bg-white'}`}>%</button>
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'vat_modal' && tempProperty?.pricing?.vatSetting && (
        <EditModal title="Taxe de vente / TVA" onClose={closeEdit} onSave={handleSaveVat}>
            <div className="space-y-6">
                <p className="text-sm text-gray-600">
                    Indiquez le pourcentage de la taxe de vente/TVA et choisissez si elle doit être incluse dans le prix.
                </p>
                <div>
                    <div className="relative">
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 pr-8"
                            placeholder="0.00"
                            value={tempProperty.pricing.vatSetting.percentage || ''}
                            onChange={(e) => {
                                if (tempProperty.pricing?.vatSetting) {
                                    tempProperty.pricing.vatSetting.percentage = parseFloat(e.target.value);
                                    setTempProperty({...tempProperty});
                                }
                            }}
                        />
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                </div>
                <div>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                        value={tempProperty.pricing.vatSetting.includedInPrice ? 'included' : 'excluded'}
                        onChange={(e) => {
                            if (tempProperty.pricing?.vatSetting) {
                                tempProperty.pricing.vatSetting.includedInPrice = e.target.value === 'included';
                                setTempProperty({...tempProperty});
                            }
                        }}
                    >
                        <option value="included">Le prix inclut la taxe de vente/TVA</option>
                        <option value="excluded">Le prix n'inclut pas la taxe de vente/TVA</option>
                    </select>
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'local_tax_modal' && currentLocalTax && (
        <EditModal title="Nouvelle taxe locale" onClose={closeEdit} onSave={handleSaveLocalTax}>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Type d'impôt local *</label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                        value={currentLocalTax.type}
                        onChange={(e) => setCurrentLocalTax({...currentLocalTax, type: e.target.value, name: e.target.value})}
                    >
                        <option value="">Cliquez pour sélectionner</option>
                        {LOCAL_TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Montant</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-full mb-3">
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${currentLocalTax.calculationType === 'flat' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setCurrentLocalTax({ ...currentLocalTax, calculationType: 'flat' })}
                        >
                            Montant forfaitaire
                        </button>
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${currentLocalTax.calculationType === 'percent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setCurrentLocalTax({ ...currentLocalTax, calculationType: 'percent' })}
                        >
                            Pourcentage
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-500 mb-1">Valeur *</label>
                            <input 
                                type="number" 
                                value={currentLocalTax.amount || ''}
                                onChange={(e) => setCurrentLocalTax({ ...currentLocalTax, amount: parseFloat(e.target.value) })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </EditModal>
      )}

      {editingSection === 'los_modal' && currentLOSRule && (
        <EditModal title="Règle de prix" onClose={closeEdit} onSave={handleSaveLOSRule}>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        {currentLOSRule.type === 'weekly' ? 'Prix total hebdomadaire' :
                         currentLOSRule.type === 'monthly' ? 'Prix total mensuel' :
                         'Prix total'}
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={currentLOSRule.amount || ''}
                            onChange={(e) => setCurrentLOSRule({ ...currentLOSRule, amount: parseFloat(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 pr-8"
                        />
                        <span className="absolute right-3 top-2 text-gray-500 text-sm">€</span>
                    </div>
                </div>
            </div>
        </EditModal>
      )}

      <input type="file" ref={photoInputRef} accept="image/*" className="hidden" onChange={handlePhotoUpload} />

    </div>
  );
};
