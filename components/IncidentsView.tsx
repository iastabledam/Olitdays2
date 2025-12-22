
import React, { useState } from 'react';
import { Incident, IncidentStatus, IncidentPriority, Property } from '../types';
import { MOCK_INCIDENTS, MOCK_PROPERTIES, MOCK_GUESTS } from '../constants';
import { 
  AlertTriangle, CheckCircle, Clock, MoreVertical, 
  Search, Filter, Plus, Wrench, Wifi, Droplets, Zap, Key, Home,
  ArrowRight, MessageSquare, Coffee, Bell, User, X, Send, ChevronDown
} from 'lucide-react';

interface IncidentsViewProps {
  onNavigateToProperty?: (id: string) => void;
  incidents: Incident[]; // Received from parent
  onUpdateIncidents?: (incidents: Incident[]) => void;
}

// Visual mapping based on priority/type
const getTypeVisuals = (category: string, priority: string) => {
    // If it's a technical issue (High/Critical or specific categories)
    const isTechnical = ['PLUMBING', 'ELECTRICITY', 'WIFI', 'ACCESS'].includes(category) || priority === 'CRITICAL' || priority === 'HIGH';
    
    if (isTechnical) {
        return {
            colorClass: 'bg-red-50 border-red-100 text-red-700',
            iconClass: 'text-red-500',
            typeLabel: 'Incident Technique'
        };
    } else {
        return {
            colorClass: 'bg-blue-50 border-blue-100 text-blue-700',
            iconClass: 'text-blue-500',
            typeLabel: 'Demande Service'
        };
    }
};

const IncidentCard = ({ incident, property, onClick }: { incident: Incident, property?: Property, onClick: () => void }) => {
  const visuals = getTypeVisuals(incident.category, incident.priority);

  const CategoryIcon = {
    'WIFI': Wifi,
    'PLUMBING': Droplets,
    'ELECTRICITY': Zap,
    'ACCESS': Key,
    'CLEANING': Home,
    'OTHER': MessageSquare
  }[incident.category] || Bell;

  // Find guest avatar if possible (mock matching by name)
  const guest = MOCK_GUESTS.find(g => g.fullName === incident.guestName);
  
  // Get the most recent message or the description
  const displayMessage = (incident.messages && incident.messages.length > 0) 
      ? incident.messages[incident.messages.length - 1].text 
      : incident.description;

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
    >
      {/* Top Row: Type & Priority */}
      <div className="flex justify-between items-start">
        <div className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${visuals.colorClass}`}>
           <CategoryIcon className="w-3 h-3 mr-1.5" />
           {visuals.typeLabel}
        </div>
        <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider`}>
          {new Date(incident.reportedAt).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}
        </span>
      </div>
      
      {/* Middle: Content */}
      <div>
          <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-indigo-600 transition leading-tight">{incident.title}</h3>
          
          {/* Enhanced Message Display */}
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
             <div className="flex items-start">
                <MessageSquare className="w-3 h-3 text-gray-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 italic line-clamp-3 leading-relaxed">
                    "{displayMessage}"
                </p>
             </div>
          </div>
      </div>
      
      {/* Bottom: Guest & Property */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
        <div className="flex items-center">
            {guest?.avatar ? (
                <img src={guest.avatar} className="w-6 h-6 rounded-full mr-2 bg-gray-200 object-cover" alt="" />
            ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 text-indigo-700 text-[10px] font-bold">
                    {incident.guestName?.charAt(0) || 'G'}
                </div>
            )}
            <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{incident.guestName || 'Voyageur inconnu'}</span>
        </div>
        <div className="flex items-center text-xs text-gray-400 max-w-[120px]">
           <Home className="w-3 h-3 mr-1 shrink-0" /> 
           <span className="truncate">{property?.name || 'Logement'}</span>
        </div>
      </div>
    </div>
  );
};

