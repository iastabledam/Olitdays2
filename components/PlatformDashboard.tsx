
import React from 'react';
import { Tenant } from '../types';
import { Plus, LogOut, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PlatformDashboardProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ tenants = [], onSelectTenant }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">HostFlow Platform</h1>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Super Admin</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium">Administrateur Système</p>
                <p className="text-xs text-slate-400">admin@hostflow.app</p>
             </div>
             <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-2xl font-bold text-gray-900">Organisations</h2>
              <p className="text-gray-500 mt-1">Sélectionnez une conciergerie pour accéder à son espace de gestion.</p>
           </div>
           <button 
             onClick={() => alert("Fonctionnalité de création d'agence (Provisioning) à venir dans la V2.")}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-md transition"
           >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Organisation
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {tenants.map(tenant => (
             <div 
               key={tenant.id}
               className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden relative"
               onClick={() => onSelectTenant(tenant)}
             >
                {/* Color Strip */}
                <div className="h-2 w-full" style={{ backgroundColor: tenant.primaryColor || '#4f46e5' }}></div>
                
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-gray-700">
                         {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-contain p-1" /> : tenant.name.charAt(0)}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                         tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                         {tenant.status}
                      </span>
                   </div>

                   <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {tenant.name}
                   </h3>
                   <p className="text-sm text-gray-500 mb-6">slug: {tenant.slug}</p>

                   <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                         <Sparkles className="w-4 h-4 mr-1.5 text-gray-400" />
                         Plan {tenant.plan}
                      </div>
                      <span className="text-indigo-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                         Accéder <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                   </div>
                </div>
             </div>
           ))}

           {/* Add New Placeholder */}
           <button 
             onClick={() => alert("Fonctionnalité de création d'agence (Provisioning) à venir dans la V2.")}
             className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all min-h-[220px]"
           >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-sm transition">
                 <Plus className="w-8 h-8" />
              </div>
              <span className="font-bold">Ajouter une organisation</span>
           </button>
        </div>

      </main>
    </div>
  );
};
