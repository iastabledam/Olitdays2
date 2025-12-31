
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PROPERTIES, MOCK_RESERVATIONS } from '../constants';
import { chatWithConcierge } from '../services/geminiService';
import { ChatMessage, Reservation, Property, Incident, IncidentStatus, IncidentPriority } from '../types';
import { 
  Wifi, MapPin, Coffee, Send, User, MessageCircle, Key, 
  Utensils, Star, Info, PlayCircle, X, CreditCard, Check, ChevronRight,
  Clock, Car, Ship, Plane, ShoppingCart, ChefHat, CheckCircle, ArrowLeft, Eye,
  AlertTriangle, MessageSquare, Video, Lock, ChevronLeft
} from 'lucide-react';

// --- MODAL COMPONENT ---
const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100 max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b shrink-0">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-0 overflow-y-auto flex-1">
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
  const [activeModal, setActiveModal] = useState<'none' | 'wifi' | 'access' | 'guide' | 'payment' | 'incident' | 'incident_detail' | 'stripe_payment'>('none');
  const [activeTab, setActiveTab] = useState<'flexibility' | 'transport' | 'restauration'>('flexibility');
  const [selectedService, setSelectedService] = useState<{name: string, price: string} | null>(null);
  
  // Payment Processing State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Incident Form State
  const [incidentDescription, setIncidentDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentReply, setIncidentReply] = useState('');
  
  // Chat Scroll Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter incidents for this reservation
  const myIncidents = (incidents || []).filter(inc => 
      inc.reservationId === reservation.id || inc.guestName === reservation.guestName
  );

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Bonjour ${reservation.guestName.split(' ')[0]} ! Je suis votre concierge virtuel pour ${property.name}. Je connais tous les détails du logement (Wifi, accès, équipements). Comment puis-je vous aider ?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

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
          price: "49.00€",
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
          price: "39.00€",
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
          price: "290.00€",
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
          price: "150.00€",
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
          price: "25.00€",
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
          price: "350.00€",
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

  const handleStripePayment = () => {
      setIsProcessingPayment(true);
      // Simulate API call to Stripe
      setTimeout(() => {
          setIsProcessingPayment(false);
          setPaymentSuccess(true);
          // Auto close after success
          setTimeout(() => {
              setPaymentSuccess(false);
              setActiveModal('none');
              alert(`Paiement de ${selectedService?.price} confirmé ! Vous recevrez un email de confirmation.`);
          }, 2000);
      }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const systemInstruction = `
      Tu es l'assistant concierge virtuel intelligent pour le logement "${property.name}".
      Ton but est d'aider le voyageur (${reservation.guestName}) durant son séjour de manière autonome.
      
      Voici les informations DÉTAILLÉES sur la propriété :
      - Adresse : ${property.address}
      - Wifi SSID : "${property.wifiSsid || 'Non renseigné'}" / Pass : "${property.wifiPwd || 'Non renseigné'}"
      - Code Entrée : ${property.accessCode || 'Contacter l\'hôte'}
      - Description : ${property.description || ''}
      - Règles : ${property.houseRules || 'Pas de règles spécifiques'}
      
      Instructions :
      1. Sois poli, chaleureux et concis.
      2. Réponds directement aux questions sur le logement.
      3. Suggère les services premium si pertinent.
    `;

    const history = messages.slice(-10).map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithConcierge(userMsg.text, history, systemInstruction);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleSubmitIncident = () => {
      if(!incidentDescription.trim()) return;
      
      const newIncident: Incident = {
          id: `inc-${Date.now()}`,
          tenantId: property.tenantId,
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
      setSelectedIncident(updated);
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

      {/* --- MY REQUESTS / INCIDENTS SECTION --- */}
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

      {/* --- SERVICES & CHAT SECTIONS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Reservation Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-indigo-600"/> Mon Séjour</h2>
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
            </div>
          </div>

          {/* Premium Services (Restored) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500" /> Services Premium
              </h2>
              <p className="text-sm text-gray-500 mt-1">Améliorez votre séjour avec nos services exclusifs.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mt-4 px-6 overflow-x-auto gap-4 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('flexibility')}
                className={`pb-3 text-sm font-medium transition whitespace-nowrap ${activeTab === 'flexibility' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Flexibilité
              </button>
              <button 
                onClick={() => setActiveTab('transport')}
                className={`pb-3 text-sm font-medium transition whitespace-nowrap ${activeTab === 'transport' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Transports
              </button>
              <button 
                onClick={() => setActiveTab('restauration')}
                className={`pb-3 text-sm font-medium transition whitespace-nowrap ${activeTab === 'restauration' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Restauration
              </button>
            </div>

            {/* List */}
            <div className="p-6 grid gap-4">
               {currentCategory.items.map(item => (
                 <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition group bg-white">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          {item.tag && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${item.tagColor}`}>
                              {item.tag}
                            </span>
                          )}
                       </div>
                       <div className="flex items-center text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                          {item.price}
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                       <div className="bg-gray-100 p-3 rounded-lg text-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{item.title}</h3>
                          <p className="text-sm font-medium text-gray-500">{item.subtitle}</p>
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.desc}</p>
                          
                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mt-3">
                             {item.features.map((feat, idx) => (
                               <span key={idx} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-600 flex items-center">
                                 <Check className="w-3 h-3 mr-1 text-green-500" /> {feat}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => handleBookService(item.title, item.price)}
                      className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-600 transition shadow-sm"
                    >
                      Réserver
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
        
        {/* Chat Widget (Restored) */}
        <div className="relative">
           <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col h-[600px]">
              <div className="bg-indigo-600 p-4 text-white">
                 <h3 className="font-bold flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" /> Concierge IA
                 </h3>
                 <p className="text-xs opacity-80 mt-1">Disponible 24/7 pour vous aider</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                 {messages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
                 {loading && (
                   <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                         <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                         </div>
                      </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>

              <div className="p-3 bg-white border-t border-gray-100">
                 <div className="relative">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Posez une question..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                      onClick={handleSend}
                      className="absolute right-1.5 top-1.5 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
                      disabled={!input.trim() || loading}
                    >
                       <Send className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
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
          </div>
        </Modal>
      )}

      {activeModal === 'access' && (
        <Modal title="Instructions d'Accès" onClose={() => setActiveModal('none')}>
           <div className="p-0">
              
              {/* Video Player Section */}
              {property.accessVideoUrl ? (
                  <div className="w-full bg-black aspect-video relative">
                      <video 
                        key={property.accessVideoUrl}
                        controls 
                        className="w-full h-full"
                        autoPlay={false}
                        playsInline
                        preload="metadata"
                      >
                          <source src={property.accessVideoUrl} type="video/mp4" />
                          <source src={property.accessVideoUrl} type="video/webm" />
                          <source src={property.accessVideoUrl} type="video/quicktime" />
                          Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                  </div>
              ) : (
                  <div className="w-full bg-gray-100 aspect-video flex items-center justify-center text-gray-400">
                      <p className="text-sm">Aucune vidéo disponible</p>
                  </div>
              )}

              <div className="p-6 space-y-4">
                  {property.accessVideoUrl && (
                      <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-2">
                          <PlayCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">Regardez la vidéo ci-dessus pour vous guider.</span>
                      </div>
                  )}

                  <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                     <Key className="w-6 h-6 text-amber-600 mr-3 shrink-0" />
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
           </div>
        </Modal>
      )}

      {activeModal === 'payment' && selectedService && (
        <Modal title="Réservation de service" onClose={() => setActiveModal('none')}>
           <div className="p-6">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                 <h4 className="font-bold text-indigo-900">{selectedService.name}</h4>
                 <p className="text-indigo-700">{selectedService.price}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Précisions..." />
                 </div>
              </div>

              <button 
                onClick={() => {
                    // Switch to Stripe Mock View
                    setActiveModal('stripe_payment');
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md"
              >
                 Confirmer la demande
              </button>
           </div>
        </Modal>
      )}

      {/* --- MOCK STRIPE PAYMENT MODAL --- */}
      {activeModal === 'stripe_payment' && selectedService && (
          <div className="fixed inset-0 z-[100] bg-gray-100 flex animate-in slide-in-from-bottom-10 duration-300">
              
              {/* LEFT: Summary */}
              <div className="w-1/2 p-12 hidden md:flex flex-col justify-between border-r border-gray-200 bg-white relative overflow-hidden">
                  <div className="z-10 relative">
                      <button onClick={() => setActiveModal('payment')} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition">
                          <ChevronLeft className="w-5 h-5 mr-1" /> Retour
                      </button>
                      
                      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Payer {property.name}</p>
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedService.price}</h2>
                      
                      <div className="space-y-4 mt-8">
                          <div className="flex justify-between items-center py-3 border-b border-gray-100">
                              <span className="font-medium text-gray-700">{selectedService.name}</span>
                              <span className="font-bold text-gray-900">{selectedService.price}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-100">
                              <span className="text-gray-500">TVA (20%)</span>
                              <span className="text-gray-500">Inclus</span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                              <span className="font-bold text-gray-900">Total à payer</span>
                              <span className="font-bold text-gray-900">{selectedService.price}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="z-10 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Propulsé par</span>
                          <span className="font-bold text-gray-600 text-sm">stripe</span>
                      </div>
                  </div>

                  {/* Decorative Circle */}
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full z-0"></div>
              </div>

              {/* RIGHT: Payment Form */}
              <div className="flex-1 p-6 md:p-12 flex flex-col justify-center bg-[#f7f9fc]">
                  <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
                      {paymentSuccess ? (
                          <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-300">
                              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                  <Check className="w-10 h-10 text-green-600" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800 mb-2">Paiement réussi !</h2>
                              <p className="text-gray-500 text-center">Merci de votre confiance. Vous allez être redirigé...</p>
                          </div>
                      ) : (
                          <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Payer par carte</h3>
                                <div className="flex gap-2">
                                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleStripePayment(); }}>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        defaultValue={reservation.guestName.toLowerCase().replace(' ', '.') + "@email.com"}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition bg-white text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Informations de carte</label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#635BFF] transition bg-white">
                                        <div className="flex items-center px-4 py-3 border-b border-gray-200">
                                            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                            <input 
                                                type="text" 
                                                placeholder="0000 0000 0000 0000" 
                                                className="flex-1 outline-none font-mono text-gray-900 bg-white"
                                            />
                                        </div>
                                        <div className="flex divide-x divide-gray-200">
                                            <input 
                                                type="text" 
                                                placeholder="MM / AA" 
                                                className="w-1/2 px-4 py-3 outline-none font-mono text-center text-gray-900 bg-white"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="CVC" 
                                                className="w-1/2 px-4 py-3 outline-none font-mono text-center text-gray-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom sur la carte</label>
                                    <input 
                                        type="text" 
                                        defaultValue={reservation.guestName}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition bg-white text-gray-900"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isProcessingPayment}
                                    className="w-full bg-[#635BFF] hover:bg-[#5851E1] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4 flex justify-center items-center"
                                >
                                    {isProcessingPayment ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" /> Payer {selectedService.price}
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center">
                                <Lock className="w-3 h-3 mr-1" /> Paiement sécurisé via Stripe
                            </p>
                          </>
                      )}
                  </div>
                  
                  {/* Mobile Back Button */}
                  <button onClick={() => setActiveModal('payment')} className="md:hidden mt-6 text-gray-500 underline text-sm text-center">
                      Annuler et retour
                  </button>
              </div>
          </div>
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
                 </ul>
              </div>
              
              <div className="space-y-2">
                 <h4 className="font-bold text-gray-800 flex items-center"><Utensils className="w-4 h-4 mr-2 text-indigo-600"/> Appareils</h4>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    <p className="font-medium text-gray-900 mb-1">Machine à café</p>
                    <p className="text-gray-600">Remplir le réservoir d'eau, insérer une capsule, fermer le levier et appuyer sur le bouton tasse.</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    <p className="font-medium text-gray-900 mb-1">Lave-vaisselle</p>
                    <p className="text-gray-600">Utiliser une tablette tout-en-un. Programme ECO recommandé.</p>
                 </div>
              </div>
           </div>
        </Modal>
      )}
      
      {activeModal === 'incident' && (
          <Modal title="Signaler un problème" onClose={() => setActiveModal('none')}>
              <div className="p-6 space-y-4">
                  <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 bg-white text-gray-900"
                      placeholder="Ex: La climatisation du salon ne fonctionne plus..."
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      autoFocus
                  />
                  <button onClick={handleSubmitIncident} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-md flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Envoyer le signalement
                  </button>
              </div>
          </Modal>
      )}

      {/* Incident Detail Modal */}
      {activeModal === 'incident_detail' && selectedIncident && (
          <Modal title="Détail de la demande" onClose={() => setActiveModal('none')}>
              <div className="flex flex-col h-[500px]">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{selectedIncident.title}</h4>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              selectedIncident.status === 'NEW' ? 'bg-indigo-100 text-indigo-700' :
                              selectedIncident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                              {selectedIncident.status === 'NEW' ? 'Envoyé' : selectedIncident.status === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
                          </span>
                      </div>
                      <p className="text-xs text-gray-500">Envoyé le {new Date(selectedIncident.reportedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                      {/* Original description */}
                      <div className="flex justify-end">
                          <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                              {selectedIncident.description}
                          </div>
                      </div>
                      
                      {/* Messages loop */}
                      {(selectedIncident.messages || []).map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.author === reservation.guestName ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                                  msg.author === reservation.guestName 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
                              }`}>
                                  <p className="text-xs opacity-70 mb-1 font-bold">{msg.author === reservation.guestName ? 'Moi' : 'Support'}</p>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-white">
                      <div className="relative">
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Répondre..."
                              value={incidentReply}
                              onChange={(e) => setIncidentReply(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleReplyToIncident()}
                          />
                          <button 
                              onClick={handleReplyToIncident}
                              disabled={!incidentReply.trim()}
                              className="absolute right-1 top-1 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                          >
                              <Send className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
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
  properties: Property[];
  reservations: Reservation[];
}> = ({ initialReservationId, onCreateIncident, incidents, properties, reservations }) => {
  const [reservationId, setReservationId] = useState<string | null>(initialReservationId || null);
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReservationId) {
        setReservationId(initialReservationId);
    }
  }, [initialReservationId]);

  const handleLogin = () => {
      const res = reservations.find(r => r.id === loginCode || r.guestName.toLowerCase() === loginCode.toLowerCase());
      if (res) {
          setReservationId(res.id);
          setError('');
      } else {
          setError('Réservation introuvable (Essayer r1, r5...).');
      }
  };

  if (reservationId) {
      const reservation = reservations.find(r => r.id === reservationId);
      const property = properties.find(p => p.id === reservation?.propertyId);

      if (reservation && property) {
          return (
              <GuestPortalUI 
                  reservation={reservation} 
                  property={property} 
                  incidents={incidents}
                  onCreateIncident={onCreateIncident}
                  onExitPreview={() => setReservationId(null)}
              />
          );
      }
  }

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
                  <User className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue</h1>
              <p className="text-gray-500 mb-8">Accédez à votre espace voyageur pour gérer votre séjour.</p>
              
              <div className="space-y-4">
                  <div className="text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Référence Réservation</label>
                      <input 
                          type="text" 
                          placeholder="Ex: r1" 
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-900"
                          value={loginCode}
                          onChange={(e) => setLoginCode(e.target.value)}
                      />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button 
                      onClick={handleLogin}
                      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-md"
                  >
                      Accéder au séjour
                  </button>
              </div>
              
              <div className="mt-8 text-xs text-gray-400">
                  Propulsé par HostFlow
              </div>
          </div>
      </div>
  );
};
