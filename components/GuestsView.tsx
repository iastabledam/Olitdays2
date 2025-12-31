
import React, { useState, useEffect } from 'react';
import { MOCK_GUESTS, MOCK_RESERVATIONS } from '../constants';
import { GuestProfile } from '../types';
import { 
  User, Search, Mail, Phone, MapPin, Calendar, 
  CreditCard, ShieldCheck, ShieldAlert, Star, History,
  Tag, FileText, CheckCircle, Clock, X, MessageSquare, AlertTriangle, Send, ExternalLink
} from 'lucide-react';

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'Airbnb') return <span className="text-[#FF5A5F] font-bold text-xs tracking-tighter">Airbnb</span>;
  if (platform === 'Booking') return <span className="text-[#003580] font-bold text-xs tracking-tighter">Booking</span>;
  if (platform === 'Vrbo') return <span className="text-[#3b5998] font-bold text-xs tracking-tighter">Vrbo</span>;
  return <span className="text-emerald-600 font-bold text-xs tracking-tighter">Direct</span>;
};

// Helper to check for masked emails
const isEmailMasked = (email?: string) => {
    if (!email) return true;
    return email.includes('guest.airbnb.com') || email.includes('guest.booking.com');
};

interface GuestsViewProps {
    initialGuestId?: string | null;
    onNavigateToGuestPortal?: (reservationId: string) => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({ initialGuestId, onNavigateToGuestPortal }) => {
  const [guests, setGuests] = useState<GuestProfile[]>(MOCK_GUESTS);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(initialGuestId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vip' | 'issue'>('all');
  const [enrichmentSent, setEnrichmentSent] = useState(false);

  useEffect(() => {
      if (initialGuestId) {
          setSelectedGuestId(initialGuestId);
      }
  }, [initialGuestId]);

  const selectedGuest = guests.find(g => g.id === selectedGuestId);

  // Filter Logic
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ? true : 
                          filterType === 'vip' ? g.tags.includes('VIP') : 
                          (!g.idCardVerified || isEmailMasked(g.email)); // Updated issue filter
    return matchesSearch && matchesFilter;
  });

  const handleSendEnrichmentRequest = () => {
      setEnrichmentSent(true);
      setTimeout(() => {
          setEnrichmentSent(false);
          alert(`Demande d'informations envoyée à ${selectedGuest?.fullName} via la messagerie ${selectedGuest?.source}.`);
      }, 1500);
  };