export const IncidentsView: React.FC<IncidentsViewProps> = ({ onNavigateToProperty, incidents, onUpdateIncidents }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Columns
  const newIncidents = incidents.filter(i => i.status === IncidentStatus.NEW);
  const progressIncidents = incidents.filter(i => i.status === IncidentStatus.IN_PROGRESS);
  const resolvedIncidents = incidents.filter(i => i.status === IncidentStatus.RESOLVED);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('incidentId', id);
  };

  const handleDrop = (e: React.DragEvent, status: IncidentStatus) => {
    const id = e.dataTransfer.getData('incidentId');
    if (onUpdateIncidents) {
        const updated = incidents.map(inc => inc.id === id ? { ...inc, status } : inc);
        onUpdateIncidents(updated);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
      if (!selectedIncident || !onUpdateIncidents) return;
      const updated = incidents.map(inc => inc.id === selectedIncident.id ? { ...inc, status: newStatus } : inc);
      onUpdateIncidents(updated);
      setSelectedIncident({ ...selectedIncident, status: newStatus });
  };

  const handleSendReply = () => {
      if (!replyText.trim() || !selectedIncident || !onUpdateIncidents) return;
      
      const newMessage = { 
          text: replyText, 
          author: 'Admin', // In real app, use currentUser.name
          date: new Date().toISOString() 
      };
      
      const updatedIncident = {
          ...selectedIncident,
          messages: [...(selectedIncident.messages || []), newMessage]
      };

      const updatedList = incidents.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc);
      onUpdateIncidents(updatedList);
      setSelectedIncident(updatedIncident);
      setReplyText('');
  };

  // Find associated property for selected incident
  const selectedProperty = selectedIncident ? MOCK_PROPERTIES.find(p => p.id === selectedIncident.propertyId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Centre de Support</h1>
          <p className="text-gray-500 text-sm">Gérez les demandes clients et les incidents techniques en un seul endroit.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center font-bold text-sm hover:bg-indigo-700 shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Créer un ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Rechercher par voyageur, titre..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
             value={filterText}
             onChange={(e) => setFilterText(e.target.value)}
           />
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
           <Filter className="w-4 h-4 mr-2" /> Filtres
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          
          {/* COLUMN: NOUVEAU */}
          <div 
            className="flex-1 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200"
            onDrop={(e) => handleDrop(e, IncidentStatus.NEW)}
            onDragOver={handleDragOver}
          >
             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center">
                   <Bell className="w-4 h-4 mr-2 text-indigo-500" /> À Traiter
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{newIncidents.length}</span>
             </div>
             <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {newIncidents.map(inc => (
                   <div key={inc.id} draggable onDragStart={(e) => handleDragStart(e, inc.id)}>
                      <IncidentCard 
                        incident={inc} 
                        property={MOCK_PROPERTIES.find(p => p.id === inc.propertyId)} 
                        onClick={() => setSelectedIncident(inc)} 
                      />
                   </div>
                ))}
             </div>
          </div>

          {/* COLUMN: EN COURS */}
          <div 
            className="flex-1 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200"
            onDrop={(e) => handleDrop(e, IncidentStatus.IN_PROGRESS)}
            onDragOver={handleDragOver}
          >
             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center">
                   <Wrench className="w-4 h-4 mr-2 text-blue-500" /> Pris en charge
                </h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{progressIncidents.length}</span>
             </div>
             <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {progressIncidents.map(inc => (
                   <div key={inc.id} draggable onDragStart={(e) => handleDragStart(e, inc.id)}>
                      <IncidentCard 
                        incident={inc} 
                        property={MOCK_PROPERTIES.find(p => p.id === inc.propertyId)} 
                        onClick={() => setSelectedIncident(inc)} 
                      />
                   </div>
                ))}
             </div>
          </div>

          {/* COLUMN: RÉSOLU */}
          <div 
            className="flex-1 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200"
            onDrop={(e) => handleDrop(e, IncidentStatus.RESOLVED)}
            onDragOver={handleDragOver}
          >
             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center">
                   <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Résolus
                </h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{resolvedIncidents.length}</span>
             </div>
             <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {resolvedIncidents.map(inc => (
                   <div key={inc.id} draggable onDragStart={(e) => handleDragStart(e, inc.id)}>
                      <IncidentCard 
                        incident={inc} 
                        property={MOCK_PROPERTIES.find(p => p.id === inc.propertyId)} 
                        onClick={() => setSelectedIncident(inc)} 
                      />
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>

      {/* --- INCIDENT DETAIL MODAL --- */}
      {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-start p-6 border-b border-gray-100">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                  selectedIncident.status === IncidentStatus.NEW ? 'bg-indigo-100 text-indigo-700' :
                                  selectedIncident.status === IncidentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                  {selectedIncident.status === IncidentStatus.NEW ? 'Nouveau' : 
                                   selectedIncident.status === IncidentStatus.IN_PROGRESS ? 'En cours' : 'Résolu'}
                              </span>
                              <span className="text-sm text-gray-400">#{selectedIncident.id}</span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h2>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                              <User className="w-4 h-4 mr-1" /> {selectedIncident.guestName}
                              <span className="mx-2">•</span>
                              <Home className="w-4 h-4 mr-1" /> {selectedProperty?.name}
                          </div>
                      </div>
                      <button onClick={() => setSelectedIncident(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 flex overflow-hidden">
                      {/* Left: Details */}
                      <div className="w-1/3 border-r border-gray-100 bg-gray-50 p-6 overflow-y-auto">
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Détails</h3>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                                  <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                                      {selectedIncident.description}
                                  </p>
                              </div>
                              
                              <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Priorité</label>
                                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                                      selectedIncident.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                                      selectedIncident.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                      {selectedIncident.priority}
                                  </div>
                              </div>

                              <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Action</label>
                                  <div className="relative">
                                      <select 
                                          className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none pr-8 outline-none focus:ring-2 focus:ring-indigo-500"
                                          value={selectedIncident.status}
                                          onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                                      >
                                          <option value={IncidentStatus.NEW}>À Faire</option>
                                          <option value={IncidentStatus.IN_PROGRESS}>En Cours (Prise en charge)</option>
                                          <option value={IncidentStatus.RESOLVED}>Résolu</option>
                                      </select>
                                      <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right: Chat */}
                      <div className="flex-1 flex flex-col bg-white">
                          <div className="flex-1 overflow-y-auto p-6 space-y-4">
                              {/* Original Description as first bubble */}
                              <div className="flex justify-start">
                                  <div className="max-w-[80%]">
                                      <span className="text-xs text-gray-400 ml-1 mb-1 block">{selectedIncident.guestName}</span>
                                      <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-none text-sm">
                                          {selectedIncident.description}
                                      </div>
                                  </div>
                              </div>

                              {/* Follow up messages */}
                              {(selectedIncident.messages || []).map((msg, i) => (
                                  <div key={i} className={`flex ${msg.author === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[80%] ${msg.author === 'Admin' ? 'items-end flex flex-col' : ''}`}>
                                          <span className="text-xs text-gray-400 mx-1 mb-1 block">{msg.author === 'Admin' ? 'Vous' : msg.author}</span>
                                          <div className={`p-3 rounded-2xl text-sm ${
                                              msg.author === 'Admin' 
                                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                          }`}>
                                              {msg.text}
                                          </div>
                                          <span className="text-[10px] text-gray-300 mt-1 block px-1">
                                              {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          {/* Input */}
                          <div className="p-4 border-t border-gray-100">
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      placeholder="Écrire une réponse au client..." 
                                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                  />
                                  <button 
                                      onClick={handleSendReply}
                                      className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition flex items-center justify-center w-10 h-10 shrink-0"
                                  >
                                      <Send className="w-4 h-4" />
                                  </button>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-2 text-center">
                                  Le client verra ce message sur son portail voyageur.
                              </p>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};
