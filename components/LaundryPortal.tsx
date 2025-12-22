
import React, { useState } from 'react';
import { LAUNDRY_STOCK } from '../constants';
import { Task, TaskType, TaskStatus, LaundryOrder, Property } from '../types';
import { CheckCircle, Truck, Package, AlertCircle, Clock, FileText, ClipboardList } from 'lucide-react';

interface LaundryPortalProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  orders: LaundryOrder[];
  onUpdateOrders: (orders: LaundryOrder[]) => void;
  properties: Property[];
}

export const LaundryPortal: React.FC<LaundryPortalProps> = ({ tasks, onUpdateTasks, orders, onUpdateOrders, properties }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'stock' | 'history'>('daily');

  // Filter tasks relevant to laundry from the GLOBAL task list
  const laundryTasks = tasks.filter(t => 
    t.type === TaskType.LAUNDRY_DELIVERY || t.type === TaskType.LAUNDRY_PICKUP
  );

  const pendingTasks = laundryTasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = laundryTasks.filter(t => t.status === TaskStatus.COMPLETED);

  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || 'Inconnu';

  const handleCompleteTask = (taskId: string) => {
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED } : t);
      onUpdateTasks(updatedTasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Portail Blanchisserie</h1>
          <p className="text-gray-500">EcoPressing SAS</p>
        </div>
        
        <div className="bg-white p-1 rounded-lg shadow-sm border inline-flex overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'daily' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Missions du Jour
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'stock' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            État des Stocks
          </button>
           <button 
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Historique Commandes
          </button>
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* To Do Column */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-amber-500" />
              À Préparer / À Livrer
            </h2>
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.type === TaskType.LAUNDRY_DELIVERY ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {task.type === TaskType.LAUNDRY_DELIVERY ? 'LIVRAISON' : 'RÉCUPÉRATION'}
                  </span>
                  <span className="text-sm text-gray-500">{task.dueDate}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{getPropertyName(task.propertyId)}</h3>
                <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                
                {task.laundryItems && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Contenu du kit</p>
                    <ul className="space-y-1">
                      {task.laundryItems.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between text-gray-700">
                          <span>{item.item}</span>
                          <span className="font-mono font-medium">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {task.type === TaskType.LAUNDRY_DELIVERY ? 'Valider Départ' : 'Confirmer Réception'}
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                Aucune mission en attente.
              </div>
            )}
          </div>

          {/* Completed / History */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
              Historique Récent
            </h2>
             {completedTasks.map(task => (
              <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 opacity-75">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium text-gray-800">{getPropertyName(task.propertyId)}</h4>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Terminé</span>
                </div>
                <p className="text-sm text-gray-500">{task.type === TaskType.LAUNDRY_DELIVERY ? 'Livraison effectuée' : 'Linge récupéré'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponible (Propre)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">En cours (Sale/Lavage)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chez les clients</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {LAUNDRY_STOCK.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.item}</td>
                    <td className="px-6 py-4 text-gray-600">{item.total}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{item.available}</td>
                    <td className="px-6 py-4 text-amber-600">{item.dirty}</td>
                    <td className="px-6 py-4 text-blue-600">{item.inUse}</td>
                    <td className="px-6 py-4">
                      {item.available < item.total * 0.2 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Critique
                        </span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800">
              <Package className="w-4 h-4 mr-2" />
              Commander du réassort
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Historique des Commandes Inter-conciergeries</h2>
            <button className="flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              <ClipboardList className="w-4 h-4 mr-2" />
              Nouvelle Commande
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Expéditeur</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Destinataire</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Détails</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{order.date}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                        {order.sender}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.receiver}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between w-full max-w-[200px]">
                          <span>{i.item}</span>
                          <span className="font-mono font-medium text-gray-400">x{i.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        order.status === 'ACCEPTED' || order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'REFUSED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status === 'ACCEPTED' ? 'Accepté' : 
                         order.status === 'DELIVERED' ? 'Livré' :
                         order.status === 'REFUSED' ? 'Refusé' : 'En Attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <button className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-100 transition">
                         <FileText className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Aucune commande dans l'historique.
              </div>
          )}
        </div>
      )}
    </div>
  );
};
