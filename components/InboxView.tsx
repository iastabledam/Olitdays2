
import React, { useState } from 'react';
import { Conversation, ChatMessage, Property, Reservation, GuestProfile, Incident, IncidentStatus, IncidentPriority } from '../types';
import { MOCK_INCIDENTS } from '../constants'; // Import mock data
import { 
  Search, Filter, Send, Paperclip, Zap, Sparkles, 
  MoreVertical, Phone, Mail, Calendar, MapPin, 
  Edit2, User, MessageSquare, Check, X,
  Key, RefreshCw, Smartphone, ExternalLink, Link, Archive, Folder,
  AlertTriangle, Plus, ArrowLeft, Copy
} from 'lucide-react';

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'Airbnb') return <span className="text-[#FF5A5F] font-bold text-xs tracking-tighter">Airbnb</span>;
  if (platform === 'Booking') return <span className="text-[#003580] font-bold text-xs tracking-tighter">Booking</span>;
  if (platform === 'Vrbo') return <span className="text-[#3b5998] font-bold text-xs tracking-tighter">Vrbo</span>;
  return <span className="text-emerald-600 font-bold text-xs tracking-tighter">Direct</span>;
};

interface InboxViewProps {
  conversations: Conversation[];
  onUpdateConversations: (conversations: Conversation[]) => void;
  properties: Property[];
  reservations: Reservation[];
  guests: GuestProfile[]; // Added guests prop
  onNavigateToGuest: (guestId: string) => void; // Added nav handler
  onNavigateToGuestPortal?: (reservationId: string) => void; // New prop for portal nav
  onNavigateToIncidents?: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({ conversations, onUpdateConversations, properties, reservations, guests, onNavigateToGuest, onNavigateToGuestPortal, onNavigateToIncidents }) => {
  // Initialize with null on mobile to show list first, or first item on desktop
  const [selectedId, setSelectedId] = useState<string | null>(
      window.innerWidth >= 768 && conversations.length > 0 ? conversations[0].id : null
  );
  const [filterText, setFilterText] = useState('');
  const [inputText, setInputText] = useState('');
  const [notes, setNotes] = useState('');
  const [showMenu, setShowMenu] = useState(false); // State for 3-dots dropdown
  
  // Local state to simulate automation updates without full backend roundtrip for demo
  const [sendingCode, setSendingCode] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  // Local state for incidents (simulation)
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const selectedConversation = conversations.find(c => c.id === selectedId);
  const selectedProperty = selectedConversation 
    ? properties.find(p => p.id === selectedConversation.propertyId) 
    : null;
  const selectedReservation = selectedConversation?.reservationId
    ? reservations.find(r => r.id === selectedConversation.reservationId)
    : null;

  // Filter incidents for this guest/reservation
  const activeIncidents = incidents.filter(i => 
      (selectedReservation && i.reservationId === selectedReservation.id) || 
      (i.guestName === selectedConversation?.guestName)
  );

  // Derived state for filtered list
  const filteredConversations = conversations.filter(c => 
    c.guestName.toLowerCase().includes(filterText.toLowerCase()) ||
    (properties.find(p => p.id === c.propertyId)?.name || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'model', // Model here means "Host/User" responding
      text: inputText,
      timestamp: Date.now()
    };

    const updatedConversations = conversations.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    });

