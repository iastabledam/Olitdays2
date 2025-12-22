
import React from 'react';
import { 
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, Bar 
} from 'recharts';
import { MOCK_REVENUE_DATA } from '../constants';
import { DollarSign, Home, TrendingUp, Users, Plus, Download, Calendar, Sparkles } from 'lucide-react';
import { BrandSettings } from '../types';

interface DashboardProps {
  onNavigate?: (viewId: string) => void;
  brandSettings?: BrandSettings;
}

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp className="w-4 h-4 mr-1" />
        {trend}
      </span>
      <span className="text-gray-400 ml-2">vs mois dernier</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, brandSettings }) => {
  // Use the brand color for charts, default to standard Indigo if undefined
  const primaryColor = brandSettings?.primaryColor || '#6366f1';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord Supervision</h1>
        <div className="flex space-x-2">
           <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Exporter</button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Rapports</button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <button 
           onClick={() => onNavigate?.('properties')}
           className="p-4 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-200 text-white flex flex-col items-center justify-center hover:bg-indigo-700 transition transform hover:-translate-y-1"
         >
            <Download className="w-6 h-6 mb-2" />
            <span className="font-bold text-sm">Importer Logement</span>
         </button>
         <button 
           onClick={() => onNavigate?.('calendar')}
           className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 flex flex-col items-center justify-center hover:bg-gray-50 transition transform hover:-translate-y-1"
         >
            <Calendar className="w-6 h-6 mb-2 text-indigo-500" />
            <span className="font-medium text-sm">Nouvelle Réservation</span>
         </button>
         <button 
            onClick={() => onNavigate?.('cleaning')}
            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 flex flex-col items-center justify-center hover:bg-gray-50 transition transform hover:-translate-y-1"
         >
            <Sparkles className="w-6 h-6 mb-2 text-amber-500" />
            <span className="font-medium text-sm">Planning Ménage</span>
         </button>
         <button className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 flex flex-col items-center justify-center hover:bg-gray-50 transition transform hover:-translate-y-1">
            <Plus className="w-6 h-6 mb-2 text-green-500" />
            <span className="font-medium text-sm">Créer Tâche</span>
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Chiffre d'Affaires" value="35,200 €" icon={DollarSign} trend="+12.5%" color="bg-indigo-500" />
        <StatCard title="Réservations Actives" value="24" icon={Home} trend="+4.2%" color="bg-blue-500" />
        <StatCard title="Taux d'Occupation" value="82%" icon={Users} trend="+1.5%" color="bg-pink-500" />
        <StatCard title="Marge Nette" value="7,040 €" icon={TrendingUp} trend="+8.1%" color="bg-emerald-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Margin Evolution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution CA & Marge</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke={primaryColor} fillOpacity={1} fill="url(#colorRevenue)" name="Chiffre d'Affaires" />
                <Area type="monotone" dataKey="margin" stroke="#10b981" fillOpacity={1} fill="url(#colorMargin)" name="Marge Conciergerie" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Margins Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Marges</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Ménage', value: 4500 },
                { name: 'Linge', value: 2800 },
                { name: 'Conciergerie', value: 7040 },
                { name: 'Upsells', value: 1200 },
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill={primaryColor} radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