  const handleOpenPortal = () => {
      if (!selectedGuest || !onNavigateToGuestPortal) return;
      // Find a relevant reservation (active or future preferred)
      const relevantReservation = MOCK_RESERVATIONS.find(r => 
          r.guestName === selectedGuest.fullName && 
          (r.status === 'confirmed' || r.status === 'checked-in')
      );

      if (relevantReservation) {
          onNavigateToGuestPortal(relevantReservation.id);
      } else {
          // If no active/future, try finding ANY reservation to at least show something (e.g. past)
          const pastReservation = MOCK_RESERVATIONS.find(r => r.guestName === selectedGuest.fullName);
          if (pastReservation) {
              onNavigateToGuestPortal(pastReservation.id);
          } else {
              alert("Aucune réservation trouvée pour ce voyageur pour afficher le portail.");
          }
      }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 relative">
      
      {/* LEFT COLUMN: Guest List */}
      <div className={`flex-1 flex flex-col space-y-4 ${selectedGuestId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header & Filters */}
        <div className="flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-gray-800">Voyageurs</h1>
             <p className="text-gray-500 text-sm">Fichier client unifié (Airbnb, Booking, Direct).</p>
           </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
           <Search className="w-5 h-5 text-gray-400 ml-2" />
           <input 
             type="text" 
             placeholder="Rechercher un voyageur..." 
             className="flex-1 outline-none text-sm p-2 bg-white text-gray-900"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
           <button 
             onClick={() => setFilterType('all')}
             className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
           >
             Tous
           </button>
           <button 
             onClick={() => setFilterType('vip')}
             className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterType === 'vip' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white border border-gray-200 text-gray-600'}`}
           >
             VIP
           </button>
           <button 
             onClick={() => setFilterType('issue')}
             className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterType === 'issue' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white border border-gray-200 text-gray-600'}`}
           >
             Dossiers Incomplets
           </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
           {filteredGuests.map(guest => {
             const hasIssues = !guest.idCardVerified || isEmailMasked(guest.email);
             
             return (
               <div 
                 key={guest.id}
                 onClick={() => setSelectedGuestId(guest.id)}
                 className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all group relative ${selectedGuestId === guest.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
               >
                  {hasIssues && (
                      <div className="absolute top-4 right-4 flex gap-1">
                          {isEmailMasked(guest.email) && <div className="w-2 h-2 rounded-full bg-amber-500" title="Email masqué"></div>}
                          {!guest.idCardVerified && <div className="w-2 h-2 rounded-full bg-red-500" title="Pièce ID manquante"></div>}
                      </div>
                  )}

                  <div className="flex items-start gap-3">
                     <img src={guest.avatar} className="w-12 h-12 rounded-full object-cover bg-gray-200" alt={guest.fullName} />
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-gray-900 truncate">{guest.fullName}</h3>
                           {guest.tags.includes('VIP') && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                        </div>
                        <p className={`text-xs truncate ${isEmailMasked(guest.email) ? 'text-amber-600 italic' : 'text-gray-500'}`}>
                            {isEmailMasked(guest.email) ? 'Email masqué (OTA)' : guest.email}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center text-xs text-gray-500">
                              <History className="w-3 h-3 mr-1" /> {guest.stayCount} séjours
                           </div>
                           <div className="flex items-center text-xs font-medium text-emerald-600">
                              <CreditCard className="w-3 h-3 mr-1" /> {guest.totalSpent}€
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                     <div className="flex gap-1">
                        {guest.tags.slice(0,2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium">{tag}</span>
                        ))}
                     </div>
                     <PlatformIcon platform={guest.source} />
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* RIGHT COLUMN: Profile Detail */}
      {selectedGuest ? (
        <div className="w-full md:w-[500px] bg-white border-l md:border border-gray-200 md:rounded-xl shadow-xl md:shadow-none fixed inset-0 md:static z-40 md:z-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
           
           {/* Detail Header */}
           <div className="p-6 border-b border-gray-100 relative">
              <button onClick={() => setSelectedGuestId(null)} className="md:hidden absolute top-4 left-4 p-2 bg-gray-100 rounded-full">
                 <X className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                 <div className="relative">
                    <img src={selectedGuest.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3" />
                    {selectedGuest.idCardVerified && (
                        <div className="absolute bottom-3 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Identité Vérifiée">
                           <ShieldCheck className="w-4 h-4" />
                        </div>
                    )}
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">{selectedGuest.fullName}</h2>
                 <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> {selectedGuest.nationality || 'Nationalité inconnue'}
                 </p>
                 
                 <div className="flex gap-2 mt-4">
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">
                       <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </button>
                    <button 
                        onClick={handleOpenPortal}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm"
                        title="Voir le portail voyageur"
                    >
                       <ExternalLink className="w-4 h-4 mr-2" /> Portail
                    </button>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* DATA QUALITY ALERTS */}
              {(isEmailMasked(selectedGuest.email) || !selectedGuest.idCardVerified) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Données manquantes (OTA)
                      </h3>
                      <div className="space-y-2 mb-3">
                          {isEmailMasked(selectedGuest.email) && (
                              <p className="text-xs text-amber-700 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                                  Email masqué (Alias temporaire)
                              </p>
                          )}
                          {!selectedGuest.idCardVerified && (
                              <p className="text-xs text-amber-700 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                                  Pièce d'identité non collectée (Légal)
                              </p>
                          )}
                      </div>
                      <button 
                        onClick={handleSendEnrichmentRequest}
                        disabled={enrichmentSent}
                        className="w-full bg-white border border-amber-300 text-amber-800 text-xs font-bold py-2 rounded-lg hover:bg-amber-100 transition flex items-center justify-center shadow-sm"
                      >
                          {enrichmentSent ? (
                              "Demande envoyée !"
                          ) : (
                              <>
                                <Send className="w-3 h-3 mr-2" /> Demander les infos via Portail
                              </>
                          )}
                      </button>
                  </div>
              )}

              {/* Compliance / Status */}
              <div className="grid grid-cols-2 gap-4">
                 <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${selectedGuest.idCardVerified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {selectedGuest.idCardVerified ? <ShieldCheck className="w-6 h-6 text-green-600 mb-1"/> : <ShieldAlert className="w-6 h-6 text-red-500 mb-1"/>}
                    <span className={`text-xs font-bold ${selectedGuest.idCardVerified ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedGuest.idCardVerified ? 'Identité Vérifiée' : 'Pièce ID manquante'}
                    </span>
                 </div>
                 <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${selectedGuest.depositSecured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <CreditCard className={`w-6 h-6 mb-1 ${selectedGuest.depositSecured ? 'text-green-600' : 'text-amber-500'}`} />
                    <span className={`text-xs font-bold ${selectedGuest.depositSecured ? 'text-green-700' : 'text-amber-700'}`}>
                        {selectedGuest.depositSecured ? 'Caution Sécurisée' : 'Caution en attente'}
                    </span>
                 </div>
              </div>

              {/* Notes & Tags */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <Tag className="w-3 h-3 mr-2" /> Préférences & Notes
                 </h3>
                 <div className="flex flex-wrap gap-2 mb-3">
                    {selectedGuest.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                            {tag}
                        </span>
                    ))}
                    <button className="px-2 py-1 bg-white border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:text-indigo-600 hover:border-indigo-300">
                        + Tag
                    </button>
                 </div>
                 <textarea 
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Ajoutez une note privée..."
                    defaultValue={selectedGuest.notes}
                 />
              </div>

              {/* Booking History */}
              <div>
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <Calendar className="w-3 h-3 mr-2" /> Historique des séjours
                 </h3>
                 <div className="space-y-3">
                    {/* Mock matching reservations for this user */}
                    {MOCK_RESERVATIONS.filter(r => r.guestName === selectedGuest.fullName).map(r => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Villa Sunny Side</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-sm text-gray-900">{r.totalAmount}€</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'checked-in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {r.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {MOCK_RESERVATIONS.filter(r => r.guestName === selectedGuest.fullName).length === 0 && (
                        <div className="text-center text-xs text-gray-400 py-4 italic">
                            Historique importé non disponible pour la démo.
                        </div>
                    )}
                 </div>
              </div>

              {/* Documents */}
              <div>
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <FileText className="w-3 h-3 mr-2" /> Documents
                 </h3>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center mr-3">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Passeport.pdf</p>
                                <p className="text-[10px] text-gray-400">Ajouté le 12 Oct 2023</p>
                            </div>
                        </div>
                        <button className="text-xs text-indigo-600 hover:underline">Voir</button>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 m-4">
            <div className="text-center text-gray-400">
                <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Sélectionnez un voyageur pour voir son dossier.</p>
            </div>
        </div>
      )}

    </div>
  );
};