    onUpdateConversations(updatedConversations);
    setInputText('');
  };

  const handleAiGenerate = () => {
    // Simulation of AI generation
    const suggestion = "Bonjour ! Merci pour votre message. Le code du portail est le 4589. N'hésitez pas si vous avez d'autres questions. Cordialement.";
    setInputText(suggestion);
  };

  const handleGoToGuestProfile = () => {
      if (!selectedConversation) return;
      const guest = guests.find(g => g.fullName === selectedConversation.guestName);
      if (guest) {
          onNavigateToGuest(guest.id);
      } else {
          alert("Profil voyageur introuvable.");
      }
      setShowMenu(false);
  };

  const handleGoToPortal = () => {
      if (selectedReservation?.id && onNavigateToGuestPortal) {
          onNavigateToGuestPortal(selectedReservation.id);
      } else {
          alert("Aucune réservation active pour ce portail.");
      }
      setShowMenu(false);
  };

  const handleCreateTicket = () => {
      if(!selectedProperty || !selectedConversation) return;
      
      const newTicket: Incident = {
          id: `inc-${Date.now()}`,
          tenantId: selectedConversation.tenantId,
          title: 'Ticket depuis la messagerie',
          description: 'Problème signalé par le client via le chat.',
          propertyId: selectedProperty.id,
          reservationId: selectedReservation?.id,
          guestName: selectedConversation.guestName,
          reportedAt: new Date().toISOString(),
          status: IncidentStatus.NEW,
          priority: IncidentPriority.MEDIUM,
          category: 'OTHER',
          messages: []
      };
      
      setIncidents([newTicket, ...incidents]);
      alert("Un ticket d'incident a été créé !");
  };

  const handleCopyLink = () => {
      if(!selectedReservation) return;
      
      // Construct the deep link
      const link = `${window.location.origin}${window.location.pathname}?guest_ref=${selectedReservation.id}`;
      
      navigator.clipboard.writeText(link).then(() => {
          alert("Lien copié dans le presse-papier !\n\nCollez ce lien dans un nouvel onglet pour tester la vue voyageur.");
      });
  };

  // --- AUTOMATION ACTIONS ---

  const handleSendKeyCode = () => {
    if (!selectedConversation) return;
    setSendingCode(true);
    setTimeout(() => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'model',
            text: `(Auto) Bonjour ${selectedConversation.guestName.split(' ')[0]}, voici votre code d'accès pour la boîte à clé : ${selectedProperty?.accessCode || '1234'}. Bon séjour !`,
            timestamp: Date.now()
        };
        const updatedConversations = conversations.map(c => {
            if (c.id === selectedId) return { ...c, messages: [...c.messages, newMessage] };
            return c;
        });
        onUpdateConversations(updatedConversations);
        if(selectedReservation) selectedReservation.keyCodeSent = true;
        setSendingCode(false);
    }, 1500);
  };

  const handleSendWhatsappLink = () => {
      if (!selectedConversation || !selectedReservation) return;
      setSendingWhatsapp(true);
      const guestLink = `https://app.hostflow.com/guest/${selectedReservation.id}`;
      const message = `Bonjour ${selectedConversation.guestName.split(' ')[0]} ! Voici votre espace voyageur personnel : ${guestLink}. À bientôt !`;
      const encodedMsg = encodeURIComponent(message);
      setTimeout(() => {
          setSendingWhatsapp(false);
          selectedReservation.guestLinkSent = true; 
          window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
      }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Conversation List */}
      {/* Mobile Logic: Hidden if a conversation is selected */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex-col bg-gray-50/50 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header / Filter */}
        <div className="p-4 border-b border-gray-200 bg-white">
           <h2 className="text-lg font-bold text-gray-800 mb-3">Boîte de réception</h2>
           <div className="flex gap-2">
             <div className="relative flex-1">
               <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Rechercher..." 
                 className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                 value={filterText}
                 onChange={(e) => setFilterText(e.target.value)}
               />
             </div>
             <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
               <Filter className="w-4 h-4" />
             </button>
           </div>
           
           {/* Quick Filters (Tabs) */}
           <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
             <button className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">Tous</button>
             <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap hover:border-gray-300">Non lus</button>
             <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap hover:border-gray-300">À venir</button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const propertyName = properties.find(p => p.id === conv.propertyId)?.name;
            
            return (
              <div 
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors relative ${selectedId === conv.id ? 'bg-indigo-50 border-indigo-100' : ''}`}
              >
                {conv.unreadCount > 0 && (
                  <span className="absolute right-4 top-4 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                )}
                
                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-gray-900 truncate max-w-[120px]">{conv.guestName}</span>
                     {conv.status === 'staying' && <span className="w-2 h-2 rounded-full bg-green-500" title="Actuellement présent"></span>}
                   </div>
                   <span className="text-[10px] text-gray-400">
                     {new Date(lastMsg.timestamp).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}
                   </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-1 truncate font-medium">{propertyName}</p>
                
                <p className={`text-sm line-clamp-2 ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {lastMsg.role === 'model' && <span className="text-indigo-600 mr-1">Vous:</span>}
                  {lastMsg.text}
                </p>

                <div className="mt-2 flex items-center justify-between">
                   <div className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm inline-block">
                     <PlatformIcon platform={conv.platform} />
                   </div>
                   {conv.status === 'inquiry' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demande</span>}
                   {conv.status === 'booked' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Réservé</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: Chat Area */}
      {/* Mobile Logic: Only shown if conversation selected */}
      <div className={`flex-1 flex-col bg-white min-w-0 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0">
               <div className="flex items-center gap-3">
                  {/* Back Button (Mobile Only) */}
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div 
                    onClick={handleGoToGuestProfile} 
                    className="relative cursor-pointer group"
                    title="Voir le dossier client"
                  >
                      <img src={selectedConversation.guestAvatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 group-hover:border-indigo-300 transition" />
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition"></div>
                  </div>
                  <div>
                    <h3 onClick={handleGoToGuestProfile} className="font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition truncate max-w-[150px]">{selectedConversation.guestName}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="flex items-center mr-2">
                         <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                         En ligne
                      </span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <button className="hidden md:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                   <Phone className="w-5 h-5" />
                 </button>
                 
                 {/* 3 DOTS MENU */}
                 <div className="relative">
                     <button 
                       onClick={() => setShowMenu(!showMenu)}
                       className={`p-2 rounded-full transition ${showMenu ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                     >
                       <MoreVertical className="w-5 h-5" />
                     </button>
                     
                     {showMenu && (
                         <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <div className="py-1">
                                 <button 
                                   onClick={handleGoToGuestProfile}
                                   className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                 >
                                     <Folder className="w-4 h-4 mr-2 text-indigo-600" />
                                     Voir le dossier client
                                 </button>
                                 <button 
                                   onClick={handleGoToPortal}
                                   className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                 >
                                     <ExternalLink className="w-4 h-4 mr-2 text-indigo-600" />
                                     Voir le portail voyageur
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
               {selectedConversation.messages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'model' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === 'model' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                       <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                         msg.role === 'model' 
                           ? 'bg-indigo-600 text-white rounded-br-none' 
                           : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                       }`}>
                         {msg.text}
                       </div>
                       <span className="text-[10px] text-gray-400 mt-1 px-1">
                         {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
               {/* Toolbar - Hidden on small mobile to save space */}
               <div className="hidden md:flex items-center gap-2 mb-2">
                  <button 
                    className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                    onClick={handleAiGenerate}
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Générer réponse IA
                  </button>
                  <button className="flex items-center px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                    <Zap className="w-3 h-3 mr-1.5 text-amber-500" />
                    Réponses rapides
                  </button>
               </div>
               
               <div className="relative">
                 <textarea 
                   className="w-full border border-gray-300 rounded-xl pl-4 pr-12 py-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                   rows={2}
                   placeholder="Écrivez votre message..."
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => {
                     if(e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSendMessage();
                     }
                   }}
                 />
                 <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={handleSendMessage}
                      className={`p-1.5 rounded-lg transition-colors ${inputText.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR: Details */}
      {/* Hidden on Mobile/Tablet (lg breakpoint) */}
      {selectedConversation && (
        <div className="hidden lg:flex w-80 border-l border-gray-200 bg-white flex-col overflow-y-auto">
           {/* Reservation Card */}
           <div className="p-6 border-b border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Réservation {selectedReservation?.id || 'N/A'}</h3>
             
             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
                <div className="flex items-start gap-3 mb-3">
                   <img src={selectedProperty?.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                   <div>
                     <p className="font-bold text-sm text-gray-800 line-clamp-1">{selectedProperty?.name}</p>
                     <p className="text-xs text-gray-500">{selectedProperty?.address.split(',')[0]}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                   <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">Arrivée</p>
                      <p className="font-bold text-gray-800">
                        {selectedReservation ? new Date(selectedReservation.startDate).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : '-'}
                      </p>
                   </div>
                   <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">Départ</p>
                      <p className="font-bold text-gray-800">
                         {selectedReservation ? new Date(selectedReservation.endDate).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : '-'}
                      </p>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase">Total</span>
                      <span className="font-bold text-gray-900">{selectedReservation?.totalAmount}€</span>
                   </div>
                   <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                     selectedConversation.status === 'staying' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                   }`}>
                     {selectedConversation.status === 'staying' ? 'EN SÉJOUR' : 'RÉSERVÉ'}
                   </span>
                </div>
             </div>
           </div>

           {/* --- INCIDENTS SECTION --- */}
           <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tickets Support</h3>
                 <button onClick={handleCreateTicket} className="text-xs text-indigo-600 font-bold hover:underline flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> Créer
                 </button>
              </div>
              <div className="space-y-2">
                 {activeIncidents.length > 0 ? (
                    activeIncidents.map(inc => (
                        <div key={inc.id} onClick={onNavigateToIncidents} className="bg-red-50 border border-red-100 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                    <span className="font-bold text-xs text-red-800 truncate max-w-[140px]">{inc.title}</span>
                                </div>
                                <span className="text-[10px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-100">{inc.status === 'NEW' ? 'Nouveau' : 'En cours'}</span>
                            </div>
                        </div>
                    ))
                 ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Check className="w-6 h-6 mx-auto text-green-400 mb-1" />
                        <p className="text-xs text-gray-400">Aucun problème signalé</p>
                    </div>
                 )}
              </div>
           </div>

           {/* AUTOMATION STATUS */}
           <div className="p-6 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Statut Automatisations</h3>
              <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center">
                          <Key className="w-4 h-4 text-gray-500 mr-2" />
                          <div>
                              <p className="text-xs font-bold text-gray-700">Code Boîte à Clé</p>
                              {selectedReservation?.keyCodeSent ? (
                                  <span className="text-[10px] text-green-600 flex items-center"><Check className="w-3 h-3 mr-1"/> Envoyé</span>
                              ) : (
                                  <span className="text-[10px] text-amber-600">En attente</span>
                              )}
                          </div>
                      </div>
                      {!selectedReservation?.keyCodeSent && (
                          <button onClick={handleSendKeyCode} disabled={sendingCode} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition">
                              <RefreshCw className={`w-4 h-4 ${sendingCode ? 'animate-spin' : ''}`} />
                          </button>
                      )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                              <Smartphone className="w-4 h-4 text-gray-500 mr-2" />
                              <div>
                                  <p className="text-xs font-bold text-gray-700">Espace Voyageur</p>
                                  {selectedReservation?.guestLinkSent ? (
                                      <span className="text-[10px] text-green-600 flex items-center"><Check className="w-3 h-3 mr-1"/> Lien envoyé</span>
                                  ) : (
                                      <span className="text-[10px] text-gray-400">Non partagé</span>
                                  )}
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={handleSendWhatsappLink} disabled={sendingWhatsapp} className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-1.5 rounded-md font-bold text-xs flex items-center justify-center transition shadow-sm">
                             {sendingWhatsapp ? <RefreshCw className="w-3 h-3 animate-spin mr-1.5"/> : "Envoyer WhatsApp"}
                          </button>
                          <button 
                            onClick={handleCopyLink} 
                            className="px-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-md flex items-center justify-center transition"
                            title="Copier le lien d'accès"
                          >
                             <Copy className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
           </div>

           {/* Guest Details */}
           <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Détails de l'invité</h3>
                 <button className="flex items-center text-xs text-indigo-600 hover:underline"><Edit2 className="w-3 h-3 mr-1" /> Éditer</button>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600" onClick={handleGoToGuestProfile}>{selectedConversation.guestName}</p>
                      <p className="text-xs text-gray-500">Principal</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600 truncate">{selectedConversation.guestEmail || 'email@masqué.com'}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{selectedConversation.guestPhone || '+33 6 .. .. .. ..'}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
