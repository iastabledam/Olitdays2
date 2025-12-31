
import React, { useState } from 'react';
import { MOCK_PROSPECTS } from '../constants';
import { Prospect } from '../types';
import { 
  Mail, Phone, MoreHorizontal, UserPlus, FileText, CheckCircle, 
  Clock, ArrowRight, FileSignature, Building, Send, ChevronRight, X, 
  Loader, Sliders, MessageSquare, PlusCircle, ExternalLink, Folder, Key, Shield
} from 'lucide-react';

export const CRMView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'owners'>('pipeline');
  const [prospects, setProspects] = useState<Prospect[]>(MOCK_PROSPECTS);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [isSimulatingAction, setIsSimulatingAction] = useState(false);
  
  // Detail View State
  const [detailTab, setDetailTab] = useState<'workflow' | 'history'>('workflow');
  const [newNote, setNewNote] = useState('');
  
  // Mock History Data (Local state for demo purposes)
  const [historyLogs, setHistoryLogs] = useState<Record<number, {id: string, type: 'note' | 'event', text: string, date: string}[]>>({
      101: [
          { id: 'h1', type: 'event', text: 'Prospect créé', date: 'Il y a 2 jours' },
          { id: 'h2', type: 'note', text: 'Appel téléphonique : Intéressé mais trouve la commission de 20% un peu élevée. À recontacter.', date: 'Il y a 1 jour' },
          { id: 'h3', type: 'event', text: 'Audit validé', date: 'Il y a 2 heures' }
      ]
  });

  // Modal State for Contract Config
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractConfig, setContractConfig] = useState({
      commission: 20,
      startDate: new Date().toISOString().split('T')[0],
      duration: 12
  });

  // Mock Owners (Active) from prospects that are signed
  const activeOwners = prospects.filter(p => p.status === 'SIGNED');
  const selectedProspect = prospects.find(p => p.id === selectedProspectId);

  // --- ACTIONS ---

  const addHistoryItem = (prospectId: number, text: string, type: 'note' | 'event' = 'event') => {
      const newItem = { id: Date.now().toString(), type, text, date: "À l'instant" };
      setHistoryLogs(prev => ({
          ...prev,
          [prospectId]: [newItem, ...(prev[prospectId] || [])]
      }));
  };

  const handleStatusChange = (id: number, newStatus: string, updates: any = {}) => {
    setIsSimulatingAction(true);
    setTimeout(() => {
      setProspects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any, ...updates } : p));
      
      // Auto-log event
      let eventText = `Statut changé vers ${newStatus}`;
      if (updates.auditDone) eventText = "Audit du logement validé";
      if (updates.contractSent) eventText = "Mandat de gestion généré et envoyé";
      if (updates.signed) eventText = "Contrat signé électroniquement (Mandat Actif)";
      
      addHistoryItem(id, eventText, 'event');
      
      setIsSimulatingAction(false);
    }, 1000);
  };

  const openContractModal = () => {
      setIsContractModalOpen(true);
  };

  const handleGenerateAndSendContract = () => {
    if(!selectedProspectId) return;
    
    setIsContractModalOpen(false);
    setIsSimulatingAction(true); // Start loading state

    // Simulate API Call to n8n which generates PDF and returns Link
    setTimeout(() => {
        // 1. Create the mock document that n8n would return
        const generatedContractDoc = { 
            id: `doc-${Date.now()}`, 
            name: `Mandat_Gestion_${selectedProspect?.name.replace(' ', '_')}.pdf`, 
            url: '#', // In real life: https://drive.google.com/file/d/xyz...
            type: 'pdf' as const, 
            date: "À l'instant" 
        };

        // 2. Update Prospect: Change Status AND Add Document
        setProspects(prev => prev.map(p => {
            if (p.id === selectedProspectId) {
                return { 
                    ...p, 
                    status: 'CONTRACT_SENT',
                    contractSent: true,
                    commissionRate: contractConfig.commission,
                    contractStartDate: contractConfig.startDate,
                    documents: [generatedContractDoc, ...(p.documents || [])] // Add new doc to top
                };
            }
            return p;
        }));

        // 3. Log Event
        addHistoryItem(selectedProspectId, `Mandat généré (Commission: ${contractConfig.commission}%) et envoyé par email.`);
        
        setIsSimulatingAction(false);
        
        // 4. Feedback
        alert(`Succès ! Le PDF a été généré sur Google Drive et le lien a été ajouté au dossier.`);
        
        // 5. Switch to history tab so user sees the new file
        setDetailTab('history');

    }, 2000); // 2 seconds delay to simulate generation time
  };

  const handleSimulateSignature = (id: number) => {
    handleStatusChange(id, 'SIGNED', { signed: true });
    alert("Webhook reçu : Signature validée ! Le statut est passé à SIGNÉ.");
  };

  const handleSendAccess = (id: number) => {
      if(!id) return;
      setIsSimulatingAction(true);
      setTimeout(() => {
          const email = selectedProspect?.email || "l'adresse du client";
          addHistoryItem(id, `Compte créé. Email de bienvenue envoyé à ${email}.`, 'event');
          setIsSimulatingAction(false);
          // Explicit message answering "Where does he receive it?"
          alert(`✅ Compte propriétaire créé avec succès !\n\nUn email contenant le lien de connexion et les identifiants a été envoyé automatiquement à :\n👉 ${email}\n\nLe client peut maintenant se connecter à son Espace Propriétaire.`);
      }, 1500);
  };

  const handleAddNote = () => {
      if(!selectedProspectId || !newNote.trim()) return;
      addHistoryItem(selectedProspectId, newNote, 'note');
      setNewNote('');
  };

  const handleAddDocument = () => {
      // In real app, this would be a URL paster or a trigger to n8n to create a folder
      const url = prompt("Entrez le lien Google Drive/Dropbox du document :");
      if(url && selectedProspectId) {
          const name = prompt("Nom du fichier :", "Nouveau Document");
          setProspects(prev => prev.map(p => {
              if (p.id === selectedProspectId) {
                  return {
                      ...p,
                      documents: [
                          { id: Date.now().toString(), name: name || 'Doc', url, type: 'pdf', date: 'À l\'instant' },
                          ...(p.documents || []) // Add to top
                      ]
                  }
              }
              return p;
          }));
      }
  };

  // --- UI COMPONENTS ---

  const WorkflowStep = ({ 
    stepNumber, 
    title, 
    status, 
    isLast = false 
  }: { 
    stepNumber: number, 
    title: string, 
    status: 'completed' | 'current' | 'upcoming', 
    isLast?: boolean 
  }) => (
    <div className={`flex items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
      <div className="flex items-center relative">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors z-10
          ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 
            status === 'current' ? 'bg-white border-indigo-600 text-indigo-600' : 
            'bg-white border-gray-200 text-gray-300'}
        `}>
          {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : stepNumber}
        </div>
        <span className={`
          absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-medium whitespace-nowrap
          ${status === 'current' ? 'text-indigo-600' : 'text-gray-500'}
        `}>
          {title}
        </span>
      </div>
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-2 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 relative">
      
      {/* LEFT COLUMN: LISTS */}
      <div className={`flex-1 space-y-6 overflow-y-auto ${selectedProspectId ? 'hidden md:block' : ''}`}>
        
        {/* TABS */}
        <div className="flex bg-gray-200 p-1 rounded-lg w-fit">
           <button 
             onClick={() => { setActiveTab('pipeline'); setSelectedProspectId(null); }}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'pipeline' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Prospects & Onboarding
           </button>
           <button 
             onClick={() => { setActiveTab('owners'); setSelectedProspectId(null); }}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'owners' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Propriétaires Actifs
           </button>
        </div>

        {/* CONTENT: PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">Pipeline d'Intégration</h2>
               <button className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center">
                 <UserPlus className="w-4 h-4 mr-2" /> Nouveau Prospect
               </button>
             </div>

             <div className="grid gap-3">
               {prospects.map(p => (
                 <div 
                   key={p.id} 
                   onClick={() => setSelectedProspectId(p.id)}
                   className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all group ${selectedProspectId === p.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
                 >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                         <div className={`w-2 h-2 rounded-full mr-2 ${
                           p.status === 'SIGNED' ? 'bg-green-500' : 
                           p.status === 'CONTRACT_SENT' ? 'bg-amber-500' : 
                           p.status === 'NEGOTIATION' ? 'bg-blue-500' : 'bg-gray-400'
                         }`}></div>
                         <span className="text-xs font-bold text-gray-500 uppercase">
                           {p.status === 'SIGNED' ? 'Signé' : 
                            p.status === 'CONTRACT_SENT' ? 'Signature en attente' : 
                            p.status === 'NEGOTIATION' ? 'En Négociation' : 'Nouveau'}
                         </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {p.lastContact}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="font-bold text-gray-900">{p.name}</h3>
                          <p className="text-sm text-gray-500">{p.property}</p>
                       </div>
                       <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition ${selectedProspectId === p.id ? 'text-indigo-600' : ''}`} />
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* CONTENT: OWNERS (Read Only List) */}
        {activeTab === 'owners' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Propriétaire</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Biens</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeOwners.length === 0 && (
                    <tr>
                        <td colSpan={3} className="p-6 text-center text-gray-500 italic">Aucun propriétaire actif pour le moment.</td>
                    </tr>
                )}
                {activeOwners.map(owner => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                            {owner.name.charAt(0)}
                        </div>
                        <div>
                           <span className="font-medium text-gray-900 block">{owner.name}</span>
                           <span className="text-xs text-gray-500">Signé le {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {owner.property}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600 p-1"><MoreHorizontal className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAIL VIEW */}
      {selectedProspect && activeTab === 'pipeline' && (
        <div className="w-full md:w-[500px] bg-white border-l md:border border-gray-200 md:rounded-xl shadow-xl md:shadow-none fixed inset-0 md:static z-40 md:z-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
           
           {/* Header */}
           <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                 <button onClick={() => setSelectedProspectId(null)} className="md:hidden text-gray-500 mb-2 flex items-center text-sm">
                    <ChevronRight className="w-4 h-4 rotate-180 mr-1"/> Retour
                 </button>
                 <h2 className="text-xl font-bold text-gray-800">{selectedProspect.name}</h2>
                 <p className="text-sm text-gray-500">{selectedProspect.property}</p>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><Phone className="w-4 h-4"/></button>
                 <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><Mail className="w-4 h-4"/></button>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex border-b border-gray-100">
               <button 
                 onClick={() => setDetailTab('workflow')}
                 className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${detailTab === 'workflow' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                 Parcours
               </button>
               <button 
                 onClick={() => setDetailTab('history')}
                 className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${detailTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                 Dossier & Historique
               </button>
           </div>

           {/* Workflow Stepper (Visible on Workflow Tab) */}
           {detailTab === 'workflow' && (
             <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between px-2 mb-4">
                   <WorkflowStep 
                      stepNumber={1} title="Audit" 
                      status={selectedProspect.auditDone ? 'completed' : 'current'} 
                   />
                   <WorkflowStep 
                      stepNumber={2} title="Contrat" 
                      status={selectedProspect.contractSent ? 'completed' : (selectedProspect.auditDone ? 'current' : 'upcoming')} 
                   />
                   <WorkflowStep 
                      stepNumber={3} title="Signature" 
                      status={selectedProspect.signed ? 'completed' : (selectedProspect.contractSent ? 'current' : 'upcoming')} 
                      isLast={true}
                   />
                </div>
             </div>
           )}

           {/* Actions Body */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: WORKFLOW ACTIONS */}
              {detailTab === 'workflow' && (
                <>
                  {/* Step 1: Info & Audit */}
                  <div className={`p-4 rounded-xl border transition-all ${selectedProspect.auditDone ? 'bg-green-50 border-green-100' : 'bg-white border-indigo-200 shadow-sm'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center">
                           <Building className="w-4 h-4 mr-2 opacity-70"/> 1. Informations & Audit
                        </h4>
                        {selectedProspect.auditDone && <CheckCircle className="w-5 h-5 text-green-500" />}
                     </div>
                     <div className="text-sm text-gray-600 space-y-1 ml-6">
                        <p>Adresse: {selectedProspect.address}</p>
                        <p>Potentiel: {selectedProspect.value}</p>
                     </div>
                     {!selectedProspect.auditDone && (
                        <button 
                           onClick={() => handleStatusChange(selectedProspect.id, 'NEGOTIATION', { auditDone: true })}
                           className="mt-3 ml-6 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
                        >
                           Valider l'audit
                        </button>
                     )}
                  </div>

                  {/* Step 2: Contract Generation */}
                  <div className={`p-4 rounded-xl border transition-all ${
                     !selectedProspect.auditDone ? 'opacity-50 grayscale' : 
                     selectedProspect.contractSent ? 'bg-green-50 border-green-100' : 'bg-white border-indigo-200 shadow-sm'
                  }`}>
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center">
                           <FileText className="w-4 h-4 mr-2 opacity-70"/> 2. Mandat de Gestion
                        </h4>
                        {selectedProspect.contractSent && <CheckCircle className="w-5 h-5 text-green-500" />}
                     </div>
                     <p className="text-xs text-gray-500 ml-6 mb-3">
                        Configurez le contrat (Commission, Durée) et envoyez-le pour signature électronique.
                     </p>
                     
                     {selectedProspect.auditDone && !selectedProspect.contractSent && (
                        <div className="ml-6 flex gap-2">
                           <button 
                              onClick={openContractModal}
                              className="flex items-center text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700"
                           >
                              <Sliders className="w-3 h-3 mr-1.5"/> Configurer
                           </button>
                           <button 
                              onClick={openContractModal}
                              disabled={isSimulatingAction}
                              className="flex items-center text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition shadow-sm"
                           >
                              {isSimulatingAction ? <Loader className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3 mr-1.5"/>}
                              Générer & Envoyer
                           </button>
                        </div>
                     )}
                     {selectedProspect.contractSent && (
                        <div className="ml-6 text-xs space-y-1">
                            <p className="text-green-700 font-medium">Envoyé le {new Date().toLocaleDateString()}</p>
                            <p className="text-gray-500">Commission: {selectedProspect.commissionRate || 20}%</p>
                        </div>
                     )}
                  </div>

                  {/* Step 3: Signature */}
                  <div className={`p-4 rounded-xl border transition-all ${
                     !selectedProspect.contractSent ? 'opacity-50 grayscale' : 
                     selectedProspect.signed ? 'bg-green-50 border-green-100' : 'bg-white border-indigo-200 shadow-sm'
                  }`}>
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center">
                           <FileSignature className="w-4 h-4 mr-2 opacity-70"/> 3. Signature Électronique
                        </h4>
                        {selectedProspect.signed && <CheckCircle className="w-5 h-5 text-green-500" />}
                     </div>
                     
                     {selectedProspect.contractSent && !selectedProspect.signed && (
                        <div className="ml-6">
                           <div className="flex items-center p-2 bg-amber-50 text-amber-700 rounded-lg text-xs mb-3 border border-amber-100">
                              <Clock className="w-3 h-3 mr-2 animate-pulse"/>
                              En attente de signature client (via Email)...
                           </div>
                           <div className="text-[10px] text-gray-400 mb-2">
                               L'API de signature notifiera automatiquement le système lors de la signature.
                           </div>
                           <button 
                              onClick={() => handleSimulateSignature(selectedProspect.id)}
                              className="text-xs text-indigo-600 hover:underline"
                           >
                              (Dev) Simuler le Webhook "Signé"
                           </button>
                        </div>
                     )}
                     
                     {selectedProspect.signed && (
                        <div className="ml-6">
                           <p className="text-xs text-green-700 font-medium mb-2">Contrat signé et stocké.</p>
                        </div>
                     )}
                  </div>

                  {/* Step 4: Final Onboarding (Account Creation) */}
                  <div className={`p-4 rounded-xl border transition-all ${
                     !selectedProspect.signed ? 'opacity-50 grayscale' : 'bg-white border-indigo-200 shadow-sm'
                  }`}>
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center">
                           <Key className="w-4 h-4 mr-2 opacity-70"/> 4. Accès & Bienvenue
                        </h4>
                        <div className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Final</div>
                     </div>
                     <p className="text-xs text-gray-500 ml-6 mb-3">
                        Générez le compte propriétaire et envoyez l'email de bienvenue avec les accès au portail.
                     </p>
                     
                     {selectedProspect.signed && (
                        <div className="ml-6">
                           <button 
                              onClick={() => handleSendAccess(selectedProspect.id)}
                              disabled={isSimulatingAction}
                              className="w-full flex items-center justify-center py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 transition"
                           >
                              {isSimulatingAction ? <Loader className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4 mr-2"/>}
                              Créer compte & Envoyer accès
                           </button>
                        </div>
                     )}
                  </div>
                </>
              )}

              {/* TAB 2: HISTORY & NOTES */}
              {detailTab === 'history' && (
                  <div className="space-y-6">
                      
                      {/* Documents Section */}
                      <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                                  <Folder className="w-4 h-4 mr-2 text-indigo-600" /> Documents & Fichiers
                              </h3>
                              <button onClick={handleAddDocument} className="text-xs text-indigo-600 hover:underline flex items-center">
                                  <PlusCircle className="w-3 h-3 mr-1" /> Ajouter
                              </button>
                          </div>
                          
                          {(!selectedProspect.documents || selectedProspect.documents.length === 0) ? (
                              <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg text-center text-xs text-gray-400">
                                  Aucun document associé (Drive/Dropbox).
                              </div>
                          ) : (
                              <div className="space-y-2">
                                  {selectedProspect.documents.map(doc => (
                                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors group shadow-sm">
                                          <div className="flex items-center overflow-hidden">
                                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${doc.type === 'folder' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                                  {doc.type === 'folder' ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                              </div>
                                              <div className="min-w-0">
                                                  <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                                                  <p className="text-[10px] text-gray-500">Ajouté le {doc.date}</p>
                                              </div>
                                          </div>
                                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600 p-1">
                                              <ExternalLink className="w-4 h-4" />
                                          </a>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Add Note Input */}
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <textarea 
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-2"
                            rows={3}
                            placeholder="Écrire une note (appel, email, détails)..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                          />
                          <div className="flex justify-end">
                              <button 
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                              >
                                  <PlusCircle className="w-3 h-3 mr-1.5"/> Ajouter la note
                              </button>
                          </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
                          {(historyLogs[selectedProspect.id] || []).map((log, index) => (
                              <div key={log.id} className="relative pl-10">
                                  <div className={`
                                      absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center
                                      ${log.type === 'note' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}
                                  `}>
                                      {log.type === 'note' ? <MessageSquare className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                      <p className="text-sm text-gray-800">{log.text}</p>
                                      <span className="text-[10px] text-gray-400 mt-1 block">{log.date}</span>
                                  </div>
                              </div>
                          ))}
                          {(!historyLogs[selectedProspect.id] || historyLogs[selectedProspect.id].length === 0) && (
                              <p className="text-center text-xs text-gray-400 italic py-4">Aucune activité récente.</p>
                          )}
                      </div>
                  </div>
              )}

           </div>
        </div>
      )}

      {/* --- CONTRACT CONFIG MODAL --- */}
      {isContractModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Configurer le Mandat</h3>
                      <button onClick={() => setIsContractModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Commission Agence (%)</label>
                          <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
                            value={contractConfig.commission}
                            onChange={(e) => setContractConfig({...contractConfig, commission: parseInt(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                          <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
                            value={contractConfig.startDate}
                            onChange={(e) => setContractConfig({...contractConfig, startDate: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois)</label>
                          <select 
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
                            value={contractConfig.duration}
                            onChange={(e) => setContractConfig({...contractConfig, duration: parseInt(e.target.value)})}
                          >
                              <option value={12}>12 mois (Renouvelable)</option>
                              <option value={24}>24 mois</option>
                              <option value={6}>Saisonnier (6 mois)</option>
                          </select>
                      </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                      <button onClick={() => setIsContractModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                      <button 
                        onClick={handleGenerateAndSendContract} 
                        disabled={isSimulatingAction}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md flex justify-center items-center"
                      >
                          {isSimulatingAction ? <Loader className="w-4 h-4 animate-spin"/> : <><Send className="w-4 h-4 mr-2" /> Envoyer</>}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
