
import React, { useState, useRef } from 'react';
import { Task, TaskStatus, TaskType, Property } from '../types';
import { 
  Camera, CheckCircle, MapPin, Clock, Upload, X, 
  Play, CheckSquare, AlertTriangle, ArrowLeft, Image as ImageIcon,
  Key, Package, AlertCircle, ShoppingBag, ChevronDown, ChevronUp
} from 'lucide-react';

interface CleanerPortalProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  properties: Property[];
  userId: string;
}

export const CleanerPortal: React.FC<CleanerPortalProps> = ({ tasks, onUpdateTasks, properties, userId }) => {
  // Filter for current cleaner (assuming role logic handled in parent or here)
  // For demo, we just use the tasks passed down, filtering by user if needed
  const myTasks = tasks.filter(t => t.assigneeId === userId || t.assigneeId === 'u4'); // u4 is default mock cleaner

  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // New States for features
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [suppliesChecked, setSuppliesChecked] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || 'Inconnu';
  const getPropertyAddress = (id: string) => properties.find(p => p.id === id)?.address || '';
  const getPropertyImage = (id: string) => properties.find(p => p.id === id)?.imageUrl || '';
  const getAccessCode = (id: string) => properties.find(p => p.id === id)?.accessCode || 'Non défini';

  const todoTasks = myTasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.VERIFIED);
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VERIFIED);

  const suppliesList = ['Papier Toilette', 'Sacs Poubelle', 'Savon Main', 'Gel Douche', 'Capsules Café', 'Éponge', 'Liquide Vaisselle'];

  // --- ACTIONS ---

  const handleStartTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.IN_PROGRESS } : t);
    onUpdateTasks(updatedTasks);
    
    const updatedTask = updatedTasks.find(t => t.id === taskId);
    if (updatedTask) setSelectedTask(updatedTask);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...selectedTask, status: TaskStatus.COMPLETED } : t);
    onUpdateTasks(updatedTasks);
    
    setSelectedTask(null);
    setSuppliesChecked([]); // Reset local state
    setShowAccessCode(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedTask) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhotoUrl = event.target.result as string;
          const currentPhotos = selectedTask.proofPhotos || [];
          // Update LOCAL selected state
          setSelectedTask({
            ...selectedTask,
            proofPhotos: [...currentPhotos, newPhotoUrl]
          });
          // Note: We don't update GLOBAL state until "Complete" is clicked, or we could do it here. 
          // Let's stick to updating global only on major actions or "Save".
          // Actually, for better UX, let's update global state too so it's saved if they exit
          const updatedTasks = tasks.map(t => t.id === selectedTask.id ? { ...selectedTask, proofPhotos: [...currentPhotos, newPhotoUrl] } : t);
          onUpdateTasks(updatedTasks);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportIncident = () => {
      if(!incidentText) return;
      alert(`Incident signalé : "${incidentText}". Une tâche de maintenance a été créée.`);
      setIsIncidentModalOpen(false);
      setIncidentText('');
  };

  const toggleSupply = (item: string) => {
    if (suppliesChecked.includes(item)) {
        setSuppliesChecked(suppliesChecked.filter(i => i !== item));
    } else {
        setSuppliesChecked([...suppliesChecked, item]);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  // --- VIEWS ---

  // 1. DETAIL VIEW (Active Task)
  if (selectedTask) {
    const isClean = selectedTask.type === TaskType.CLEANING;
    
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-100px)] pb-24 relative">
        {/* Header Image & Nav */}
        <div className="relative h-56 w-full">
           <img src={getPropertyImage(selectedTask.propertyId)} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           
           <button 
             onClick={() => setSelectedTask(null)}
             className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>

           <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold leading-tight mb-1">{getPropertyName(selectedTask.propertyId)}</h2>
              <p className="flex items-center text-sm opacity-90 mb-3"><MapPin className="w-3 h-3 mr-1"/> {getPropertyAddress(selectedTask.propertyId)}</p>
              
              {/* Access Code Toggle */}
              {selectedTask.status === TaskStatus.IN_PROGRESS && (
                  <button 
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white/30 transition"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {showAccessCode ? `Code: ${getAccessCode(selectedTask.propertyId)}` : 'Voir code d\'accès'}
                  </button>
              )}
           </div>
        </div>

        <div className="p-4 space-y-4 -mt-4 relative z-10">
           
           {/* Quick Actions Bar */}
           {selectedTask.status === TaskStatus.IN_PROGRESS && (
               <div className="grid grid-cols-2 gap-3 mb-2">
                   <button 
                     onClick={() => setIsIncidentModalOpen(true)}
                     className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 flex items-center justify-center font-bold text-sm shadow-sm active:scale-95 transition"
                   >
                       <AlertTriangle className="w-4 h-4 mr-2" />
                       Signaler Problème
                   </button>
                   <div className="bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm">
                       <Clock className="w-4 h-4 mr-2" />
                       00:45 écoulées
                   </div>
               </div>
           )}

           {/* Checklist Instructions */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-indigo-600" /> Instructions
                </h3>
             </div>
             
             <p className="text-gray-600 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                "{selectedTask.description}"
             </p>
             
             {isClean && (
               <div className="space-y-3">
                 {['Aérer les pièces en grand', 'Retirer tous les draps sales', 'Désinfecter sanitaires & cuisine', 'Vérifier sous les lits', 'Passer l\'aspirateur & serpillière'].map((item, i) => (
                   <label key={i} className="flex items-start text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                     <input type="checkbox" className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-3" />
                     <span className="leading-tight">{item}</span>
                   </label>
                 ))}
               </div>
             )}
           </div>

           {/* Supplies Checklist (New Feature) */}
           {selectedTask.status === TaskStatus.IN_PROGRESS && isClean && (
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                       <ShoppingBag className="w-5 h-5 mr-2 text-indigo-600" />
                       Réapprovisionnement
                   </h3>
                   <p className="text-xs text-gray-500 mb-3">Cochez les éléments que vous avez remis en place :</p>
                   <div className="grid grid-cols-2 gap-2">
                       {suppliesList.map(item => (
                           <button 
                            key={item}
                            onClick={() => toggleSupply(item)}
                            className={`text-xs py-2 px-3 rounded-lg border text-left flex justify-between items-center transition ${
                                suppliesChecked.includes(item) 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                           >
                               {item}
                               {suppliesChecked.includes(item) && <CheckCircle className="w-3 h-3 ml-1 text-green-600"/>}
                           </button>
                       ))}
                   </div>
               </div>
           )}

           {/* Photo Evidence Section */}
           {selectedTask.status === TaskStatus.IN_PROGRESS && (
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-indigo-600" /> Photos Preuves
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Requis</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                   {(selectedTask.proofPhotos || []).map((photo, idx) => (
                     <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative shadow-sm">
                       <img src={photo} className="w-full h-full object-cover" />
                     </div>
                   ))}
                   <button 
                     onClick={triggerCamera}
                     className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-indigo-400 transition bg-gray-50"
                   >
                     <Camera className="w-6 h-6 mb-1" />
                     <span className="text-[10px] font-bold">Ajouter</span>
                   </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  capture="environment" // Mobile: Opens rear camera directly
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                />
                <p className="text-xs text-gray-400 text-center">Prenez en photo le salon et la salle de bain une fois terminés.</p>
             </div>
           )}

           {/* Action Buttons */}
           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20 md:static md:bg-transparent md:border-none md:p-0">
              {selectedTask.status === TaskStatus.PENDING ? (
                <button 
                  onClick={() => handleStartTask(selectedTask.id)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" /> Commencer la mission
                </button>
              ) : (
                <button 
                  onClick={handleCompleteTask}
                  disabled={(selectedTask.proofPhotos?.length || 0) === 0}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Terminer la mission
                </button>
              )}
           </div>
        </div>

        {/* INCIDENT MODAL */}
        {isIncidentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h3 className="font-bold text-red-800 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" /> Signaler un problème
                        </h3>
                        <button onClick={() => setIsIncidentModalOpen(false)} className="p-1 rounded-full hover:bg-red-100 text-red-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-600">Décrivez le problème (casse, fuite, tache tenace) pour l'équipe technique.</p>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                            placeholder="Ex: La poignée de la porte fenêtre est bloquée..."
                            value={incidentText}
                            onChange={(e) => setIncidentText(e.target.value)}
                            autoFocus
                        />
                        <button className="w-full border border-gray-300 py-2 rounded-lg text-gray-600 text-sm flex items-center justify-center hover:bg-gray-50">
                            <Camera className="w-4 h-4 mr-2" /> Ajouter une photo
                        </button>
                        <button 
                            onClick={handleReportIncident}
                            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-md"
                        >
                            Envoyer le signalement
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    );
  }

  // 2. LIST VIEW (Dashboard)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Ménage</h1>
          <p className="text-gray-500">CleanTeam SAS</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          <button 
            onClick={() => setActiveTab('todo')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'todo' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
          >
            À Faire ({todoTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-500'}`}
          >
            Terminé
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'todo' ? todoTasks : completedTasks).map(task => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
             <div className="relative h-32">
                <img src={getPropertyImage(task.propertyId)} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm flex items-center">
                   <Clock className="w-3 h-3 mr-1 text-indigo-600"/> {task.dueDate}
                </div>
                {task.status === TaskStatus.IN_PROGRESS && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm animate-pulse">
                    En cours
                  </div>
                )}
             </div>
             
             <div className="p-4">
               <h3 className="font-bold text-gray-900 mb-1">{getPropertyName(task.propertyId)}</h3>
               <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
               
               {activeTab === 'todo' ? (
                 <button 
                    onClick={() => setSelectedTask(task)}
                    className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                 >
                   {task.status === TaskStatus.IN_PROGRESS ? 'Reprendre' : 'Voir la mission'}
                 </button>
               ) : (
                 <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg justify-center">
                   <CheckCircle className="w-4 h-4 mr-2" /> Mission terminée
                 </div>
               )}
             </div>
          </div>
        ))}

        {((activeTab === 'todo' && todoTasks.length === 0) || (activeTab === 'completed' && completedTasks.length === 0)) && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
             <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>Aucune mission dans cette liste.</p>
          </div>
        )}
      </div>
    </div>
  );
};
