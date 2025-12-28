
import React, { useState } from 'react';
import { Property } from '../types';
import { 
  MapPin, Wifi, MoreVertical, Plus, Home, AlertTriangle, CheckCircle, 
  Calendar, Settings, Link, Download, Loader, X, Search, Image as ImageIcon,
  LayoutGrid, List
} from 'lucide-react';

interface PropertiesViewProps {
  properties: Property[]; // Receive from parent
  onNavigateToPlanning?: (propertyId: string) => void;
  onEditProperty?: (propertyId: string) => void;
  onAddProperty?: (property: Property) => void; // To handle imports
  onNewProperty?: () => void; // New prop to navigate to creation view
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ 
  properties, 
  onNavigateToPlanning, 
  onEditProperty,
  onAddProperty,
  onNewProperty
}) => {
  // View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [importUrl, setImportUrl] = useState('');
  const [importedProperty, setImportedProperty] = useState<Property | null>(null);

  // --- ACTIONS ---

  const handleAnalyzeUrl = () => {
    if (!importUrl) return;
    
    setImportStep('loading');
    
    // SIMULATION: In a real app, this would call your backend which scrapes Airbnb
    setTimeout(() => {
      const mockImportedProperty: Property = {
        id: `p-new-${Date.now()}`,
        name: "Superbe Loft Vue Mer (Import Airbnb)",
        address: "Promenade des Anglais, Nice",
        ownerId: 'u3',
        imageUrl: "https://images.unsplash.com/photo-1512918760532-3edbed7174ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        photos: [
            "https://images.unsplash.com/photo-1512918760532-3edbed7174ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
        ],
        description: "Découvrez ce magnifique appartement refait à neuf...",
        status: 'active',
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['Wifi', 'Cuisine', 'Vue mer']
      };
      
      setImportedProperty(mockImportedProperty);
      setImportStep('preview');
    }, 2000); // Fake delay
  };

  const handleConfirmImport = () => {
    if (importedProperty && onAddProperty) {
      onAddProperty(importedProperty);
      setIsImportModalOpen(false);
      setImportStep('input');
      setImportUrl('');
      setImportedProperty(null);
    }
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Logements</h1>
          <p className="text-gray-500">Gérez votre parc immobilier et les statuts.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Vue Grille"
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Vue Liste"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            <button 
            onClick={onNewProperty}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition shadow-sm font-medium"
            >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un bien
            </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                <div className="relative h-48 cursor-pointer bg-gray-100" onClick={() => onNavigateToPlanning?.(property.id)}>
                  {property.imageUrl ? (
                    <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs">Aucune photo</span>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition z-10 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onEditProperty?.(property.id); }}>
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="absolute bottom-3 left-3">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
                       property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {property.status === 'active' ? 'Actif' : 'Maintenance'}
                     </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 
                      className="font-bold text-lg text-gray-900 cursor-pointer hover:text-indigo-600 line-clamp-1"
                      onClick={() => onNavigateToPlanning?.(property.id)}
                    >
                      {property.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate">{property.address || 'Adresse non définie'}</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <button 
                       onClick={() => onEditProperty?.(property.id)}
                       className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center bg-gray-50 px-2 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1" />
                      Gérer
                    </button>
                    <button 
                      onClick={() => onNavigateToPlanning?.(property.id)}
                      className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
                    >
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Voir Planning
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State Card */}
            <button 
                onClick={onNewProperty}
                className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition h-full min-h-[300px] bg-gray-50 hover:bg-indigo-50/10"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                 <Plus className="w-8 h-8 text-indigo-400" />
              </div>
              <span className="font-bold text-lg">Créer un bien</span>
              <span className="text-sm mt-1">Configurer manuellement</span>
            </button>
          </div>
      ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-bold">Logement</th>
                        <th className="px-6 py-4 font-bold">Détails</th>
                        <th className="px-6 py-4 font-bold">Statut</th>
                        <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {properties.map(property => (
                        <tr key={property.id} className="hover:bg-gray-50 transition group cursor-pointer" onClick={() => onNavigateToPlanning?.(property.id)}>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-12 w-16 bg-gray-200 rounded-lg overflow-hidden mr-4 shrink-0 border border-gray-100 relative">
                                        {property.imageUrl ? (
                                            <img src={property.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-5 h-5"/></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition truncate">{property.name}</p>
                                        <p className="text-xs text-gray-500 flex items-center mt-0.5 truncate"><MapPin className="w-3 h-3 mr-1"/> {property.address}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mr-2 border border-gray-200">
                                        {property.maxGuests || 0} pers
                                    </span>
                                    <span className="text-xs text-gray-400">{property.bedrooms || 0} ch. • {property.surface || 0} {property.surfaceUnit === 'ft2' ? 'pi²' : 'm²'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                 <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                   property.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                 }`}>
                                   {property.status === 'active' ? 'Actif' : 'Maintenance'}
                                 </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                    <button 
                                       onClick={() => onEditProperty?.(property.id)}
                                       className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition"
                                    >
                                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                                        Gérer
                                    </button>
                                    <button 
                                        onClick={() => onNavigateToPlanning?.(property.id)}
                                        className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        Planning
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {properties.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                Aucun logement trouvé. Commencez par en ajouter un !
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      )}

      {/* --- IMPORT MODAL --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-800 flex items-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" className="h-6 mr-3" alt="Airbnb" />
                 Importer un logement
               </h2>
               <button onClick={() => setIsImportModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Body */}
            <div className="p-6">
               {importStep === 'input' && (
                 <div className="space-y-4">
                    <p className="text-gray-600 text-sm">Copiez l'URL de votre annonce Airbnb pour importer automatiquement les photos, la description et les équipements.</p>
                    
                    <div className="relative">
                       <Link className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                       <input 
                         type="text" 
                         placeholder="https://www.airbnb.fr/rooms/12345678"
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5A5F] outline-none"
                         value={importUrl}
                         onChange={(e) => setImportUrl(e.target.value)}
                         autoFocus
                       />
                    </div>

                    <button 
                      onClick={handleAnalyzeUrl}
                      disabled={!importUrl}
                      className="w-full bg-[#FF5A5F] text-white font-bold py-3 rounded-xl hover:bg-[#ff4449] transition disabled:opacity-50 flex justify-center items-center"
                    >
                      Analyser l'annonce
                    </button>
                 </div>
               )}

               {importStep === 'loading' && (
                 <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Loader className="w-12 h-12 text-[#FF5A5F] animate-spin mb-4" />
                    <h3 className="font-bold text-gray-800">Analyse en cours...</h3>
                    <p className="text-sm text-gray-500">Nous récupérons les photos haute définition.</p>
                 </div>
               )}

               {importStep === 'preview' && importedProperty && (
                 <div className="space-y-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> Succès ! Données récupérées.
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                       <img src={importedProperty.imageUrl} className="w-full h-48 object-cover" alt="Preview" />
                       <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-1">{importedProperty.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{importedProperty.address}</p>
                          <div className="flex gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{importedProperty.maxGuests} voyageurs</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{importedProperty.bedrooms} chambres</span>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleConfirmImport}
                      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center"
                    >
                      Confirmer et Créer
                    </button>
                 </div>
               )}
            </div>

            {/* Footer */}
            {importStep === 'input' && (
              <div className="bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-400">Compatible avec Airbnb et Booking.com.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
