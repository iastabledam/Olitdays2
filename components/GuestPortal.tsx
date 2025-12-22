
import React, { useState, useEffect } from 'react';
import { MOCK_PROPERTIES, MOCK_RESERVATIONS } from '../constants';
import { chatWithConcierge } from '../services/geminiService';
import { ChatMessage, Reservation, Property, Incident, IncidentStatus, IncidentPriority } from '../types';
import { 
  Wifi, MapPin, Coffee, Send, User, MessageCircle, Key, 
  Utensils, Star, Info, PlayCircle, X, CreditCard, Check, ChevronRight,
  Clock, Car, Ship, Plane, ShoppingCart, ChefHat, CheckCircle, ArrowLeft, Eye,
  AlertTriangle, MessageSquare
} from 'lucide-react';

// --- MODAL COMPONENT ---
const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  </div>
);

// --- SUB-COMPONENT: ACTUAL GUEST UI ---
interface GuestPortalUIProps {
  reservation: Reservation;
  property: Property;
  onExitPreview?: () => void;
  onCreateIncident?: (incident: Incident) => void;
  onUpdateIncident?: (incident: Incident) => void;
  incidents?: Incident[]; // Receive global incidents
}

const GuestPortalUI: React.FC<GuestPortalUIProps> = ({ reservation, property, onExitPreview, onCreateIncident, onUpdateIncident, incidents }) => {
  // --- STATE ---
  const [chatOpen, setChatOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'wifi' | 'access' | 'guide' | 'payment' | 'incident' | 'incident_detail'>('none');
  const [activeTab, setActiveTab] = useState<'flexibility' | 'transport' | 'restauration'>('flexibility');
  const [selectedService, setSelectedService] = useState<{name: string, price: string} | null>(null);
  
  // Incident Form State
  const [incidentDescription, setIncidentDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentReply, setIncidentReply] = useState('');
  
  // Filter incidents for this reservation
  const myIncidents = (incidents || []).filter(inc => 
      inc.reservationId === reservation.id || inc.guestName === reservation.guestName
  );

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Bonjour ${reservation.guestName.split(' ')[0]} ! Je suis votre concierge virtuel pour ${property.name}. Comment puis-je vous aider aujourd'hui ?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // --- PREMIUM SERVICES DATA ---
  const servicesData = {
    flexibility: {
      title: "Flexibilité Horaires",
      subtitle: "Adaptez votre séjour à votre rythme",
      items: [
        {
          id: 'early-checkin',
          title: "Arrivée Anticipée",
          subtitle: "Accès dès 12h au lieu de 16h",
          price: "49€",
          desc: "Profitez de votre villa dès votre arrivée. Villa préparée et climatisée.",
          features: ["Villa prête dès 12h", "Climatisation activée", "Champagne offert"],
          badge: "DISPONIBLE",
          badgeColor: "bg-green-100 text-green-700",
          icon: Clock,
          tag: "POPULAIRE",
          tagColor: "bg-amber-500"
        },
        {
          id: 'late-checkout',
          title: "Départ Tardif",
          subtitle: "Villa jusqu'à 14h au lieu de 10h",
          price: "39€",
          desc: "Prolongez votre séjour et profitez d'une matinée relaxante.",
          features: ["Extension jusqu'à 14h", "Accès piscine maintenu"],
          badge: "DISPONIBLE",
          badgeColor: "bg-green-100 text-green-700",
          icon: Clock
        }
      ]
    },
    transport: {
      title: "Transport & Mobilité",
      subtitle: "Déplacez-vous en toute sérénité",
      items: [
        {
          id: 'boat',
          title: "Location Bateau",
          subtitle: "Avec Skipper • 6 places",
          price: "290€/j",
          desc: "Explorez les plus belles calanques de la Côte d'Azur.",
          features: ["Skipper inclus", "Carburant inclus", "Équipement snorkeling"],
          badge: "LIMITÉ",
          badgeColor: "bg-amber-100 text-amber-700",
          icon: Ship,
          tag: "PREMIUM",
          tagColor: "bg-purple-600"
        },
        {
          id: 'airport',
          title: "Transfert Aéroport",
          subtitle: "Nice ↔ Villa • VIP",
          price: "150€",
          desc: "Transport privé en véhicule haut de gamme avec chauffeur.",
          features: ["Chauffeur costume", "Accueil personnalisé", "Suivi vol"],
          badge: "DISPONIBLE",
          badgeColor: "bg-green-100 text-green-700",
          icon: Plane
        }
      ]
    },
    restauration: {
      title: "Restauration",
      subtitle: "Spécialités locales à domicile",
      items: [
        {
          id: 'breakfast',
          title: "Petit-déjeuner",
          subtitle: "Livré chaque matin à 8h",
          price: "25€/p",
          desc: "Viennoiseries fraîches, jus pressé et fruits.",
          features: ["Produits frais", "Livraison discrète", "Jus pressé"],
          badge: "DISPONIBLE",
          badgeColor: "bg-green-100 text-green-700",
          icon: Coffee,
          tag: "POPULAIRE",
          tagColor: "bg-amber-500"
        },
        {
          id: 'chef',
          title: "Chef à Domicile",
          subtitle: "Menu Gastronomique",
          price: "350€",
          desc: "Un chef étoilé cuisine dans votre villa un dîner d'exception.",
          features: ["Chef professionnel", "Service à table", "Nettoyage inclus"],
          badge: "SUR RÉSERVATION",
          badgeColor: "bg-yellow-100 text-yellow-800",
          icon: ChefHat,
          tag: "PREMIUM",
          tagColor: "bg-purple-600"
        }
      ]
    }
  };

  // --- ACTIONS ---
  const handleBookService = (name: string, price: string) => {
    setSelectedService({ name, price });
    setActiveModal('payment');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const propertyContext = `
      Nom: ${property.name}
      Adresse: ${property.address}
      Wifi SSID: ${property.wifiSsid}
      Wifi MDP: ${property.wifiPwd}
      Code Boîte à Clé: ${property.accessCode || 'Non défini'}
      Règles: Pas de fête, non fumeur, check-out 11h.
    `;

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithConcierge(userMsg.text, history, propertyContext);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleSubmitIncident = () => {
      if(!incidentDescription.trim()) return;
      
      const newIncident: Incident = {
          id: `inc-${Date.now()}`,
          tenantId: property.tenantId, // Ensure tenantId is passed from property
          title: 'Signalement Voyageur',
          description: incidentDescription,
          propertyId: property.id,
          reservationId: reservation.id,
          guestName: reservation.guestName,
          reportedAt: new Date().toISOString(),
          status: IncidentStatus.NEW,
          priority: IncidentPriority.HIGH, 
          category: 'OTHER',
          messages: [{ text: incidentDescription, author: reservation.guestName, date: new Date().toISOString() }]
      };

      if (onCreateIncident) {
          onCreateIncident(newIncident);
      }
      
      setIncidentDescription('');
      setActiveModal('none');
  };

  const handleReplyToIncident = () => {
      if (!selectedIncident || !incidentReply.trim() || !onUpdateIncident) return;
      
      const newMessage = {
          text: incidentReply,
          author: reservation.guestName,
          date: new Date().toISOString()
      };
      
      const updated = {
          ...selectedIncident,
          messages: [...(selectedIncident.messages || []), newMessage]
      };
      
      onUpdateIncident(updated);
      setSelectedIncident(updated); // Update local view
      setIncidentReply('');
  };

  const currentCategory = servicesData[activeTab];

  return (
    <div className="w-full space-y-8 pb-24 animate-fade-in font-sans relative">
      
      {/* --- PREVIEW BANNER (If Admin) --- */}
      {onExitPreview && (
        <div className="bg-indigo-900 text-white px-6 py-3 sticky top-0 z-50 shadow-md flex justify-between items-center -mx-6 -mt-6 mb-6">
          <div className="flex items-center">
             <Eye className="w-5 h-5 mr-2" />
             <span className="font-medium">Mode Aperçu : {reservation.guestName}</span>
          </div>
          <button 
            onClick={onExitPreview}
            className="bg-white text-indigo-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition flex items-center"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Quitter
          </button>
        </div>
      )}

      {/* --- HEADER IMAGE & WELCOME --- */}
      <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg group">
        <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
          <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            Séjour en cours
          </div>
          <h1 className="text-3xl font-bold mb-1">{property.name}</h1>
          <p className="flex items-center opacity-90 text-sm"><MapPin className="w-4 h-4 mr-1" /> {property.address}</p>
        </div>
      </div>

      {/* --- MY REQUESTS / INCIDENTS SECTION (NEW) --- */}
      {myIncidents.length > 0 && (
          <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" /> Suivi de mes demandes
              </h3>
              <div className="space-y-3">
                  {myIncidents.map(inc => (
                      <div 
                        key={inc.id} 
                        onClick={() => { setSelectedIncident(inc); setActiveModal('incident_detail'); }}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 transition border border-gray-100"
                      >
                          <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                  inc.status === 'NEW' ? 'bg-indigo-500' :
                                  inc.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
                              }`}></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800">{inc.title}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{inc.messages?.[inc.messages.length - 1]?.text || inc.description}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                                  inc.status === 'NEW' ? 'bg-indigo-100 text-indigo-700' :
                                  inc.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                  {inc.status === 'NEW' ? 'Envoyé' : inc.status === 'IN_PROGRESS' ? 'Pris en charge' : 'Résolu'}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- QUICK ACTIONS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveModal('wifi')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md hover:border-indigo-100 transition duration-200">
          <div className="bg-indigo-50 p-3 rounded-full mb-3 text-indigo-600">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800">WiFi</h3>
          <p className="text-xs text-gray-500 mt-1">Codes d'accès</p>
        </button>
        <button onClick={() => setActiveModal('access')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md hover:border-emerald-100 transition duration-200">
          <div className="bg-emerald-50 p-3 rounded-full mb-3 text-emerald-600">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800">Accès</h3>
          <p className="text-xs text-gray-500 mt-1">Clés & Vidéo</p>
        </button>
        <button onClick={() => setActiveModal('guide')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md hover:border-amber-100 transition duration-200">
          <div className="bg-amber-50 p-3 rounded-full mb-3 text-amber-600">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800">Guide</h3>
          <p className="text-xs text-gray-500 mt-1">Règles maison</p>
        </button>
        <button onClick={() => setActiveModal('incident')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md hover:border-red-100 transition duration-200 group">
          <div className="bg-red-50 p-3 rounded-full mb-3 text-red-600 group-hover:animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800">Signaler</h3>
          <p className="text-xs text-gray-500 mt-1">Problème / Panne</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* --- RESERVATION INFO --- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600"/> Mon Séjour
            </h2>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
               <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Arrivée</p>
                 <p className="font-bold text-gray-900">{new Date(reservation.startDate).toLocaleDateString('fr-FR')}</p>
                 <p className="text-sm text-gray-600">15:00</p>
               </div>
               <div className="h-8 w-px bg-gray-300"></div>
               <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Départ</p>
                 <p className="font-bold text-gray-900">{new Date(reservation.endDate).toLocaleDateString('fr-FR')}</p>
                 <p className="text-sm text-gray-600">11:00</p>
               </div>
               <div className="hidden sm:block">
                 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">CONFIRMÉ</span>
               </div>
            </div>
          </div>

          {/* --- PREMIUM SERVICES SECTION (OLITDAYS STYLE) --- */}
          <div id="services" className="scroll-mt-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Star className="w-6 h-6 mr-2 text-[#FF6B6B]" fill="#FF6B6B" /> 
                Services Premium
              </h2>
            </div>
            
            {/* TABS */}
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6 flex gap-2 overflow-x-auto">
              {(['flexibility', 'transport', 'restauration'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-[#FF6B6B] text-white shadow-md' 
                      : 'bg-transparent text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'flexibility' && <Clock className="w-4 h-4 mr-2" />}
                  {tab === 'transport' && <Car className="w-4 h-4 mr-2" />}
                  {tab === 'restauration' && <Utensils className="w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* SERVICE CARDS */}
            <div className="space-y-4">
              {currentCategory.items.map((item: any) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#FF6B6B]/30 transition-all">
                   {/* Tags */}
                   {item.tag && (
                      <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-lg text-[10px] font-bold tracking-wider text-white uppercase ${item.tagColor}`}>
                        {item.tag}
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.badgeColor}`}>
                      {item.badge}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 mt-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                         <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-[#FF6B6B] group-hover:bg-[#FFF0F0] transition-colors">
                            <item.icon className="w-8 h-8" />
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.subtitle}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-[#FF6B6B] font-bold text-lg">{item.price}</div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mt-3 mb-3 leading-relaxed">{item.desc}</p>

                        <div className="space-y-1 mb-4">
                          {item.features.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center text-xs text-gray-500">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                              {feat}
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => handleBookService(item.title, item.price)}
                          className="w-full sm:w-auto bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CHAT WIDGET --- */}
        <div className="relative">
           <div className={`
             fixed bottom-0 right-0 left-0 top-0 z-40 md:z-0 md:static md:block md:h-[600px] md:sticky md:top-24
             ${chatOpen ? 'block' : 'hidden md:block'}
           `}>
             <div className="bg-white md:rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden">
               {/* Mobile Header to close */}
               <div className="md:hidden bg-indigo-600 p-4 text-white flex justify-between items-center">
                 <span className="font-bold">Conciergerie</span>
                 <button onClick={() => setChatOpen(false)}><X className="w-6 h-6"/></button>
               </div>
               
               {/* Desktop Header */}
               <div className="hidden md:flex bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white justify-between items-center">
                 <div className="flex items-center">
                   <div className="relative">
                     <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0 border border-indigo-600"></div>
                     <MessageCircle className="w-5 h-5 mr-2 opacity-80" />
                   </div>
                   <span className="font-bold text-sm">Concierge IA</span>
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                 {messages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                       msg.role === 'user' 
                         ? 'bg-indigo-600 text-white rounded-br-none' 
                         : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-500 animate-pulse">
                        Écrit...
                      </div>
                    </div>
                 )}
               </div>

               <div className="p-3 bg-white border-t">
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Une question ?"
                     className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                   <button 
                     onClick={handleSend}
                     disabled={loading}
                     className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             </div>
           </div>

           {/* Mobile Chat Bubble Button */}
           {!chatOpen && (
             <button 
               onClick={() => setChatOpen(true)}
               className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition transform hover:scale-110 z-40"
             >
               <MessageCircle className="w-7 h-7" />
               <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
           )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal === 'wifi' && (
        <Modal title="Connexion WiFi" onClose={() => setActiveModal('none')}>
          <div className="p-6 text-center space-y-4">
             <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
               <Wifi className="w-8 h-8" />
             </div>
             <div className="space-y-2">
               <p className="text-gray-500 text-sm">Réseau (SSID)</p>
               <p className="text-xl font-bold text-gray-900 bg-gray-50 p-2 rounded-lg select-all">{property.wifiSsid || 'Non configuré'}</p>
             </div>
             <div className="space-y-2">
               <p className="text-gray-500 text-sm">Mot de passe</p>
               <p className="text-xl font-bold text-gray-900 bg-gray-50 p-2 rounded-lg select-all">{property.wifiPwd || 'Non configuré'}</p>
             </div>
             <p className="text-xs text-gray-400">Cliquez sur le texte pour copier</p>
          </div>
        </Modal>
      )}

      {activeModal === 'access' && (
        <Modal title="Instructions d'Accès" onClose={() => setActiveModal('none')}>
           <div className="p-6 space-y-4">
              <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                 <Key className="w-6 h-6 text-amber-600 mr-3" />
                 <div>
                    <h4 className="font-bold text-amber-800">Code Boîte à Clé</h4>
                    <p className="text-2xl font-mono font-bold text-amber-900 tracking-widest">{property.accessCode || '----'}</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <h4 className="font-bold text-gray-800">Procédure d'arrivée</h4>
                 <p className="text-sm text-gray-600 leading-relaxed">
                   1. Composez le code sur le boîtier situé à droite de la porte.<br/>
                   2. Abaissez le loquet noir pour ouvrir.<br/>
                   3. Prenez les clés et refermez le boîtier.
                 </p>
              </div>
           </div>
        </Modal>
      )}

      {activeModal === 'guide' && (
        <Modal title="Guide de la Maison" onClose={() => setActiveModal('none')}>
           <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                 <h4 className="font-bold text-gray-800 flex items-center"><Info className="w-4 h-4 mr-2 text-indigo-600"/> Règles Générales</h4>
                 <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Arrivée après 15h, Départ avant 11h.</li>
                    <li>Non fumeur à l'intérieur.</li>
                    <li>Pas de fêtes ni de soirées bruyantes après 22h.</li>
                    <li>Les animaux ne sont pas autorisés.</li>
                 </ul>
              </div>
              <div className="space-y-2">
                 <h4 className="font-bold text-gray-800 flex items-center"><Utensils className="w-4 h-4 mr-2 text-indigo-600"/> Ordures Ménagères</h4>
                 <p className="text-sm text-gray-600">
                    Les poubelles sont situées à l'extérieur, sur le côté gauche de la maison. Merci de trier le verre et le carton.
                 </p>
              </div>
           </div>
        </Modal>
      )}
      
      {activeModal === 'incident' && (
          <Modal title="Signaler un problème" onClose={() => setActiveModal('none')}>
              <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                      Une fuite ? Un appareil en panne ? Décrivez le problème ci-dessous pour que notre équipe intervienne rapidement.
                  </p>
                  <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                      placeholder="Ex: La climatisation du salon ne fonctionne plus..."
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      autoFocus
                  />
                  <button 
                      onClick={handleSubmitIncident}
                      disabled={!incidentDescription.trim()}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-md flex items-center justify-center"
                  >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Envoyer le signalement
                  </button>
              </div>
          </Modal>
      )}

      {/* INCIDENT DETAIL MODAL (Chat with host about issue) */}
      {activeModal === 'incident_detail' && selectedIncident && (
          <Modal 
              title={
                  <div className="flex flex-col">
                      <span>{selectedIncident.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit mt-1 ${
                          selectedIncident.status === 'NEW' ? 'bg-indigo-100 text-indigo-700' :
                          selectedIncident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                          {selectedIncident.status === 'NEW' ? 'Reçu' : selectedIncident.status === 'IN_PROGRESS' ? 'Pris en charge' : 'Résolu'}
                      </span>
                  </div>
              } 
              onClose={() => setActiveModal('none')}
          >
              <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {/* Original description */}
                      <div className="flex justify-end">
                          <div className="max-w-[85%] bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm">
                              {selectedIncident.description}
                          </div>
                      </div>
                      
                      {/* Messages */}
                      {(selectedIncident.messages || []).map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.author === reservation.guestName ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                  msg.author === reservation.guestName 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                              }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-4 bg-white border-t border-gray-100">
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Répondre..."
                              value={incidentReply}
                              onChange={(e) => setIncidentReply(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleReplyToIncident()}
                          />
                          <button 
                              onClick={handleReplyToIncident}
                              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                          >
                              <Send className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
          </Modal>
      )}

      {activeModal === 'payment' && selectedService && (
        <Modal title="Confirmation" onClose={() => setActiveModal('none')}>
           <div className="p-6 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in zoom-in duration-300">
                 <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Demande envoyée !</h3>
                <p className="text-gray-500 mt-2">
                  Vous avez demandé : <span className="font-bold text-gray-800">{selectedService.name}</span> ({selectedService.price}).
                  <br/>Votre concierge reviendra vers vous pour confirmer.
                </p>
              </div>
              <button 
                onClick={() => setActiveModal('none')}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
              >
                Retour à l'accueil
              </button>
           </div>
        </Modal>
      )}

    </div>
  );
};

export const GuestPortal: React.FC<{
  initialReservationId?: string | null;
  onCreateIncident?: (incident: Incident) => void;
  incidents?: Incident[];
}> = ({ initialReservationId, onCreateIncident, incidents }) => {
  const reservation = initialReservationId 
    ? MOCK_RESERVATIONS.find(r => r.id === initialReservationId)
    : MOCK_RESERVATIONS[0]; 

  if (!reservation) return <div className="p-8 text-center text-gray-500">Aucune réservation trouvée.</div>;

  const property = MOCK_PROPERTIES.find(p => p.id === reservation.propertyId);
  
  if (!property) return <div className="p-8 text-center text-gray-500">Propriété introuvable.</div>;

  return (
    <GuestPortalUI 
       reservation={reservation} 
       property={property} 
       onCreateIncident={onCreateIncident}
       incidents={incidents}
    />
  );
};
